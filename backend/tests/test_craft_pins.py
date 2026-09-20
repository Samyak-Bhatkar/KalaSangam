"""Automated Test Suite for Craft Honesty & Authenticity Pins (Problem Statement 26090).
Verifies:
1. AI / Heuristic Voice Callout Classification & Bilingual Label Formatting
2. Audio File Persistence for Buyer Voice Playback
3. API Endpoints: /api/v1/studio/annotate-pin-voice and -json
4. Database Persistence: Draft Save, Product Publish, and Public Verification Dossier
"""
import sys
import time
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.database import init_db, get_product_by_id
from app.services.craft_pin_service import (
    classify_and_format_pin_callout,
    save_pin_audio_file,
    heuristic_classify_pin,
    composite_annotated_buyer_image,
    DEFECT_VARIATION_BANK,
    CRAFT_FEATURE_BANK,
)
from app.services.ondc_adapter import generate_beckn_catalog_payload as build_beckn_catalog_payload

client = TestClient(app)

def test_pin_callout_classification():
    """Verify classification and label generation for both imperfections and craft details."""
    init_db()

    # Test Case 1: Natural handmade variation (Terracotta hairline crack)
    text_imperfection = "यहाँ पर हल्की सी दरार है, यह मिट्टी के प्राकृतिक स्वभाव और भट्टी में पकाने के कारण है"
    res1 = classify_and_format_pin_callout(
        transcript=text_imperfection,
        language="hi",
        category_hint="Terracotta Pottery"
    )
    assert res1["category"] == "imperfection", f"Expected 'imperfection', got {res1['category']}"
    assert len(res1.get("short_label", "")) > 0, "Short label must not be empty"
    assert "दोष" not in res1.get("short_label", ""), "Label must not use negative defect framing"
    assert "खराबी" not in res1.get("short_label", ""), "Label must not use negative flaw framing"
    assert len(res1.get("full_description", "")) > 0, "Full description must not be empty"

    # Test Case 2: Craft highlight / motif (Hand-carved wheel rim)
    text_feature = "यह हाथ से उकेरी गई पारंपरिक पहिया नक्काशी है, जो हमारे परिवार की तीन पीढ़ियों की पहचान है"
    res2 = classify_and_format_pin_callout(
        transcript=text_feature,
        language="hi",
        category_hint="Terracotta Pottery"
    )
    assert res2["category"] == "craft_detail", f"Expected 'craft_detail', got {res2['category']}"
    assert len(res2.get("short_label", "")) > 0, "Short label must not be empty"
    assert len(res2.get("full_description", "")) > 0

    # Test Case 3: English text variation
    text_en = "Slight natural unevenness in the hand-turned clay rim, characteristic of manual wheel crafting."
    res3 = classify_and_format_pin_callout(
        transcript=text_en,
        language="en",
        category_hint="Terracotta"
    )
    assert res3["category"] == "imperfection"
    assert "defect" not in res3.get("short_label", "").lower()
    assert "flaw" not in res3.get("short_label", "").lower()

def test_save_pin_audio_file():
    """Verify audio bytes persistence to static directory."""
    dummy_wav = b"RIFF....WAVEfmt ...." + b"\x00" * 100
    url = save_pin_audio_file(dummy_wav, mime_type="audio/wav")
    assert url.startswith("/static/uploads/"), f"Unexpected url format: {url}"
    
    # Check that file actually exists in settings.UPLOAD_DIR
    rel_path = url.replace("/static/uploads/", "")
    full_path = settings.UPLOAD_DIR / rel_path
    assert full_path.exists(), f"Audio file not saved at {full_path}"
    assert full_path.stat().st_size > 0

def test_annotate_pin_voice_endpoints():
    """Verify both JSON and Multipart endpoints."""
    # JSON endpoint
    json_req = {
        "transcript": "यहाँ पर प्राकृतिक ज़री की हल्की बुनाई भिन्नता है, जो हथकरघे की निशानी है",
        "language": "hi",
        "category_hint": "Handloom Weaving",
        "pin_number": 1,
        "x": 42.5,
        "y": 68.0,
        "audio_url": "/static/uploads/test_sample.webm"
    }
    res = client.post("/api/v1/studio/annotate-pin-voice-json", json=json_req)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "success"
    pin = data["pin"]
    assert pin["pin_number"] == 1
    assert pin["x"] == 42.5
    assert pin["y"] == 68.0
    assert pin["category"] in ["imperfection", "craft_detail"]
    assert pin["short_label"]
    assert pin["audio_url"] == "/static/uploads/test_sample.webm"

    # Multipart endpoint with mock audio file
    dummy_audio = b"\x1a\x45\xdf\xa3" + b"\x00" * 200  # Mock WebM header
    files = {"audio": ("sample.webm", dummy_audio, "audio/webm")}
    form_data = {
        "transcript": "पारंपरिक कुम्हार चाक की हाथ से बनी धुरी",
        "language": "hi",
        "category_hint": "Terracotta",
        "pin_number": "2",
        "x_pct": "35.2",
        "y_pct": "75.8"
    }
    res_multi = client.post("/api/v1/studio/annotate-pin-voice", files=files, data=form_data)
    assert res_multi.status_code == 200, res_multi.text
    data_multi = res_multi.json()
    assert data_multi["status"] == "success"
    pin_m = data_multi["pin"]
    assert pin_m["pin_number"] == 2
    assert pin_m["x"] == 35.2
    assert pin_m["y"] == 75.8
    assert pin_m["audio_url"] is not None
    assert pin_m["audio_url"].startswith("/static/uploads/")

