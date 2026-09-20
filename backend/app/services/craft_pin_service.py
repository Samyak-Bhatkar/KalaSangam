"""
Craft Honesty & Authenticity Pins Service
Module: Tap-to-Annotate Pin Callouts & Natural Variations
Client: Ministry of Social Justice and Empowerment (MoSJE) / NBCFDC / NSFDC

Processes vernacular voice audio recordings dropped on specific spots of the craft image.
Uses Google Gemini 2.5 Flash / 3.5 Flash Lite or curated heuristic matching to:
1. Classify the spot into:
   - "imperfection": natural variation, organic texture nuance, firing mark, handmade human trait.
   - "craft_detail": artistic flourish, traditional motif, signature carving, hand-embroidery highlight.
2. Select the SEMANTICALLY CLOSEST term from curated English word banks (not free-form generation):
   - Defect/Natural Variation Bank: 12 curated terms
   - Positive/Craft-Feature Bank: 12 curated terms
3. Generate a concise supporting sentence in English (<12 words) summarizing the artisan's narrative.
4. Server-side Pillow compositing to generate a flattened, non-interactive JPEG image with solid black
   anchor dots (#000000), 2-segment jogged elbow lines (#000000), and callout text cards for ONDC/Beckn syndication.
"""

import os
import re
import time
import json
import math
import io
import base64
import logging
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

from ..config import settings
from ..models.schemas import CraftPin
from .stock_background_service import load_image_from_source

logger = logging.getLogger("ShilpSetu.CraftPins")

# ==============================================================================
# CURATED WORD BANKS (Problem Statement Requirement: Fixed Lists of Terms)
# ==============================================================================
DEFECT_VARIATION_BANK: List[str] = [
    "Hairline Crack",
    "Surface Pitting",
    "Glaze Unevenness",
    "Warping",
    "Firing Marks",
    "Minor Chipping",
    "Color Variation",
    "Asymmetry",
    "Loose Thread",
    "Weave Irregularity",
    "Natural Grain Mark",
    "Blowhole"
]

CRAFT_FEATURE_BANK: List[str] = [
    "Hand-Painted",
    "Hand-Carved",
    "Traditional Motif",
    "Wheel-Thrown",
    "Hand-Woven",
    "Natural Dye",
    "Gold Leaf Work",
    "Filigree Detail",
    "Block Print",
    "Inlay Work",
    "Hand-Stitched",
    "GI-Tagged Craft"
]

GEMINI_PIN_DIRECTIVE = """You are an expert Indian handicraft appraisal & transparency master under the Ministry of Social Justice and Empowerment (MoSJE).
An Indian rural artisan pointed directly at a specific spot on their handcrafted product and voice-described what is located at that spot:
Artisan Voice Transcript: "{transcript}"
Spoken Language / Dialect: {language}
Craft Context Hint: {category_hint}

You must classify this spot and select the SEMANTICALLY CLOSEST term STRICTLY from one of two curated word banks.
Do NOT invent new English terms. Choose only from the exact lists below:

DEFECT / NATURAL VARIATION BANK:
{defect_bank}

POSITIVE / CRAFT-FEATURE BANK:
{feature_bank}

Conform strictly to this JSON schema:
{{
  "category": "imperfection" OR "craft_detail",
  "bank_term": "Exact string matched from the bank above",
  "short_label_en": "Exact string matched from the bank above (identical to bank_term)",
  "short_label_hi": "Concise Hindi translation of the matched term (e.g. 'मिट्टी की प्राकृतिक हेयरलाइन दरार' or 'पारंपरिक हाथ से नक्काशीदार मोटिफ')",
  "one_line_summary": "One condensed supporting sentence in English under 12 words explaining this exact spot to conscious buyers",
  "full_description_hi": "The artisan's spoken narrative rendered cleanly and respectfully in Hindi",
  "full_description_en": "A warm, engaging English translation celebrating handmade authenticity"
}}

STRICT GUIDELINES:
1. "category":
   - Use "imperfection" if the spot describes a natural variation, slight crack, hand-formed asymmetry, fire mark, uneven stitch, natural grain, or inherent material trait. Pick bank_term strictly from DEFECT / NATURAL VARIATION BANK.
   - Use "craft_detail" if the spot describes an artistic touch, traditional motif, signature carving, hand-woven border, special raw material, or master technique. Pick bank_term strictly from POSITIVE / CRAFT-FEATURE BANK.
2. POSITIVE FRAMING (CRITICAL):
   - Never use words like "defect", "flaw", "damaged", or "fault".
   - Frame variations positively as "handmade authenticity" or "organic artisan nuance".
3. Return ONLY valid JSON matching this schema.
"""

