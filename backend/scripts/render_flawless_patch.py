import os
from PIL import Image, ImageDraw, ImageFont

# Load pristine user uploaded image
src_path = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\.user_uploaded\media_1788892885282.png"
img = Image.open(src_path).convert("RGBA")

# Load extracted icons
icon_store = Image.open(r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\scratch\icon_store.png").convert("RGBA")
icon_inst = Image.open(r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\scratch\icon_inst.png").convert("RGBA")

# Setup fonts
font_pill_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 12)
font_pill_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 8)

font_ondc_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 16)
font_ondc_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 6)
font_ondc_note = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 7)
font_beckn_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 11)
font_beckn_body = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 8)
font_beckn_hl = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 10)

font_guard = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 9.5)
font_guard_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 7)

draw = ImageDraw.Draw(img)

# ==============================================================================
# 1. RENDER 3 ACCURATE PRICING PILLS (Column 3)
# ==============================================================================
pill_x1 = 533
pill_x2 = 736
pill_w = pill_x2 - pill_x1

pills = [
    {
        "y1": 236, "y2": 276,
        "title": "B2C Retail",
        "sub": "Direct Cost × 1.35x Multiplier",
        "icon": icon_store,
        "icon_offset_x": 150, "icon_offset_y": 1
    },
    {
        "y1": 279, "y2": 319,
        "title": "B2B Wholesale",
        "sub": "Volume Tiering (MOQ ≥ 10 units)",
        "icon": icon_inst,
        "icon_offset_x": 145, "icon_offset_y": 1
    },
    {
        "y1": 323, "y2": 365,
        "title": "GeM Govt Tender",
        "sub": "Direct Cost + 15% Stat. Margin",
        "icon": None,
        "icon_offset_x": 150, "icon_offset_y": 2
    }
]

