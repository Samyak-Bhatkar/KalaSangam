"""Automated Test Suite for Product Draft, Publish, QR Lifecycle and Lazy Auto-Cleanup."""
import sys
import os
import time
import sqlite3
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, cleanup_expired_drafts, get_db_connection

def test_full_lifecycle():
    client = TestClient(app)
    init_db()

    test_id = f"TEST-ARTISAN-{int(time.time())}"
    
    print(f"\n[1] Testing 'Save as Draft' for {test_id}...")
    draft_payload = {
        "id": test_id,
        "title_hi": "हस्तनिर्मित चंदेरी साड़ी",
        "title_en": "Handcrafted Chanderi Saree",
        "description_hi": "प्राकृतिक रेशम और ज़री",
        "description_en": "Natural silk with authentic zari work",
        "craft_category": "Handloom Textiles",
        "technique": "Handloom Zari Weaving",
        "raw_cost": 1200.0,
        "labor_hours": 18.0,
        "b2c_price": 3200.0,
        "b2b_price": 2800.0,
        "gem_price": 2700.0,
        "artisan_name": "Shanti Devi",
        "beneficiary_id": "NBCFDC-8492",
        "cluster_pin": "473446",
        "raw_image_url": "/static/uploads/raw_sample.jpg",
        "studio_image_url": "/static/uploads/studio_sample.jpg",
    }

    res = client.post("/api/v1/products/draft", json=draft_payload)
    assert res.status_code == 200, f"Draft creation failed: {res.text}"
    data = res.json()
    assert data["status"] == "draft", f"Expected status 'draft', got {data['status']}"
    assert data["qr_code_url"] is None, f"Draft MUST NOT have a QR code, got {data['qr_code_url']}"
    print(" -> PASSED: Draft created with status='draft' and zero QR code.")

    print(f"\n[2] Testing Public Verify Endpoint on Draft (Anti-Leak Check)...")
    res_verify_draft = client.get(f"/api/v1/products/{test_id}/verify")
    assert res_verify_draft.status_code == 404, f"Expected 404 for draft, got {res_verify_draft.status_code}"
    print(" -> PASSED: Public verification correctly returned 404 (zero leakage of drafts).")

    print(f"\n[3] Testing 'Publish to ONDC & GeM' for {test_id}...")
    publish_payload = {
        "product_data": draft_payload,
        "pricing_data": {
            "raw_cost": 1200.0,
            "artisan_labor_earning": 2160.0,
            "b2c_price": 3200.0,
            "gem_price": 2700.0
        },
        "artisan_info": {
            "artisan_name": "Shanti Devi",
            "cluster_pin": "473446",
            "beneficiary_id": "NBCFDC-8492"
        }
    }
    res_publish = client.post(f"/api/v1/products/{test_id}/publish", json=publish_payload)
    assert res_publish.status_code == 200, f"Publish failed: {res_publish.text}"
    pub_data = res_publish.json()
    assert pub_data["status"] == "published", f"Expected status 'published', got {pub_data['status']}"
    assert pub_data["qr_code_url"] is not None, "Published product MUST have a QR code URL!"
    assert pub_data["published_at"] is not None, "Published product MUST have published_at timestamp!"
    print(f" -> PASSED: Product published! QR Code generated: {pub_data['qr_code_url']}")

    print(f"\n[4] Testing Public Verify Endpoint on Published Product...")
    res_verify_pub = client.get(f"/api/v1/products/{test_id}/verify")
    assert res_verify_pub.status_code == 200, f"Expected 200 for published, got {res_verify_pub.status_code}"
    verified_data = res_verify_pub.json()
    assert verified_data["status"] == "verified"
    assert verified_data["artisan_name"] == "Shanti Devi"
    assert verified_data["qr_code_url"] is not None
    assert "ondc://" in verified_data["ondc_buy_url"]
    print(f" -> PASSED: Public verify returned certified dossier: {verified_data['authenticity_seal']}")

    print(f"\n[5] Testing Lazy Auto-Cleanup of 24h Old Drafts...")
    old_draft_id = f"OLD-DRAFT-{int(time.time())}"
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (
                id, title_hi, title_en, status, created_at
            ) VALUES (
                ?, 'पुरानी कलाकृति', 'Old Draft', 'draft', datetime('now', '-25 hours')
            )
        """, (old_draft_id,))
        conn.commit()

    # Call /api/v1/products which triggers cleanup
    res_list = client.get("/api/v1/products")
    assert res_list.status_code == 200
    products = res_list.json()["products"]
    found_old = any(p["id"] == old_draft_id for p in products)
    assert not found_old, f"Old draft {old_draft_id} should have been automatically cleaned up!"
    print(f" -> PASSED: Lazy auto-cleanup successfully purged 25-hour old draft!")

    # Cleanup test item
    client.delete(f"/api/v1/products/{test_id}")
    print("\nALL LIFECYCLE TESTS PASSED SUCCESSFULLY!\n")

if __name__ == "__main__":
    test_full_lifecycle()
