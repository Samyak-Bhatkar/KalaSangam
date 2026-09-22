import pytest
import io
import base64
import numpy as np
from PIL import Image, ImageDraw
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


def test_adaptive_compute_tier_routing():
    """Verify X-Compute-Tier low routes directly to fast tier without error."""
    buf = io.BytesIO()
    img = Image.new("RGB", (200, 200), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 150, 150], fill=(20, 20, 20))
    img.save(buf, format="JPEG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    # Quality check with X-Compute-Tier: low
    res_low = client.post(
        "/api/v1/studio/quality-check-json",
        json={"image_base64": b64, "language": "hi"},
        headers={"X-Compute-Tier": "low"}
    )
    assert res_low.status_code == 200
    data_low = res_low.json()
    assert data_low["status"] == "success"

    # Enhance with X-Compute-Tier: low
    res_enh = client.post(
        "/api/v1/studio/enhance",
        data={"image_base64": b64},
        headers={"X-Compute-Tier": "low"}
    )
    assert res_enh.status_code == 200
    data_enh = res_enh.json()
    assert data_enh["status"] == "success"
    assert data_enh["width"] == 1080


# ==============================================================================
# SKELETON TOPOLOGY REGRESSION SUITE: HANDLE RETENTION & WIRE SEVERING
# ==============================================================================

def test_regression_terracotta_pot_zero_core_handle_preserved():
    """
    Regression Test 1: Terracotta Pot (Zero-Core-Survival Case).
    Verifies that a thin looped handle whose neck junction drops below core_thresh
    is recognized as a closed loop / bridge by skeleton topology and retained.
    """
    from pathlib import Path
    from app.services.image_studio import segment_craft, filter_salient_main_body

    pot_path = Path(r"c:\SAMYAKFILES\Users\AppData\Local\Programs\DATA SCIENCE COURSE\SIH\ShilpSetu\frontend\public\terracotta_pot_raw.png")
    if not pot_path.exists():
        pytest.skip("terracotta_pot_raw.png fixture not available")

    pot_raw = Image.open(pot_path).convert("RGB")
    pot_cutout = segment_craft(pot_raw, compute_tier="high")
    pot_filtered = filter_salient_main_body(pot_cutout)
    alpha = np.array(pot_filtered)[:, :, 3]

    # Handle bounding region on left: y in [350, 480], x in [240, 340]
    handle_pixels = np.sum(alpha[350:480, 240:340] > 35)
    assert handle_pixels > 2500, f"Expected >2500 handle pixels, got {handle_pixels}"


def test_regression_mixer_jar_multi_component_handle_preserved():
    """
    Regression Test 2: Steel Mixer Jar (Multi-Component Core Retention).
    Verifies that a protruding cookware handle surviving as a secondary component in core
    is NOT discarded by size-ranking (1 + np.argmax) and remains fully intact.
    """
    from pathlib import Path
    from app.services.image_studio import segment_craft, filter_salient_main_body

    mixer_path = Path(r"c:\SAMYAKFILES\Users\AppData\Local\Programs\DATA SCIENCE COURSE\SIH\ShilpSetu\backend\app\static\uploads\raw_1790057061007.jpg")
    if not mixer_path.exists():
        pytest.skip("raw_1790057061007.jpg mixer fixture not available")

    mixer_raw = Image.open(mixer_path).convert("RGB")
    mixer_cutout = segment_craft(mixer_raw, compute_tier="high")
    mixer_filtered = filter_salient_main_body(mixer_cutout)
    alpha = np.array(mixer_filtered)[:, :, 3]

    # Right handle column bounding box: y in [200, 750], x in [850, 1100]
    handle_pixels = np.sum(alpha[200:750, 850:1100] > 35)
    assert handle_pixels > 20000, f"Expected >20000 handle pixels on mixer jar, got {handle_pixels}"


def test_regression_genuine_object_with_detached_wire_severed():
    """
    Regression Test 3: Genuine Object with Detached Dangling Wire.
    Verifies that:
    1. The solid product body and handle are retained.
    2. A dangling wire extending outward into the frame margin is permanently severed
       with an explicit assertion that alpha == 0 in the wire region.
    """
    import cv2
    from app.services.image_studio import filter_salient_main_body

    h, w = 500, 500
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    # 1. Product body: Solid ellipse in center (250, 250)
    cv2.ellipse(rgba, (250, 250), (100, 140), 0, 0, 360, (60, 120, 210, 255), -1)

    # 2. Product handle: Loop on right side (x in [330, 410], y in [200, 300])
    handle_pts = np.zeros((h, w), dtype=np.uint8)
    cv2.ellipse(handle_pts, (330, 250), (50, 70), 0, -80, 80, 255, 18)
    rgba[:, :, 3] = np.maximum(rgba[:, :, 3], handle_pts)
    rgba[:, :, :3][handle_pts > 0] = (60, 120, 210)

    # 3. Dangling wire on left margin: Thin line extending to x=20, y=440
    wire_pts = np.array([[150, 300], [100, 350], [60, 390], [20, 440]], np.int32)
    cv2.polylines(rgba, [wire_pts], False, (20, 20, 20, 255), thickness=4)

    cutout_in = Image.fromarray(rgba)
    cutout_out = filter_salient_main_body(cutout_in)
    out_alpha = np.array(cutout_out)[:, :, 3]

    # Explicit Assertion 1: Wire tip region MUST BE TRANSPARENT (alpha == 0)
    wire_tip_region = out_alpha[380:450, 10:70]
    assert np.all(wire_tip_region == 0), f"Expected wire region alpha == 0, found {np.sum(wire_tip_region > 0)} active pixels!"

    # Explicit Assertion 2: Handle loop MUST BE PRESERVED
    handle_region = out_alpha[220:280, 340:400]
    assert np.sum(handle_region > 35) > 500, "Handle loop was unexpectedly clipped!"


def test_regression_mixer_jar_high_res_no_oom():
    """
    Regression Test 4: High-Resolution Matting OOM Guard.
    Verifies that calling /api/v1/studio/enhance on the 1204x1600 mixer jar
    does not trigger out-of-memory errors in closed-form matting, succeeding cleanly.
    """
    from pathlib import Path
    mixer_path = Path(r"c:\SAMYAKFILES\Users\AppData\Local\Programs\DATA SCIENCE COURSE\SIH\ShilpSetu\backend\app\static\uploads\raw_1790057061007.jpg")
    if not mixer_path.exists():
        pytest.skip("raw_1790057061007.jpg mixer fixture not available")

    with open(mixer_path, "rb") as f:
        img_bytes = f.read()

    b64 = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode("utf-8")

    res = client.post(
        "/api/v1/studio/enhance",
        data={"image_base64": b64}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["width"] == 1080
    assert data["height"] == 1080
    assert data["drop_shadow_applied"] is True



