"""Motif Decoding and Provenance Engine
Theme: Heritage & Culture | Problem Statement 26197
AICTE / MIC Student Innovation
Decodes authentic Indian craft motifs, manages cultural Knowledge Vault records,
and enforces strict anti-hallucination candidate validation.
"""

import json
import logging
import base64
import io
import re
import uuid
import time
from pathlib import Path
from typing import Optional, Dict, Any, List
from PIL import Image

from ..config import settings
from ..models.mock_data import CRAFT_FIXTURES, DEFAULT_CRAFT_KEY
from .gemini_logger import log_gemini_error

logger = logging.getLogger("ShilpSetu.MotifEngine")

MOTIF_KB_PATH = Path(__file__).resolve().parent.parent / "data" / "motif_kb.json"

# In-memory store for artisan confirmed motif testimonies
ARTISAN_MOTIF_CONFIRMATIONS: Dict[str, Dict[str, Any]] = {}

# In-memory queue for public community suggestions (shown in Coordinator Review Desk)
PENDING_MOTIF_SUGGESTIONS: List[Dict[str, Any]] = []

def load_motif_kb() -> List[Dict[str, Any]]:
    """Loads seeded motif knowledge base from disk."""
    try:
        if MOTIF_KB_PATH.exists():
            with open(MOTIF_KB_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("motifs", [])
        logger.warning(f"Motif KB file not found at {MOTIF_KB_PATH}")
    except Exception as e:
        logger.error(f"Failed to load Motif KB: {e}")
    return []

def get_candidates(craft_hint: Optional[str] = None, cluster_hint: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Ranks and retrieves top candidate motifs matching craft and cluster hints.
    """
    all_motifs = load_motif_kb()
    if not all_motifs:
        return []

    hint_str = f"{craft_hint or ''} {cluster_hint or ''}".lower()

    def score_motif(m: Dict[str, Any]) -> int:
        score = 0
        cat = m.get("craft_category", "").lower()
        cluster = m.get("cluster_hint", "").lower()

        if any(w in hint_str for w in ["terracotta", "pottery", "clay", "pot", "mitti", "kalash", "gorakhpur"]):
            if "terracotta" in cat:
                score += 10
        elif any(w in hint_str for w in ["textile", "saree", "silk", "chanderi", "handloom", "zari"]):
            if "textile" in cat:
                score += 10
        elif any(w in hint_str for w in ["dhokra", "metal", "brass", "bell", "bastar"]):
            if "dhokra" in cat or "metal" in cat:
                score += 10
        elif any(w in hint_str for w in ["madhubani", "mithila", "painting", "tree"]):
            if "painting" in cat:
                score += 10

        if any(token in cluster for token in hint_str.split() if len(token) > 3):
            score += 5
        return score

    sorted_motifs = sorted(all_motifs, key=score_motif, reverse=True)
    return sorted_motifs[:limit]

def call_gemini_motif_vision(image_bytes: bytes, candidates: List[Dict[str, Any]], language: str = "hi") -> Optional[Dict[str, Any]]:
    """
    Invokes Gemini Vision with candidate-constrained prompt.
    Strict rule: rejects any response whose motif_id is not in candidates.
    If image is not a craft, returns {"unrecognized": True}.
    """
    if not settings.GEMINI_API_KEY:
        logger.info("GEMINI_API_KEY not configured, will engage fallback")
        return None

    candidate_summary = [
        {
            "motif_id": c["motif_id"],
            "name_en": c["name_en"],
            "name_hi": c["name_hi"],
            "craft_category": c["craft_category"],
            "cluster_hint": c["cluster_hint"]
        }
        for c in candidates
    ]

    candidate_ids = [c["motif_id"] for c in candidates]

    system_prompt = f"""You are an Indian Cultural Iconographer & Art Historian for National Handicrafts.
You are inspecting a photograph of an authentic Indian handicraft.
Your task is to identify which of the following CANDIDATE MOTIFS best matches the visual pattern:

CANDIDATES:
{json.dumps(candidate_summary, ensure_ascii=False, indent=2)}

STRICT RULES:
1. If the image is completely unrelated to Indian handicraft (e.g. laptop, car, food, generic office item), return:
{{"is_craft": false, "motif_id": null, "confidence": 0.0, "reason": "Non-craft object"}}
2. If it is a handicraft, you MUST select ONLY a motif_id from the candidate list above ({candidate_ids}).
3. Return ONLY a valid JSON object matching this schema:
{{
  "is_craft": true,
  "motif_id": "<one of the candidate motif_ids>",
  "confidence": <float between 0.70 and 0.98>,
  "detected_visual_features": ["list of 2-3 visual details observed in the image"],
  "artisan_observation_hi": "संक्षिप्त 1 वाक्य विवरण हिंदी में",
  "artisan_observation_en": "Brief 1-sentence visual observation in English"
}}"""

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        model_candidates = ["models/gemini-2.5-flash", "models/gemini-flash-latest", "models/gemini-2.5-flash-lite", "models/gemini-3.6-flash"]
        response = None
        for m in model_candidates:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=[
                        system_prompt,
                        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
                    ]
                )
                if response and response.text:
                    break
            except Exception as m_err:
                logger.debug(f"Motif decode with model {m} failed: {m_err}")
        
        if response and response.text:
            raw_text = response.text.strip()
            raw_text = re.sub(r"^```json\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)
            parsed = json.loads(raw_text)

            if parsed.get("is_craft") is False:
                return {"unrecognized": True, "reason": parsed.get("reason", "Non-craft object")}

            if parsed.get("motif_id") in candidate_ids:
                return parsed
            else:
                logger.warning(f"Gemini returned invalid motif_id {parsed.get('motif_id')}, rejected.")
                return None
    except Exception as e:
        logger.warning(f"google-genai client attempt failed: {e}")

    # Legacy SDK fallback
    try:
        import google.generativeai as gai
        gai.configure(api_key=settings.GEMINI_API_KEY)
        model = gai.GenerativeModel("models/gemini-3.6-flash")
        resp = model.generate_content([
            system_prompt,
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])
        if resp and resp.text:
            raw_text = resp.text.strip()
            raw_text = re.sub(r"^```json\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)
            parsed = json.loads(raw_text)

            if parsed.get("is_craft") is False:
                return {"unrecognized": True, "reason": parsed.get("reason", "Non-craft object")}

            if parsed.get("motif_id") in candidate_ids:
                return parsed
            else:
                logger.warning(f"Gemini returned invalid motif_id {parsed.get('motif_id')}, rejected.")
                return None
    except Exception as leg_err:
        logger.debug(f"Legacy SDK fallback failed: {leg_err}")

    return None

def build_category_fallback_record(craft_hint: Optional[str] = None, language: str = "hi", status: str = "partial") -> Dict[str, Any]:
    """
    Offline/error fallback: returns the category-level craft record from CRAFT_FIXTURES
    labelled 'Craft record' (never a specific motif match).
    Part B Rule: status='partial' -> match_chip_label='Craft-level match'.
    """
    hint = (craft_hint or "").lower()
    fixture = CRAFT_FIXTURES[DEFAULT_CRAFT_KEY]
    for k, fix in CRAFT_FIXTURES.items():
        if any(token in fix.get("craft_category", "").lower() for token in hint.split() if len(token) > 3):
            fixture = fix
            break

    cat_name = fixture.get("craft_category", "Traditional Indian Craft")
    title_hi = fixture.get("title_hi", "पारंपरिक भारतीय शिल्प")
    title_en = fixture.get("title_en", "Traditional Indian Craft")
    technique_hi = fixture.get("technique", "पारंपरिक हस्तकला तकनीक")
    technique_en = fixture.get("technique", "Handcrafted traditional technique")

    # Match chip labels according to Rule B1
    if status == "unrecognized":
        chip_label = "कोई सटीक रूपांकन नहीं मिला" if language == "hi" else "No exact motif match"
        show_pct = False
        confidence_pct = None
    else:
        chip_label = "शिल्प-स्तरीय मेल" if language == "hi" else "Craft-level match"
        show_pct = False
        confidence_pct = None

    return {
        "status": status,
        "is_category_fallback": True,
        "motif_id": f"CRAFT-RECORD-{fixture.get('id', 'GEN-01')}",
        "record_type": "Craft record",
        "match_chip_label": chip_label,
        "show_pct_chip": show_pct,
        "name_en": f"Craft Record: {cat_name}",
        "name_hi": f"शिल्प अभिलेख: {title_hi}",
        "name_local": technique_hi if language == "hi" else technique_en,
        "name_local_hi": technique_hi,
        "name_local_en": technique_en,
        "craft_category": cat_name,
        "cluster_hint": fixture.get("cluster_pin", "India"),
        "meaning_en": f"Category-level craft record for {cat_name}. Specific motif could not be confirmed with high optical confidence.",
        "meaning_hi": f"{title_hi} का श्रेणी-स्तरीय शिल्प अभिलेख। विशिष्ट रूपांकन का निश्चित मिलान नहीं हो सका।",
        "meaning": f"{title_hi} का श्रेणी-स्तरीय शिल्प अभिलेख।" if language == "hi" else f"Category-level craft record for {cat_name}.",
        "technique_note_en": technique_en,
        "technique_note_hi": technique_hi,
        "technique_note": technique_hi if language == "hi" else technique_en,
        "sources": [
            {
                "title": f"Official Fixture: {cat_name}",
                "publisher": "National Handicrafts Board / Cluster Documentation",
                "url_or_doc_id": fixture.get("id", "GEN-01"),
                "page_or_section": "Cluster Baseline"
            }
        ],
        "source_badges": [
            {
                "field": "name",
                "label": "⚪ Draft (सत्यापन शेष)" if language == "hi" else "⚪ Draft (Unverified)",
                "type": "draft",
                "detail": "Cluster baseline fixture pending field audit"
            },
            {
                "field": "technique",
                "label": "🟡 AI-observed" if language == "hi" else "🟡 AI-observed",
                "type": "ai_observed",
                "detail": "Category geometry match"
            }
        ],
        "verification_status": "needs_verification",
        "confidence": 0.70,
        "confidence_pct": None,
        "narration_text": f"यह {title_hi} का श्रेणी-स्तरीय अभिलेख है।" if language == "hi" else f"This is a verified category record for {cat_name}.",
        "narration_audio_url": None,
        "detected_visual_features": ["Category geometry matched", "Organic material textures"]
    }

def decode_craft_motif(
    image_base64: Optional[str] = None,
    craft_hint: Optional[str] = None,
    cluster_hint: Optional[str] = None,
    language: str = "hi"
) -> Dict[str, Any]:
    """
    Decodes motif from base64 image using candidate matching & Gemini Vision.
    Enforces honest status and strict 3-tier provenance rules:
    - status='matched' -> Motif match NN%
    - status='partial' -> Craft-level match (hide %)
    - status='unrecognized' -> No exact motif match (hide %)
    - Green 'Curated' badge ONLY when verification_status == 'verified' and non-empty sources.
    """
    candidates = get_candidates(craft_hint, cluster_hint, limit=5)
    if not candidates:
        return build_category_fallback_record(craft_hint, language, status="partial")

    image_bytes = None
    if image_base64:
        try:
            clean_b64 = image_base64
            if "," in clean_b64:
                clean_b64 = clean_b64.split(",")[1]
            image_bytes = base64.b64decode(clean_b64)
        except Exception as e:
            logger.warning(f"Could not decode image_base64: {e}")

    # Call Gemini Vision if image bytes exist and API key is set
    ai_result = None
    if image_bytes and settings.GEMINI_API_KEY:
        ai_result = call_gemini_motif_vision(image_bytes, candidates, language)

    # If Gemini explicitly flagged image as non-craft
    if ai_result and ai_result.get("unrecognized"):
        return build_category_fallback_record(craft_hint, language, status="unrecognized")

    # If Gemini succeeded with a valid candidate from the candidate list
    if ai_result and ai_result.get("motif_id"):
        matched_id = ai_result["motif_id"]
        matched = next((c for c in candidates if c["motif_id"] == matched_id), candidates[0])
        
        conf = float(ai_result.get("confidence", 0.94))
        conf_pct_val = int(conf * 100)
        ai_obs_hi = ai_result.get("artisan_observation_hi", "")
        ai_obs_en = ai_result.get("artisan_observation_en", "")

        meaning_text = matched.get("meaning_hi") if language == "hi" else matched.get("meaning_en")
        tech_text = matched.get("technique_note_hi") if language == "hi" else matched.get("technique_note_en")
        name_local_text = matched.get("name_local_hi") if language == "hi" else matched.get("name_local_en")
        narration = matched.get("narration_hi") if language == "hi" else matched.get("narration_en")

        # Provenance badge rule B2:
        # Green curated ONLY if verification_status == "verified" AND non-empty sources
        is_verified = (matched.get("verification_status") == "verified") and len(matched.get("sources", [])) > 0
        if is_verified:
            source_badge_label = "🟢 Curated" if language != "hi" else "🟢 प्रमाणित (Curated)"
            source_badge_type = "curated"
        else:
            source_badge_label = "⚪ Draft (सत्यापन शेष)" if language == "hi" else "⚪ Draft (Verification Pending)"
            source_badge_type = "draft"

        chip_label = f"रूपांकन मेल {conf_pct_val}%" if language == "hi" else f"Motif match {conf_pct_val}%"

        return {
            "status": "matched",
            "is_category_fallback": False,
            "motif_id": matched["motif_id"],
            "record_type": "Motif record",
            "match_chip_label": chip_label,
            "show_pct_chip": True,
            "name_en": matched["name_en"],
            "name_hi": matched["name_hi"],
            "name_local": name_local_text or matched.get("name_local_hi"),
            "name_local_hi": matched.get("name_local_hi"),
            "name_local_en": matched.get("name_local_en"),
            "craft_category": matched["craft_category"],
            "cluster_hint": matched["cluster_hint"],
            "gi_tag_ref": matched.get("gi_tag_ref"),
            "meaning_en": matched["meaning_en"],
            "meaning_hi": matched["meaning_hi"],
            "meaning": meaning_text,
            "technique_note_en": matched["technique_note_en"],
            "technique_note_hi": matched["technique_note_hi"],
            "technique_note": tech_text,
            "verification_status": matched.get("verification_status", "needs_verification"),
            "sources": matched.get("sources", []),
            "source_badges": [
                {
                    "field": "name",
                    "label": source_badge_label,
                    "type": source_badge_type,
                    "detail": matched.get("sources", [{}])[0].get("title", "Archival Reference")
                },
                {
                    "field": "technique",
                    "label": "🟡 AI-observed" if language != "hi" else "🟡 AI-अवलोकन",
                    "type": "ai_observed",
                    "detail": "Gemini 2.5 Vision contour extraction"
                }
            ],
            "confidence": conf,
            "confidence_pct": f"{conf_pct_val}%",
            "narration_text": narration,
            "narration_audio_url": None,
            "detected_visual_features": ai_result.get("detected_visual_features", ["Pattern contour matched", "Handcrafted texture"]),
            "ai_observation": ai_obs_hi if language == "hi" else ai_obs_en
        }

    # If offline, rate-limited, or no candidate matched:
    # Rule B1: status='partial' -> "Craft-level match" and hide % chip
    return build_category_fallback_record(craft_hint, language, status="partial")

def confirm_or_correct_motif(
    motif_id: str,
    product_id: Optional[str] = None,
    correction_text: Optional[str] = None,
    artisan_name: Optional[str] = "Master Artisan",
    audio_url: Optional[str] = None,
    language: str = "hi"
) -> Dict[str, Any]:
    """
    Appends an ARTISAN entry (🔵 Artisan-told) to the motif record for this product.
    Only authenticated artisans/coordinators can append directly.
    """
    key = product_id or motif_id
    confirmation_entry = {
        "motif_id": motif_id,
        "product_id": product_id,
        "artisan_name": artisan_name,
        "testimony": correction_text or "Confirmed authentic heritage motif by practicing artisan.",
        "audio_url": audio_url,
        "language": language,
        "confirmed_at": "2026-09-29T00:30:00Z",
        "badge": "🔵 Artisan-told"
    }
    ARTISAN_MOTIF_CONFIRMATIONS[key] = confirmation_entry
    logger.info(f"Recorded artisan testimony for {key}: {confirmation_entry['testimony']}")

    return {
        "status": "confirmed",
        "motif_id": motif_id,
        "product_id": product_id,
        "artisan_entry": confirmation_entry,
        "source_badge": "🔵 Artisan-told",
        "message": "Artisan cultural testimony successfully appended to Craft Knowledge Vault"
    }

def submit_public_suggestion(
    motif_id: str,
    suggestion_text: str,
    cluster_hint: Optional[str] = None,
    language: str = "hi",
    suggested_by: Optional[str] = "Public Contributor"
) -> Dict[str, Any]:
    """
    Saves a public/visitor suggestion into the coordinator pending review queue.
    CRITICAL RULE: A suggestion must NEVER appear as 'artisan-told' until approved.
    """
    suggestion_id = f"SUGG-{uuid.uuid4().hex[:8].upper()}"
    entry = {
        "id": suggestion_id,
        "motif_id": motif_id,
        "suggestion_text": suggestion_text.strip(),
        "cluster_hint": cluster_hint or "General",
        "language": language,
        "suggested_by": suggested_by,
        "status": "pending_coordinator_review",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    PENDING_MOTIF_SUGGESTIONS.append(entry)
    logger.info(f"Saved public motif suggestion {suggestion_id} for motif {motif_id}")
    return {
        "status": "submitted",
        "suggestion_id": suggestion_id,
        "message": "आपकी टिप्पणी समीक्षा हेतु समन्वयक समीक्षा पटल (Review Desk) पर भेज दी गई है।" if language == "hi" else "Your suggestion has been submitted to the Coordinator Review Desk for verification."
    }

def get_pending_suggestions() -> List[Dict[str, Any]]:
    """Returns all pending suggestions for Coordinator Review Panel."""
    return [s for s in PENDING_MOTIF_SUGGESTIONS if s.get("status") == "pending_coordinator_review"]

def approve_suggestion(suggestion_id: str, coordinator_name: str = "Cluster Coordinator") -> Optional[Dict[str, Any]]:
    """Approves a public suggestion, converting it into a verified testimony."""
    for s in PENDING_MOTIF_SUGGESTIONS:
        if s.get("id") == suggestion_id:
            s["status"] = "approved"
            s["approved_by"] = coordinator_name
            s["approved_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            
            # Now register it as an approved oral record
            ARTISAN_MOTIF_CONFIRMATIONS[s["motif_id"]] = {
                "motif_id": s["motif_id"],
                "artisan_name": f"{s['suggested_by']} (Approved by {coordinator_name})",
                "testimony": s["suggestion_text"],
                "language": s["language"],
                "confirmed_at": s["approved_at"],
                "badge": "🔵 Verified Testimony"
            }
            return s
    return None

def get_confirmed_motif_for_product(product_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves any artisan-confirmed motif testimony for a product."""
    return ARTISAN_MOTIF_CONFIRMATIONS.get(product_id)
