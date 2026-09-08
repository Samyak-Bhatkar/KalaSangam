import os
from PIL import Image, ImageDraw, ImageFont

# 1. Load the technical workflow slide which has the authentic Llama logo
slide = Image.open(r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Technical_Workflow_Slide.png").convert("RGBA")

# Let's locate the Llama icon in the slide
# In column 2 (x: 410 to 770), the Llama card is at the bottom
# Let's crop the logo area around (x: 435 to 475, y: 470 to 510)
# Let's verify by searching or cropping
crop_candidate = slide.crop((435, 475, 475, 515))
crop_candidate.save(r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\llama_extracted_logo.png")

# 2. Load shilpsetu_workflow.jpg
wf_path = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public\shilpsetu_workflow.jpg"
wf = Image.open(wf_path).convert("RGBA")

# Bounding box of the Multimodal Gemini card: 538, 565, 674, 706
x1, y1, x2, y2 = 538, 565, 674, 706
w = x2 - x1
h = y2 - y1

card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(card)

# Clean rounded card matching theme
draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=15, fill=(19, 24, 38, 255), outline=(52, 75, 122, 255), width=2)

# Paste the crisp Llama logo (resize to 38x38)
logo = Image.open(r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\llama_extracted_logo.png").convert("RGBA")
logo_resized = logo.resize((38, 38), Image.Resampling.LANCZOS)
card.paste(logo_resized, ((w - 38) // 2, 14), logo_resized)

# Font
font_bold = None
for fp in ["C:\\Windows\\Fonts\\segoeuib.ttf", "C:\\Windows\\Fonts\\arialbd.ttf"]:
    if os.path.exists(fp):
        font_bold = ImageFont.truetype(fp, 14)
        break
if not font_bold:
    font_bold = ImageFont.load_default()

t1 = "Llama 3.2"
t2 = "Vision"
b1 = draw.textbbox((0, 0), t1, font=font_bold)
b2 = draw.textbbox((0, 0), t2, font=font_bold)
w1 = b1[2] - b1[0]
w2 = b2[2] - b2[0]

draw.text(((w - w1) // 2, 62), t1, fill=(245, 247, 250, 255), font=font_bold)
draw.text(((w - w2) // 2, 82), t2, fill=(245, 247, 250, 255), font=font_bold)

# Subtitle badge: "Multimodal AI"
font_small = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 10) if os.path.exists("C:\\Windows\\Fonts\\segoeui.ttf") else font_bold
t3 = "Multimodal AI"
b3 = draw.textbbox((0, 0), t3, font=font_small)
w3 = b3[2] - b3[0]
draw.text(((w - w3) // 2, 108), t3, fill=(148, 163, 184, 255), font=font_small)

# Paste onto workflow
wf.paste(card, (x1, y1), card)

# Save
wf_rgb = wf.convert("RGB")
wf_rgb.save(wf_path, format="JPEG", quality=96)
wf_rgb.save(r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Workflow_Llama.jpg", format="JPEG", quality=96)

artifact_dir = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9"
wf_rgb.save(os.path.join(artifact_dir, "shilpsetu_workflow.jpg"), format="JPEG", quality=96)
wf_rgb.save(os.path.join(artifact_dir, "ShilpSetu_Workflow_Llama.jpg"), format="JPEG", quality=96)

print("Successfully updated shilpsetu_workflow.jpg with crisp Llama 3.2 Vision logo!")
