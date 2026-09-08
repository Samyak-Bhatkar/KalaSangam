"""Script to generate authentic sample craft images for ShilpSetu AI
Creates high-resolution visual fixtures for Terracotta, Chanderi Silk, Dhokra Brass, and Madhubani Painting
"""

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

def create_gorakhpur_terracotta() -> Image.Image:
    """Creates a high-res artisan workshop image of a Gorakhpur Terracotta Urn."""
    w, h = 1000, 1000
    img = Image.new("RGB", (w, h), (218, 195, 172))  # Rural workshop clay background
    draw = ImageDraw.Draw(img)

    # Workshop table shadow
    draw.ellipse([150, 780, 850, 920], fill=(130, 105, 85))

    # Terracotta urn body (rich earthy terracotta tones)
    # Base bulb
    base_color = (196, 75, 43)
    highlight_color = (235, 115, 78)
    shadow_color = (140, 45, 25)
    
    # Layered concentric gradient pot
    for r in range(320, 0, -5):
        factor = r / 320.0
        cr = int(highlight_color[0] * (1 - factor * 0.4) + shadow_color[0] * (factor * 0.4))
        cg = int(highlight_color[1] * (1 - factor * 0.4) + shadow_color[1] * (factor * 0.4))
        cb = int(highlight_color[2] * (1 - factor * 0.4) + shadow_color[2] * (factor * 0.4))
        cx = 500 - int((1 - factor) * 40)
        cy = 580 - int((1 - factor) * 30)
        draw.ellipse([cx - r, cy - int(r * 0.9), cx + r, cy + int(r * 0.9)], fill=(cr, cg, cb))

    # Neck
    for y in range(260, 420):
        t = (y - 260) / 160.0
        neck_w = int(140 + t * 90)
        draw.ellipse([500 - neck_w, y, 500 + neck_w, y + 25], fill=(180, 68, 38))

    # Rim / Lip
    draw.ellipse([320, 240, 680, 310], fill=(210, 85, 50), outline=(130, 40, 20), width=4)
    draw.ellipse([360, 255, 640, 295], fill=(70, 25, 15))  # Inner opening

    # Traditional Indian Gorakhpur floral appliqué carvings
    for i in range(12):
        angle = i * (2 * math.pi / 12)
        px = int(500 + 220 * math.cos(angle))
        py = int(580 + 170 * math.sin(angle))
        draw.ellipse([px - 22, py - 22, px + 22, py + 22], fill=(235, 130, 90), outline=(110, 35, 15), width=3)
        draw.ellipse([px - 8, py - 8, px + 8, py + 8], fill=(255, 190, 130))

    # Ornamental neck ring
    for i in range(16):
        nx = int(370 + i * 17)
        draw.ellipse([nx, 400, nx + 12, 416], fill=(245, 150, 100), outline=(100, 30, 10), width=2)

    return img

def create_chanderi_saree() -> Image.Image:
    """Creates a high-res artisan workshop image of a Chanderi Silk Saree."""
    w, h = 1000, 1000
    img = Image.new("RGB", (w, h), (230, 224, 215))
    draw = ImageDraw.Draw(img)

    # Wooden weaving loom bench
    draw.rectangle([80, 820, 920, 950], fill=(110, 75, 50))

    # Royal Peacock Blue Silk Drape with pleats
    for p in range(12):
        x1 = 180 + p * 55
        x2 = x1 + 65
        pleat_color = (25 + (p % 2) * 20, 60 + (p % 2) * 30, 110 + (p % 2) * 40)
        draw.polygon([(x1, 280), (x2, 280), (x2 + 40, 840), (x1 + 40, 840)], fill=pleat_color)

    # Gold Zari Pallu (Broad Gold Brocade Border)
    draw.rectangle([160, 480, 840, 620], fill=(212, 175, 55), outline=(160, 120, 30), width=5)

    # Zari Motifs (Buti & Paisley)
    for row in range(3):
        for col in range(8):
            bx = 210 + col * 78
            by = 510 + row * 40
            draw.ellipse([bx, by, bx + 22, by + 26], fill=(255, 230, 130), outline=(140, 100, 20), width=2)
            draw.line([(bx + 11, by - 6), (bx + 11, by)], fill=(255, 230, 130), width=3)

    # Delicate Gossamer Bootis on blue silk
    for r in range(4):
        for c in range(7):
            bx = 230 + c * 85 + (r % 2) * 40
            by = 310 + r * 40
            draw.ellipse([bx, by, bx + 10, by + 10], fill=(230, 195, 80))

    # Zari tassels (fringe work)
    for t in range(45):
        tx = 160 + t * 15
        draw.line([(tx, 840), (tx, 875)], fill=(212, 175, 55), width=2)

    return img

