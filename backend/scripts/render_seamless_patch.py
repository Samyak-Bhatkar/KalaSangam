import os
from PIL import Image, ImageDraw, ImageFont

# Load original uploaded image
src_path = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\.user_uploaded\media_1788892885282.png"
img = Image.open(src_path).convert("RGBA")

# Extract icons
icon_store = Image.open(r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\scratch\icon_store.png").convert("RGBA")
icon_inst = Image.open(r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\scratch\icon_inst.png").convert("RGBA")

# Fonts
font_pill_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 11)
font_pill_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 8)

font_ondc_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 15)
font_ondc_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 6)
font_beckn_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 11)
font_beckn_body = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 8)
font_beckn_hl = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 10)

draw = ImageDraw.Draw(img)

# ==============================================================================
# 1. RENDER 3 ACCURATE PRICING PILLS (Column 3)
# ==============================================================================
pill_w = 194
pill_h = 39
pill_x = 534

pills = [
    {
        "y": 236,
        "title": "B2C Retail",
        "sub": "Direct Cost × 1.35x Multiplier",
        "icon": icon_store,
        "icon_offset_x": 146
    },
    {
        "y": 279,
        "title": "B2B Wholesale",
        "sub": "Volume Tiering (MOQ ≥ 10)",
        "icon": icon_inst,
        "icon_offset_x": 142
    },
    {
        "y": 323,
        "title": "GeM Govt Tender",
        "sub": "Direct Cost + 15% Stat. Margin",
        "icon": None,
        "icon_offset_x": 145
    }
]

for p in pills:
    px = pill_x
    py = p["y"]
    
    # Create pill surface with subtle gold gradient & border
    pill_img = Image.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(pill_img)
    
    for row in range(pill_h):
        t = row / max(pill_h - 1, 1)
        r = int(250 * (1 - t) + 243 * t)
        g = int(241 * (1 - t) + 228 * t)
        b = int(218 * (1 - t) + 192 * t)
        p_draw.line([(6, row), (pill_w - 7, row)], fill=(r, g, b, 255))
    
    # Rounded border
    p_draw.rounded_rectangle([0, 0, pill_w - 1, pill_h - 1], radius=8, outline=(236, 213, 168, 255), width=1)
    
    # Bullet dot
    p_draw.ellipse([8, 10, 13, 15], fill=(175, 115, 25, 255))
    
    # Title
    p_draw.text((18, 6), p["title"], fill=(15, 23, 42, 255), font=font_pill_title)
    
    # Subtitle formula
    p_draw.text((18, 21), p["sub"], fill=(120, 80, 15, 255), font=font_pill_sub)
    
    # Right Icon
    if p["icon"]:
        # Composite icon cleanly
        pill_img.paste(p["icon"], (p["icon_offset_x"], 1), p["icon"])
    else:
        # Custom clean GeM government shield icon
        # Badge circle
        p_draw.ellipse([155, 6, 183, 34], fill=(225, 195, 130, 255), outline=(180, 140, 60, 255), width=1)
        # Checkmark / G gavel
        p_draw.text((160, 11), "GeM", fill=(90, 60, 10, 255), font=font_pill_sub)
        p_draw.line([(163, 27), (167, 31), (175, 23)], fill=(40, 140, 60, 255), width=2)
        
    img.paste(pill_img, (px, py), pill_img)

# ==============================================================================
# 2. RENDER ACCURATE ONDC TOP CARD (Column 4)
# ==============================================================================
top_card_x = 777
top_card_y = 64
top_card_w = 221
top_card_h = 82

header_img = Image.new("RGBA", (top_card_w, top_card_h), (0, 0, 0, 0))
h_draw = ImageDraw.Draw(header_img)

# Gradient background matching the card top
for row in range(top_card_h):
    t = row / max(top_card_h - 1, 1)
    r = int(244 * (1 - t) + 228 * t)
    g = int(252 * (1 - t) + 246 * t)
    b = int(248 * (1 - t) + 238 * t)
    h_draw.line([(4, row), (top_card_w - 5, row)], fill=(r, g, b, 255))

# Top rounded corners and border outline
h_draw.rounded_rectangle([0, 0, top_card_w - 1, top_card_h + 20], radius=10, outline=(155, 215, 195, 255), width=1)

# Draw authentic official ONDC brand mark
# Left: x: 10 to 90
# 1. Multi-color circular ring
h_draw.arc([10, 12, 36, 38], start=135, end=315, fill=(0, 102, 178, 255), width=4)
h_draw.arc([10, 12, 36, 38], start=315, end=135, fill=(0, 168, 89, 255), width=4)
# Inner dot
h_draw.ellipse([20, 22, 26, 28], fill=(245, 158, 11, 255))

# 2. 'N D C' letters in bold brand style
h_draw.text((40, 12), "N", fill=(0, 102, 178, 255), font=font_ondc_bold)
h_draw.text((55, 12), "D", fill=(0, 102, 178, 255), font=font_ondc_bold)
h_draw.text((70, 12), "C", fill=(0, 168, 89, 255), font=font_ondc_bold)

# 3. Official subtitle
h_draw.text((10, 44), "OPEN NETWORK FOR", fill=(10, 80, 140, 255), font=font_ondc_sub)
h_draw.text((10, 52), "DIGITAL COMMERCE", fill=(0, 130, 70, 255), font=font_ondc_sub)
h_draw.text((10, 62), "ONDC Buyer Network", fill=(71, 85, 105, 255), font=font_pill_sub)

# Right: Beckn Protocol & Buyer Apps text (x: 94 to 215)
h_draw.text((95, 8), "ONDC Beckn", fill=(15, 23, 42, 255), font=font_beckn_title)
h_draw.text((95, 21), "Protocol V1.2.0", fill=(15, 23, 42, 255), font=font_beckn_title)
h_draw.text((95, 36), "Open Commerce payload", fill=(51, 65, 85, 255), font=font_beckn_body)
h_draw.text((95, 47), "broadcast to", fill=(51, 65, 85, 255), font=font_beckn_body)
h_draw.text((95, 58), "Buyer Apps", fill=(15, 23, 42, 255), font=font_beckn_hl)

# Paste over card top
img.paste(header_img, (top_card_x, top_card_y), header_img)

# Save final patched images
out_root = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Workflow_Accurate.png"
out_docs = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\docs\images\ShilpSetu_Workflow_Accurate.png"
out_artifact = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\ShilpSetu_Workflow_Accurate.png"

img_rgb = img.convert("RGB")
img_rgb.save(out_root, format="PNG")
os.makedirs(os.path.dirname(out_docs), exist_ok=True)
img_rgb.save(out_docs, format="PNG")
img_rgb.save(out_artifact, format="PNG")

print("Generated flawless accurate workflow image:", out_root)
