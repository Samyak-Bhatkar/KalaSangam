"""
Generate editable Microsoft PowerPoint (.pptx) presentation for ShilpSetu
System Architecture Slide (Team INVINCIBLE - SIH 2026).

Features:
- Natively editable shapes, text frames, fonts, and colors
- Dual engine: uses `python-pptx` if installed, or native Microsoft PowerPoint COM API
- 16:9 widescreen layout with dark theme styling
- Outputs to `system_architecture_slide.pptx`
"""

import os
import sys

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.shapes import MSO_SHAPE
    HAS_PYTHON_PPTX = True
except ImportError:
    HAS_PYTHON_PPTX = False

def rgb_int(r, g, b):
    """Convert RGB to PowerPoint COM integer format (BGR byte order)."""
    return r + (g << 8) + (b << 16)

# Data definition for the 6 cards
CARDS = [
    {
        "col": 1,
        "layer": "LAYER 01 • INGESTION",
        "title": "Frontend & UI",
        "sub": "Multi-Channel Artisan Access",
        "theme": {"r": 56, "g": 189, "b": 248}, # Sky Blue
        "left": 16, "top": 58, "width": 172, "height": 426,
        "items": [
            ("Flutter (Mobile)", "Dart 3", "Cross-platform app, zero-bandwidth offline queue, 60px tactile touch targets"),
            ("React 18 + Vite", "Web", "Responsive buyer marketplace, coordinator audit desk & live analytics"),
            ("2G IVR Telephony", "Hotline", "Keypad feature phone simulation, Web Audio DTMF tones & automated flow"),
            ("Tailwind + M3", "Design", "Zero-text icon navigation, warm terracotta aesthetic, accessible WCAG 2.1")
        ]
    },
    {
        "col": 2,
        "layer": "LAYER 02 • CORE GATEWAY",
        "title": "Backend & Core",
        "sub": "High-Concurrency Orchestrator",
        "theme": {"r": 16, "g": 185, "b": 129}, # Emerald Green
        "left": 200, "top": 58, "width": 172, "height": 426,
        "items": [
            ("FastAPI", "Python 3.13", "Stateless async microservices gateway, parallel pipeline dispatch & routing"),
            ("Uvicorn ASGI", "Async IO", "High-throughput event loop, handling multi-part audio/image streams"),
            ("Pydantic v2", "Validation", "Strict schema contracts, craft entity sanitization & coordinator approval logs"),
            ("SQLite WAL / Postgres", "DB", "Zero-lock draft catalog persistence, artisan profiles & audit trail log")
        ]
    },
    {
        "col": 3,
        "layer": "LAYER 03A • VISUAL AI",
        "title": "Computer Vision",
        "sub": "Photometric Studio Pipeline",
        "theme": {"r": 168, "g": 85, "b": 247}, # Purple
        "left": 384, "top": 58, "width": 178, "height": 207,
        "items": [
            ("rembg (BiRefNet)", "Matting", "Sub-2s neural background removal with high-res boundary preservation"),
            ("OpenCV & Pillow", "Color Science", "6500K studio color balancing, Gaussian drop-shadow synthesis"),
            ("Skeleton Pruning", "Topology", "Multi-component craft retention for intricate zari & pottery rims"),
            ("GrabCut Fallback", "Resilience", "Low-resource iterative graph-cut engine if neural VRAM constrained")
        ]
    },
    {
        "col": 3,
        "layer": "LAYER 03B • MULTIMODAL",
        "title": "Speech & LLM Intel",
        "sub": "Indic Dialect Extraction",
        "theme": {"r": 251, "g": 146, "b": 60}, # Orange
        "left": 384, "top": 277, "width": 178, "height": 207,
        "items": [
            ("MeitY Bhashini ASR", "Dhruva", "Conformer Indic ASR across 22 scheduled languages & colloquial dialects"),
            ("Gemini 2.5 Flash", "Multimodal", "Combined audio transcript + image entity extraction for craft metadata"),
            ("Meta Llama 3.2 Vision", "Edge Fallback", "Offline/on-prem multimodal fallback for zero-cloud sovereignty"),
            ("IndicTrans v2", "Translation", "Regional dialect to English product title, materials & craft story")
        ]
    },
    {
        "col": 4,
        "layer": "LAYER 04 • COMMERCE",
        "title": "Market Linkage",
        "sub": "Statutory Wage & Open Rails",
        "theme": {"r": 45, "g": 212, "b": 191}, # Teal
        "left": 574, "top": 58, "width": 172, "height": 426,
        "items": [
            ("Vyapar-Niti Engine", "Fair Wage", "MoSJE statutory ₹120/hr wage floor, B2C (1.35x), B2B wholesale MOQ tiers"),
            ("CLIP Similarity", "Visual Index", "Image embeddings to cross-reference market pricing & prevent duplication"),
            ("ONDC Beckn v1.2", "Protocol", "BAP/BPP catalog serialization, open discovery across Buyer Apps"),
            ("GeM Procurement", "Gov Orders", "Direct 15% price preference listing for institutional public procurement")
        ]
    },
    {
        "col": 5,
        "layer": "LAYER 05 • TRUST & GI",
        "title": "Security & Trust",
        "sub": "Cryptographic Provenance",
        "theme": {"r": 248, "g": 113, "b": 113}, # Red/Rose
        "left": 758, "top": 58, "width": 186, "height": 426,
        "items": [
            ("2D DCT Steganography", "SciPy", "Invisible frequency-domain luminance watermark with artisan GI & timestamp"),
            ("SHA-256 Fingerprint", "Integrity", "Cryptographic payload digest preventing catalog tampering"),
            ("Dynamic QR", "Verify", "Scannable buyer certificate linking directly to artisan cluster & GI registry"),
            ("Karigar Trust Score", "Ledger", "Fulfillment history, material authenticity & craft ratings credit scoring")
        ]
    }
]

