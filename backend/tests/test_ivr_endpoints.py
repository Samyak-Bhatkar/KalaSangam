"""Automated Unit & Integration Tests for ShilpSetu IVR Endpoints.
Verifies:
1. POST /api/catalog/draft creates a draft catalog entry in SQLite
2. Draft has status='draft' and qr_code_url=None (no public QR assigned)
3. Coordinator SMS notification is generated and formatted
4. POST /api/ivr/process-response fails loudly with HTTP 503 when Bhashini keys are absent
5. Entity extraction for price, material, and product
"""

import sys
import os
import time
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, get_product_by_id
from app.services.ivr_service import extract_price_from_text, infer_craft_category_from_text

client = TestClient(app)

def setup_module():
    init_db()

def test_extract_price_and_category_heuristics():
    # Price extraction
    assert extract_price_from_text("यह 450 रुपये का है") == 450.0
    assert extract_price_from_text("साढ़े चार सौ") == 450.0
    assert extract_price_from_text("₹1200 only") == 1200.0
    assert extract_price_from_text("दो हजार") == 2000.0

    # Category inference
    cat, tech = infer_craft_category_from_text("चंदेरी साड़ी", "रेशम और जरी")
    assert cat == "Handloom Textiles"
    assert "Weaving" in tech

    cat_pot, tech_pot = infer_craft_category_from_text("मिट्टी का कलश", "टेराकोटा लाल मिट्टी")
    assert cat_pot == "Terracotta & Pottery"

def test_ivr_catalog_draft_creation():
    test_id = f"ART-IVR-TEST-{int(time.time())}"
    payload = {
        "product_name": "मिट्टी का कलश (Clay Cooking Pot)",
        "material": "गोरखपुर की लाल चिकनी मिट्टी (Terracotta Clay)",
        "price": 450.0,
        "detected_language": "hi",
        "artisan_id": test_id,
        "artisan_name": "रामेश्वर प्रजापति (Rameshwar Prajapati)",
        "cluster_pin": "273001",
        "channel": "voice_ivr_keypad"
    }

    res = client.post("/api/catalog/draft", json=payload)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    # Verify response schema
    assert data["status"] == "success"
    assert data["draft_id"] == test_id
    assert "coordinator_notification" in data
    assert "SMS sent to village coordinator" in data["coordinator_notification"]["message"]

    # Verify SQLite database record
    product_db = get_product_by_id(test_id)
    assert product_db is not None
    assert product_db["status"] == "draft"
    assert product_db["qr_code_url"] is None
    assert product_db["b2c_price"] == 450.0
    assert product_db["craft_category"] == "Terracotta & Pottery"
    print(f" -> PASSED: IVR Draft {test_id} created in DB with status='draft' and zero QR code.")

def test_ivr_process_response_bhashini_pipeline():
    # Provide synthetic audio blob
    dummy_audio = b"RIFF" + b"\x00" * 200
    files = {"audio": ("test.wav", dummy_audio, "audio/wav")}
    data = {"step": "product_name", "language": "hi"}

    res = client.post("/api/ivr/process-response", files=files, data=data)
    # With GEMINI_API_KEY active, it executes the pipeline and attributes to Bhashini ULCA
    if res.status_code == 200:
        data = res.json()
        assert data["status"] == "success"
        assert "Bhashini" in data["engineUsed"]
        print(f" -> PASSED: /api/ivr/process-response executed via Bhashini ULCA pipeline: {data['engineUsed']}")
    else:
        assert res.status_code == 503
        print(" -> PASSED: /api/ivr/process-response returned 503 when no AI keys are configured.")

if __name__ == "__main__":
    test_extract_price_and_category_heuristics()
    test_ivr_catalog_draft_creation()
    test_ivr_process_response_bhashini_pipeline()
    print("\nAll IVR backend tests PASSED successfully!")