def create_dhokra_brass() -> Image.Image:
    """Creates a high-res artisan workshop image of a Bastar Dhokra Brass Bell Metal Idol."""
    w, h = 1000, 1000
    img = Image.new("RGB", (w, h), (195, 185, 175))
    draw = ImageDraw.Draw(img)

    # Workshop casting platform
    draw.ellipse([200, 750, 800, 920], fill=(105, 95, 85))

    brass_body = (184, 134, 11)
    brass_hi = (238, 194, 76)
    brass_patina = (90, 75, 40)

    # Primitive Tribal Musician Figurine
    # Torso
    draw.polygon([(460, 420), (540, 420), (520, 680), (480, 680)], fill=brass_body, outline=brass_patina, width=4)

    # Cylindrical tribal legs
    draw.line([(485, 680), (470, 820)], fill=brass_body, width=28)
    draw.line([(515, 680), (530, 820)], fill=brass_body, width=28)
    draw.ellipse([445, 810, 490, 840], fill=brass_hi)  # Left foot
    draw.ellipse([510, 810, 555, 840], fill=brass_hi)  # Right foot

    # Lost wax spiraled bell metal head
    draw.ellipse([450, 260, 550, 390], fill=brass_body, outline=brass_patina, width=5)
    # Headdress with traditional tribal brass coils
    for i in range(7):
        cx = 440 + i * 20
        draw.arc([cx, 230, cx + 25, 275], 0, 360, fill=brass_hi, width=4)

    # Traditional trumpet / flute held by artisan figurine
    draw.line([(510, 450), (660, 390)], fill=brass_hi, width=14)
    draw.ellipse([645, 370, 685, 410], fill=brass_body, outline=brass_hi, width=3)  # Flute bell horn

    # Arms wrapping the instrument
    draw.line([(470, 450), (540, 430)], fill=brass_body, width=18)
    draw.line([(530, 450), (620, 410)], fill=brass_body, width=18)

    # Lost-wax filigree texture wires along torso
    for y in range(450, 670, 18):
        draw.line([(465, y), (535, y)], fill=brass_hi, width=3)

    return img

def create_madhubani_art() -> Image.Image:
    """Creates a high-res artisan workshop image of a Madhubani Folk Painting."""
    w, h = 1000, 1000
    img = Image.new("RGB", (w, h), (242, 232, 210))  # Handmade sun-dried parchment paper
    draw = ImageDraw.Draw(img)

    # Traditional double-line geometric border
    draw.rectangle([60, 60, 940, 940], outline=(15, 15, 15), width=5)
    draw.rectangle([80, 80, 920, 920], outline=(180, 40, 30), width=4)

    # Border fish & floral motifs (Mithila symbol of fertility and water)
    for i in range(18):
        bx = 100 + i * 44
        draw.ellipse([bx, 84, bx + 30, 104], fill=(220, 90, 40), outline=(15, 15, 15), width=2)
        draw.ellipse([bx, 894, bx + 30, 914], fill=(220, 90, 40), outline=(15, 15, 15), width=2)

    # Sacred Tree of Life (Kalpavriksha) in center
    trunk_color = (35, 30, 25)
    leaf_green = (34, 139, 34)
    leaf_ochre = (218, 165, 32)
    flower_vermilion = (210, 45, 35)

    # Trunk with intricate Kachni line work
    draw.polygon([(475, 860), (525, 860), (510, 520), (490, 520)], fill=trunk_color)
    for y in range(540, 850, 14):
        draw.line([(480, y), (520, y)], fill=(240, 230, 210), width=2)

    # Spreading branches
    branches = [
        ((490, 560), (320, 420)),
        ((510, 560), (680, 420)),
        ((495, 500), (360, 320)),
        ((505, 500), (640, 320)),
        ((500, 460), (500, 240))
    ]
    for b_start, b_end in branches:
        draw.line([b_start, b_end], fill=trunk_color, width=12)

    # Vibrant Madhubani Leaves & Rosettes
    for angle_deg in range(0, 360, 15):
        rad = math.radians(angle_deg)
        dist = 220 + (angle_deg % 45) * 4
        lx = int(500 + dist * math.cos(rad))
        ly = int(400 + (dist * 0.7) * math.sin(rad))
        col = leaf_green if angle_deg % 30 == 0 else (leaf_ochre if angle_deg % 15 == 0 else flower_vermilion)
        draw.ellipse([lx - 18, ly - 14, lx + 18, ly + 14], fill=col, outline=(15, 15, 15), width=2)

    # Peacock flanking tree (Auspicious Mithila motif)
    # Left peacock
    draw.ellipse([260, 620, 380, 740], fill=(20, 70, 160), outline=(15, 15, 15), width=3) # Body
    draw.ellipse([240, 540, 300, 630], fill=(30, 144, 255), outline=(15, 15, 15), width=3) # Neck
    draw.polygon([(240, 560), (200, 570), (240, 580)], fill=(220, 120, 20)) # Beak
    # Crest
    draw.line([(270, 540), (265, 510)], fill=(15, 15, 15), width=3)
    draw.ellipse([258, 500, 272, 514], fill=(212, 175, 55))

    # Right peacock
    draw.ellipse([620, 620, 740, 740], fill=(20, 70, 160), outline=(15, 15, 15), width=3)
    draw.ellipse([700, 540, 760, 630], fill=(30, 144, 255), outline=(15, 15, 15), width=3)
    draw.polygon([(760, 560), (800, 570), (760, 580)], fill=(220, 120, 20))
    draw.line([(730, 540), (735, 510)], fill=(15, 15, 15), width=3)
    draw.ellipse([728, 500, 742, 514], fill=(212, 175, 55))

    return img

def main():
    base_dir = Path(__file__).resolve().parent.parent
    backend_samples = base_dir / "app" / "static" / "samples"
    backend_samples.mkdir(parents=True, exist_ok=True)

    crafts = [
        ("gorakhpur_terracotta.jpg", create_gorakhpur_terracotta()),
        ("chanderi_saree.jpg", create_chanderi_saree()),
        ("dhokra_brass.jpg", create_dhokra_brass()),
        ("madhubani_art.jpg", create_madhubani_art())
    ]

    for fname, img in crafts:
        out_path = backend_samples / fname
        img.save(out_path, format="JPEG", quality=92)
        print(f"Generated sample craft: {out_path}")

if __name__ == "__main__":
    main()
