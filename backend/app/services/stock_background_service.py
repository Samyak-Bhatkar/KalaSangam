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
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image, ImageOps, ImageFilter
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


def get_background_options(query: Optional[str] = None, limit: int = 4) -> BackgroundOptionsResponse:
    """
    Fetches 3-4 background options:
    1. Query Pexels with query.
    2. Fallback to Pixabay if Pexels returns empty/error.
    3. Fallback to curated Indian handicraft settings if both fail.
    4. Marks single top result as recommended: true.
    """
    effective_query = (query or "").strip()
    if not effective_query:
        effective_query = "neutral wooden surface"

    # 1. Pexels search
    options = query_pexels(effective_query, limit=limit)
    source_used = "pexels"

    # 2. Pixabay fallback
    if not options:
        options = query_pixabay(effective_query, limit=limit)
        source_used = "pixabay"

    # 3. Curated fallback
    if not options:
        options = [BackgroundOption(**b) for b in CURATED_FALLBACK_BACKGROUNDS[:limit]]
        source_used = "curated"

    # Ensure strictly ONE item is marked recommended
    for i, opt in enumerate(options):
        opt.recommended = (i == 0)

    return BackgroundOptionsResponse(
        status="success",
        query=effective_query,
        source=source_used,
        options=options
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
    canvas_size: int = 1080
) -> Tuple[Image.Image, str, str]:
    """
    Composites the product cutout onto the chosen lifestyle background.
    Requirements:
    a. Scale and position cutout so product occupies bottom 55-65% of the canvas (resting on a surface).
    b. Drop shadow: duplicate alpha, render solid black, apply strong Gaussian blur, offset downward, 40% opacity.
    c. Layer order: stock background (bottom) -> blurred shadow layer -> product cutout (top).
    d. Pillow / OpenCV implementation.
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
