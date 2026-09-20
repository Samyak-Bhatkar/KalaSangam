"""Stock Background Retrieval & Lifestyle Scene Compositing Service
Client: Ministry of Social Justice and Empowerment (MoSJE)
Purpose: Provides marginalized rural artisans with free, contextual 'lifestyle'
         product images (e.g., resting on a wooden table, festive diwali setting)
         without adding expensive generative AI compute costs.
         Retrieves free stock images via Pexels/Pixabay and composites the rembg
         cutout using realistic surface drop shadows.
"""

import io
import os
import re
import time
import base64
import logging
import urllib.request
import urllib.parse
import json
import colorsys
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image, ImageOps, ImageFilter
from sklearn.cluster import KMeans
from ..config import settings
from ..models.schemas import BackgroundOption, BackgroundOptionsResponse

logger = logging.getLogger("ShilpSetu.StockBackground")

# High-resolution curated Indian handicraft lifestyle setting fallbacks
CURATED_FALLBACK_BACKGROUNDS = [
    {
        "id": "curated-wood-table",
        "url": "https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=1080",
        "thumbnail_url": "https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=350",
        "title": "Rustic Natural Wood Surface",
        "source": "curated",
        "recommended": True
    },
    {
        "id": "curated-warm-festive",
        "url": "https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1080",
        "thumbnail_url": "https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=350",
        "title": "Warm Ambient Festive Room",
        "source": "curated",
        "recommended": False
    },
    {
        "id": "curated-stone-craft",
        "url": "https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=1080",
        "thumbnail_url": "https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=350",
        "title": "Minimalist Artisan Surface",
        "source": "curated",
        "recommended": False
    },
    {
        "id": "curated-decor-shelf",
        "url": "https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=1080",
        "thumbnail_url": "https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=350",
        "title": "Heritage Living Display",
        "source": "curated",
        "recommended": False
    }
]

# Dedicated top-down / flat lay backdrops for overhead craft shots
CURATED_FLAT_LAY_BACKGROUNDS = [
    {
        "id": "curated-wood-flatlay",
        "url": "https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=1080",
        "thumbnail_url": "https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=350",
        "title": "Rustic Natural Wood Flat Lay",
        "source": "curated",
        "recommended": True
    },
    {
        "id": "curated-stone-flatlay",
        "url": "https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=1080",
        "thumbnail_url": "https://images.pexels.com/photos/164005/pexels-photo-164005.jpeg?auto=compress&cs=tinysrgb&w=350",
        "title": "Minimalist Stone Surface Top View",
        "source": "curated",
        "recommended": False
    },
    {
        "id": "curated-craft-mat-flatlay",
        "url": "https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=1080",
        "thumbnail_url": "https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=350",
        "title": "Natural Handloom Weave Backdrop",
        "source": "curated",
        "recommended": False
    }
]


def extract_dominant_color_rgb(cutout_img: Image.Image, k: int = 4) -> Optional[Tuple[int, int, int]]:
    """
    Extracts the dominant RGB color from the product cutout's visible (alpha > 40)
    pixels using K-Means color quantization (k=3-5 clusters).
    Selects the largest cluster by pixel count.
    Runs entirely client/server-side with classical CV (zero LLM/Gemini API calls).
    """
    try:
        rgba = cutout_img.convert("RGBA")
        arr = np.array(rgba)
        # Filter pixels where alpha > 40 (visible product body)
        mask = arr[:, :, 3] > 40
        rgb_pixels = arr[mask][:, :3]

        if len(rgb_pixels) < 50:
            return None

        # Downsample for sub-millisecond K-Means convergence
        if len(rgb_pixels) > 4000:
            indices = np.random.choice(len(rgb_pixels), 4000, replace=False)
            sample_pixels = rgb_pixels[indices]
        else:
            sample_pixels = rgb_pixels

        kmeans = KMeans(n_clusters=min(k, len(sample_pixels)), n_init=3, max_iter=20, random_state=42)
        kmeans.fit(sample_pixels)

        # Count frequencies in each cluster
        labels, counts = np.unique(kmeans.labels_, return_counts=True)
        dominant_idx = labels[np.argmax(counts)]
        dominant_center = kmeans.cluster_centers_[dominant_idx]

        return (int(round(dominant_center[0])), int(round(dominant_center[1])), int(round(dominant_center[2])))
    except Exception as e:
        logger.warning(f"Failed to extract dominant color: {e}")
        return None


