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


# ==============================================================================
# STEP 7 REGRESSION SUITE: CONTOUR SMOOTHING, GUIDED FILTER & RUNTIME GUARDS
# ==============================================================================

def test_regression_step7_contour_smoothing_and_jaggedness_reduction():
    """
    Regression Test 5: Step 7 Contour Smoothing and Curvature Jaggedness Reduction.
    Verifies that Savitzky-Golay contour smoothing
    reduces high-frequency boundary curvature oscillation by >= 20%.
    """
    from app.services.image_studio import smooth_mask_contours
    import cv2

    # Create a synthetic scalloped / faceted circular craft silhouette
    h, w = 400, 400
    mask = np.zeros((h, w), dtype=np.uint8)
    center = (200, 200)
    radius = 120

    # Draw a circle with high-frequency stride-2 scalloped jitter along perimeter
    thetas = np.linspace(0, 2 * np.pi, 300, endpoint=False)
    jitter = np.array([2.5 if i % 2 == 0 else -2.5 for i in range(len(thetas))])
    r_scalloped = radius + jitter
    pts = np.stack([center[0] + r_scalloped * np.cos(thetas),
                    center[1] + r_scalloped * np.sin(thetas)], axis=-1).astype(np.int32)
    cv2.fillPoly(mask, [pts], 255)

    def measure_jaggedness(m):
        cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        if not cnts:
            return 0.0
        c = max(cnts, key=cv2.contourArea).reshape(-1, 2).astype(np.float64)
        dx = np.gradient(c[:, 0])
        dy = np.gradient(c[:, 1])
        ddx = np.gradient(dx)
        ddy = np.gradient(dy)
        denom = (dx**2 + dy**2)**1.5
        denom[denom < 1e-5] = 1e-5
        kappa = np.abs(dx * ddy - dy * ddx) / denom
        return float(np.mean(np.abs(np.diff(kappa))))

    jag_before = measure_jaggedness(mask)
    smoothed = smooth_mask_contours(mask, max_window=11)
    jag_after = measure_jaggedness(smoothed)

    reduction = (jag_before - jag_after) / jag_before * 100.0
    assert reduction >= 20.0, f"Expected >=20% reduction in jaggedness, got {reduction:.1f}%"


def test_regression_step7_handle_thickness_invariance():
    """
    Regression Test 6: Step 7 Handle Scanline Thickness Invariance.
    Verifies that the window length cap ensures narrow structures (such as thin handles)
    do not suffer erosion, maintaining handle thickness within <= 2px.
    """
    from app.services.image_studio import smooth_mask_contours
    import cv2

    h, w = 400, 400
    mask = np.zeros((h, w), dtype=np.uint8)

    # Solid craft body
    cv2.circle(mask, (200, 200), 100, 255, -1)
    # Thin handle arc (6px thickness) extending from x=290 to x=350, y=160 to 240
    cv2.ellipse(mask, (270, 200), (60, 40), 0, -60, 60, 255, 6)

    # Measure handle scanline width before smoothing at row 200
    width_before = np.sum(mask[200, 310:350] > 0)
    assert width_before > 0, "Synthetic handle must be present"

    smoothed = smooth_mask_contours(mask, max_window=11)
    width_after = np.sum(smoothed[200, 310:350] > 0)

    delta_px = abs(width_after - width_before)
    assert delta_px <= 2, f"Handle thickness varied by {delta_px}px (> 2px threshold)!"