FLOW_BADGES = [
    ("1", "Capture & Ingestion", 188, 255, rgb_int(56, 189, 248)),
    ("2", "Vision Processing", 370, 150, rgb_int(168, 85, 247)),
    ("3", "Speech Payload", 370, 360, rgb_int(251, 146, 60)),
    ("4", "Merge to Pricing", 562, 255, rgb_int(45, 212, 191)),
    ("5", "Watermark & GI", 746, 255, rgb_int(248, 113, 113)),
]

def generate_via_com(output_path):
    import win32com.client
    ppt = win32com.client.Dispatch("PowerPoint.Application")
    # Add presentation without displaying window
    pres = ppt.Presentations.Add(WithWindow=0)
    
    # 16:9 Widescreen slide (960 x 540 pt)
    pres.PageSetup.SlideWidth = 960
    pres.PageSetup.SlideHeight = 540
    slide = pres.Slides.Add(1, 12) # ppLayoutBlank
    
    # Slide Background: Dark #060A12
    bg = slide.Background
    bg.Fill.Solid()
    bg.Fill.ForeColor.RGB = rgb_int(6, 10, 18)
    
    # ------------------ TOP HEADER BAR ------------------
    header_box = slide.Shapes.AddShape(5, 16, 8, 928, 42) # 5 = msoShapeRoundedRectangle
    header_box.Fill.Solid()
    header_box.Fill.ForeColor.RGB = rgb_int(15, 23, 42)
    header_box.Line.ForeColor.RGB = rgb_int(51, 65, 85)
    header_box.Line.Weight = 1.2
    
    # Team Badge
    badge_box = slide.Shapes.AddShape(5, 24, 15, 88, 28)
    badge_box.Fill.Solid()
    badge_box.Fill.ForeColor.RGB = rgb_int(45, 15, 20)
    badge_box.Line.ForeColor.RGB = rgb_int(239, 68, 68)
    badge_box.Line.Weight = 1.5
    tf = badge_box.TextFrame
    tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
    p = tf.TextRange
    p.Text = "INVINCIBLE"
    p.Font.Size = 10
    p.Font.Bold = True
    p.Font.Color.RGB = rgb_int(252, 165, 165)
    p.Font.Name = "Segoe UI"
    
    # Title Text Box
    title_box = slide.Shapes.AddTextbox(1, 120, 11, 460, 36)
    tf = title_box.TextFrame
    tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
    p = tf.TextRange
    p.Text = "ShilpSetu AI (शिल्पसेतु AI) — Interconnected System Architecture"
    p.Font.Size = 13.5
    p.Font.Bold = True
    p.Font.Color.RGB = rgb_int(248, 250, 252)
    p.Font.Name = "Segoe UI"
    
    # Subtitle Text Box
    sub_box = slide.Shapes.AddTextbox(1, 120, 29, 460, 18)
    tf = sub_box.TextFrame
    tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
    p = tf.TextRange
    p.Text = "End-to-End Multimodal Edge & Sovereign Cloud Ingestion Pipeline"
    p.Font.Size = 8.5
    p.Font.Color.RGB = rgb_int(148, 163, 184)
    p.Font.Name = "Segoe UI"
    
    # SIH Right Badge
    sih_box = slide.Shapes.AddTextbox(1, 620, 10, 180, 36)
    tf = sih_box.TextFrame
    tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
    p = tf.TextRange
    p.Text = "SMART INDIA HACKATHON 2026\nProblem ID: 26090"
    p.Font.Size = 8.5
    p.Font.Bold = True
    p.Font.Color.RGB = rgb_int(245, 158, 11)
    p.Font.Name = "Segoe UI"
    
    # Govt Rail Tag
    govt_box = slide.Shapes.AddShape(5, 810, 14, 124, 30)
    govt_box.Fill.Solid()
    govt_box.Fill.ForeColor.RGB = rgb_int(30, 41, 59)
    govt_box.Line.ForeColor.RGB = rgb_int(100, 116, 139)
    govt_box.Line.Weight = 1
    tf = govt_box.TextFrame
    tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
    p = tf.TextRange
    p.Text = "MoSJE • NBCFDC/NSFDC"
    p.Font.Size = 7.5
    p.Font.Bold = True
    p.Font.Color.RGB = rgb_int(226, 232, 240)
    p.Font.Name = "Segoe UI"
    
    # ------------------ ARCHITECTURE CARDS ------------------
    for card in CARDS:
        cx, cy, cw, ch = card["left"], card["top"], card["width"], card["height"]
        color = card["theme"]
        
        # Card Container
        c_shape = slide.Shapes.AddShape(5, cx, cy, cw, ch)
        c_shape.Fill.Solid()
        c_shape.Fill.ForeColor.RGB = rgb_int(15, 23, 42)
        c_shape.Line.ForeColor.RGB = rgb_int(color["r"], color["g"], color["b"])
        c_shape.Line.Weight = 1.8
        
        # Card Header Area
        header_h = 42 if ch > 300 else 36
        th_box = slide.Shapes.AddTextbox(1, cx + 8, cy + 6, cw - 16, header_h)
        tf = th_box.TextFrame
        tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
        p = tf.TextRange
        p.Text = f"{card['layer']}\n{card['title']} — {card['sub']}"
        p.Font.Name = "Segoe UI"
        
        # Format Layer Tag
        p1 = p.Lines(1)
        p1.Font.Size = 7.5
        p1.Font.Bold = True
        p1.Font.Color.RGB = rgb_int(color["r"], color["g"], color["b"])
        
        # Format Card Title
        if p.Lines().Count > 1:
            p2 = p.Lines(2)
            p2.Font.Size = 9.5
            p2.Font.Bold = True
            p2.Font.Color.RGB = rgb_int(255, 255, 255)
        
        # Separator line
        sep = slide.Shapes.AddLine(cx + 8, cy + header_h + 8, cx + cw - 8, cy + header_h + 8)
        sep.Line.ForeColor.RGB = rgb_int(51, 65, 85)
        sep.Line.Weight = 0.75
        
        # Items
        item_y = cy + header_h + 14
        spacing = (ch - (header_h + 18)) / len(card["items"])
        
        for name, tag, desc in card["items"]:
            it_box = slide.Shapes.AddTextbox(1, cx + 8, item_y, cw - 16, spacing - 4)
            tf = it_box.TextFrame
            tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
            tf.WordWrap = -1
            
            p = tf.TextRange
            p.Text = f"• {name} [{tag}]\n  {desc}"
            p.Font.Name = "Segoe UI"
            
            l1 = p.Lines(1)
            l1.Font.Size = 8.5
            l1.Font.Bold = True
            l1.Font.Color.RGB = rgb_int(241, 245, 249)
            
            if p.Lines().Count > 1:
                l2 = p.Lines(2)
                l2.Font.Size = 7.5
                l2.Font.Bold = False
                l2.Font.Color.RGB = rgb_int(148, 163, 184)
            
            item_y += spacing

    # ------------------ FLOW BADGES ------------------
    for num, label, bx, by, bcolor in FLOW_BADGES:
        badge = slide.Shapes.AddShape(5, bx - 14, by - 10, 28, 20)
        badge.Fill.Solid()
        badge.Fill.ForeColor.RGB = rgb_int(15, 23, 42)
        badge.Line.ForeColor.RGB = bcolor
        badge.Line.Weight = 1.2
        tf = badge.TextFrame
        tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
        p = tf.TextRange
        p.Text = num
        p.Font.Size = 9
        p.Font.Bold = True
        p.Font.Color.RGB = rgb_int(255, 255, 255)
        p.Font.Name = "Segoe UI"
    
    # ------------------ FOOTER STATUS BAR ------------------
    footer_box = slide.Shapes.AddShape(5, 16, 492, 928, 38)
    footer_box.Fill.Solid()
    footer_box.Fill.ForeColor.RGB = rgb_int(15, 23, 42)
    footer_box.Line.ForeColor.RGB = rgb_int(51, 65, 85)
    footer_box.Line.Weight = 1
    
    # Footer Text Box
    ft_box = slide.Shapes.AddTextbox(1, 24, 495, 912, 32)
    tf = ft_box.TextFrame
    tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
    p = tf.TextRange
    p.Text = (
        "Legend: ① Ingestion  ② Vision AI  ③ Speech & LLM  ④ Fair Wage Pricing  ⑤ Provenance & GI  ⑥ Persistent Sync\n"
        "Performance: Latency < 4.2s End-to-End  |  Living Wage Guard: 100% Protected (₹120/hr floor)  |  Sovereignty: ONDC + GeM Ready"
    )
    p.Font.Name = "Segoe UI"
    
    l1 = p.Lines(1)
    l1.Font.Size = 8
    l1.Font.Color.RGB = rgb_int(148, 163, 184)
    
    if p.Lines().Count > 1:
        l2 = p.Lines(2)
        l2.Font.Size = 8
        l2.Font.Bold = True
        l2.Font.Color.RGB = rgb_int(52, 211, 153) # Green highlight
    
    # Save Presentation
    if os.path.exists(output_path):
        try:
            os.remove(output_path)
        except Exception:
            pass
            
    pres.SaveAs(os.path.abspath(output_path))
    pres.Close()
    ppt.Quit()
    print(f"[SUCCESS] Native PPTX generated successfully via PowerPoint COM at: {output_path}")