# Keywords for zero-fail heuristic fallback mapped to curated bank terms
IMPERFECTION_KEYWORDS = [
    "दरार", "crack", "hairline", "हल्की सी", "असमान", "uneven", "दाग", "mark", "छिद्र", "rough",
    "खुरदुरा", "प्राकृतिक", "मिट्टी का स्वभाव", "धब्बा", "पतला", "कच्चा", "गड्ढा", "variation",
    "asymmetry", "slight", "texture", "fire", "kiln", "आग", "भट्ठी", "रंग का अंतर", "गढ्ढा", "छिद्र"
]

def match_heuristic_bank_term(transcript: str, category: str) -> str:
    """Matches a transcript to the closest term in the curated word bank."""
    t = transcript.lower()
    if category == "imperfection":
        if any(w in t for w in ["दरार", "crack", "hairline"]):
            return "Hairline Crack"
        if any(w in t for w in ["गड्ढा", "गढ्ढा", "pit", "pitting", "छिद्र", "blowhole"]):
            return "Surface Pitting" if "pit" in t or "गड्ढा" in t else "Blowhole"
        if any(w in t for w in ["गलेज", "glaze", "चमक", "coating"]):
            return "Glaze Unevenness"
        if any(w in t for w in ["टेढ़ा", "warp", "warping", "झुकाव"]):
            return "Warping"
        if any(w in t for w in ["आग", "भट्ठी", "fire", "kiln", "धुआं", "smoke"]):
            return "Firing Marks"
        if any(w in t for w in ["किनारा", "chip", "chipping", "कोना"]):
            return "Minor Chipping"
        if any(w in t for w in ["रंग", "color", "shade", "tone", "धब्बा"]):
            return "Color Variation"
        if any(w in t for w in ["असममित", "asymmetry", "हाथ", "आकार"]):
            return "Asymmetry"
        if any(w in t for w in ["धागा", "thread", "सिलाई"]):
            return "Loose Thread"
        if any(w in t for w in ["बुनाई", "weave", "warp", "weft"]):
            return "Weave Irregularity"
        if any(w in t for w in ["लकड़ी", "grain", "रेशा", "काठ"]):
            return "Natural Grain Mark"
        return "Color Variation"
    else:
        if any(w in t for w in ["पेंट", "रंगना", "चित्र", "paint"]):
            return "Hand-Painted"
        if any(w in t for w in ["नक्काशी", "carv", "तराशा"]):
            return "Hand-Carved"
        if any(w in t for w in ["चाक", "wheel", "potter", "घड़ा"]):
            return "Wheel-Thrown"
        if any(w in t for w in ["हथकरघा", "बुनाई", "loom", "woven"]):
            return "Hand-Woven"
        if any(w in t for w in ["प्राकृतिक रंग", "वनस्पति", "dye"]):
            return "Natural Dye"
        if any(w in t for w in ["सोना", "gold", "leaf", "वर्क"]):
            return "Gold Leaf Work"
        if any(w in t for w in ["जाली", "filigree", "तार"]):
            return "Filigree Detail"
        if any(w in t for w in ["ब्लॉक", "block", "ठप्पा"]):
            return "Block Print"
        if any(w in t for w in ["जड़ाई", "inlay", "मीना"]):
            return "Inlay Work"
        if any(w in t for w in ["सिलाई", "टांका", "stitch"]):
            return "Hand-Stitched"
        if any(w in t for w in ["जीआई", "gi", "भौगोलिक", "heritage"]):
            return "GI-Tagged Craft"
        return "Traditional Motif"