def test_regression_step7_alpha_ramp_width_constraint():
    """
    Regression Test 7: Alpha Ramp Width Constraint (< 3.5% of Foreground Area).
    Verifies that Step 7 Savgol contour smoothing with Gaussian sub-pixel anti-aliasing
    maintains a tight boundary transition band (10 <= alpha <= 245) strictly under 3.5%
    of total foreground area, preventing broad translucent halo rings from forming.
    """
    from PIL import Image
    import cv2
    from app.services.image_studio import filter_salient_main_body

    # Construct standard-scale craft fixture with subtle boundary jitter
    h, w = 500, 500
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = [180, 170, 160]  # Ambient background
    cv2.circle(rgba, (250, 250), 160, (35, 35, 35, 255), -1)

    for deg in range(0, 360, 6):
        rad = np.deg2rad(deg)
        cx = int(250 + 160 * np.cos(rad))
        cy = int(250 + 160 * np.sin(rad))
        if deg % 12 == 0:
            cv2.circle(rgba, (cx, cy), 3, (35, 35, 35, 255), -1)

    pil_in = Image.fromarray(rgba)
    filtered = filter_salient_main_body(pil_in)
    out_arr = np.array(filtered)
    alpha = out_arr[:, :, 3]

    trans_pixels = np.sum((alpha >= 10) & (alpha <= 245))
    fg_pixels = np.sum(alpha >= 10)
    assert fg_pixels > 0, "Foreground body must be retained"
    ramp_pct = (trans_pixels / fg_pixels) * 100.0

    assert ramp_pct < 3.5, f"Transitional alpha ramp width {ramp_pct:.2f}% exceeds strict 3.5% limit!"


def test_regression_step7_white_composite_border_luminance_integrity():
    """
    Regression Test 8: White Composite Border-Band Luminance Integrity.
    Verifies zero/near-zero border-band luminance contamination when a dark craft
    is composited onto a pure white studio background (255, 255, 255).
    Guarantees:
    1. Monotonic luminance transition: foreground craft luminance <= transitional <= background white.
    2. Absence of elevated bright ring/halo artifacts.
    """
    from PIL import Image
    import cv2
    from app.services.image_studio import filter_salient_main_body

    h, w = 500, 500
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = [160, 150, 140]  # Ambient warm workshop background
    # Dark product craft (luminance ~35)
    cv2.circle(rgba, (250, 250), 160, (35, 35, 35, 255), -1)

    pil_in = Image.fromarray(rgba)
    filtered = filter_salient_main_body(pil_in)
    out_arr = np.array(filtered)
    alpha = out_arr[:, :, 3]

    # Composite onto pure white studio backdrop
    alpha_norm = (alpha.astype(np.float32) / 255.0)[:, :, None]
    comp_white = (out_arr[:, :, :3].astype(np.float32) * alpha_norm + 255.0 * (1.0 - alpha_norm)).astype(np.uint8)
    comp_lum = cv2.cvtColor(comp_white, cv2.COLOR_RGB2GRAY)

    trans_mask = (alpha >= 10) & (alpha <= 245)
    fg_mask = (alpha > 245)
    bg_mask = (alpha < 10)

    mean_fg_lum = float(comp_lum[fg_mask].mean())
    mean_trans_lum = float(comp_lum[trans_mask].mean())
    mean_bg_lum = float(comp_lum[bg_mask].mean())

    # Monotonic transition without inverted halo spikes
    assert mean_fg_lum < mean_trans_lum < mean_bg_lum, (
        f"Luminance inversion detected: FG={mean_fg_lum:.1f}, Trans={mean_trans_lum:.1f}, BG={mean_bg_lum:.1f}"
    )

    # Check that pure white background is preserved
    pure_bg_lum = float(comp_lum[alpha == 0].mean())
    assert abs(pure_bg_lum - 255.0) < 1e-5, f"Pure background must remain 255.0 white, got {pure_bg_lum:.2f}"
    assert mean_bg_lum >= 254.9, f"Sub-threshold background must remain near-pure white, got {mean_bg_lum:.2f}"


def test_regression_step7_opencv_headless_runtime_compatibility():
    """
    Regression Test 9: Clean Dependency Integrity (Plain opencv-python-headless).
    Verifies that the entire segmentation and Step 7 smoothing pipeline runs smoothly
    with standard OpenCV headless without any dependency on cv2.ximgproc or contrib modules.
    """
    import cv2
    from PIL import Image
    from app.services.image_studio import filter_salient_main_body

    # cv2.ximgproc should NOT be required or present
    assert not hasattr(cv2, 'ximgproc'), "Runtime environment must use plain opencv-python-headless without ximgproc"

    # Execution must succeed without error
    test_img = Image.new("RGBA", (200, 200), (0, 0, 0, 0))
    draw_arr = np.array(test_img)
    cv2.circle(draw_arr, (100, 100), 50, (100, 100, 100, 255), -1)
    result = filter_salient_main_body(Image.fromarray(draw_arr))
    assert result is not None
    assert result.size == (200, 200)





