"""Comprehensive Automated Test Suite for ShilpSetu AI Backend
Tests all 7 core services and API contracts
"""

import os
import sys
import base64
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Fix Windows console UTF-8 printing
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')


from app.services.pricing_engine import calculate_living_wage_pricing
from app.services.image_studio import process_studio_image, image_to_base64
from app.services.catalog_engine import process_voice_and_catalog
from app.services.reel_generator import render_vertical_reel
from app.services.negotiator import evaluate_b2b_negotiation
from app.services.watermark import embed_dct_watermark, extract_dct_watermark
from app.services.ondc_adapter import generate_beckn_catalog_payload
from app.models.mock_data import CRAFT_FIXTURES

def test_pricing_engine():
    print("\n--- [1] Testing Pricing Engine ---")
    # Test Gorakhpur terracotta: 6 hours labor, 180 raw cost
    # Fair wage: 6 * 120 = 720
    # Overhead: 10% * (180 + 720) = 90
    # Base Direct Cost = 180 + 720 + 90 = 990
    res = calculate_living_wage_pricing(
        category="Terracotta & Pottery",
        labor_hours=6.0,
        raw_cost=180.0,
        artisan_expected_price=700.0  # Underpriced!
    )
    assert res.base_cost == 990.0, f"Expected base_cost 990.0, got {res.base_cost}"
    assert res.is_underpriced is True, "Expected underpricing flag to trigger"
    assert res.b2c_price == round(990.0 * 1.25, 2)
    assert res.gem_price == round(990.0 * 1.15, 2)
    print(f"✓ Base Direct Cost: ₹{res.base_cost}")
    print(f"✓ B2C Retail: ₹{res.b2c_price}, B2B Wholesale: ₹{res.b2b_price}, GeM: ₹{res.gem_price}")
    print(f"✓ Underpricing Guard successfully caught shortfall: {res.underprice_warning_msg_en}")

def test_watermark_service():
    print("\n--- [2] Testing Steganographic Digital GI Watermark ---")
    sample_img_path = backend_dir / "app" / "static" / "samples" / "chanderi_saree.jpg"
    with open(sample_img_path, "rb") as f:
        img_bytes = f.read()

    watermarked_bytes, payload = embed_dct_watermark(
        image_bytes=img_bytes,
        beneficiary_id="NSFDC-MP-77291",
        cluster_pin="473446",
        gi_tag_serial="GI-0007-0042"
    )
    assert len(watermarked_bytes) > 0, "Watermark output is empty"
    print(f"✓ Watermark embedded with payload: {payload}")

    is_auth, meta = extract_dct_watermark(watermarked_bytes)
    print(f"✓ Watermark extraction result: is_authentic={is_auth}, meta={meta}")
    assert is_auth is True, "Failed to extract embedded watermark"
    assert meta["beneficiary_id"] == "NSFDC-MP-77291"
    assert meta["cluster_pin"] == "473446"

def test_negotiator():
    print("\n--- [3] Testing Bargain Guard Voice Negotiator ---")
    # Lowball wholesale offer: ₹220 vs direct cost ₹260 for 100 units
    res = evaluate_b2b_negotiation(
        product_id="TEST-001",
        buyer_offer_inr=220.0,
        quantity=100,
        base_cost_inr=260.0,
        craft_category="Handloom Textiles"
    )
    assert res.verdict == "REJECT_AND_COUNTER"
    assert res.loss_per_unit_inr == 40.0
    print(f"✓ Verdict: {res.verdict}")
    print(f"✓ Hindi Audio Alert: {res.artisan_audio_explanation_hi}")
    print(f"✓ English Corporate Counter-Offer: {res.counter_message_en}")

def test_ondc_adapter():
    print("\n--- [4] Testing ONDC Beckn Protocol Retail v1.2 Adapter ---")
    fixture = CRAFT_FIXTURES["gorakhpur_terracotta"]
    payload = generate_beckn_catalog_payload(
        product_data=fixture,
        pricing_data={"base_cost": 990.0, "b2c_price": 1237.5, "b2b_price": 1089.0, "gem_price": 1138.5},
        artisan_info={"beneficiary_id": "NBCFDC-UP-18492", "artisan_name": "Sunil Kumar Prajapati", "cluster_pin": "273001"}
    )
    assert payload["context"]["core_version"] == "1.2.0"
    assert payload["context"]["domain"] == "ONDC:RET12"
    item = payload["message"]["catalog"]["bpp/providers"][0]["items"][0]
    assert item["price"]["currency"] == "INR"
    assert item["price"]["value"] == "1237.50"
    print(f"✓ Beckn payload successfully generated for item: {item['descriptor']['name']}")
    print(f"✓ BPP Provider: {payload['message']['catalog']['bpp/providers'][0]['descriptor']['name']}")

def test_image_studio():
    print("\n--- [5] Testing AI Image Studio Engine ---")
    sample_img_path = backend_dir / "app" / "static" / "samples" / "gorakhpur_terracotta.jpg"
    with open(sample_img_path, "rb") as f:
        img_bytes = f.read()

    raw_img, studio_canvas, meta = process_studio_image(img_bytes)
    assert studio_canvas.size == (1080, 1080)
    assert meta["lighting_normalized"] is True
    assert meta["drop_shadow_applied"] is True
    print(f"✓ Processed studio image to {studio_canvas.size} with {meta['segmentation_engine']}")

def test_catalog_engine():
    print("\n--- [6] Testing Catalog Engine Fallback ---")
    fixture = CRAFT_FIXTURES["gorakhpur_terracotta"]
    sample_img_path = backend_dir / "app" / "static" / "samples" / "gorakhpur_terracotta.jpg"
    with open(sample_img_path, "rb") as f:
        img_bytes = f.read()
    b64_img = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

    catalog = process_voice_and_catalog(
        image_base64=b64_img,
        language="hi",
        transcript=fixture["sample_transcript_hi"],
        category_hint="Terracotta"
    )
    assert catalog.craft_category == "Terracotta & Pottery"
    assert catalog.estimated_hours == 6
    assert catalog.gi_tag_eligible is True
    print(f"✓ Generated Catalog Title (EN): {catalog.title_en}")
    print(f"✓ Generated Catalog Title (HI): {catalog.title_hi}")

def test_reel_generator():
    print("\n--- [7] Testing 15-Second Video Reel Generator ---")
    sample_img_path = backend_dir / "app" / "static" / "samples" / "gorakhpur_terracotta.jpg"
    with open(sample_img_path, "rb") as f:
        img_bytes = f.read()
    b64_img = f"data:image/jpeg;base64,{base64.b64encode(img_bytes).decode('utf-8')}"

    res = render_vertical_reel(
        product_id="TEST-REEL-001",
        title="Gorakhpur Terracotta Urn",
        studio_image_base64=b64_img,
        story_narrative="Crafted by master artisan Sunil Kumar Prajapati using heritage clay technique.",
        artisan_name="Sunil Kumar Prajapati",
        craft_cluster="Gorakhpur, Uttar Pradesh"
    )
    assert res.duration == 15.0
    assert res.format == "mp4"
    assert res.reel_url.endswith(".mp4")
    print(f"✓ 15-second Vertical Video Reel successfully rendered: {res.reel_url}")
    print(f"✓ Soundtrack URL: {res.audio_soundtrack}")

if __name__ == "__main__":
    test_pricing_engine()
    test_watermark_service()
    test_negotiator()
    test_ondc_adapter()
    test_image_studio()
    test_catalog_engine()
    test_reel_generator()
    print("\n🎉 ALL 7 BACKEND SERVICES VERIFIED & PASSING!")
