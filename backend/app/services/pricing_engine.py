"""Statutory Living-Wage Dynamic Pricing Engine
Client: Ministry of Social Justice and Empowerment (MoSJE)
Formulation: Cost-Plus Living-Wage Floor & Multi-Channel Pricing Tiers
"""

from typing import Optional
from ..config import settings
from ..models.schemas import PricingCalculationResponse

def calculate_living_wage_pricing(
    category: str,
    labor_hours: float,
    raw_cost: float,
    artisan_expected_price: Optional[float] = None
) -> PricingCalculationResponse:
    """
    Computes statutory living-wage fair trade pricing based on MoSJE formulas:
      Labor Cost = Labor_Hours * Fair_Wage_Floor (₹120/hr)
      Overhead = 10% * (Raw_Cost + Labor_Cost)
      Direct Cost = Raw_Cost + Labor_Cost + Overhead

    Channel Tiers:
      B2C = Direct_Cost * M_craft
      B2B = Direct_Cost * (1 + (M_craft - 1) * 0.40)
      GeM = Direct_Cost * 1.15
    """
    # 1. Statutory constants
    fair_wage_rate = settings.STATUTORY_FAIR_WAGE_PER_HOUR  # ₹120/hr
    labor_cost = round(labor_hours * fair_wage_rate, 2)
    overhead_cost = round(settings.WORKSHOP_OVERHEAD_RATE * (raw_cost + labor_cost), 2)
    
    # 2. Base statutory Direct Cost
    base_cost = round(raw_cost + labor_cost + overhead_cost, 2)

    # 3. Complexity Multiplier
    # Map category to recognized multiplier
    m_craft = 1.35  # default
    for cat_name, mult in settings.CRAFT_MULTIPLIERS.items():
        if cat_name.lower() in category.lower() or category.lower() in cat_name.lower():
            m_craft = mult
            break

    # 4. Multi-Channel Tiers
    b2c_price = round(base_cost * m_craft, 2)
    b2b_margin_factor = 1.0 + ((m_craft - 1.0) * 0.40)
    b2b_price = round(base_cost * b2b_margin_factor, 2)
    gem_price = round(base_cost * (1.0 + settings.GEM_PROCUREMENT_MARGIN), 2)

    # 5. Underpricing Guard
    is_underpriced = False
    warning_hi = None
    warning_en = None
    if artisan_expected_price is not None and artisan_expected_price > 0:
        if artisan_expected_price < base_cost:
            is_underpriced = True
            shortfall = round(base_cost - artisan_expected_price, 2)
            warning_hi = (
                f"चेतावनी: आपकी बताई गई कीमत (₹{artisan_expected_price:,.0f}) आपकी बुनियादी लागत और उचित मजदूरी "
                f"(₹{base_cost:,.0f}) से ₹{shortfall:,.0f} कम है! कृपया कम से कम ₹{base_cost:,.0f} निर्धारित करें।"
            )
            warning_en = (
                f"Warning: Your expected price (₹{artisan_expected_price:,.0f}) is ₹{shortfall:,.0f} below the "
                f"statutory fair living wage cost (₹{base_cost:,.0f}). Artisan labor must be protected!"
            )

    # Margin percentage on B2C over direct cost
    margin_pct = round(((b2c_price - base_cost) / base_cost) * 100, 1) if base_cost > 0 else 0.0

    return PricingCalculationResponse(
        category=category,
        labor_hours=labor_hours,
        raw_cost=raw_cost,
        fair_wage_rate=fair_wage_rate,
        labor_cost=labor_cost,
        overhead_cost=overhead_cost,
        base_cost=base_cost,
        b2c_price=b2c_price,
        b2b_price=b2b_price,
        gem_price=gem_price,
        artisan_expected_price=artisan_expected_price,
        is_underpriced=is_underpriced,
        underprice_warning_msg_hi=warning_hi,
        underprice_warning_msg_en=warning_en,
        margin_percentage=margin_pct
    )