def map_hue_to_search_modifier(target_deg: float) -> str:
    """
    Maps target hue degree (0-360) to a search-friendly English color-family descriptor.
    Small lookup table mapping degree ranges to descriptive physical surface terms.
    """
    deg = target_deg % 360.0
    if 345.0 <= deg or deg < 15.0:
        return "warm terracotta surface"
    elif 15.0 <= deg < 45.0:
        return "warm wood table"
    elif 45.0 <= deg < 75.0:
        return "golden warm surface"
    elif 75.0 <= deg < 150.0:
        return "natural sage foliage"
    elif 150.0 <= deg < 195.0:
        return "teal stone surface"
    elif 195.0 <= deg < 255.0:
        return "cool slate surface"
    elif 255.0 <= deg < 290.0:
        return "cool blue backdrop"
    elif 290.0 <= deg < 345.0:
        return "earthy stone backdrop"
    return "neutral wood surface"


def compute_hsl_color_query_modifier(rgb: Tuple[int, int, int]) -> Dict[str, Any]:
    """
    Computes HSL hue-wheel complementary or analogous background pairing:
    - colorsys.rgb_to_hls returns (h, l, s) where h, l, s in [0, 1]
    - H in degrees [0, 360), S in [0, 1], L in [0, 1]

    Rule:
    - Neutral/Low-saturation (S < 0.20): artisan craft has neutral/low saturation tone.
      Pair with neutral marble / crisp clean stone.
    - Highly saturated/vivid (S >= 0.45): high contrast complementary pairing
      target_hue = (dominant_hue + 180) % 360
    - Muted/Earthy (0.20 <= S < 0.45): harmonious analogous pairing
      target_hue = (dominant_hue + 30) % 360 (or -30)
    """
    r, g, b = [c / 255.0 for c in rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    hue_deg = h * 360.0
    hex_color = f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"

    if s < 0.20:
        strategy = "neutral"
        target_hue = hue_deg
        modifier = "white marble neutral surface"
    elif s >= 0.45:
        strategy = "complementary"
        target_hue = (hue_deg + 180.0) % 360.0
        modifier = map_hue_to_search_modifier(target_hue)
    else:
        strategy = "analogous"
        # Favor positive +30 shift for warmth, or negative if high hue
        target_hue = (hue_deg + 30.0) % 360.0
        modifier = map_hue_to_search_modifier(target_hue)

    return {
        "dominant_color_hex": hex_color,
        "strategy": strategy,
        "hue_deg": hue_deg,
        "target_hue_deg": target_hue,
        "saturation": s,
        "lightness": l,
        "color_modifier": modifier
    }


def apply_angle_modifier(query: str, shot_angle: Optional[str] = None) -> str:
    """
    Appends angle-aware search modifier based on capture-time tilt classification:
    - flat_lay -> append 'flat lay' or 'top view'
    - eye_level -> append 'close-up' or 'front view'
    - angled -> no modifier needed (or 'angle view')
    """
    if not shot_angle:
        return query
    clean_angle = shot_angle.lower().strip()
    lowered = query.lower()

    if clean_angle == "flat_lay":
        if "flat lay" not in lowered and "top view" not in lowered:
            return f"{query.strip()} flat lay"
    elif clean_angle == "eye_level":
        if "front view" not in lowered and "close-up" not in lowered:
            return f"{query.strip()} front view"
    elif clean_angle == "angled":
        pass

    return query.strip()


def query_pexels(query: str, limit: int = 4) -> List[BackgroundOption]:
    """Queries Pexels Search API for matching stock images."""
    if not settings.PEXELS_API_KEY:
        return []
    
    clean_query = urllib.parse.quote(query.strip())
    url = f"https://api.pexels.com/v1/search?query={clean_query}&per_page={limit}&orientation=landscape"
    headers = {
        "Authorization": settings.PEXELS_API_KEY,
        "User-Agent": "ShilpSetu/1.0 (MoSJE Rural Artisan AI)"
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            photos = data.get("photos", [])
            options = []
            for idx, p in enumerate(photos):
                src = p.get("src", {})
                img_url = src.get("large") or src.get("medium") or src.get("original")
                thumb_url = src.get("small") or src.get("tiny") or img_url
                alt = p.get("alt") or f"Setting {idx + 1}"
                if img_url:
                    options.append(
                        BackgroundOption(
                            id=f"pexels-{p.get('id', idx)}",
                            url=img_url,
                            thumbnail_url=thumb_url,
                            title=alt[:45],
                            source="pexels",
                            recommended=(idx == 0)
                        )
                    )
            return options
    except Exception as e:
        logger.warning(f"Pexels query failed ({e}), attempting fallback.")
        return []


def query_pixabay(query: str, limit: int = 4) -> List[BackgroundOption]:
    """Queries Pixabay API for matching stock photos."""
    if not settings.PIXABAY_API_KEY:
        return []
    
    clean_query = urllib.parse.quote(query.strip())
    url = f"https://pixabay.com/api/?key={settings.PIXABAY_API_KEY}&q={clean_query}&image_type=photo&per_page={limit}&orientation=horizontal"
    headers = {
        "User-Agent": "ShilpSetu/1.0 (MoSJE Rural Artisan AI)"
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            hits = data.get("hits", [])
            options = []
            for idx, h in enumerate(hits):
                img_url = h.get("largeImageURL") or h.get("webformatURL")
                thumb_url = h.get("previewURL") or img_url
                tags = h.get("tags") or f"Setting {idx + 1}"
                if img_url:
                    options.append(
                        BackgroundOption(
                            id=f"pixabay-{h.get('id', idx)}",
                            url=img_url,
                            thumbnail_url=thumb_url,
                            title=tags.split(",")[0].strip().title()[:45],
                            source="pixabay",
                            recommended=(idx == 0)
                        )
                    )
            return options
    except Exception as e:
        logger.warning(f"Pixabay query failed ({e}), engaging curated fallback.")
        return []


def get_background_options(
    query: Optional[str] = None,
    limit: int = 4,
    shot_angle: Optional[str] = None,
    tilt_degrees: Optional[float] = None,
    cutout_source: Optional[Any] = None
) -> BackgroundOptionsResponse:
    """
    Fetches 3-4 background options:
    1. Extracts dominant color from non-transparent cutout pixels using K-Means (zero AI cost).
    2. Applies full HSL hue-wheel complementary/analogous color matching modifier.
    3. Applies angle-aware query biasing based on shot_angle.
    4. Combines base semantic query + color-theory modifier + angle modifier into single additive query.
    5. Queries Pexels, falls back to Pixabay, falls back to curated Indian handicraft settings.
    6. Marks single top result as recommended: true.
    7. Identifies if lifestyle option is eligible (guardrail against ambiguous angles).
    """
    base_query = (query or "").strip()
    if not base_query:
        base_query = "neutral wooden surface"

    clean_angle = (shot_angle or "").lower().strip() or None
    lifestyle_eligible = clean_angle != "angled"

    # Analyze dominant color if cutout_source is available
    dominant_color_hex = None
    color_strategy = None
    color_modifier = None

    if cutout_source:
        try:
            if isinstance(cutout_source, Image.Image):
                cutout_pil = cutout_source
            else:
                cutout_pil = load_image_from_source(cutout_source)
            
            dom_rgb = extract_dominant_color_rgb(cutout_pil)
            if dom_rgb:
                color_info = compute_hsl_color_query_modifier(dom_rgb)
                dominant_color_hex = color_info.get("dominant_color_hex")
                color_strategy = color_info.get("strategy")
                color_modifier = color_info.get("color_modifier")
        except Exception as e:
            logger.warning(f"Could not extract color from cutout: {e}")

    # Build additive query: base_query + color_modifier + angle_modifier
    query_parts = [base_query]
    if color_modifier and color_modifier.lower() not in base_query.lower():
        query_parts.append(color_modifier)

    combined_query = " ".join(query_parts)
    effective_query = apply_angle_modifier(combined_query, clean_angle)

    # 1. Pexels search
    options = query_pexels(effective_query, limit=limit)
    source_used = "pexels"

    # Fallback to base angle query if combined color query yields no stock images
    if not options and color_modifier:
        fallback_query = apply_angle_modifier(base_query, clean_angle)
        options = query_pexels(fallback_query, limit=limit)

    # 2. Pixabay fallback
    if not options:
        options = query_pixabay(effective_query, limit=limit)
        source_used = "pixabay"
        if not options and color_modifier:
            fallback_query = apply_angle_modifier(base_query, clean_angle)
            options = query_pixabay(fallback_query, limit=limit)

    # 3. Curated fallback
    if not options:
        if clean_angle == "flat_lay":
            options = [BackgroundOption(**b) for b in CURATED_FLAT_LAY_BACKGROUNDS[:limit]]
        else:
            options = [BackgroundOption(**b) for b in CURATED_FALLBACK_BACKGROUNDS[:limit]]
        source_used = "curated"

    # Ensure strictly ONE item is marked recommended
    for i, opt in enumerate(options):
        opt.recommended = (i == 0)

    return BackgroundOptionsResponse(
        status="success",
        query=base_query,
        effective_query=effective_query,
        shot_angle=clean_angle,
        source=source_used,
        options=options,
        lifestyle_eligible=lifestyle_eligible,
        dominant_color_hex=dominant_color_hex,
        color_pairing_strategy=color_strategy,
        color_modifier=color_modifier
    )


def load_image_from_source(source_str: str) -> Image.Image:
    """Loads PIL Image from URL, local file path, or base64 data string."""
    if source_str.startswith("data:image"):
        clean_b64 = re.sub(r"^data:image/[a-zA-Z]+;base64,", "", source_str)
        raw_bytes = base64.b64decode(clean_b64)
        return Image.open(io.BytesIO(raw_bytes))
    elif source_str.startswith("http://") or source_str.startswith("https://"):
        req = urllib.request.Request(
            source_str,
            headers={"User-Agent": "ShilpSetu/1.0 (MoSJE Rural Artisan AI)"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            data = response.read()
            return Image.open(io.BytesIO(data))
    elif os.path.exists(source_str):
        return Image.open(source_str)
    else:
        # Check static uploads directory
        local_candidate = settings.UPLOAD_DIR / os.path.basename(source_str)
        if local_candidate.exists():
            return Image.open(local_candidate)
        raise FileNotFoundError(f"Could not load image source: {source_str[:60]}")


def composite_lifestyle_scene(
    cutout_img: Any,
    background_source: str,
    canvas_size: int = 1080,
    rotation_deg: float = 0.0,
    size_pct: float = 58.0,
    bottom_cushion_pct: float = 8.0
) -> Tuple[Image.Image, str, str]:
    """
    Composites the product cutout onto the chosen lifestyle background.
    Requirements:
    a. Dynamic size_pct: Scale cutout so product occupies requested percentage of canvas height (40%-75%, default 58%).
    b. Dynamic bottom_cushion_pct: Position cutout with requested bottom cushion (2%-20%, default 8%).
    c. Drop shadow: duplicate alpha, render solid black, apply strong Gaussian blur, offset downward, 40% opacity.
    d. Layer order: stock background (bottom) -> blurred shadow layer -> product cutout (top).
    e. Horizontal centering is fixed/automatic.
    f. Optional manual rotation nudge (-15 to +15 deg) applied smoothly before compositing.
    """
    # 1. Prepare background image (fit to exact square canvas_size)
    raw_bg = load_image_from_source(background_source).convert("RGB")
    bg_canvas = ImageOps.fit(raw_bg, (canvas_size, canvas_size), method=Image.Resampling.LANCZOS).convert("RGBA")

    # 2. Prepare transparent craft cutout
    if isinstance(cutout_img, Image.Image):
        cutout = cutout_img.convert("RGBA")
    elif isinstance(cutout_img, str):
        cutout = load_image_from_source(cutout_img).convert("RGBA")
    elif hasattr(cutout_img, "read"):
        cutout = Image.open(cutout_img).convert("RGBA")
    else:
        raise ValueError("Invalid cutout image provided.")

    bbox = cutout.getbbox()
    if bbox:
        cutout = cutout.crop(bbox)

    # Apply optional manual rotation nudge (-15 to +15 deg)
    if abs(rotation_deg) > 0.01:
        # Negative angle rotates clockwise in PIL to match CSS slider expectations
        cutout = cutout.rotate(-rotation_deg, resample=Image.Resampling.BICUBIC, expand=True)
        bbox_rot = cutout.getbbox()
        if bbox_rot:
            cutout = cutout.crop(bbox_rot)

    cw, ch = cutout.size

    # Clamp size_pct between 40.0% and 75.0% (default 58.0%)
    safe_size_pct = max(40.0, min(75.0, float(size_pct)))
    target_product_h = int(canvas_size * (safe_size_pct / 100.0))
    max_product_w = int(canvas_size * 0.85)
    scale = min(max_product_w / max(1, cw), target_product_h / max(1, ch))
    new_w = max(1, int(cw * scale))
    new_h = max(1, int(ch * scale))
    cutout_scaled = cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Position cutout: strictly horizontally centered, resting on bottom surface
    pos_x = (canvas_size - new_w) // 2

    # Clamp bottom_cushion_pct between 2.0% and 20.0% (default 8.0%)
    safe_cushion_pct = max(2.0, min(20.0, float(bottom_cushion_pct)))
    bottom_cushion = int(canvas_size * (safe_cushion_pct / 100.0))
    pos_y = canvas_size - new_h - bottom_cushion
    pos_y = max(int(canvas_size * 0.02), pos_y)

    # b. Generate realistic surface drop shadow:
    # Duplicate cutout alpha channel, render solid black, apply strong Gaussian blur,
    # offset downward, and reduce opacity to ~40%.
    alpha = cutout_scaled.split()[3]
    alpha_40 = alpha.point(lambda p: int(p * 0.40))

    black_silhouette = Image.new("RGBA", (new_w, new_h), (15, 18, 22, 255))
    black_silhouette.putalpha(alpha_40)

    shadow_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_y = max(8, int(new_h * 0.038))  # Slight downward projection
    shadow_canvas.paste(black_silhouette, (pos_x, pos_y + offset_y), black_silhouette)
    shadow_blurred = shadow_canvas.filter(ImageFilter.GaussianBlur(radius=16.0))

    # c. Composite in order: background -> blurred shadow -> product cutout
    composite = Image.alpha_composite(bg_canvas, shadow_blurred)
    composite.paste(cutout_scaled, (pos_x, pos_y), cutout_scaled)

    # Convert to RGB for clean JPEG output
    final_rgb = composite.convert("RGB")

    # Save to disk
    timestamp = int(time.time() * 1000)
    filename = f"lifestyle_{timestamp}.jpg"
    out_path = settings.UPLOAD_DIR / filename
    final_rgb.save(out_path, format="JPEG", quality=92)

    # Encode to base64
    buf = io.BytesIO()
    final_rgb.save(buf, format="JPEG", quality=92)
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{b64_str}"

    return final_rgb, f"/static/uploads/{filename}", data_url
    # 2. Prepare transparent craft cutout
    if isinstance(cutout_img, Image.Image):
        cutout = cutout_img.convert("RGBA")
    elif isinstance(cutout_img, str):
        cutout = load_image_from_source(cutout_img).convert("RGBA")
    elif hasattr(cutout_img, "read"):
        cutout = Image.open(cutout_img).convert("RGBA")
    else:
        raise ValueError("Invalid cutout image provided.")

    bbox = cutout.getbbox()
    if bbox:
        cutout = cutout.crop(bbox)

    # Apply optional manual rotation nudge (-15 to +15 deg)
    if abs(rotation_deg) > 0.01:
        # Negative angle rotates clockwise in PIL to match CSS slider expectations
        cutout = cutout.rotate(-rotation_deg, resample=Image.Resampling.BICUBIC, expand=True)
        bbox_rot = cutout.getbbox()
        if bbox_rot:
            cutout = cutout.crop(bbox_rot)

    cw, ch = cutout.size

    # a. Scale cutout so product occupies roughly bottom 55-65% of canvas (resting on surface, not floating)
    target_product_h = int(canvas_size * 0.58)  # ~58% of canvas height
    max_product_w = int(canvas_size * 0.72)     # ~72% max width
    scale = min(max_product_w / max(1, cw), target_product_h / max(1, ch))
    new_w = max(1, int(cw * scale))
    new_h = max(1, int(ch * scale))
    cutout_scaled = cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Position cutout: centered horizontally, placed resting on bottom surface
    pos_x = (canvas_size - new_w) // 2
    bottom_cushion = int(canvas_size * 0.08)  # 8% cushion from bottom edge
    pos_y = canvas_size - new_h - bottom_cushion
    pos_y = max(int(canvas_size * 0.10), pos_y)

    # b. Generate realistic surface drop shadow:
    # Duplicate cutout alpha channel, render solid black, apply strong Gaussian blur,
    # offset downward, and reduce opacity to ~40%.
    alpha = cutout_scaled.split()[3]
    alpha_40 = alpha.point(lambda p: int(p * 0.40))

    black_silhouette = Image.new("RGBA", (new_w, new_h), (15, 18, 22, 255))
    black_silhouette.putalpha(alpha_40)

    shadow_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset_y = max(10, int(new_h * 0.038))  # Slight downward projection
    shadow_canvas.paste(black_silhouette, (pos_x, pos_y + offset_y), black_silhouette)
    shadow_blurred = shadow_canvas.filter(ImageFilter.GaussianBlur(radius=16.0))

    # c. Composite in order: background -> blurred shadow -> product cutout
    composite = Image.alpha_composite(bg_canvas, shadow_blurred)
    composite.paste(cutout_scaled, (pos_x, pos_y), cutout_scaled)

    # Convert to RGB for clean JPEG output
    final_rgb = composite.convert("RGB")

    # Save to disk
    timestamp = int(time.time() * 1000)
    filename = f"lifestyle_{timestamp}.jpg"
    out_path = settings.UPLOAD_DIR / filename
    final_rgb.save(out_path, format="JPEG", quality=92)

    # Encode to base64
    buf = io.BytesIO()
    final_rgb.save(buf, format="JPEG", quality=92)
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{b64_str}"

    return final_rgb, f"/static/uploads/{filename}", data_url
