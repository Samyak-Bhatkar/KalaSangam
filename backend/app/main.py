"""ShilpSetu AI - FastAPI Backend Entrypoint
Ministry of Social Justice and Empowerment (MoSJE), Government of India
Department of Social Justice and Empowerment
Target Beneficiaries: NBCFDC & NSFDC Marginalized Artisans & Weavers
"""

import os
import io
import time
import base64
import logging
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from .config import settings
from .models.schemas import (
    StudioEnhanceResponse,
    CatalogItemResponse,
    CatalogVoiceProcessRequest,
    PricingCalculationRequest,
    PricingCalculationResponse,
    ReelGenerationRequest,
    ReelGenerationResponse,
    NegotiationRequest,
    NegotiationResponse,
    WatermarkEmbedRequest,
    WatermarkEmbedResponse,
    WatermarkVerifyRequest,
    WatermarkVerifyResponse,
)
from .models.mock_data import CRAFT_FIXTURES
from .services.image_studio import process_studio_image, image_to_base64
from .services.catalog_engine import process_voice_and_catalog
from .services.pricing_engine import calculate_living_wage_pricing
from .services.reel_generator import render_vertical_reel
from .services.negotiator import evaluate_b2b_negotiation
from .services.watermark import embed_dct_watermark, extract_dct_watermark
from .services.ondc_adapter import generate_beckn_catalog_payload
from .services.n8n_client import (
    trigger_bargain_guard_workflow,
    trigger_ondc_publish_workflow,
    trigger_reel_dispatch_workflow,
    trigger_ministry_analytics_workflow,
)

from .services.transcription_service import transcribe_audio_bytes, fallback_craft_transcript

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ShilpSetu.Main")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Autonomous AI-driven Smart Cataloging & Market Linkage System for Rural Indian Artisans (MoSJE)",
)

# Enable CORS for local, staging, and LAN mobile development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kalasangam-frontend.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads and audio
app.mount("/static", StaticFiles(directory=str(settings.STATIC_DIR)), name="static")

# Mount Flutter Web PWA build
flutter_build_dir = Path(__file__).resolve().parent.parent.parent / "mobile_flutter" / "build" / "web"
if flutter_build_dir.exists():
    app.mount("/flutter", StaticFiles(directory=str(flutter_build_dir), html=True), name="flutter")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ministry": settings.CLIENT_MINISTRY,
        "ai_status": {
            "gemini_configured": bool(settings.GEMINI_API_KEY),
            "bhashini_configured": bool(settings.BHASHINI_API_KEY),
            "zero_fail_mode": True
        },
        "cloud_and_n8n": {
            "n8n_enabled": settings.N8N_ENABLED,
            "cloud_storage_provider": settings.CLOUD_STORAGE_PROVIDER,
            "n8n_base_url": settings.N8N_BASE_URL
        }
    }

@app.get("/api/v1/crafts/presets")
def get_craft_presets():
    """Returns preset Indian craft fixtures for zero-typing instant testing."""
    return {
        "status": "success",
        "crafts": list(CRAFT_FIXTURES.values())
    }