def test_database_lifecycle_with_craft_pins():
    """Verify craft pins survive draft save, fetch, publish, and public verify."""
    test_id = f"TEST-PINS-{int(time.time())}"
    
    test_pins = [
        {
            "id": f"pin_{int(time.time())}_1",
            "pin_number": 1,
            "x": 38.5,
            "y": 62.0,
            "category": "imperfection",
            "short_label": "प्राकृतिक दरार / Natural hairline",
            "full_description": "मिट्टी के प्राकृतिक स्वभाव के कारण पकाने के बाद हल्की सी दरार",
            "audio_url": "/static/uploads/test1.webm",
            "language": "hi"
        },
        {
            "id": f"pin_{int(time.time())}_2",
            "pin_number": 2,
            "x": 55.0,
            "y": 28.5,
            "category": "craft_detail",
            "short_label": "पारंपरिक चाक नक्काशी / Wheel motif",
            "full_description": "हस्तनिर्मित बारीक पहिया नक्काशी जो पीढ़ियों पुरानी है",
            "audio_url": None,
            "language": "hi"
        }
    ]

    draft_payload = {
        "id": test_id,
        "title_hi": "गोरखपुर टेराकोटा कलश",
        "title_en": "Gorakhpur Terracotta Pot",
        "description_hi": "पारंपरिक लाल मिट्टी का कलश",
        "description_en": "Traditional red clay pot",
        "craft_category": "Terracotta Pottery",
        "technique": "Hand-turned wheel pottery",
        "raw_cost": 250.0,
        "labor_hours": 5.0,
        "b2c_price": 850.0,
        "artisan_name": "राम कुमार प्रजापति",
        "beneficiary_id": "NBCFDC-5120",
        "cluster_pin": "273001",
        "raw_image_url": "/static/uploads/raw_terracotta.jpg",
        "studio_image_url": "/static/uploads/studio_terracotta.jpg",
        "craft_pins": test_pins
    }

    # 1. Save draft
    res_draft = client.post("/api/v1/products/draft", json=draft_payload)
    assert res_draft.status_code == 200, res_draft.text
    draft_data = res_draft.json()
    assert draft_data["status"] == "draft"
    assert len(draft_data["craft_pins"]) == 2
    assert draft_data["craft_pins"][0]["short_label"] == test_pins[0]["short_label"]
    assert draft_data["craft_pins"][1]["category"] == "craft_detail"

    # 2. Check direct database get
    db_prod = get_product_by_id(test_id)
    assert db_prod is not None
    assert len(db_prod.get("craft_pins", [])) == 2

    # 3. Publish product
    pub_payload = {
        "product_data": draft_payload,
        "pricing_data": {"b2c_price": 850.0},
        "artisan_info": {"cluster_pin": "273001"}
    }
    res_pub = client.post(f"/api/v1/products/{test_id}/publish", json=pub_payload)
    assert res_pub.status_code == 200, res_pub.text
    pub_data = res_pub.json()
    assert pub_data["status"] == "published"
    assert len(pub_data["craft_pins"]) == 2

    # 4. Check public verification endpoint
    res_verify = client.get(f"/api/v1/products/{test_id}/verify")
    assert res_verify.status_code == 200, res_verify.text
    verify_data = res_verify.json()
    assert verify_data["status"] == "verified"
    assert len(verify_data["craft_pins"]) == 2
    assert verify_data["craft_pins"][0]["x"] == 38.5
    assert verify_data["craft_pins"][1]["x"] == 55.0
    print("\n -> All Craft Pin backend lifecycle tests PASSED successfully!")


