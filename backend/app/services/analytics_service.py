"""Seller-App Layer Analytics & Price Reality Check Service
Client: Ministry of Social Justice and Empowerment (MoSJE)
Purpose: Instruments storefront and catalog page loads to provide artisans with
         conversion funnel insights (views vs purchases) and fair living-wage
         guardrails. Note: These metrics are captured directly at the Seller-App
         layer, as ONDC Beckn protocol does not provide seller-side view analytics.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel

class SellerAnalyticsResponse(BaseModel):
    artisan_id: str
    views_this_week: int
    sales_this_week: int
    views_change_pct: float
    diagnosis_hi: str
    diagnosis_en: str
    conversion_ratio_status: str  # 'needs_price_check' | 'healthy' | 'low_traffic'
    price_floor_inr: float
    current_product_price_inr: float
    ai_suggested_price_inr: float
    is_rare_item: bool
    rare_benchmark_range_inr: Optional[str] = None
    voice_narration_hi: str
    voice_narration_en: str
    data_source_note: str

# In-memory session counter for storefront view events
_PRODUCT_VIEWS_STORE: Dict[str, int] = {
    "CRAFT-NBCFDC-002": 214,
    "CRAFT-NSFDC-001": 182,
}

def record_product_view(product_id: str) -> int:
    """Increments the Seller-App page view counter for a product."""
    current = _PRODUCT_VIEWS_STORE.get(product_id, 0) + 1
    _PRODUCT_VIEWS_STORE[product_id] = current
    return current

def get_seller_reality_check(
    artisan_id: str = "ART-NBCFDC-8492",
    product_id: str = "CRAFT-NBCFDC-002"
) -> SellerAnalyticsResponse:
    """
    Returns views-vs-sales diagnostics and pricing guardrails for the artisan cockpit.
    """
    views = _PRODUCT_VIEWS_STORE.get(product_id, 214)
    sales = 0  # 0 conversions this week to trigger pricing check demo
    
    # Diagnosis logic
    diagnosis_hi = "बहुत लोग देख रहे हैं पर खरीद नहीं रहे — कीमत जांचें"
    diagnosis_en = "Many people are viewing but not buying — check your price"
    status = "needs_price_check"

    price_floor = 320.0
    current_price = 450.0
    ai_suggested = 390.0

    voice_hi = (
        f"इस हफ्ते 214 खरीदारों ने आपका शिल्प देखा, पर कोई बिक्री नहीं हुई। "
        f"बहुत लोग देख रहे हैं पर खरीद नहीं रहे — कीमत जांचें। "
        f"आपकी न्यूनतम उचित लागत ₹320 है, और AI का सुझाव ₹390 है।"
    )
    voice_en = (
        f"214 buyers viewed your craft this week with zero sales. "
        f"Many people are viewing but not buying — check your price. "
        f"Your fair living-wage floor is ₹320, and the AI suggests adjusting to ₹390."
    )

    return SellerAnalyticsResponse(
        artisan_id=artisan_id,
        views_this_week=views,
        sales_this_week=sales,
        views_change_pct=+24.5,
        diagnosis_hi=diagnosis_hi,
        diagnosis_en=diagnosis_en,
        conversion_ratio_status=status,
        price_floor_inr=price_floor,
        current_product_price_inr=current_price,
        ai_suggested_price_inr=ai_suggested,
        is_rare_item=True,
        rare_benchmark_range_inr="₹800–₹1,200",
        voice_narration_hi=voice_hi,
        voice_narration_en=voice_en,
        data_source_note="Internal Seller-App layer analytics (not native ONDC Beckn data)"
    )
