import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Load original uploaded image
src_path = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\.user_uploaded\media_1788892885282.png"
img = Image.open(src_path).convert("RGBA")

# Setup typography
font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 12)
font_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 9)
font_sub_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 9)
font_ondc_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 16)
font_ondc_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 6)
font_beckn_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 11)
font_beckn_norm = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 9)

# ==============================================================================
# 1. FIX COLUMN 3: MULTI-TIER PRICING PILLS
# ==============================================================================
# In original coordinates:
# Pill 1: y: 238 to 277
# Pill 2: y: 280 to 320
# Pill 3: y: 323 to 365
# Pill horizontal text area: x: 543 to 696 (leaving right icon intact)

pills_data = [
    {
        "y1": 238, "y2": 277,
        "title": "B2C Retail",
        "formula": "Direct Cost × 1.35x Craft Multiplier",
        "has_right_icon": True
    },
    {
        "y1": 280, "y2": 320,
        "title": "B2B Wholesale",
        "formula": "Volume Tiering (MOQ ≥ 10 units)",
        "has_right_icon": True
    },
    {
        "y1": 323, "y2": 365,
        "title": "GeM Govt Tender",
        "formula": "Direct Cost + 15% Statutory MSP",
        "has_right_icon": False
    }
]

draw = ImageDraw.Draw(img)

for p in pills_data:
    y1, y2 = p["y1"], p["y2"]
    h = y2 - y1
    x1 = 543
    x2 = 696 if p["has_right_icon"] else 722
    w = x2 - x1
    
    # Create smooth vertical gradient matching the pill background
    pill_patch = Image.new("RGBA", (w, h))
    patch_draw = ImageDraw.Draw(pill_patch)
    
    for row in range(h):
        ratio = row / max(h - 1, 1)
        r = int(247 * (1 - ratio) + 243 * ratio)
        g = int(236 * (1 - ratio) + 226 * ratio)
        b = int(212 * (1 - ratio) + 189 * ratio)
        patch_draw.line([(0, row), (w, row)], fill=(r, g, b, 255))
    
    # Round corners on the left side
    mask = Image.new("L", (w, h), 255)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, w + 10, h], radius=6, fill=255)
    
    # Paste smooth background over the text region
    img.paste(pill_patch, (x1, y1), mask)
    
    # Redraw amber bullet
    draw.ellipse([x1 + 6, y1 + 9, x1 + 12, y1 + 15], fill=(180, 120, 30, 255))
    
    # Draw Title
    draw.text((x1 + 17, y1 + 5), p["title"], fill=(15, 23, 42, 255), font=font_title)
    
    # Draw Formula Subtitle
    draw.text((x1 + 17, y1 + 22), p["formula"], fill=(120, 80, 15, 255), font=font_sub_bold)

# ==============================================================================
# 2. FIX COLUMN 4: TOP CARD (AUTHENTIC ONDC LOGO & PROTOCOL SPEC)
# ==============================================================================
# The upper portion of the top card: x: 780 to 995, y: 68 to 144
card_x1, card_y1, card_x2, card_y2 = 780, 68, 995, 144
card_w = card_x2 - card_x1
card_h = card_y2 - card_y1

# Create clean gradient matching the upper card
ondc_header_patch = Image.new("RGBA", (card_w, card_h))
h_draw = ImageDraw.Draw(ondc_header_patch)

for row in range(card_h):
    ratio = row / max(card_h - 1, 1)
    r = int(243 * (1 - ratio) + 228 * ratio)
    g = int(251 * (1 - ratio) + 245 * ratio)
    b = int(247 * (1 - ratio) + 237 * ratio)
    h_draw.line([(0, row), (card_w, row)], fill=(r, g, b, 255))

# Mask with top rounded corners
card_mask = Image.new("L", (card_w, card_h), 255)
cm_draw = ImageDraw.Draw(card_mask)
cm_draw.rounded_rectangle([0, 0, card_w, card_h + 10], radius=8, fill=255)

# Render Authentic ONDC Emblem & Typography on the left (x: 8 to 92)
# Letter 'O' with dual-color open circle
h_draw.arc([10, 14, 38, 42], start=120, end=300, fill=(0, 102, 178, 255), width=4)
h_draw.arc([10, 14, 38, 42], start=300, end=120, fill=(0, 168, 89, 255), width=4)
# Central connectivity dot
h_draw.ellipse([21, 25, 27, 31], fill=(245, 158, 11, 255))

# Letters 'N', 'D', 'C'
h_draw.text((42, 14), "N", fill=(0, 102, 178, 255), font=font_ondc_title)
h_draw.text((58, 14), "D", fill=(0, 102, 178, 255), font=font_ondc_title)
h_draw.text((74, 14), "C", fill=(0, 168, 89, 255), font=font_ondc_title)

# Subtitle under ONDC
h_draw.text((10, 50), "OPEN NETWORK FOR", fill=(10, 80, 140, 255), font=font_ondc_sub)
h_draw.text((10, 58), "DIGITAL COMMERCE", fill=(0, 130, 70, 255), font=font_ondc_sub)

# Render accurate Beckn Protocol text on the right (x: 95 onwards)
h_draw.text((96, 8), "ONDC Beckn", fill=(15, 23, 42, 255), font=font_beckn_bold)
h_draw.text((96, 21), "Protocol V1.2.0", fill=(15, 23, 42, 255), font=font_beckn_bold)
h_draw.text((96, 36), "Open Commerce payload", fill=(51, 65, 85, 255), font=font_beckn_norm)
h_draw.text((96, 48), "broadcast to", fill=(51, 65, 85, 255), font=font_beckn_norm)
h_draw.text((96, 60), "Buyer Apps", fill=(15, 23, 42, 255), font=font_beckn_bold)

# Paste over card top
img.paste(ondc_header_patch, (card_x1, card_y1), card_mask)

# Save output in multiple destinations
out_file = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Workflow_Accurate.png"
out_artifact = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\ShilpSetu_Workflow_Accurate.png"

img_rgb = img.convert("RGB")
img_rgb.save(out_file, format="PNG")
img_rgb.save(out_artifact, format="PNG")
print("Accurate patch generated successfully:", out_file)