def generate_via_python_pptx(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    slide = prs.slides.add_slide(prs.slide_layouts[6]) # blank layout

    # Background
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = RGBColor(6, 10, 18)
    bg.line.fill.background()

    # Scale factor from 960x540 pt to Inches
    sx = 13.333 / 960.0
    sy = 7.5 / 540.0

    # Header Bar
    header = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(16 * sx), Inches(8 * sy), Inches(928 * sx), Inches(42 * sy))
    header.fill.solid()
    header.fill.fore_color.rgb = RGBColor(15, 23, 42)
    header.line.color.rgb = RGBColor(51, 65, 85)

    # Title in header
    tb = slide.shapes.add_textbox(Inches(120 * sx), Inches(11 * sy), Inches(460 * sx), Inches(36 * sy))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "ShilpSetu AI (शिल्पसेतु AI) — Interconnected System Architecture"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = RGBColor(248, 250, 252)

    # Cards
    for card in CARDS:
        cx, cy, cw, ch = card["left"] * sx, card["top"] * sy, card["width"] * sx, card["height"] * sy
        col = card["theme"]
        c_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(cx), Inches(cy), Inches(cw), Inches(ch))
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = RGBColor(15, 23, 42)
        c_shape.line.color.rgb = RGBColor(col["r"], col["g"], col["b"])

        tf = c_shape.text_frame
        tf.word_wrap = True
        p0 = tf.paragraphs[0]
        p0.text = f"{card['layer']}\n{card['title']} — {card['sub']}\n"
        p0.font.size = Pt(9.5)
        p0.font.bold = True
        p0.font.color.rgb = RGBColor(col["r"], col["g"], col["b"])

        for name, tag, desc in card["items"]:
            p = tf.add_paragraph()
            p.text = f"• {name} [{tag}]: {desc}"
            p.font.size = Pt(7.5)
            p.font.color.rgb = RGBColor(226, 232, 240)

    prs.save(output_path)
    print(f"[SUCCESS] Native PPTX generated successfully via python-pptx at: {output_path}")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    root_dir = os.path.dirname(base_dir)
    frontend_public = os.path.join(root_dir, "frontend", "public")
    
    output_root = os.path.join(root_dir, "system_architecture_slide.pptx")
    output_public = os.path.join(frontend_public, "system_architecture_slide.pptx")
    
    print("Generating native editable Microsoft PowerPoint presentation...")
    if HAS_PYTHON_PPTX:
        generate_via_python_pptx(output_root)
    else:
        generate_via_com(output_root)
    
    # Also copy to frontend/public for web downloads
    try:
        import shutil
        shutil.copy2(output_root, output_public)
        print(f"[SUCCESS] Synced copy to: {output_public}")
    except Exception as e:
        print(f"[NOTE] Could not copy to public: {e}")

if __name__ == "__main__":
    main()
