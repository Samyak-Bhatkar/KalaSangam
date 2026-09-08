"""Bargain Guard Autonomous Voice Negotiator
Client: Ministry of Social Justice and Empowerment (MoSJE)
Section 5, Innovation 2: B2B wholesale offer evaluation, artisan protection,
regional Hindi audio alert generation, and corporate counter-offer synthesis.
"""

from typing import Optional
from ..models.schemas import NegotiationResponse
from ..config import settings

def evaluate_b2b_negotiation(
    product_id: str,
    buyer_offer_inr: float,
    quantity: int,
    base_cost_inr: float,
    craft_category: Optional[str] = "General Handicraft",
    b2c_price_inr: Optional[float] = None
) -> NegotiationResponse:
    """
    Evaluates wholesale buyer inquiries against statutory Direct Cost.
    Prevents exploitation of rural artisans by predatory middlemen.
    """
    # 1. Target B2B price with fair wholesale margin
    m_craft = 1.35
    for cat_name, mult in settings.CRAFT_MULTIPLIERS.items():
        if cat_name.lower() in (craft_category or "").lower():
            m_craft = mult
            break

    # Standard wholesale target
    target_b2b_price = round(base_cost_inr * (1.0 + (m_craft - 1.0) * 0.40), 2)
    # Recommended counter offer (gives 10-15% margin above direct cost depending on volume)
    counter_offer = round(max(target_b2b_price, base_cost_inr * 1.12), 2)

    total_fair_value = round(counter_offer * quantity, 2)
    margin_recovered = round((counter_offer - buyer_offer_inr) * quantity, 2)

    # 2. Evaluation Logic
    if buyer_offer_inr < base_cost_inr:
        loss_per_unit = round(base_cost_inr - buyer_offer_inr, 2)
        total_loss = round(loss_per_unit * quantity, 2)
        verdict = "REJECT_AND_COUNTER"

        artisan_alert_hi = (
            f"व्यापारी {quantity} पीस के लिए ₹{buyer_offer_inr:,.0f} प्रति पीस का ऑफर दे रहा है। "
            f"आपकी मूल लागत ₹{base_cost_inr:,.0f} है, जिससे आपको प्रति पीस ₹{loss_per_unit:,.0f} "
            f"(कुल ₹{total_loss:,.0f}) का भारी नुकसान होगा! क्या मैं ₹{counter_offer:,.0f} का उचित काउंटर-ऑफर भेजूं?"
        )

        counter_message_en = (
            f"Dear Buyer, thank you for your inquiry for {quantity} units of authentic {craft_category}. "
            f"Under the Ministry of Social Justice & Empowerment statutory living-wage framework, "
            f"our certified direct production cost is ₹{base_cost_inr:,.0f}/unit. "
            f"The offered rate of ₹{buyer_offer_inr:,.0f}/unit is below legal artisan labor compensation. "
            f"We can offer a preferential volume wholesale rate of ₹{counter_offer:,.0f}/unit (ex-cluster), "
            f"guaranteeing genuine master-craft quality with dispatch within 10 business days."
        )

    elif buyer_offer_inr < target_b2b_price:
        loss_per_unit = 0.0
        diff_from_target = round(target_b2b_price - buyer_offer_inr, 2)
        verdict = "REJECT_AND_COUNTER"

        artisan_alert_hi = (
            f"व्यापारी का ₹{buyer_offer_inr:,.0f} का ऑफर आपकी मूल लागत तो निकाल रहा है, "
            f"लेकिन थोक बाजार के मानक मुनाफे से ₹{diff_from_target:,.0f} कम है। "
            f"क्या मैं ₹{counter_offer:,.0f} का पेशेवर काउंटर-ऑफर भेजूं?"
        )

        counter_message_en = (
            f"Thank you for your bulk order request of {quantity} units. "
            f"While ₹{buyer_offer_inr:,.0f} covers our baseline materials and wages, "
            f"our best wholesale price for this hand-crafted batch is ₹{counter_offer:,.0f}/unit. "
            f"This includes quality certification and export-grade protective packaging."
        )

    else:
        # Profitable offer: Recommend acceptance
        loss_per_unit = 0.0
        profit_per_unit = round(buyer_offer_inr - base_cost_inr, 2)
        total_profit = round(profit_per_unit * quantity, 2)
        verdict = "ACCEPT"

        artisan_alert_hi = (
            f"बधाई हो! व्यापारी {quantity} पीस के लिए ₹{buyer_offer_inr:,.0f} का बहुत अच्छा ऑफर दे रहा है। "
            f"इसमें आपको प्रति पीस ₹{profit_per_unit:,.0f} (कुल ₹{total_profit:,.0f}) का शुद्ध लाभ मिलेगा। "
            f"यह ऑर्डर तुरंत स्वीकार किया जाना चाहिए।"
        )

        counter_message_en = (
            f"Thank you for your generous bulk purchase offer of ₹{buyer_offer_inr:,.0f}/unit for {quantity} pieces. "
            f"We gratefully accept this purchase order. Our MoSJE certified artisan collective will commence "
            f"dispatch preparations immediately."
        )

    return NegotiationResponse(
        verdict=verdict,
        counter_offer_inr=counter_offer,
        counter_message_en=counter_message_en,
        artisan_audio_explanation_hi=artisan_alert_hi,
        loss_per_unit_inr=loss_per_unit,
        total_fair_value_inr=total_fair_value,
        margin_recovered_inr=max(0.0, margin_recovered)
    )
