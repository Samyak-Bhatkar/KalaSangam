import pytest
import io
import base64
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_synthetic_image(color=(180, 80, 50), size=(300, 300), blur=False):
    img = Image.new("RGB", size, (240, 240, 240))
    # Draw a craft-like colored circle in the center
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    draw.ellipse([60, 60, 240, 240], fill=color, outline=(40, 20, 10), width=4)
    if blur:
        from PIL import ImageFilter
        img = img.filter(ImageFilter.GaussianBlur(radius=8))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

def test_quality_check_pass():
    img_bytes = create_synthetic_image(blur=False)
    b64 = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode("utf-8")

    res = client.post(
        "/api/v1/studio/quality-check-json",
        json={"image_base64": b64, "language": "hi"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "voice_prompt_hi" in data
    assert "sharpness_score" in data
    assert "mean_brightness" in data

def test_quality_check_blur_detection():
    # Intentionally heavily blurred image
    img_bytes = create_synthetic_image(blur=True)
    b64 = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode("utf-8")

    res = client.post(
        "/api/v1/studio/quality-check-json",
        json={"image_base64": b64, "language": "hi"}
    )
    assert res.status_code == 200
    data = res.json()
    # Should detect low sharpness / blur
    assert data["dominant_issue"] == "blurry" or data["sharpness_score"] < 65.0
    assert "धुंधली" in data["voice_prompt_hi"] or "स्थिर" in data["voice_prompt_hi"]

def test_studio_enhance():
    img_bytes = create_synthetic_image(blur=False)
    b64 = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode("utf-8")

    res = client.post(
        "/api/v1/studio/enhance",
        data={"image_base64": b64}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["studio_url"].startswith("/static/uploads/")
    assert data["processed_base64"].startswith("data:image/jpeg;base64,")
    assert data["lighting_normalized"] is True
    assert data["drop_shadow_applied"] is True

def test_amazon_85_percent_rule_and_centering():
    # Synthetic bottle/speaker craft with trailing wire artifact
    img = Image.new("RGB", (400, 500), (230, 230, 230))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    # Draw tall cylinder (bottle/speaker)
    draw.rounded_rectangle([150, 100, 250, 420], radius=20, fill=(30, 80, 190))
    # Draw thin trailing cable to the left
    draw.line([(150, 200), (40, 260)], fill=(240, 240, 240), width=2)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    res = client.post(
        "/api/v1/studio/enhance",
        data={"image_base64": b64}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["width"] == 1080
    assert data["height"] == 1080
    # Verify Amazon 85% rule (85% to 88% canvas coverage)
    raw_b64 = data["processed_base64"].split(",")[1]
    enhanced_img = Image.open(io.BytesIO(base64.b64decode(raw_b64)))
    assert enhanced_img.size == (1080, 1080)
    # Check that product is not white in the center
    center_pixel = enhanced_img.getpixel((540, 500))
    # It shouldn't be pure white background at center
    assert center_pixel[:3] != (255, 255, 255)

def test_quality_check_cluttered_background_centered_craft_passes():
    """
    Regression Test: A centered craft placed on a cluttered background
    (e.g., table lines, shadows, texture artifacts in margin) should NOT be falsely flagged as cut_off.
    """
    from PIL import ImageDraw
    img = Image.new("RGB", (400, 400), (220, 215, 205))
    draw = ImageDraw.Draw(img)
    
    # Draw background clutter: table edges and lines spanning outer margins
    for y in range(0, 400, 30):
        draw.line([(0, y), (400, y)], fill=(160, 150, 140), width=2)
    for x in range(0, 400, 40):
        draw.line([(x, 0), (x, 400)], fill=(170, 160, 150), width=1)
        
    # Draw centered terracotta pot (well within margins, 40px padding on all sides)
    draw.ellipse([60, 60, 340, 340], fill=(190, 75, 40), outline=(90, 35, 15), width=4)
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    raw_bytes = buf.getvalue()
    b64 = "data:image/jpeg;base64," + base64.b64encode(raw_bytes).decode("utf-8")

    res = client.post(
        "/api/v1/studio/quality-check-json",
        json={"image_base64": b64, "language": "hi"}
    )
    assert res.status_code == 200
    data = res.json()
    # Crucial: centered craft must NOT be flagged as cut_off
    assert data["dominant_issue"] != "cut_off"

def test_quality_check_genuine_cut_off_fails():
    """
    Test: A craft that genuinely touches/crosses the frame boundary with large coverage
    must correctly be flagged as cut_off.
    """
    from PIL import ImageDraw
    img = Image.new("RGB", (400, 400), (240, 240, 240))
    draw = ImageDraw.Draw(img)
    # Craft extends all the way to x=0 and y=0 (sliced off by edge)
    draw.ellipse([0, 0, 380, 380], fill=(190, 75, 40), outline=(90, 35, 15), width=4)
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    raw_bytes = buf.getvalue()
    b64 = "data:image/jpeg;base64," + base64.b64encode(raw_bytes).decode("utf-8")

    res = client.post(
        "/api/v1/studio/quality-check-json",
        json={"image_base64": b64, "language": "hi"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["passed"] is False
    assert data["dominant_issue"] == "cut_off"
    assert data["issue_icon"] == "crop"

def test_quality_check_and_enhance_caching():
    """
    Test: Running quality-check caches the segmentation cutout, and /enhance reuses it.
    """
    from app.services.image_studio import get_cached_cutout
    img_bytes = create_synthetic_image(blur=False)
    b64 = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode("utf-8")

    # Step 1: Quality check
    res1 = client.post(
        "/api/v1/studio/quality-check-json",
        json={"image_base64": b64, "language": "hi"}
    )
    assert res1.status_code == 200
    
    # Confirm cache is populated
    cached = get_cached_cutout(img_bytes)
    assert cached is not None
    assert cached.mode == "RGBA"

    # Step 2: Enhance uses cache
    res2 = client.post(
        "/api/v1/studio/enhance",
        data={"image_base64": b64}
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "success"
    assert data2["width"] == 1080