for p in pills:
    y1, y2 = p["y1"], p["y2"]
    h = y2 - y1
    
    pill_img = Image.new("RGBA", (pill_w, h), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(pill_img)
    
    for row in range(h):
        t = row / max(h - 1, 1)
        r = int(251 * (1 - t) + 242 * t)
        g = int(242 * (1 - t) + 227 * t)
        b = int(220 * (1 - t) + 190 * t)
        p_draw.line([(0, row), (pill_w, row)], fill=(r, g, b, 255))
        
    p_draw.rounded_rectangle([0, 0, pill_w - 1, h - 1], radius=8, outline=(236, 213, 168, 255), width=1)
    
    p_draw.ellipse([8, 11, 13, 16], fill=(175, 115, 25, 255))
    p_draw.text((18, 6), p["title"], fill=(15, 23, 42, 255), font=font_pill_title)
    p_draw.text((18, 22), p["sub"], fill=(120, 80, 15, 255), font=font_pill_sub)
    
    if p["icon"]:
        pill_img.paste(p["icon"], (p["icon_offset_x"], p["icon_offset_y"]), p["icon"])
    else:
        p_draw.ellipse([156, 7, 188, 35], fill=(225, 195, 130, 255), outline=(180, 140, 60, 255), width=1)
        p_draw.text((161, 11), "GeM", fill=(90, 60, 10, 255), font=font_pill_sub)
        p_draw.line([(165, 26), (170, 31), (180, 21)], fill=(22, 130, 50, 255), width=2)
        
    img.paste(pill_img, (pill_x1, y1), pill_img)

# ==============================================================================
# 2. ENHANCE BOTTOM CARD: UNDERPRICING & BARGAIN GUARD
# ==============================================================================
bg_x1, bg_y1 = 533, 372
bg_x2, bg_y2 = 736, 420
bg_w = bg_x2 - bg_x1
bg_h = bg_y2 - bg_y1

guard_patch = Image.new("RGBA", (bg_w, bg_h), (0, 0, 0, 0))
g_draw = ImageDraw.Draw(guard_patch)

for row in range(bg_h):
    t = row / max(bg_h - 1, 1)
    r = int(48 * (1 - t) + 30 * t)
    g = int(40 * (1 - t) + 24 * t)
    b = int(26 * (1 - t) + 14 * t)
    g_draw.line([(0, row), (bg_w, row)], fill=(r, g, b, 255))

g_draw.rounded_rectangle([0, 0, bg_w - 1, bg_h - 1], radius=10, outline=(160, 130, 70, 255), width=1)

# Shield icon
g_draw.polygon([(14, 10), (28, 10), (34, 16), (21, 35), (8, 16)], fill=None, outline=(220, 185, 110, 255), width=2)
g_draw.line([(14, 20), (19, 26), (27, 16)], fill=(245, 215, 130, 255), width=2)

# Text fitted cleanly
g_draw.text((40, 9), "Underpricing & Bargain Guard", fill=(245, 220, 150, 255), font=font_guard)
g_draw.text((40, 24), "n8n WhatsApp Auto-Negotiation Shield", fill=(195, 175, 125, 255), font=font_guard_sub)

img.paste(guard_patch, (bg_x1, bg_y1), guard_patch)

# ==============================================================================
# 3. RENDER ACCURATE ONDC TOP CARD (Column 4)
# ==============================================================================
top_x1, top_y1 = 776, 70
top_x2, top_y2 = 997, 153
top_w = top_x2 - top_x1
top_h = top_y2 - top_y1

ondc_patch = Image.new("RGBA", (top_w, top_h))
o_draw = ImageDraw.Draw(ondc_patch)

for row in range(top_h):
    t = row / max(top_h - 1, 1)
    r = int(238 * (1 - t) + 220 * t)
    g = int(250 * (1 - t) + 241 * t)
    b = int(246 * (1 - t) + 232 * t)
    o_draw.line([(0, row), (top_w, row)], fill=(r, g, b, 255))

mask = Image.new("L", (top_w, top_h), 255)
m_draw = ImageDraw.Draw(mask)
m_draw.rounded_rectangle([0, 0, top_w, top_h + 20], radius=8, fill=255)

o_draw.arc([10, 12, 38, 40], start=135, end=315, fill=(0, 102, 178, 255), width=4)
o_draw.arc([10, 12, 38, 40], start=315, end=135, fill=(0, 168, 89, 255), width=4)
o_draw.ellipse([21, 23, 27, 29], fill=(245, 158, 11, 255))

o_draw.text((44, 13), "N", fill=(0, 102, 178, 255), font=font_ondc_bold)
o_draw.text((61, 13), "D", fill=(0, 102, 178, 255), font=font_ondc_bold)
o_draw.text((78, 13), "C", fill=(0, 168, 89, 255), font=font_ondc_bold)

o_draw.text((10, 46), "OPEN NETWORK FOR", fill=(10, 80, 140, 255), font=font_ondc_sub)
o_draw.text((10, 54), "DIGITAL COMMERCE", fill=(0, 130, 70, 255), font=font_ondc_sub)
o_draw.text((10, 64), "ONDC Buyer Network", fill=(15, 118, 110, 255), font=font_ondc_note)

o_draw.text((105, 8), "ONDC Beckn", fill=(15, 23, 42, 255), font=font_beckn_title)
o_draw.text((105, 21), "Protocol V1.2.0", fill=(15, 23, 42, 255), font=font_beckn_title)
o_draw.text((105, 36), "Open Commerce payload", fill=(51, 65, 85, 255), font=font_beckn_body)
o_draw.text((105, 47), "broadcast to", fill=(51, 65, 85, 255), font=font_beckn_body)
o_draw.text((105, 59), "Buyer Apps", fill=(15, 23, 42, 255), font=font_beckn_hl)

img.paste(ondc_patch, (top_x1, top_y1), mask)

# Save output
out_root = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Workflow_Accurate.png"
out_docs = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\docs\images\ShilpSetu_Workflow_Accurate.png"
out_artifact = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\ShilpSetu_Workflow_Accurate.png"

img_rgb = img.convert("RGB")
img_rgb.save(out_root, format="PNG")
os.makedirs(os.path.dirname(out_docs), exist_ok=True)
img_rgb.save(out_docs, format="PNG")
img_rgb.save(out_artifact, format="PNG")

print("Enhanced accurate patch saved to:", out_root)
