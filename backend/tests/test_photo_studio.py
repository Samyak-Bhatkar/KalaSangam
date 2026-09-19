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
