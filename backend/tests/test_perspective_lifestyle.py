"""Unit tests for Perspective-Aware Lifestyle Stock Compositing & Tilt Guardrails.
Covers:
1. Capture-time tilt query modifier (flat_lay, eye_level, angled).
2. Steep/ambiguous angle guardrail flag (lifestyle_eligible).
3. Flat-lay specific curated backdrops fallback.
4. Cutout rotation handling in composite_lifestyle_scene.
5. FastAPI endpoint integration (/api/studio/background-options and /api/studio/composite-lifestyle).
"""

import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.services.stock_background_service import (
    apply_angle_modifier,
    get_background_options,
    composite_lifestyle_scene,
    CURATED_FALLBACK_BACKGROUNDS,
    CURATED_FLAT_LAY_BACKGROUNDS,
)

client = TestClient(app)


def test_apply_angle_modifier():
    # eye_level -> front view
    assert "front view" in apply_angle_modifier("wooden table", "eye_level")
    # Already containing front view should not duplicate
    assert apply_angle_modifier("wooden table front view", "eye_level") == "wooden table front view"

    # flat_lay -> flat lay
    assert "flat lay" in apply_angle_modifier("terracotta pottery", "flat_lay")
    assert apply_angle_modifier("terracotta pottery top view", "flat_lay") == "terracotta pottery top view"

    # angled -> no change
    assert apply_angle_modifier("brass lamp", "angled") == "brass lamp"
    # None or empty
    assert apply_angle_modifier("brass lamp", None) == "brass lamp"


def test_get_background_options_guardrail_and_biasing():
    # 1. eye_level: eligible
    eye_res = get_background_options(
        query="artisan workshop",
        shot_angle="eye_level",
        tilt_degrees=12.0
    )
    assert eye_res.lifestyle_eligible is True
    assert eye_res.shot_angle == "eye_level"
    assert "front view" in eye_res.effective_query
    assert len(eye_res.options) > 0

    # 2. flat_lay: eligible, flat lay query modifier, curated flat lay fallback
    flat_res = get_background_options(
        query="craft surface",
        shot_angle="flat_lay",
        tilt_degrees=75.0
    )
    assert flat_res.lifestyle_eligible is True
    assert flat_res.shot_angle == "flat_lay"
    assert "flat lay" in flat_res.effective_query
    assert any("flatlay" in opt.id.lower() or "flat lay" in opt.title.lower() for opt in flat_res.options)

    # 3. angled: NOT eligible (guardrail activated)
    angled_res = get_background_options(
        query="tabletop setting",
        shot_angle="angled",
        tilt_degrees=42.0
    )
    assert angled_res.lifestyle_eligible is False
    assert angled_res.shot_angle == "angled"


def test_composite_lifestyle_scene_with_rotation(tmp_path):
    # Create test transparent cutout (150x200 red oval)
    cutout = Image.new("RGBA", (200, 200), (0, 0, 0, 0))
    for y in range(40, 160):
        for x in range(50, 150):
            cutout.putpixel((x, y), (210, 80, 45, 255))

    # Curated wood table
    bg_url = CURATED_FALLBACK_BACKGROUNDS[0]["url"]

    # Composite with 0 deg rotation
    comp_0, url_0, b64_0 = composite_lifestyle_scene(cutout, bg_url, canvas_size=400, rotation_deg=0.0)
    assert comp_0.size == (400, 400)
    assert url_0.startswith("/static/uploads/")
    assert b64_0.startswith("data:image/jpeg;base64,")

    # Composite with 12 deg rotation
    comp_rot, url_rot, b64_rot = composite_lifestyle_scene(cutout, bg_url, canvas_size=400, rotation_deg=12.0)
    assert comp_rot.size == (400, 400)
    assert url_rot.startswith("/static/uploads/")
    assert b64_rot.startswith("data:image/jpeg;base64,")


def test_api_background_options_endpoint():
    # POST /api/studio/background-options with shot_angle
    resp = client.post("/api/studio/background-options", json={
        "suggested_background_query": "wooden desk",
        "shot_angle": "flat_lay",
        "tilt_degrees": 70.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["lifestyle_eligible"] is True
    assert data["shot_angle"] == "flat_lay"
    assert "flat lay" in data["effective_query"]

    # POST /api/studio/background-options with angled
    resp_angled = client.post("/api/studio/background-options", json={
        "suggested_background_query": "wooden desk",
        "shot_angle": "angled",
        "tilt_degrees": 45.0
    })
    assert resp_angled.status_code == 200
    data_angled = resp_angled.json()
    assert data_angled["lifestyle_eligible"] is False
