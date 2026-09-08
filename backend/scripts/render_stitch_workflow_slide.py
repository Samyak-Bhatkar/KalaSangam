"""Renders the official 1920x1080 Widescreen Presentation Workflow Slide for the Stitch Project:
https://stitch.withgoogle.com/projects/14738180325558078307
Features:
- Authentic Stitch Vernacular Craft Design System (Terracotta #9F3C16, Warm Papyrus #FFF8F5, Deep Indigo #1E3A8A)
- 4 Full Phone Mockups showcasing the exact 4 Stitch Prototype Screens:
  1. 3-Tap Home Command Center (Shanti Devi Profile, ₹18,450 Net, Voice FAB)
  2. Smart Viewfinder & Studio AI (AR Bounding Box, Studio Ready 6500K)
  3. Multilingual Voice Catalog (Bhashini Indic ASR, Realtime Waveform, Meta Llama 3.2)
  4. Fair Wage Pricing & Publish (MoSJE ₹120/hr Wage Floor, Cost-Plus Breakdown, ONDC Publish)
"""

import os
import subprocess
import shutil

HTML_SLIDE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShilpSetu AI - Google Stitch Vernacular Workflow</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Noto+Sans:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #FAF6EE;
      background-image: 
        radial-gradient(circle at 10% 15%, rgba(199, 90, 50, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 85%, rgba(30, 58, 138, 0.08) 0%, transparent 40%),
        linear-gradient(135deg, #FBF7F0 0%, #FAF6EE 50%, #F5EFE0 100%);
      display: flex;
      flex-direction: column;
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 30px 44px;
      color: #1F1B18;
      overflow: hidden;
      position: relative;
    }

    /* Subtle traditional pattern dots */
    .bg-pattern {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#D5C7B2 1.2px, transparent 1.2px);
      background-size: 32px 32px;
      opacity: 0.55;
      pointer-events: none;
    }

    /* HEADER */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #E8DEC8;
      padding-bottom: 16px;
      margin-bottom: 24px;
      position: relative;
      z-index: 10;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-circle {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #9F3C16;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 26px;
      box-shadow: 0 4px 14px rgba(159, 60, 22, 0.35);
    }
    .brand-text h1 {
      font-size: 30px;
      font-weight: 900;
      color: #9F3C16;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      font-size: 13px;
      font-weight: 800;
      background: #1E3A8A;
      color: #FFFFFF;
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .brand-subtitle {
      font-family: 'Noto Sans', sans-serif;
      font-size: 14px;
      color: #57423B;
      margin-top: 2px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .gov-pill {
      background: #FFFFFF;
      border: 1.5px solid #E8DEC8;
      border-radius: 30px;
      padding: 8px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-weight: 700;
      color: #1F1B18;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    /* 4-COLUMN WORKFLOW GRID */
    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      flex: 1;
      position: relative;
      z-index: 10;
    }

    .stage-column {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* STAGE CARD HEADER */
    .stage-header {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 12px 16px;
      border: 1.5px solid #E8DEC8;
      box-shadow: 0 4px 12px rgba(43, 38, 35, 0.04);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #9F3C16;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      font-weight: 900;
      flex-shrink: 0;
    }
    .step-title {
      font-size: 15px;
      font-weight: 800;
      color: #1F1B18;
      line-height: 1.2;
    }
    .step-sub {
      font-family: 'Noto Sans', sans-serif;
      font-size: 12px;
      color: #8A726A;
      margin-top: 2px;
    }

    /* PHONE FRAME */
    .phone-container {
      flex: 1;
      background: #1F1B18;
      border-radius: 28px;
      padding: 8px;
      box-shadow: 
        0 14px 34px rgba(43, 38, 35, 0.18),
        0 4px 12px rgba(43, 38, 35, 0.1);
      display: flex;
      flex-direction: column;
      border: 3px solid #DEC0B7;
      position: relative;
      max-height: 640px;
    }
    .phone-speaker-notch {
      width: 90px;
      height: 16px;
      background: #1F1B18;
      border-radius: 0 0 10px 10px;
      align-self: center;
      position: absolute;
      top: 8px;
      z-index: 30;
    }
    .phone-screen {
      flex: 1;
      border-radius: 20px;
      overflow: hidden;
      background: #FFF8F5;
      position: relative;
    }
    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
      display: block;
    }

    /* FEATURE CHIPS BELOW PHONE */
    .feature-box {
      background: #FFFFFF;
      border-radius: 14px;
      padding: 10px 14px;
      border: 1px solid #E8DEC8;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #57423B;
    }
    .feature-bullet {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9F3C16;
    }

    /* BOTTOM PIPELINE STATUS BAR */
    .pipeline-bar {
      margin-top: 14px;
      background: #FFFFFF;
      border-radius: 14px;
      border: 1.5px solid #E8DEC8;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(43, 38, 35, 0.04);
    }
    .pipeline-node {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: #1E3A8A;
    }
    .pipeline-arrow {
      color: #9F3C16;
      font-size: 18px;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <div class="bg-pattern"></div>

  <!-- HEADER -->
  <header class="header">
    <div class="brand-row">
      <div class="brand-logo-circle">🪡</div>
      <div class="brand-text">
        <h1>
          ShilpSetu AI
          <span class="brand-badge">Google Stitch Prototype</span>
        </h1>
        <div class="brand-subtitle">
          4-Stage Vernacular Artisan Onboarding & Sovereign Commerce Linkage • Tactile Indian Craft Design System
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="gov-pill">
        <span>🏛️</span>
        <span>MoSJE • NBCFDC Certified</span>
      </div>
      <div class="gov-pill">
        <span>🌐</span>
        <span>ONDC & GeM Direct Linkage</span>
      </div>
      <div class="gov-pill" style="background: #FFF0EB; border-color: #DEC0B7; color: #9F3C16;">
        <span>📱</span>
        <span>Touch-First & Voice-Only UI</span>
      </div>
    </div>
  </header>

  <!-- WORKFLOW GRID -->
  <div class="workflow-grid">
    <!-- STAGE 1: HOME COMMAND CENTER -->
    <div class="stage-column">
      <div class="stage-header">
        <div class="step-number">1</div>
        <div>
          <div class="step-title">Home Command Center</div>
          <div class="step-sub">3-Tap Zero-Typing Dashboard</div>
        </div>
      </div>
      <div class="phone-container">
        <div class="phone-speaker-notch"></div>
        <div class="phone-screen">
          <img src="file:///c:/Users/thulp/OneDrive/Desktop/ShilpSetu AI/stitch_assets/images/chrome_screens/stitch_screen_1.png" alt="Stitch Screen 1">
        </div>
      </div>
      <div class="feature-box">
        <div class="feature-item"><span class="feature-bullet"></span>₹18,450 Net Monthly Artisan Earnings</div>
        <div class="feature-item"><span class="feature-bullet"></span>+38% Direct Profit Over Middlemen</div>
        <div class="feature-item"><span class="feature-bullet"></span>Voice FAB "बोलकर बताएं" (One-Tap Action)</div>
      </div>
    </div>

    <!-- STAGE 2: SMART VIEWFINDER -->
    <div class="stage-column">
      <div class="stage-header">
        <div class="step-number" style="background: #1E3A8A;">2</div>
        <div>
          <div class="step-title">Smart Viewfinder AI</div>
          <div class="step-sub">AR Alignment & 6500K Studio</div>
        </div>
      </div>
      <div class="phone-container">
        <div class="phone-speaker-notch"></div>
        <div class="phone-screen">
          <img src="file:///c:/Users/thulp/OneDrive/Desktop/ShilpSetu AI/stitch_assets/images/chrome_screens/stitch_screen_2.png" alt="Stitch Screen 2">
        </div>
      </div>
      <div class="feature-box">
        <div class="feature-item"><span class="feature-bullet" style="background: #1E3A8A;"></span>AR Bounding Brackets for Pottery/Textiles</div>
        <div class="feature-item"><span class="feature-bullet" style="background: #1E3A8A;"></span>"Studio Ready" Daylight Quality Bar</div>
        <div class="feature-item"><span class="feature-bullet" style="background: #1E3A8A;"></span>Rembg Pure Background Extraction</div>
      </div>
    </div>

    <!-- STAGE 3: MULTILINGUAL VOICE CATALOG -->
    <div class="stage-column">
      <div class="stage-header">
        <div class="step-number" style="background: #825100;">3</div>
        <div>
          <div class="step-title">Voice Cataloguer</div>
          <div class="step-sub">Bhashini ASR & Meta Llama 3.2</div>
        </div>
      </div>
      <div class="phone-container">
        <div class="phone-speaker-notch"></div>
        <div class="phone-screen">
          <img src="file:///c:/Users/thulp/OneDrive/Desktop/ShilpSetu AI/stitch_assets/images/chrome_screens/stitch_screen_3.png" alt="Stitch Screen 3">
        </div>
      </div>
      <div class="feature-box">
        <div class="feature-item"><span class="feature-bullet" style="background: #825100;"></span>Speak in Dialect: Hindi, Bundeli, Malwi</div>
        <div class="feature-item"><span class="feature-bullet" style="background: #825100;"></span>Real-Time Noise Filtered Audio Waveform</div>
        <div class="feature-item"><span class="feature-bullet" style="background: #825100;"></span>Automated English & Story Generation</div>
      </div>
    </div>

    <!-- STAGE 4: FAIR WAGE PRICING & PUBLISH -->
    <div class="stage-column">
      <div class="stage-header">
        <div class="step-number" style="background: #10B981;">4</div>
        <div>
          <div class="step-title">Statutory Fair Pricing</div>
          <div class="step-sub">MoSJE ₹120/hr & ONDC Publish</div>
        </div>
      </div>
      <div class="phone-container">
        <div class="phone-speaker-notch"></div>
        <div class="phone-screen">
          <img src="file:///c:/Users/thulp/OneDrive/Desktop/ShilpSetu AI/stitch_assets/images/chrome_screens/stitch_screen_4.png" alt="Stitch Screen 4">
        </div>
      </div>
      <div class="feature-box">
        <div class="feature-item"><span class="feature-bullet" style="background: #10B981;"></span>6 hrs Labor × ₹120/hr Wage Floor (63%)</div>
        <div class="feature-item"><span class="feature-bullet" style="background: #10B981;"></span>Cost-Plus Fair Retail Price: ₹1,150</div>
        <div class="feature-item"><span class="feature-bullet" style="background: #10B981;"></span>1-Tap Broadcast to ONDC Beckn & GeM</div>
      </div>
    </div>
  </div>

  <!-- PIPELINE BAR -->
  <div class="pipeline-bar">
    <div class="pipeline-node"><span>🧑‍🎨</span> Rural Artisan Workshop</div>
    <div class="pipeline-arrow">➔</div>
    <div class="pipeline-node"><span>📸</span> AR Framing & Studio Normalization</div>
    <div class="pipeline-arrow">➔</div>
    <div class="pipeline-node"><span>🎙️</span> Bhashini Indic Speech-to-Text</div>
    <div class="pipeline-arrow">➔</div>
    <div class="pipeline-node"><span>🧠</span> Meta Llama 3.2 Catalog Reasoning</div>
    <div class="pipeline-arrow">➔</div>
    <div class="pipeline-node"><span>⚖️</span> MoSJE Living-Wage Pricing Engine</div>
    <div class="pipeline-arrow">➔</div>
    <div class="pipeline-node" style="color: #059669;"><span>🚀</span> ONDC & GeM Sovereign Commerce</div>
  </div>
</body>
</html>
"""

html_path = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\backend\scripts\temp_stitch_slide.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(HTML_SLIDE)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_png = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Stitch_Workflow_Slide.png"
out_docs = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\docs\images\ShilpSetu_Stitch_Workflow_Slide.png"
out_artifact = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\ShilpSetu_Stitch_Workflow_Slide.png"

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1920,1080",
    f"--screenshot={out_png}",
    html_path
]

subprocess.run(cmd, check=True)
os.makedirs(os.path.dirname(out_docs), exist_ok=True)
shutil.copy2(out_png, out_docs)
shutil.copy2(out_png, out_artifact)
print("Rendered ShilpSetu Stitch Workflow Slide successfully:", out_png)
