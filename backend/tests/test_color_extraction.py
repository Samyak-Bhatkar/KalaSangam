"""Unit and integration tests for Color-Aware Palette Biasing and Dominant Color Extraction.
Architected for high throughput, sub-10ms clustering, and zero LLM cost.
"""

import io
import base64
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.services.stock_background_service import (
    extract_dominant_color_rgb,
    compute_hsl_color_query_modifier,
    map_hue_to_search_modifier,
    get_background_options,
)

client = TestClient(app)


def create_mock_cutout(color_rgb, alpha=255, size=(100, 100)):
    """Creates a test transparent PNG with a centered colored shape."""
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    for y in range(25, 75):
        for x in range(25, 75):
            img.putpixel((x, y), (*color_rgb, alpha))
    return img


def test_extract_dominant_color_rgb_terracotta():
    # Warm terracotta red-orange (190, 75, 45)
    img = create_mock_cutout((190, 75, 45))
    dom = extract_dominant_color_rgb(img, k=3)
    assert dom is not None
    r, g, b = dom
    # Should be close to (190, 75, 45)
    assert abs(r - 190) < 15
    assert abs(g - 75) < 15
    assert abs(b - 45) < 15


def test_extract_dominant_color_empty_alpha():
    # Completely transparent image
    img = Image.new("RGBA", (50, 50), (0, 0, 0, 0))
    dom = extract_dominant_color_rgb(img)
    assert dom is None


def test_compute_hsl_color_query_modifier_vivid():
    # High saturation vivid blue (0, 100, 255) -> S ~ 1.0 -> complementary (orange/terracotta)
    color_info = compute_hsl_color_query_modifier((0, 100, 255))
    assert color_info["strategy"] == "complementary"
    assert color_info["dominant_color_hex"] == "#0064ff"
    assert "color_modifier" in color_info


def test_compute_hsl_color_query_modifier_neutral():
    # Low saturation gray (128, 128, 128) -> S = 0.0 -> neutral
    color_info = compute_hsl_color_query_modifier((128, 128, 128))
    assert color_info["strategy"] == "neutral"
    assert "neutral" in color_info["color_modifier"]


def test_get_background_options_with_color_extraction():
    # Vibrant brass/gold craft (212, 175, 55)
    craft_img = create_mock_cutout((212, 175, 55))
    buf = io.BytesIO()
    craft_img.save(buf, format="PNG")
    b64_str = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"

    res = get_background_options(
        query="artisan workshop",
        shot_angle="eye_level",
        cutout_source=b64_str
    )

    assert res.status == "success"
    assert res.dominant_color_hex is not None
    assert res.color_pairing_strategy in ("complementary", "analogous", "neutral")
    assert len(res.options) > 0


def test_api_background_options_color_payload():
    craft_img = create_mock_cutout((180, 50, 40))
    buf = io.BytesIO()
    craft_img.save(buf, format="PNG")
    b64_str = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"

    resp = client.post("/api/studio/background-options", json={
        "suggested_background_query": "wooden surface",
        "shot_angle": "eye_level",
        "cutout_base64": b64_str,
    })

    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["dominant_color_hex"] is not None
    assert data["color_pairing_strategy"] is not None
