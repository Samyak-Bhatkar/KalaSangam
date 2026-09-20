from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Studio Enhancer Schemas
class StudioQualityCheckRequest(BaseModel):
    image_base64: Optional[str] = None
    language: str = "hi"
    category_hint: Optional[str] = None

class StudioQualityCheckResponse(BaseModel):
    status: str = "success"
    passed: bool
    dominant_issue: Optional[str] = None  # "blurry", "cut_off", "too_dark", "too_bright", "cluttered", or None
    issue_icon: Optional[str] = None      # "shake", "crop", "moon", "sun_high", "layers", "check"
    voice_prompt_hi: str
    voice_prompt_en: str
    sharpness_score: float
    mean_brightness: float
    coverage_pct: float
    is_removable_bg: bool

class StudioEnhanceResponse(BaseModel):
    status: str = "success"
    original_url: str
    studio_url: str
    processed_base64: str
    width: int
    height: int
    lighting_normalized: bool
    drop_shadow_applied: bool
    cutout_url: Optional[str] = None
    cutout_base64: Optional[str] = None

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
    suggested_background_query: Optional[str] = "neutral wooden surface"

# Stock Background & Lifestyle Compositing Schemas
class BackgroundOption(BaseModel):
    id: str
    url: str
    thumbnail_url: str
    title: str
    source: str  # "pexels" | "pixabay" | "curated"
    recommended: bool = False

class BackgroundOptionsRequest(BaseModel):
    suggested_background_query: Optional[str] = "neutral wooden surface"
    limit: Optional[int] = 4

class BackgroundOptionsResponse(BaseModel):
    status: str = "success"
    query: str
    source: str
    options: List[BackgroundOption]

class LifestyleCompositeRequest(BaseModel):
    background_url: str
    cutout_base64: Optional[str] = None
    raw_image_base64: Optional[str] = None
    product_id: Optional[str] = None

class LifestyleCompositeResponse(BaseModel):
    status: str = "success"
    lifestyle_url: str
    lifestyle_base64: str
    background_url: str
    width: int = 1080
    height: int = 1080
    shadow_applied: bool = True

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

# Product Lifecycle Schemas (Draft-First & QR Code Lifecycle)
class ProductDraftSaveRequest(BaseModel):
    id: str
    title_hi: Optional[str] = ""
    title_en: Optional[str] = ""
    description_hi: Optional[str] = ""
    description_en: Optional[str] = ""
    craft_category: Optional[str] = ""
    technique: Optional[str] = ""
    raw_cost: Optional[float] = 0.0
    labor_hours: Optional[float] = 0.0
    b2c_price: Optional[float] = 0.0
    b2b_price: Optional[float] = 0.0
    gem_price: Optional[float] = 0.0
    artisan_name: Optional[str] = "Rural Artisan"
    beneficiary_id: Optional[str] = "MoSJE-NBCFDC-01"
    cluster_pin: Optional[str] = "273001"
    raw_image_url: Optional[str] = ""
    studio_image_url: Optional[str] = ""
    lifestyle_image_url: Optional[str] = ""
    watermarked_image_url: Optional[str] = ""

class ProductPublishRequest(BaseModel):
    product_data: Optional[ProductDraftSaveRequest] = None
    verify_base_url: Optional[str] = None
    pricing_data: Optional[Dict[str, Any]] = None
    artisan_info: Optional[Dict[str, Any]] = None

class ProductResponse(BaseModel):
    id: str
    title_hi: Optional[str] = None
    title_en: Optional[str] = None
    description_hi: Optional[str] = None
    description_en: Optional[str] = None
    craft_category: Optional[str] = None
    technique: Optional[str] = None
    raw_cost: Optional[float] = 0.0
    labor_hours: Optional[float] = 0.0
    b2c_price: Optional[float] = 0.0
    b2b_price: Optional[float] = 0.0
    gem_price: Optional[float] = 0.0
    artisan_name: Optional[str] = None
    beneficiary_id: Optional[str] = None
    cluster_pin: Optional[str] = None
    raw_image_url: Optional[str] = None
    studio_image_url: Optional[str] = None
    lifestyle_image_url: Optional[str] = None
    watermarked_image_url: Optional[str] = None
    status: str  # 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
    qr_code_url: Optional[str] = None
    channel: Optional[str] = "camera"
    original_transcript: Optional[str] = ""
    rejection_reason: Optional[str] = ""
    correction_log: Optional[Any] = None
    created_at: Optional[str] = None
    published_at: Optional[str] = None

class ProductPublicVerifyResponse(BaseModel):
    status: str = "verified"
    id: str
    title_hi: Optional[str] = None
    title_en: Optional[str] = None
    description_hi: Optional[str] = None
    description_en: Optional[str] = None
    craft_category: Optional[str] = None
    technique: Optional[str] = None
    b2c_price: Optional[float] = None
    gem_price: Optional[float] = None
    artisan_name: Optional[str] = None
    beneficiary_id: Optional[str] = None
    cluster_pin: Optional[str] = None
    studio_image_url: Optional[str] = None
    watermarked_image_url: Optional[str] = None
    published_at: Optional[str] = None
    qr_code_url: Optional[str] = None
    ondc_buy_url: str
    fair_wage_guarantee: str = "₹120/hr statutory floor compliant (NBCFDC/NSFDC)"
    authenticity_seal: str = "MoSJE GI Certified Authentic Handcrafted Indian Product"

# IVR Telephony Schemas (Zero-Smartphone Tier)
class IVRCatalogDraftRequest(BaseModel):
    product_name: str
    material: str
    price: float
    detected_language: Optional[str] = "hi"
    timestamp: Optional[str] = None
    artisan_id: Optional[str] = None
    artisan_name: Optional[str] = "Rural Artisan (Keypad IVR Caller)"
    cluster_pin: Optional[str] = "273001"
    channel: Optional[str] = "voice_ivr_keypad"

class CoordinatorNotification(BaseModel):
    recipient: str
    message: str
    cluster_pin: str
    dispatched_at: str
    channel: str = "voice_ivr_keypad"
    status: str = "QUEUED_FOR_FIELD_DISPATCH"

class IVRCatalogDraftResponse(BaseModel):
    status: str = "success"
    draft_id: str
    product: Dict[str, Any]
    coordinator_notification: CoordinatorNotification

# Coordinator Review Panel Schemas
class CoordinatorDraftUpdateRequest(BaseModel):
    title_hi: Optional[str] = None
    title_en: Optional[str] = None
    description_hi: Optional[str] = None
    description_en: Optional[str] = None
    b2c_price: Optional[float] = None
    b2b_price: Optional[float] = None
    gem_price: Optional[float] = None
    craft_category: Optional[str] = None
    technique: Optional[str] = None
    artisan_name: Optional[str] = None
    cluster_pin: Optional[str] = None
    status: Optional[str] = "approved"

class CoordinatorDraftRejectRequest(BaseModel):
    reason: str = Field(min_length=3, description="Required audit justification for draft rejection")

class CoordinatorDraftCounts(BaseModel):
    total_pending: int
    missing_photo: int
    camera_drafts: int
    ivr_drafts: int
    all: int

class CoordinatorDraftListResponse(BaseModel):
    status: str = "success"
    counts: CoordinatorDraftCounts
    drafts: List[Dict[str, Any]]

class CoordinatorPhotoUploadResponse(BaseModel):
    status: str = "success"
    draft_id: str
    raw_image_url: str
    studio_image_url: str
    processed_base64: str
    message: str = "Craft photo enhanced and studio grounded successfully"