def test_curated_word_bank_matching():
    """Verify that pin classifications strictly match terms from the curated word banks."""
    # Test 1: Imperfection maps to DEFECT_VARIATION_BANK
    res_crack = classify_and_format_pin_callout(
        transcript="यहाँ पर मिट्टी की हल्की सी हेयरलाइन दरार है",
        language="hi",
        category_hint="Terracotta"
    )
    assert res_crack["category"] == "imperfection"
    assert res_crack["bank_term"] in DEFECT_VARIATION_BANK
    assert res_crack["short_label_en"] == res_crack["bank_term"]
    assert "one_line_summary" in res_crack
    assert len(res_crack["one_line_summary"].split()) <= 15

    # Test 2: Craft detail maps to CRAFT_FEATURE_BANK
    res_carv = classify_and_format_pin_callout(
        transcript="यह हाथ से उकेरी गई पारंपरिक नक्काशी का काम है",
        language="hi",
        category_hint="Woodcraft"
    )
    assert res_carv["category"] == "craft_detail"
    assert res_carv["bank_term"] in CRAFT_FEATURE_BANK
    assert res_carv["short_label_en"] == res_carv["bank_term"]
    assert len(res_carv["one_line_summary"].split()) <= 15


def test_export_annotated_image_pillow():
    """Verify server-side Pillow compositing generates a valid flattened JPEG with elbow callouts."""
    from PIL import Image

    sample_pins = [
        {
            "id": "pin_1",
            "pin_number": 1,
            "x": 40.0,
            "y": 60.0,
            "category": "imperfection",
            "bank_term": "Hairline Crack",
            "short_label_en": "Hairline Crack",
            "one_line_summary": "Natural surface nuance from kiln firing.",
            "label_angle": 210.0,
        },
        {
            "id": "pin_2",
            "pin_number": 2,
            "x": 58.0,
            "y": 35.0,
            "category": "craft_detail",
            "bank_term": "Traditional Motif",
            "short_label_en": "Traditional Motif",
            "one_line_summary": "Hand-carved concentric wheel motif detailing.",
            "label_angle": 35.0,
        }
    ]

    # Use a blank canvas or sample image
    file_url, data_url = composite_annotated_buyer_image(
        image_source=None,
        pins=sample_pins,
        canvas_size=1080
    )

    assert file_url.startswith("/static/uploads/"), f"Unexpected file URL: {file_url}"
    assert data_url.startswith("data:image/jpeg;base64,"), "Output must be JPEG data URL"

    # Verify physical file existence and JPEG format
    rel_path = file_url.replace("/static/uploads/", "")
    full_path = settings.UPLOAD_DIR / rel_path
    assert full_path.exists(), f"File does not exist at {full_path}"
    assert full_path.stat().st_size > 5000, "File size too small for a 1080p JPEG"

    # Open with PIL and verify format & dimensions
    with Image.open(full_path) as img:
        assert img.format == "JPEG", f"Expected JPEG format, got {img.format}"
        assert img.size == (1080, 1080), f"Expected 1080x1080, got {img.size}"


def test_export_annotated_image_endpoint():
    """Verify POST /api/v1/studio/export-annotated-image endpoint."""
    sample_payload = {
        "image_url": "https://shilpsetu.gov.in/static/uploads/default_studio.jpg",
        "pins": [
            {
                "id": "pin_api_1",
                "pin_number": 1,
                "x": 45.0,
                "y": 55.0,
                "category": "imperfection",
                "bank_term": "Surface Pitting",
                "short_label_en": "Surface Pitting",
                "one_line_summary": "Organic clay surface pitting from firing.",
                "label_angle": 180.0,
            }
        ],
        "canvas_size": 1080
    }

    res = client.post("/api/v1/studio/export-annotated-image", json=sample_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "success"
    assert data["format"] == "JPEG"
    assert data["annotated_image_url"].startswith("/static/uploads/")
    assert data["annotated_image_base64"].startswith("data:image/jpeg;base64,")


def test_ondc_payload_includes_annotated_image():
    """Verify that Beckn payload generator includes annotated_image_url in catalog_images."""
    product_data = {
        "id": "PROD-TEST-ONDC",
        "title_en": "Handcrafted Terracotta Urn",
        "studio_image_url": "https://shilpsetu.gov.in/static/uploads/studio_pot.jpg",
        "lifestyle_image_url": "https://shilpsetu.gov.in/static/uploads/lifestyle_pot.jpg",
        "annotated_image_url": "https://shilpsetu.gov.in/static/uploads/annotated_callout.jpg",
    }
    pricing_data = {"b2c_price": 1200.0}
    artisan_info = {"artisan_name": "Ramesh Kumar", "cluster_pin": "273001"}

    beckn = build_beckn_catalog_payload(product_data, pricing_data, artisan_info)
    items = beckn["message"]["catalog"]["bpp/providers"][0]["items"]
    item_images = items[0]["descriptor"]["images"]

    assert "https://shilpsetu.gov.in/static/uploads/studio_pot.jpg" in item_images
    assert "https://shilpsetu.gov.in/static/uploads/lifestyle_pot.jpg" in item_images
    assert "https://shilpsetu.gov.in/static/uploads/annotated_callout.jpg" in item_images
    assert len(item_images) == 3
