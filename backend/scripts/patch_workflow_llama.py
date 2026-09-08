import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# 1. Render Transparent Llama Icon using Headless Chrome
p_llama_svg = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\tech_logos\llama_colored.svg"
with open(p_llama_svg, "r", encoding="utf-8") as f:
    svg_content = f.read()

html_content = f"""<!DOCTYPE html>
<html>
<head>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ background: transparent !important; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }}
    .icon {{ width: 140px; height: 140px; }}
  </style>
</head>
<body>
  <div class="icon">{svg_content}</div>
</body>
</html>"""

html_temp = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\llama_temp.html"
with open(html_temp, "w", encoding="utf-8") as f:
    f.write(html_content)

llama_png = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\llama_icon_alpha.png"
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--default-background-color=00000000",
    "--window-size=200,200",
    f"--screenshot={llama_png}",
    f"file:///{os.path.abspath(html_temp).replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print("Rendered transparent Llama icon PNG successfully!")

# 2. Patch shilpsetu_workflow.jpg
img_path = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public\shilpsetu_workflow.jpg"
img = Image.open(img_path).convert("RGBA")

# Exact bounding box of the card in 1376x768 image
x1, y1, x2, y2 = 538, 565, 674, 706
w = x2 - x1
h = y2 - y1

# Create card surface with exact background and rounded border
card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(card)

# Fill card: dark navy matching original #131726, border #344B7A
draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=15, fill=(19, 23, 38, 255), outline=(52, 75, 122, 255), width=2)

# Load transparent Llama icon
llama_img = Image.open(llama_png).convert("RGBA")
alpha = llama_img.split()[3]
bbox = alpha.getbbox()
llama_cropped = llama_img.crop(bbox)

# Target icon size ~ 52px high
icon_target_h = 50
icon_scale = icon_target_h / llama_cropped.height
icon_target_w = int(llama_cropped.width * icon_scale)
llama_resized = llama_cropped.resize((icon_target_w, icon_target_h), Image.Resampling.LANCZOS)

# Paste icon into card
icon_x = (w - icon_target_w) // 2
icon_y = 15
card.paste(llama_resized, (icon_x, icon_y), llama_resized)

# Font setup
font_bold = None
font_regular = None
for fpath in ["C:\\Windows\\Fonts\\segoeui.ttf", "C:\\Windows\\Fonts\\arial.ttf"]:
    if os.path.exists(fpath):
        font_regular = ImageFont.truetype(fpath, 15)
        break

for fpath in ["C:\\Windows\\Fonts\\segoeuib.ttf", "C:\\Windows\\Fonts\\arialbd.ttf"]:
    if os.path.exists(fpath):
        font_bold = ImageFont.truetype(fpath, 15)
        break

if not font_regular:
    font_regular = ImageFont.load_default()
if not font_bold:
    font_bold = font_regular

# Typography matching original "Multimodal" / "Llama AI"
line1 = "Llama 3.2"
line2 = "Vision"

b1 = draw.textbbox((0, 0), line1, font=font_bold)
b2 = draw.textbbox((0, 0), line2, font=font_bold)
w1 = b1[2] - b1[0]
w2 = b2[2] - b2[0]

text_y1 = 76
text_y2 = 96

draw.text(((w - w1) // 2, text_y1), line1, fill=(245, 247, 250, 255), font=font_bold)
draw.text(((w - w2) // 2, text_y2), line2, fill=(245, 247, 250, 255), font=font_bold)

# Composite card onto image
img.paste(card, (x1, y1), card)

# Convert back to RGB and save
img_rgb = img.convert("RGB")
img_rgb.save(img_path, format="JPEG", quality=96)

# Save also in root directory as ShilpSetu_Workflow_Llama.jpg
out_root_jpg = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Workflow_Llama.jpg"
img_rgb.save(out_root_jpg, format="JPEG", quality=96)

# Also copy to artifacts directory
artifact_dir = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9"
img_rgb.save(os.path.join(artifact_dir, "shilpsetu_workflow.jpg"), format="JPEG", quality=96)
img_rgb.save(os.path.join(artifact_dir, "ShilpSetu_Workflow_Llama.jpg"), format="JPEG", quality=96)

# Also save inspection crop
crop = img.crop((510, 530, 700, 730))
crop.save(r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\llama_card_verified.png")
crop.save(os.path.join(artifact_dir, "llama_card_verified.png"))

print("Successfully replaced Multimodal Gemini AI card with Llama 3.2 Vision in shilpsetu_workflow.jpg!")