# ==============================================================================
# MODULE 1 & 2: AUTONOMOUS AI IMAGE STUDIO ENDPOINT
# ==============================================================================
@app.post("/api/v1/studio/enhance", response_model=StudioEnhanceResponse)
async def enhance_studio_image(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    """
    POST /api/v1/studio/enhance
    Takes raw workshop craft photo (multipart file or base64), applies:
    - Salient craft segmentation (rembg / OpenCV)
    - 6500K daylight white balancing
    - 10% safety cushion centering on 1080x1080 canvas
    - Directional elliptical contact drop shadow (#F8F9FA background)
    """
    try:
        if file is not None:
            raw_bytes = await file.read()
        elif image_base64:
            clean_b64 = image_base64
            if "," in clean_b64:
                clean_b64 = clean_b64.split(",")[1]
            raw_bytes = base64.b64decode(clean_b64)
        else:
            raise HTTPException(status_code=400, detail="Either file upload or image_base64 is required.")

        raw_img, studio_canvas, metadata = process_studio_image(raw_bytes)

        # Save to static uploads
        timestamp = int(time.time() * 1000)
        raw_filename = f"raw_{timestamp}.jpg"
        studio_filename = f"studio_{timestamp}.jpg"

        raw_path = settings.UPLOAD_DIR / raw_filename
        studio_path = settings.UPLOAD_DIR / studio_filename

        raw_img.save(raw_path, format="JPEG", quality=90)
        # Convert RGBA studio canvas to RGB for JPEG save
        rgb_studio = studio_canvas.convert("RGB")
        rgb_studio.save(studio_path, format="JPEG", quality=95)

        processed_b64 = image_to_base64(studio_canvas, format="JPEG")

        return StudioEnhanceResponse(
            status="success",
            original_url=f"/static/uploads/{raw_filename}",
            studio_url=f"/static/uploads/{studio_filename}",
            processed_base64=processed_b64,
            width=metadata["width"],
            height=metadata["height"],
            lighting_normalized=metadata["lighting_normalized"],
            drop_shadow_applied=metadata["drop_shadow_applied"]
        )
    except Exception as e:
        logger.error(f"Studio enhancement error: {e}")
        raise HTTPException(status_code=500, detail=f"Image enhancement failed: {str(e)}")

# ==============================================================================
# MODULE 3: MULTIMODAL VOICE-TO-CATALOG ENDPOINT
# ==============================================================================
@app.post("/api/v1/catalog/voice-process", response_model=CatalogItemResponse)
async def process_voice_catalog(
    audio: Optional[UploadFile] = File(None),
    image_base64: str = Form(...),
    language: str = Form("hi"),
    transcript: Optional[str] = Form(None),
    category_hint: Optional[str] = Form(None)
):
    """
    POST /api/v1/catalog/voice-process
    Ingests recorded regional audio and studio image.
    Outputs strictly typed bilingual e-commerce metadata conforming to MoSJE schema.
    """
    try:
        # If audio file is provided but no transcript, transcribe via Gemini / fallback
        effective_transcript = transcript
        if audio and not effective_transcript:
            audio_bytes = await audio.read()
            mime_type = audio.content_type or "audio/webm"
            trans_res = transcribe_audio_bytes(
                audio_bytes=audio_bytes,
                mime_type=mime_type,
                language=language,
                category_hint=category_hint
            )
            effective_transcript = trans_res.get("transcript", "")

        catalog_data = process_voice_and_catalog(
            image_base64=image_base64,
            language=language,
            transcript=effective_transcript,
            category_hint=category_hint
        )
        return catalog_data
    except Exception as e:
        logger.error(f"Catalog voice processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice cataloging failed: {str(e)}")

@app.post("/api/v1/voice/transcribe")
async def transcribe_voice_endpoint(
    audio: UploadFile = File(...),
    language: str = Form("hi"),
    category_hint: Optional[str] = Form(None)
):
    """
    POST /api/v1/voice/transcribe
    Autonomous Vernacular Voice Transcription Endpoint for ShilpSetu.
    Accepts recorded voice audio (WebM/WAV) from mobile or desktop browser.
    Transcribes using Gemini 3.5 Flash Lite / 3.6 Flash with zero-fail heuristic fallback.
    """
    try:
        audio_bytes = await audio.read()
        mime_type = audio.content_type or "audio/webm"
        result = transcribe_audio_bytes(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            language=language,
            category_hint=category_hint
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Voice transcription endpoint error: {e}")
        return JSONResponse(content={
            "transcript": fallback_craft_transcript(category_hint),
            "source": "exception_fallback",
            "success": True,
        })

@app.post("/api/v1/catalog/voice-process-json", response_model=CatalogItemResponse)
async def process_voice_catalog_json(req: CatalogVoiceProcessRequest):
    """JSON body variant of the voice catalog endpoint for flexible client calls."""
    try:
        return process_voice_and_catalog(
            image_base64=req.image_base64,
            language=req.language,
            transcript=req.transcript,
            category_hint=req.category_hint
        )
    except Exception as e:
        logger.error(f"Catalog JSON processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# MODULE 4: STATUTORY LIVING-WAGE PRICING ENDPOINT
# ==============================================================================
@app.post("/api/v1/pricing/calculate", response_model=PricingCalculationResponse)
async def calculate_pricing(req: PricingCalculationRequest):
    """
    POST /api/v1/pricing/calculate
    Applies MoSJE statutory fair wage formula (₹120/hr skilled artisan floor)
    and computes multi-channel tiers (B2C, B2B, GeM) with underpricing guard alert.
    """
    try:
        return calculate_living_wage_pricing(
            category=req.category,
            labor_hours=req.labor_hours,
            raw_cost=req.raw_cost,
            artisan_expected_price=req.artisan_expected_price
        )
    except Exception as e:
        logger.error(f"Pricing calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# INNOVATION 1: AI 15-SECOND REEL STORYTELLER ENDPOINT
# ==============================================================================
@app.post("/api/v1/marketing/generate-reel", response_model=ReelGenerationResponse)
async def generate_marketing_reel(req: ReelGenerationRequest, background_tasks: BackgroundTasks):
    """
    POST /api/v1/marketing/generate-reel
    Generates 15-second 9:16 vertical video reel with Ken Burns zoom,
    heritage narration, ambient Indian flute/sitar music, and ONDC QR code.
    Triggers n8n background distribution workflow.
    """
    try:
        res = render_vertical_reel(
            product_id=req.product_id,
            title=req.title,
            studio_image_base64=req.studio_image_base64,
            story_narrative=req.story_text,
            artisan_name=req.artisan_name,
            craft_cluster=req.craft_cluster
        )
        # Dispatch background event to n8n
        background_tasks.add_task(
            trigger_reel_dispatch_workflow,
            {
                "product_id": req.product_id,
                "video_url": res.video_url,
                "audio_url": res.audio_url,
                "title": req.title,
                "artisan_name": req.artisan_name,
                "craft_cluster": req.craft_cluster
            }
        )
        return res
    except Exception as e:
        logger.error(f"Reel generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# INNOVATION 2: BARGAIN GUARD AUTONOMOUS VOICE NEGOTIATOR
# ==============================================================================
@app.post("/api/v1/b2b/negotiate", response_model=NegotiationResponse)
async def negotiate_b2b_offer(req: NegotiationRequest, background_tasks: BackgroundTasks):
    """
    POST /api/v1/b2b/negotiate
    Protective AI agent evaluating bulk wholesale offers against statutory cost.
    Emits Hindi voice alert and polished English B2B counter-offer.
    Triggers n8n Bargain Guard WhatsApp workflow.
    """
    try:
        res = evaluate_b2b_negotiation(
            product_id=req.product_id,
            buyer_offer_inr=req.buyer_offer_inr,
            quantity=req.quantity,
            base_cost_inr=req.base_cost_inr,
            craft_category=req.craft_category,
            b2c_price_inr=req.b2c_price_inr
        )
        # Dispatch background event to n8n (WhatsApp Voice Note + Quick Replies)
        background_tasks.add_task(
            trigger_bargain_guard_workflow,
            {
                "product_id": req.product_id,
                "buyer_offer_inr": req.buyer_offer_inr,
                "quantity": req.quantity,
                "base_cost_inr": req.base_cost_inr,
                "verdict": res.verdict,
                "counter_offer_inr": res.counter_offer_inr,
                "artisan_audio_explanation_hi": res.artisan_audio_explanation_hi,
                "counter_message_en": res.counter_message_en,
                "margin_recovered_inr": res.margin_recovered_inr,
                "total_fair_value_inr": res.total_fair_value_inr
            }
        )
        return res
    except Exception as e:
        logger.error(f"B2B negotiation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# INNOVATION 3: STEGANOGRAPHIC DIGITAL GI WATERMARK
# ==============================================================================
@app.post("/api/v1/watermark/embed", response_model=WatermarkEmbedResponse)
async def embed_watermark(req: WatermarkEmbedRequest):
    """Embeds 64-bit DCT frequency watermark into craft image."""
    try:
        clean_b64 = req.image_base64
        if "," in clean_b64:
            clean_b64 = clean_b64.split(",")[1]
        img_bytes = base64.b64decode(clean_b64)

        watermarked_bytes, payload_str = embed_dct_watermark(
            image_bytes=img_bytes,
            beneficiary_id=req.beneficiary_id,
            cluster_pin=req.cluster_pin,
            gi_tag_serial=req.gi_tag_serial
        )

        timestamp = int(time.time())
        filename = f"watermarked_{timestamp}.png"
        filepath = settings.UPLOAD_DIR / filename
        with open(filepath, "wb") as f:
            f.write(watermarked_bytes)

        b64_out = f"data:image/png;base64,{base64.b64encode(watermarked_bytes).decode('utf-8')}"

        return WatermarkEmbedResponse(
            status="success",
            watermarked_image_base64=b64_out,
            watermarked_url=f"/static/uploads/{filename}",
            payload_embedded=payload_str,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        )
    except Exception as e:
        logger.error(f"Watermark embed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/verify-watermark", response_model=WatermarkVerifyResponse)
async def verify_watermark(req: WatermarkVerifyRequest):
    """
    POST /api/v1/verify-watermark
    Extracts DCT frequency payload to verify authenticity against powerloom copycats.
    """
    try:
        clean_b64 = req.image_base64
        if "," in clean_b64:
            clean_b64 = clean_b64.split(",")[1]
        img_bytes = base64.b64decode(clean_b64)

        is_auth, meta = extract_dct_watermark(img_bytes)

        return WatermarkVerifyResponse(
            is_authentic=is_auth,
            beneficiary_id=meta.get("beneficiary_id"),
            cluster_pin=meta.get("cluster_pin"),
            gi_tag_serial=meta.get("gi_tag_serial"),
            payload_raw=meta.get("payload_raw"),
            status_message=meta.get("status_message", "Analyzed")
        )
    except Exception as e:
        logger.error(f"Watermark verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# INNOVATION 4: ONDC BECKN PROTOCOL ADAPTER
# ==============================================================================
@app.post("/api/v1/ondc/generate-beckn-payload")
async def export_beckn_catalog(payload: dict = Body(...), background_tasks: BackgroundTasks = None):
    """
    POST /api/v1/ondc/generate-beckn-payload
    Formats product into complete Beckn Retail Protocol v1.2.0 catalog schema.
    Triggers n8n ONDC/GeM publish & MoSJE ministry analytics workflows.
    """
    try:
        product_data = payload.get("product_data", payload)
        pricing_data = payload.get("pricing_data")
        artisan_info = payload.get("artisan_info")

        beckn_schema = generate_beckn_catalog_payload(
            product_data=product_data,
            pricing_data=pricing_data,
            artisan_info=artisan_info
        )

        if background_tasks:
            background_tasks.add_task(trigger_ondc_publish_workflow, beckn_schema)
            background_tasks.add_task(
                trigger_ministry_analytics_workflow,
                "CATALOG_PUBLISHED",
                {
                    "item_id": product_data.get("id"),
                    "title": product_data.get("title_en"),
                    "category": product_data.get("craft_category"),
                    "cluster_pin": artisan_info.get("cluster_pin") if artisan_info else "273001",
                    "b2c_price": pricing_data.get("b2c_price") if pricing_data else None,
                    "labor_hours": product_data.get("estimated_hours")
                }
            )
        return beckn_schema
    except Exception as e:
        logger.error(f"ONDC Beckn generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
