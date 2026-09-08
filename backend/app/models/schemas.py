from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Studio Enhancer Schemas
class StudioEnhanceResponse(BaseModel):
    status: str = "success"
    original_url: str
    studio_url: str
    processed_base64: str
    width: int
    height: int
    lighting_normalized: bool
    drop_shadow_applied: bool

# Catalog Engine Schemas
class CatalogVoiceProcessRequest(BaseModel):
    image_base64: str
    language: str = "hi"
    transcript: Optional[str] = None
    category_hint: Optional[str] = None

class CatalogItemResponse(BaseModel):
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    craft_category: str
    materials_used: List[str]
    technique: str
    estimated_hours: int
    raw_material_cost_estimate_inr: float
    seo_keywords: List[str]
    gi_tag_eligible: bool
    source_language: str
    transcription: str
    tts_audio_url: Optional[str] = None

# Pricing Engine Schemas
class PricingCalculationRequest(BaseModel):
    category: str
    labor_hours: float = Field(ge=0.5, description="Labor invested in hours")
    raw_cost: float = Field(ge=0, description="Raw material cost in INR")
    artisan_expected_price: Optional[float] = None

class PricingCalculationResponse(BaseModel):
    category: str
    labor_hours: float
    raw_cost: float
    fair_wage_rate: float
    labor_cost: float
    overhead_cost: float
    base_cost: float  # Direct Cost = Raw + Labor + Overhead
    b2c_price: float
    b2b_price: float
    gem_price: float
    artisan_expected_price: Optional[float]
    is_underpriced: bool
    underprice_warning_msg_hi: Optional[str]
    underprice_warning_msg_en: Optional[str]
    margin_percentage: float

# AI Reel Marketing Schemas
class ReelGenerationRequest(BaseModel):
    product_id: str = "ART-2026-001"
    title: str
    studio_image_base64: str
    story_text: str
    language: str = "hi"
    artisan_name: str = "Ramesh Kumar"
    craft_cluster: str = "Chanderi, Madhya Pradesh"

class ReelGenerationResponse(BaseModel):
    reel_url: str
    duration: float = 15.0
    format: str = "mp4"
    qr_data: str
    narrative_text: str
    audio_soundtrack: str
    video_base64: Optional[str] = None

# Bargain Guard Negotiation Schemas
class NegotiationRequest(BaseModel):
    product_id: str
    buyer_offer_inr: float
    quantity: int = 100
    base_cost_inr: float
    craft_category: Optional[str] = "General Handicraft"
    b2c_price_inr: Optional[float] = None

class NegotiationResponse(BaseModel):
    verdict: str  # "REJECT_AND_COUNTER" | "ACCEPT"
    counter_offer_inr: float
    counter_message_en: str
    artisan_audio_explanation_hi: str
    loss_per_unit_inr: float
    total_fair_value_inr: float
    margin_recovered_inr: float

# Watermark Schemas
class WatermarkEmbedRequest(BaseModel):
    image_base64: str
    beneficiary_id: str = "MoSJE-849201"
    cluster_pin: str = "473446"
    gi_tag_serial: str = "GI-0078"

class WatermarkEmbedResponse(BaseModel):
    status: str = "success"
    watermarked_image_base64: str
    watermarked_url: str
    payload_embedded: str
    timestamp: str

class WatermarkVerifyRequest(BaseModel):
    image_base64: str

class WatermarkVerifyResponse(BaseModel):
    is_authentic: bool
    beneficiary_id: Optional[str] = None
    cluster_pin: Optional[str] = None
    gi_tag_serial: Optional[str] = None
    payload_raw: Optional[str] = None
    status_message: str

# Beckn / ONDC Schemas
class BecknCatalogPayload(BaseModel):
    context: Dict[str, Any]
    message: Dict[str, Any]
