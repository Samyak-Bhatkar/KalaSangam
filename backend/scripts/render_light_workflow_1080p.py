"""Renders a 1920x1080 Widescreen Presentation Slide of the Accurate Light-Pastel Workflow.
Matches the exact aesthetic of the user's uploaded slide:
- 4 Columns: Input & Sensing, AI Core Engine, Statutory Pricing Engine, Market Linkage & Sovereign Commerce
- Authentic ONDC Branding & Beckn Protocol V1.2.0
- Accurate Living-Wage Statutory Formulations (MoSJE ₹120/hr, B2C 1.35x, B2B MOQ 10, GeM 15%)
- Meta Llama 3.2 Vision + Bhashini ASR Indic
- 15s Reel Generator + Bargain Guard
"""

import os
import subprocess
import shutil

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShilpSetu AI - Accurate Technical Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #DCE8E3;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(99, 179, 237, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(52, 211, 153, 0.2) 0%, transparent 40%),
        linear-gradient(135deg, #DFEBE6 0%, #E8F0EC 50%, #D8E6E0 100%);
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      padding: 36px 48px;
      color: #1E293B;
      overflow: hidden;
      position: relative;
    }

    /* Subtle circuit background lines */
    .bg-circuits {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#A7C4B8 1px, transparent 1px);
      background-size: 32px 32px;
      opacity: 0.45;
      pointer-events: none;
    }

    /* 4 COLUMNS GRID */
    .columns-container {
      display: grid;
      grid-template-columns: 1fr 1.25fr 1.15fr 1.15fr;
      gap: 28px;
      flex: 1;
      position: relative;
      z-index: 10;
    }

    .column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* COLUMN HEADER PILLS */
    .col-header {
      padding: 14px 20px;
      border-radius: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      text-align: center;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }
    .header-blue { background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%); }
    .header-purple { background: linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%); }
    .header-gold { background: linear-gradient(135deg, #EAB308 0%, #D97706 100%); }
    .header-teal { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }

    /* CARDS */
    .card {
      background: #FFFFFF;
      border-radius: 18px;
      padding: 16px 20px;
      border: 1px solid rgba(203, 213, 225, 0.7);
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
      position: relative;
    }

    /* COL 1: INPUT & SENSING */
    .image-preview-box {
      border-radius: 14px;
      overflow: hidden;
      height: 220px;
      position: relative;
      background: #E2E8F0;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.1);
    }
    .image-preview-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-caption {
      text-align: center;
      font-weight: 700;
      font-size: 15px;
      color: #1E293B;
      margin-top: 10px;
    }

    .smart-ar-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
    }
    .phone-icon-thumb {
      width: 60px;
      height: 90px;
      background: #0F172A;
      border-radius: 10px;
      border: 2px solid #38BDF8;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(56, 189, 248, 0.3);
    }
    .ar-guides {
      width: 44px;
      height: 60px;
      border: 1px dashed #38BDF8;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .voice-recording-card {
      background: linear-gradient(135deg, #182234 0%, #0F172A 100%);
      color: #FFFFFF;
      border-radius: 18px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 18px;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
    }
    .mic-glow-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.15);
      border: 2px solid #38BDF8;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #38BDF8;
      font-size: 26px;
    }
    .waveform-bars {
      display: flex;
      align-items: center;
      gap: 3px;
      height: 36px;
    }
    .bar {
      width: 4px;
      background: linear-gradient(180deg, #38BDF8 0%, #EC4899 100%);
      border-radius: 2px;
    }

    /* COL 2: AI CORE ENGINE */
    .studio-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .studio-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 800;
      color: #1E293B;
    }
    .profit-pill {
      background: #8B5CF6;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .studio-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13.5px;
      color: #475569;
    }
    .studio-features li::before {
      content: "• ";
      color: #8B5CF6;
      font-weight: 800;
    }

    .bhashini-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #FAF5FF;
      border: 1px solid #E9D5FF;
    }
    .indic-letters {
      font-size: 22px;
      font-weight: 800;
      color: #9333EA;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
      line-height: 1;
    }

    .llama-card {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 16px 20px;
    }
    .llama-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 6px;
    }

    .toolkits-card {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 14px;
      background: #F8FAFC;
    }
    .toolkit-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
    }

    /* COL 3: STATUTORY PRICING ENGINE */
    .mosje-card {
      background: #FFFDF7;
      border: 1px solid #FDE68A;
      text-align: center;
      padding: 18px;
    }
    .mosje-emblem {
      font-size: 32px;
      margin-bottom: 6px;
    }
    .mosje-title {
      font-weight: 800;
      font-size: 15px;
      color: #78350F;
      margin-bottom: 4px;
    }
    .wage-floor-pill {
      background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 24px;
      font-weight: 900;
      padding: 8px 24px;
      border-radius: 24px;
      display: inline-block;
      margin: 10px 0;
      box-shadow: 0 4px 12px rgba(180, 83, 9, 0.3);
    }
    .overhead-note {
      font-size: 13px;
      font-weight: 700;
      color: #92400E;
    }

    .pricing-tiers-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tiers-title {
      font-size: 17px;
      font-weight: 800;
      color: #0F172A;
    }
    .tier-pill {
      background: linear-gradient(180deg, #FEF9EE 0%, #FDF3DB 100%);
      border: 1px solid #FDE68A;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tier-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tier-name {
      font-weight: 800;
      font-size: 14px;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tier-name::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #D97706;
      display: inline-block;
    }
    .tier-formula {
      font-size: 11px;
      font-weight: 700;
      color: #92400E;
      margin-left: 13px;
    }
    .tier-icon {
      font-size: 26px;
    }

    .guard-card {
      background: linear-gradient(135deg, #2D271E 0%, #1A1713 100%);
      color: #FDE68A;
      border-radius: 14px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-weight: 800;
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* COL 4: MARKET LINKAGE */
    .ondc-card {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 18px;
    }
    .ondc-top-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 14px;
    }
    .ondc-logo-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .ondc-emblem {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 22px;
      font-weight: 900;
    }
    .ondc-o {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 4px solid #00A859;
      border-top-color: #0066B2;
      border-left-color: #0066B2;
      position: relative;
    }
    .ondc-dot {
      width: 8px;
      height: 8px;
      background: #F59E0B;
      border-radius: 50%;
      position: absolute;
      top: 6px;
      left: 6px;
    }
    .ondc-text-blue { color: #0066B2; }
    .ondc-text-green { color: #00A859; }
    .ondc-sub-tag {
      font-size: 7px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #065F46;
      text-transform: uppercase;
    }

    .beckn-spec {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .beckn-title {
      font-weight: 800;
      font-size: 14px;
      color: #0F172A;
    }
    .beckn-desc {
      font-size: 11px;
      color: #334155;
      line-height: 1.3;
    }

    .buyer-apps-row {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-top: 12px;
      border-top: 1px dashed #CBD5E1;
    }
    .buyer-app-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .app-cart { background: #E0F2FE; color: #0284C7; }
    .app-bank { background: #EDE9FE; color: #7C3AED; }
    .app-globe { background: #FCE7F3; color: #DB2777; }
    .app-truck { background: #DCFCE7; color: #16A34A; }

    .reel-card {
      background: linear-gradient(135deg, #064E3B 0%, #022C22 100%);
      color: #FFFFFF;
      border-radius: 18px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex: 1;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(6, 78, 59, 0.25);
    }
    .reel-phone {
      width: 100px;
      height: 160px;
      border-radius: 18px;
      border: 3px solid #34D399;
      background: #065F46;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    .reel-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      border: 2px solid #6EE7B7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #6EE7B7;
    }
    .reel-title {
      font-weight: 800;
      font-size: 15px;
      text-align: center;
      color: #ECFDF5;
    }
  </style>
</head>
<body>
  <div class="bg-circuits"></div>

  <div class="columns-container">
    <!-- COL 1: INPUT & SENSING -->
    <div class="column">
      <div class="col-header header-blue">Input & Sensing</div>
      
      <div class="card" style="padding: 12px;">
        <div class="image-preview-box">
          <img src="file:///c:/Users/thulp/OneDrive/Desktop/ShilpSetu AI/backend/app/static/samples/gorakhpur_terracotta.jpg" alt="Artisan Pottery">
        </div>
        <div class="image-caption">Rural Indian artisan workshop</div>
      </div>

      <div class="card smart-ar-box">
        <div class="phone-icon-thumb">
          <div class="ar-guides">📐</div>
        </div>
        <div>
          <div style="font-weight: 800; font-size: 14px; color: #0F172A;">Smartphone</div>
          <div style="font-size: 12px; color: #64748B;">Utilising smart AR alignment guides</div>
        </div>
      </div>

      <div class="voice-recording-card">
        <div class="mic-glow-circle">🎙️</div>
        <div>
          <div class="waveform-bars">
            <div class="bar" style="height: 12px;"></div>
            <div class="bar" style="height: 24px;"></div>
            <div class="bar" style="height: 34px;"></div>
            <div class="bar" style="height: 18px;"></div>
            <div class="bar" style="height: 28px;"></div>
            <div class="bar" style="height: 14px;"></div>
            <div class="bar" style="height: 30px;"></div>
          </div>
          <div style="font-weight: 800; font-size: 14px; margin-top: 4px;">Voice recording</div>
          <div style="font-size: 11.5px; color: #94A3B8;">ambient noise cancellation</div>
        </div>
      </div>
    </div>

    <!-- COL 2: AI CORE ENGINE -->
    <div class="column">
      <div class="col-header header-purple">AI Core Engine</div>

      <div class="card">
        <div class="studio-header">
          <div class="studio-title">
            <span>⚙️</span> AI Studio
          </div>
          <div class="profit-pill">+38% artist profit</div>
        </div>
        <ul class="studio-features">
          <li>Rembg background removal</li>
          <li>6500K daylight normalization</li>
          <li>Soft ground shadows</li>
          <li>SciPy 2D-DCT Steganographic Watermark</li>
        </ul>
      </div>

      <div class="card bhashini-card">
        <div class="indic-letters">
          <span>अ</span><span>म</span>
          <span>च</span><span>ध</span>
        </div>
        <div>
          <div style="font-weight: 800; font-size: 15px; color: #581C87;">Bhashini Indic ASR</div>
          <div style="font-size: 12px; color: #6B21A8;">Realtime Speech-to-Text (12+ Languages)</div>
        </div>
      </div>

      <div class="card llama-card">
        <div class="llama-title">
          <span>Meta Llama 3.2</span>
          <span style="font-size: 20px; color: #0284C7;">♾️</span>
        </div>
        <div style="font-size: 12px; color: #475569; line-height: 1.4;">
          Multimodal Large Language Model reasoning & generating bilingual craft catalogs
        </div>
      </div>

      <div class="card toolkits-card">
        <div class="toolkit-badge">
          <span style="font-size: 20px;">⭕</span>
          <span>OpenCV</span>
        </div>
        <div class="toolkit-badge">
          <span style="font-size: 20px;">🖼️</span>
          <span>Pillow</span>
        </div>
        <div class="toolkit-badge">
          <span style="font-size: 20px;">🔢</span>
          <span>NumPy</span>
        </div>
        <div class="toolkit-badge">
          <span style="font-size: 20px;">🧬</span>
          <span>SciPy</span>
        </div>
      </div>
    </div>

    <!-- COL 3: STATUTORY PRICING ENGINE -->
    <div class="column">
      <div class="col-header header-gold">Statutory Pricing Engine</div>

      <div class="card mosje-card">
        <div class="mosje-emblem">🏛️</div>
        <div class="mosje-title">Ministry of Social Justice & Empowerment (MoSJE)</div>
        <div style="font-size: 12px; color: #92400E;">Statutory fair living wage floor</div>
        <div class="wage-floor-pill">₹120/hr</div>
        <div class="overhead-note">10% workshop overhead included</div>
      </div>

      <div class="card pricing-tiers-card">
        <div class="tiers-title">Multi-tier pricing calculations</div>

        <div class="tier-pill">
          <div class="tier-info">
            <div class="tier-name">B2C Retail</div>
            <div class="tier-formula">Direct Cost × 1.35x Craft Multiplier</div>
          </div>
          <div class="tier-icon">🏪</div>
        </div>

        <div class="tier-pill">
          <div class="tier-info">
            <div class="tier-name">B2B Wholesale</div>
            <div class="tier-formula">Volume Tiering (MOQ ≥ 10 units)</div>
          </div>
          <div class="tier-icon">🏛️</div>
        </div>

        <div class="tier-pill">
          <div class="tier-info">
            <div class="tier-name">GeM Govt Tender</div>
            <div class="tier-formula">Direct Cost + 15% Statutory MSP</div>
          </div>
          <div class="tier-icon">🛡️</div>
        </div>
      </div>

      <div class="guard-card">
        <span>🛡️</span>
        <span>Underpricing Guard & Bargain Guard</span>
      </div>
    </div>

    <!-- COL 4: MARKET LINKAGE & COMMERCE -->
    <div class="column">
      <div class="col-header header-teal">Market Linkage & Sovereign Commerce</div>

      <div class="card ondc-card">
        <div class="ondc-top-row">
          <div class="ondc-logo-box">
            <div class="ondc-emblem">
              <div class="ondc-o"><div class="ondc-dot"></div></div>
              <span class="ondc-text-blue">N</span>
              <span class="ondc-text-blue">D</span>
              <span class="ondc-text-green">C</span>
            </div>
            <div class="ondc-sub-tag">Open Network For Digital Commerce</div>
          </div>

          <div class="beckn-spec">
            <div class="beckn-title">ONDC Beckn Protocol V1.2.0</div>
            <div class="beckn-desc">Open Commerce payload broadcast to <strong>Buyer Apps</strong></div>
          </div>
        </div>

        <div class="buyer-apps-row">
          <div class="buyer-app-btn app-cart" title="Paytm ONDC">🛒</div>
          <div class="buyer-app-btn app-bank" title="Mystore / Banking">🏦</div>
          <div class="buyer-app-btn app-globe" title="Magicpin Global">🛍️</div>
          <div class="buyer-app-btn app-truck" title="Pincode Logistics">🚚</div>
        </div>
      </div>

      <div class="reel-card">
        <div class="reel-phone">
          <div class="reel-icon">▶️</div>
        </div>
        <div class="reel-title">15 second vertical video reel generator</div>
        <div style="font-size: 11.5px; color: #A7F3D0; text-align: center;">FastAPI MoviePy & Edge-TTS Multilingual Voiceover</div>
      </div>
    </div>
  </div>
</body>
</html>
"""

html_path = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\backend\scripts\temp_accurate_slide.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(HTML_CONTENT)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_png = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Workflow_Accurate_1080p.png"
out_artifact = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\ShilpSetu_Workflow_Accurate_1080p.png"

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1920,1080",
    f"--screenshot={out_png}",
    html_path
]

subprocess.run(cmd, check=True)
shutil.copy2(out_png, out_artifact)
print("Rendered 1080p slide successfully:", out_png)