def heuristic_classify_pin(
    transcript: str,
    language: str = "hi",
    category_hint: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligent zero-fail rule-based heuristic classifier strictly adhering to the curated word banks.
    """
    t_lower = (transcript or "").lower()
    is_imperfection = any(kw in t_lower for kw in IMPERFECTION_KEYWORDS)

    category = "imperfection" if is_imperfection else "craft_detail"
    bank_term = match_heuristic_bank_term(t_lower, category)

    if category == "imperfection":
        short_label_hi = f"प्राकृतिक विशेषता ({bank_term})"
        short_label_en = bank_term
        full_desc_hi = transcript or "यह शिल्प के हस्तनिर्मित स्वभाव और प्राकृतिक सामग्री की प्रामाणिक विशेषता है।"
        one_line_summary = f"Natural handcrafted {bank_term.lower()} inherent to authentic traditional production."
        full_desc_en = f"This natural surface nuance ({bank_term}) is inherent to authentic handcrafting: '{transcript}'"
    else:
        short_label_hi = f"कारीगरी विवरण ({bank_term})"
        short_label_en = bank_term
        full_desc_hi = transcript or "कारीगर द्वारा हाथ से तैयार की गई विशेष हस्तशिल्प तकनीक।"
        one_line_summary = f"Signature {bank_term.lower()} artisan technique celebrated in this handcrafted piece."
        full_desc_en = f"An authentic {bank_term} artisan feature highlighted by the maker: '{transcript}'"

    primary_label = short_label_hi if language == "hi" else short_label_en
    primary_desc = full_desc_hi if language == "hi" else full_desc_en

    return {
        "category": category,
        "bank_term": bank_term,
        "short_label": primary_label,
        "short_label_hi": short_label_hi,
        "short_label_en": short_label_en,
        "one_line_summary": one_line_summary,
        "full_description": primary_desc,
        "full_description_hi": full_desc_hi,
        "full_description_en": full_desc_en,
    }


def classify_and_format_pin_callout(
    transcript: str,
    language: str = "hi",
    category_hint: Optional[str] = None
) -> Dict[str, Any]:
    """
    Classifies a spot transcript and generates concise labels matched to curated word banks.
    Attempts Google Gemini first; falls back to heuristics.
    """
    clean_transcript = (transcript or "").strip()
    if not clean_transcript:
        clean_transcript = "हस्तनिर्मित कलाकृति का विशेष विवरण"

    if not settings.GEMINI_API_KEY:
        logger.info("GEMINI_API_KEY not configured. Using heuristic craft pin classifier.")
        return heuristic_classify_pin(clean_transcript, language, category_hint)

    prompt = GEMINI_PIN_DIRECTIVE.format(
        transcript=clean_transcript,
        language=language,
        category_hint=category_hint or "Traditional Indian Handicraft",
        defect_bank=", ".join(DEFECT_VARIATION_BANK),
        feature_bank=", ".join(CRAFT_FEATURE_BANK)
    )

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        for model_name in ["gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=[prompt],
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        response_mime_type="application/json"
                    )
                )
                if resp and resp.text:
                    parsed = json.loads(resp.text)
                    if "category" in parsed:
                        cat = parsed.get("category", "craft_detail")
                        bank = DEFECT_VARIATION_BANK if cat == "imperfection" else CRAFT_FEATURE_BANK
                        term = parsed.get("bank_term") or parsed.get("short_label_en")
                        if term not in bank:
                            # Strict sanity match
                            term = match_heuristic_bank_term(clean_transcript, cat)
                        parsed["bank_term"] = term
                        parsed["short_label_en"] = term
                        parsed["short_label"] = parsed.get("short_label") or parsed.get("short_label_hi") or term
                        parsed["one_line_summary"] = parsed.get("one_line_summary") or f"Authentic handcrafted {term.lower()} detail."
                        parsed["full_description"] = parsed.get("full_description") or parsed.get("full_description_hi") or clean_transcript
                        return parsed
            except Exception as e_inner:
                logger.debug(f"Gemini model {model_name} pin call failed: {e_inner}")
                continue
    except ImportError:
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=settings.GEMINI_API_KEY)
            model = legacy_genai.GenerativeModel("gemini-1.5-flash")
            resp = model.generate_content(
                prompt,
                generation_config={"temperature": 0.1, "response_mime_type": "application/json"}
            )
            if resp and resp.text:
                parsed = json.loads(resp.text)
                if "category" in parsed:
                    cat = parsed.get("category", "craft_detail")
                    bank = DEFECT_VARIATION_BANK if cat == "imperfection" else CRAFT_FEATURE_BANK
                    term = parsed.get("bank_term") or parsed.get("short_label_en")
                    if term not in bank:
                        term = match_heuristic_bank_term(clean_transcript, cat)
                    parsed["bank_term"] = term
                    parsed["short_label_en"] = term
                    parsed["short_label"] = parsed.get("short_label") or parsed.get("short_label_hi") or term
                    parsed["one_line_summary"] = parsed.get("one_line_summary") or f"Authentic handcrafted {term.lower()} detail."
                    parsed["full_description"] = parsed.get("full_description") or parsed.get("full_description_hi") or clean_transcript
                    return parsed
        except Exception as e_leg:
            logger.warning(f"Legacy Gemini pin call failed: {e_leg}")
    except Exception as e:
        logger.warning(f"Gemini pin classification error: {e}")

    return heuristic_classify_pin(clean_transcript, language, category_hint)


def save_pin_audio_file(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """
    Saves recorded pin voice audio to static/uploads directory and returns accessible URL path.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = "wav" if "wav" in mime_type else "webm"
    filename = f"pin_audio_{int(time.time() * 1000)}.{ext}"
    dest_path = Path(settings.UPLOAD_DIR) / filename
    with open(dest_path, "wb") as f:
        f.write(audio_bytes)
    return f"/static/uploads/{filename}"


# ==============================================================================
# SERVER-SIDE PILLOW COMPOSITING: FLATTENED JPEG FOR ONDC/E-COMMERCE SYNDICATION
# ==============================================================================
def get_pillow_fonts(title_size: int = 24, sub_size: int = 16) -> Tuple[ImageFont.ImageFont, ImageFont.ImageFont]:
    """Resolves font with cross-platform fallbacks."""
    font_bold = None
    font_regular = None

    candidate_bold_paths = [
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for fp in candidate_bold_paths:
        if os.path.exists(fp):
            try:
                font_bold = ImageFont.truetype(fp, title_size)
                break
            except Exception:
                pass

    candidate_reg_paths = [
        "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for fp in candidate_reg_paths:
        if os.path.exists(fp):
            try:
                font_regular = ImageFont.truetype(fp, sub_size)
                break
            except Exception:
                pass

    if not font_bold:
        font_bold = ImageFont.load_default()
    if not font_regular:
        font_regular = ImageFont.load_default()

    return font_bold, font_regular


def composite_annotated_buyer_image(
    image_source: Any,
    pins: List[Any],
    canvas_size: int = 1080
) -> Tuple[str, str]:
    """
    Generates a flattened, non-interactive JPEG image with dot markers,
    two-segment jogged elbow leader lines (#000000), and short callout cards burned directly
    into the pixels using Pillow.
    Saves as JPEG format suitable for ONDC/Beckn marketplace syndication.

    Returns:
        Tuple of (saved_file_url, base64_data_url)
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # 1. Load base image
    if isinstance(image_source, Image.Image):
        base_img = image_source.convert("RGBA")
    elif isinstance(image_source, str) and image_source.strip():
        base_img = load_image_from_source(image_source).convert("RGBA")
    else:
        # Fallback to pure white clean studio canvas
        base_img = Image.new("RGBA", (canvas_size, canvas_size), (248, 249, 250, 255))

    # Fit base image to canvas_size x canvas_size
    bw, bh = base_img.size
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (248, 249, 250, 255))

    scale = min(canvas_size / max(1, bw), canvas_size / max(1, bh))
    nw = max(1, int(bw * scale))
    nh = max(1, int(bh * scale))
    resized_img = base_img.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (canvas_size - nw) // 2
    oy = (canvas_size - nh) // 2
    canvas.paste(resized_img, (ox, oy), resized_img if resized_img.mode == "RGBA" else None)

    # 2. Setup Drawing & Fonts
    draw = ImageDraw.Draw(canvas)
    font_title, font_sub = get_pillow_fonts(title_size=20, sub_size=14)

    # Solid black color palette for callouts as requested (#000000)
    BLACK = (0, 0, 0, 255)
    WHITE = (255, 255, 255, 255)
    TEXT_MUTED = (71, 85, 105, 255)

    # 3. Draw Each Pin's Callout
    for pin in pins:
        p_data = pin.dict() if hasattr(pin, "dict") else (pin if isinstance(pin, dict) else {})
        x_pct = float(p_data.get("x") if p_data.get("x") is not None else p_data.get("x_pct", 50.0))
        y_pct = float(p_data.get("y") if p_data.get("y") is not None else p_data.get("y_pct", 50.0))
        angle_deg = float(p_data.get("label_angle") if p_data.get("label_angle") is not None else 0.0)

        # Calculate anchor coordinates on canvas
        ax = ox + (x_pct / 100.0) * nw
        ay = oy + (y_pct / 100.0) * nh

        # Radial geometry
        angle_rad = math.radians(angle_deg)
        r_diag = 110.0  # diagonal length on 1080p canvas
        ex = ax + r_diag * math.cos(angle_rad)
        ey = ay + r_diag * math.sin(angle_rad)

        # Horizontal shelf direction: right if pointing right, left if pointing left
        shelf_len = 45.0
        is_right = math.cos(angle_rad) >= 0
        sx = ex + (shelf_len if is_right else -shelf_len)
        sy = ey

        # Term labels
        label_text = p_data.get("bank_term") or p_data.get("short_label_en") or p_data.get("short_label") or "Handcrafted Detail"
        sub_text = p_data.get("one_line_summary") or p_data.get("full_description_en") or p_data.get("full_description") or ""
        if len(sub_text) > 65:
            sub_text = sub_text[:62] + "..."

        # Measure text box
        tb_title = draw.textbbox((0, 0), label_text, font=font_title)
        title_w = tb_title[2] - tb_title[0]
        title_h = tb_title[3] - tb_title[1]

        sub_w, sub_h = 0, 0
        if sub_text:
            tb_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
            sub_w = tb_sub[2] - tb_sub[0]
            sub_h = tb_sub[3] - tb_sub[1]

        pad_x = 16
        pad_y = 12
        card_w = max(title_w, sub_w) + (pad_x * 2)
        card_h = title_h + (sub_h + 6 if sub_text else 0) + (pad_y * 2)

        # Card position: adjacent to shelf endpoint
        if is_right:
            cx = sx + 8
            cy = sy - (card_h / 2.0)
        else:
            cx = sx - card_w - 8
            cy = sy - (card_h / 2.0)

        # Clamp card to stay safely inside 1080 canvas
        cx = max(18.0, min(canvas_size - card_w - 18.0, cx))
        cy = max(18.0, min(canvas_size - card_h - 18.0, cy))

        # Re-adjust shelf end to attach neatly to card edge if clamped
        if is_right:
            shelf_end_x = cx
        else:
            shelf_end_x = cx + card_w

        # --- A. Draw Leader Line (2-segment jogged elbow line in solid black #000000) ---
        # Diagonal segment
        draw.line([(ax, ay), (ex, ey)], fill=BLACK, width=3)
        # Horizontal shelf segment
        draw.line([(ex, ey), (shelf_end_x, sy)], fill=BLACK, width=3)

        # --- B. Draw Anchor Dot (solid black with crisp white outer ring for contrast) ---
        dot_r = 7
        draw.ellipse([ax - dot_r - 2, ay - dot_r - 2, ax + dot_r + 2, ay + dot_r + 2], fill=WHITE)
        draw.ellipse([ax - dot_r, ay - dot_r, ax + dot_r, ay + dot_r], fill=BLACK)

        # Shelf endpoint dot at card boundary
        draw.ellipse([shelf_end_x - 4, sy - 4, shelf_end_x + 4, sy + 4], fill=BLACK)

        # --- C. Draw Callout Card Card Box ---
        # Card background (clean white card with crisp solid black border)
        card_bbox = [cx, cy, cx + card_w, cy + card_h]
        # Drop shadow behind card
        draw.rounded_rectangle([cx + 3, cy + 3, cx + card_w + 3, cy + card_h + 3], radius=10, fill=(0, 0, 0, 35))
        draw.rounded_rectangle(card_bbox, radius=10, fill=WHITE, outline=BLACK, width=2)

        # Draw Title
        draw.text((cx + pad_x, cy + pad_y), label_text, font=font_title, fill=BLACK)

        # Draw Subtitle
        if sub_text:
            draw.text((cx + pad_x, cy + pad_y + title_h + 6), sub_text, font=font_sub, fill=TEXT_MUTED)

    # 4. Save as flattened JPEG format (per ONDC syndication requirements)
    final_rgb = canvas.convert("RGB")
    buf = io.BytesIO()
    final_rgb.save(buf, format="JPEG", quality=92, optimize=True)
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{b64_str}"

    filename = f"annotated_callout_{int(time.time() * 1000)}.jpg"
    dest_path = Path(settings.UPLOAD_DIR) / filename
    final_rgb.save(dest_path, format="JPEG", quality=92, optimize=True)

    file_url = f"/static/uploads/{filename}"
    logger.info(f"Generated flattened ONDC annotated JPEG at: {file_url}")
    return file_url, data_url
