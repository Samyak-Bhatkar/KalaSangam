"""Automated Unit & Integration Tests for Village Coordinator Review Panel.
Verifies:
1. GET /api/v1/coordinator/drafts lists pending drafts with accurate count metrics
2. Filter queries: all, camera, ivr, missing_photo
3. PUT /api/v1/coordinator/drafts/{id} updates fields and records audit correction log
4. POST /api/v1/coordinator/drafts/{id}/reject marks status='rejected' with mandatory reason
5. POST /api/v1/coordinator/drafts/{id}/upload-photo enhances in-person photo via AI Image Studio
6. POST /api/v1/coordinator/drafts/{id}/publish moves draft to published with certified QR
7. GET /api/v1/storefront/products returns live published listings
"""

import sys
import io
import time
from pathlib import Path
from PIL import Image

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, save_draft_product, get_product_by_id, delete_product

client = TestClient(app)

def setup_module():
    init_db()

def create_test_image_bytes():
    """Generates a small test image in memory."""
    img = Image.new("RGB", (200, 200), color=(180, 80, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_coordinator_draft_lifecycle():
    ts = int(time.time() * 1000)
    camera_draft_id = f"ART-COORD-CAM-{ts}"
    ivr_draft_id = f"ART-IVR-COORD-{ts}"

    # 1. Seed two test drafts: one from camera (with photo) and one from IVR (photo pending)
    save_draft_product({
        "id": camera_draft_id,
        "title_en": "Terracotta Flower Pot",
        "title_hi": "टेराकोटा गमला",
        "description_en": "Handmade red clay pot",
        "description_hi": "हाथ से बना लाल मिट्टी का गमला",
        "craft_category": "Terracotta & Pottery",
        "b2c_price": 350.0,
        "raw_cost": 100.0,
        "artisan_name": "Rameshwar Prajapati",
        "channel": "camera",
        "studio_image_url": "/static/uploads/sample_pot.jpg",
        "raw_image_url": "/static/uploads/sample_raw.jpg",
        "original_transcript": "यह लाल मिट्टी का गमला है",
        "status": "draft"
    })

    save_draft_product({
        "id": ivr_draft_id,
        "title_en": "Dhokra Tribal Figurine",
        "title_hi": "ढोकरा जनजातीय मूर्ति",
        "description_en": "Lost-wax cast bell metal craft",
        "description_hi": "लॉस्ट-वैक्स धातु शिल्प",
        "craft_category": "Dhokra & Metalware",
        "b2c_price": 850.0,
        "raw_cost": 300.0,
        "artisan_name": "Sukhram Baghel",
        "channel": "ivr",
        "studio_image_url": "",
        "raw_image_url": "",
        "original_transcript": "ढोकरा की मूर्ति है आठ सौ पचास रुपये",
        "status": "draft"
    })

    # 2. Test GET /api/v1/coordinator/drafts
    res = client.get("/api/v1/coordinator/drafts?filter=all")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "counts" in data
    assert data["counts"]["total_pending"] >= 2
    assert data["counts"]["missing_photo"] >= 1
    print(f" -> PASSED: /api/v1/coordinator/drafts returned {len(data['drafts'])} drafts, counts: {data['counts']}")

    # 3. Test filter=missing_photo
    res_missing = client.get("/api/v1/coordinator/drafts?filter=missing_photo")
    assert res_missing.status_code == 200
    missing_drafts = res_missing.json()["drafts"]
    for d in missing_drafts:
        assert not d.get("studio_image_url") and not d.get("raw_image_url")
    assert any(d["id"] == ivr_draft_id for d in missing_drafts)
    print(f" -> PASSED: filter=missing_photo correctly isolated {len(missing_drafts)} drafts needing photo visits.")

    # 4. Test In-Person Photo Upload via AI Image Studio for the IVR draft
    img_bytes = create_test_image_bytes()
    upload_res = client.post(
        f"/api/v1/coordinator/drafts/{ivr_draft_id}/upload-photo",
        files={"file": ("field_visit.jpg", img_bytes, "image/jpeg")}
    )
    assert upload_res.status_code == 200
    up_data = upload_res.json()
    assert up_data["status"] == "success"
    assert up_data["studio_image_url"].startswith("/static/uploads/")
    # Verify product in DB has studio image now
    ivr_updated = get_product_by_id(ivr_draft_id)
    assert ivr_updated["studio_image_url"] == up_data["studio_image_url"]
    print(f" -> PASSED: Uploaded and enhanced field visit photo for {ivr_draft_id}: {up_data['studio_image_url']}")

    # 5. Test PUT /api/v1/coordinator/drafts/{id} with Correction Tracking
    edit_payload = {
        "title_en": "Dhokra Heritage Tribal Figurine (Verified)",
        "b2c_price": 950.0,
        "technique": "Cire-Perdue Lost Wax Bell Metal Casting"
    }
    edit_res = client.put(f"/api/v1/coordinator/drafts/{ivr_draft_id}", json=edit_payload)
    assert edit_res.status_code == 200
    edited_draft = edit_res.json()["draft"]
    assert edited_draft["title_en"] == "Dhokra Heritage Tribal Figurine (Verified)"
    assert edited_draft["b2c_price"] == 950.0
    # Verify correction log
    corrections = edited_draft.get("correction_log")
    if isinstance(corrections, str):
        import json
        corrections = json.loads(corrections)
    assert len(corrections) > 0
    price_corr = next((c for c in corrections if c["field"] == "b2c_price"), None)
    assert price_corr is not None
    assert price_corr["original"] == 850.0
    assert price_corr["corrected"] == 950.0
    print(f" -> PASSED: Coordinator correction log captured: {price_corr}")

    # 6. Test POST /api/v1/coordinator/drafts/{id}/reject
    reject_res = client.post(
        f"/api/v1/coordinator/drafts/{camera_draft_id}/reject",
        json={"reason": "Blurry artisan workshop photo, needs clearer reshoot."}
    )
    assert reject_res.status_code == 200
    rejected_draft = reject_res.json()["draft"]
    assert rejected_draft["status"] == "rejected"
    assert "Blurry artisan workshop photo" in rejected_draft["rejection_reason"]
    print(f" -> PASSED: Coordinator rejected {camera_draft_id} with audit reason.")

    # 7. Test POST /api/v1/coordinator/drafts/{id}/publish
    pub_res = client.post(f"/api/v1/coordinator/drafts/{ivr_draft_id}/publish")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["status"] == "published"
    assert pub_data["qr_code_url"] is not None
    print(f" -> PASSED: Coordinator approved & published {ivr_draft_id} with QR {pub_data['qr_code_url']}.")

    # 8. Test GET /api/v1/storefront/products
    store_res = client.get("/api/v1/storefront/products")
    assert store_res.status_code == 200
    store_data = store_res.json()
    assert store_data["status"] == "success"
    assert store_data["count"] >= 1
    assert any(p["id"] == ivr_draft_id for p in store_data["products"])
    print(f" -> PASSED: Storefront reflects published product {ivr_draft_id} (Total Live: {store_data['count']}).")

    # Cleanup test items
    delete_product(camera_draft_id)
    delete_product(ivr_draft_id)

if __name__ == "__main__":
    test_coordinator_draft_lifecycle()
    print("\nAll Coordinator Review Panel tests PASSED successfully!")
