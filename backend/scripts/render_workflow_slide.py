"""Renders the comprehensive 1920x1080 ShilpSetu AI Workflow & Cloud/n8n Architecture Slide.
Client: Ministry of Social Justice and Empowerment (MoSJE)
Outputs:
- ShilpSetu_Updated_Workflow_Slide.png in workspace root
- docs/images/ShilpSetu_Updated_Workflow_Slide.png
"""

import os
import subprocess
import shutil

WORKFLOW_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShilpSetu AI - End-to-End Workflow & Cloud/n8n Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #0B0F19;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      padding: 32px 42px;
      color: #F8FAFC;
      overflow: hidden;
    }

    /* TOP HEADER */
    .slide-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #1E293B;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .brand-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .brand-title h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 34px;
      font-weight: 900;
      letter-spacing: -0.5px;
      background: linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-tag {
      font-size: 13px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.18);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.35);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .brand-subtitle {
      font-size: 15px;
      color: #94A3B8;
      font-weight: 500;
    }
    .ministry-badge {
      text-align: right;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .emblem-pill {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .emblem-pill .govt {
      font-size: 14px;
      font-weight: 800;
      color: #F1F5F9;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .emblem-pill .sub {
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
    }

    /* 5-COLUMN WORKFLOW GRID */
    .workflow-container {
      display: grid;
      grid-template-columns: 1fr 1.05fr 1.05fr 1.05fr 1fr;
      gap: 16px;
      flex: 1;
      align-items: stretch;
      position: relative;
    }

    .flow-col {
      background: rgba(15, 23, 42, 0.75);
      border-radius: 24px;
      border: 2px solid #1E293B;
      padding: 22px 20px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(12px);
    }

    /* COLUMN ACCENTS */
    .col-1 { border-color: #F97316; box-shadow: 0 0 25px rgba(249, 115, 22, 0.12); }
    .col-2 { border-color: #0284C7; box-shadow: 0 0 25px rgba(2, 132, 199, 0.12); }
    .col-3 { border-color: #EAB308; box-shadow: 0 0 25px rgba(234, 179, 8, 0.12); }
    .col-4 { border-color: #EC4899; box-shadow: 0 0 25px rgba(236, 72, 153, 0.15); }
    .col-5 { border-color: #10B981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.12); }

    .col-header {
      padding: 12px 14px;
      border-radius: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      text-align: center;
      margin-bottom: 18px;
    }
    .header-1 { background: rgba(249, 115, 22, 0.16); color: #FB923C; border: 1.5px solid rgba(249, 115, 22, 0.4); }
    .header-2 { background: rgba(2, 132, 199, 0.16); color: #38BDF8; border: 1.5px solid rgba(2, 132, 199, 0.4); }
    .header-3 { background: rgba(234, 179, 8, 0.16); color: #FACC15; border: 1.5px solid rgba(234, 179, 8, 0.4); }
    .header-4 { background: rgba(236, 72, 153, 0.16); color: #F472B6; border: 1.5px solid rgba(236, 72, 153, 0.4); }
    .header-5 { background: rgba(16, 185, 129, 0.16); color: #34D399; border: 1.5px solid rgba(16, 185, 129, 0.4); }

    /* CARD COMPONENTS */
    .card-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      flex: 1;
    }
    .step-card {
      background: #0F172A;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-desc {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.45;
    }
    .stat-badge {
      display: inline-block;
      align-self: flex-start;
      margin-top: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      color: #E2E8F0;
    }

    .highlight-box {
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(249, 115, 22, 0.08));
      border: 1.5px solid rgba(234, 179, 8, 0.45);
      border-radius: 16px;
      padding: 16px;
      text-align: center;
      margin-bottom: 12px;
    }
    .highlight-price {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 32px;
      font-weight: 900;
      color: #FBBF24;
      margin: 4px 0;
    }
    .highlight-sub {
      font-size: 11px;
      color: #E2E8F0;
      font-weight: 600;
    }

    /* FOOTER */
    .slide-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid #1E293B;
      padding-top: 14px;
      margin-top: 18px;
      font-size: 13px;
      color: #64748B;
      font-weight: 600;
    }
    .footer-pills {
      display: flex;
      gap: 12px;
    }
    .footer-pill {
      background: #1E293B;
      padding: 4px 12px;
      border-radius: 999px;
      color: #CBD5E1;
      font-size: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="slide-header">
    <div class="brand-title">
      <h1>
        ShilpSetu AI (शिल्पसेतु AI)
        <span class="brand-tag">MoSJE • NBCFDC / NSFDC</span>
      </h1>
      <p class="brand-subtitle">Autonomous AI-Driven Smart Cataloging & Multi-Channel Market Linkage System</p>
    </div>
    <div class="ministry-badge">
      <div class="emblem-pill">
        <span class="govt">Government of India</span>
        <span class="sub">Department of Social Justice and Empowerment</span>
      </div>
    </div>
  </header>

  <!-- 5-COLUMN WORKFLOW -->
  <main class="workflow-container">

    <!-- STAGE 1 -->
    <div class="flow-col col-1">
      <div class="col-header header-1">1. Input & Sensing</div>
      <div class="card-list">
        <div class="step-card">
          <div class="card-title">📸 Smart Viewfinder</div>
          <p class="card-desc">AR silhouette guides (Pottery, Saree, Idol, Painting). Zero-text shutter with 10% safety cushion.</p>
          <span class="stat-badge">Mobile Camera • Flutter/Web</span>
        </div>
        <div class="step-card">
          <div class="card-title">🎙️ 96px Vernacular Mic</div>
          <p class="card-desc">Giant pulsing tactile mic with live web audio waveform visualizer for low-literacy artisans.</p>
          <span class="stat-badge">Hindi, Marathi, Tamil, etc.</span>
        </div>
        <div class="step-card">
          <div class="card-title">🇮🇳 Bhashini ASR</div>
          <p class="card-desc">National Language Translation Mission integration with noise cancellation for village workshops.</p>
          <span class="stat-badge">Dialect-Aware Voice AI</span>
        </div>
      </div>
    </div>

    <!-- STAGE 2 -->
    <div class="flow-col col-2">
      <div class="col-header header-2">2. AI Core Studio</div>
      <div class="card-list">
        <div class="step-card">
          <div class="card-title">✨ Salient Segmentation</div>
          <p class="card-desc">rembg BiRefNet / OpenCV GrabCut extracts craft from cluttered rural workshop backgrounds.</p>
          <span class="stat-badge">Sub-500ms Edge Fallback</span>
        </div>
        <div class="step-card">
          <div class="card-title">☀️ 6500K Daylight Studio</div>
          <p class="card-desc">Auto-normalizes dim tungsten bulb lighting into daylight off-white (#F8F9FA) with natural contact drop shadow.</p>
          <span class="stat-badge">1080x1080 Studio Canvas</span>
        </div>
        <div class="step-card">
          <div class="card-title">🤖 Multimodal Reasoning</div>
          <p class="card-desc">Gemini 2.5 Flash & Llama Vision ingest voice transcript + photo to extract technique, materials & SEO.</p>
          <span class="stat-badge">Bilingual Listing (EN/HI)</span>
        </div>
      </div>
    </div>

    <!-- STAGE 3 -->
    <div class="flow-col col-3">
      <div class="col-header header-3">3. Statutory Fair Wage</div>
      <div class="highlight-box">
        <div class="highlight-sub">STATUTORY LIVING WAGE FLOOR</div>
        <div class="highlight-price">₹120 / hr</div>
        <div class="highlight-sub">+ 10% Workshop Overhead (Tools/Power)</div>
      </div>
      <div class="card-list">
        <div class="step-card">
          <div class="card-title">🛡️ Underpricing Guard</div>
          <p class="card-desc">Triggers Hindi audio alert if artisan's asking price falls below statutory baseline costs.</p>
          <span class="stat-badge" style="color: #F87171;">Prevents Labor Exploitation</span>
        </div>
        <div class="step-card">
          <div class="card-title">📊 Multi-Channel Tiers</div>
          <p class="card-desc">Calculates certified margins:<br>• B2C Retail: Multiplier (1.25 - 1.50)<br>• B2B Wholesale: Volume tier<br>• GeM Public Tender: 15% statutory margin</p>
        </div>
      </div>
    </div>

    <!-- STAGE 4 -->
    <div class="flow-col col-4">
      <div class="col-header header-4">4. n8n Automation & Cloud</div>
      <div class="card-list">
        <div class="step-card">
          <div class="card-title">💬 WhatsApp Bargain Guard</div>
          <p class="card-desc">n8n intercepts wholesale bids below cost, sends Hindi voice alert & interactive counter-offer buttons to artisan.</p>
          <span class="stat-badge" style="color: #F472B6;">WhatsApp Cloud API / Twilio</span>
        </div>
        <div class="step-card">
          <div class="card-title">🎬 Async 15s Reel Pipeline</div>
          <p class="card-desc">Background job queue renders 9:16 vertical video with Ken Burns zoom, Raag Bhupali flute & QR code.</p>
          <span class="stat-badge">GCS / S3 Cloud Storage</span>
        </div>
        <div class="step-card">
          <div class="card-title">📈 MoSJE Analytics Sync</div>
          <p class="card-desc">Streams live artisan living wage hours, GI tags & inventory to Ministry Google Sheets / PostgreSQL.</p>
          <span class="stat-badge">Docker & Cloud Run Ready</span>
        </div>
      </div>
    </div>

    <!-- STAGE 5 -->
    <div class="flow-col col-5">
      <div class="col-header header-5">5. Sovereign Commerce</div>
      <div class="card-list">
        <div class="step-card">
          <div class="card-title">🌐 ONDC Beckn v1.2 Gateway</div>
          <p class="card-desc">Emits ONDC:RET12 JSON schemas directly to Open Commerce registry for discovery on Paytm, Pincode & Magicpin.</p>
          <span class="stat-badge">Zero Intermediary Cut</span>
        </div>
        <div class="step-card">
          <div class="card-title">🏛️ GeM Public Procurement</div>
          <p class="card-desc">Automated catalog submission for Government institutional tenders under MSME/MoSJE quotas.</p>
          <span class="stat-badge">Direct Institutional Bids</span>
        </div>
        <div class="step-card">
          <div class="card-title">🔒 Digital GI Watermark</div>
          <p class="card-desc">Embeds 64-bit DCT frequency payload into Luminance channel to verify authenticity against powerlooms.</p>
          <span class="stat-badge">Anti-Counterfeit Protection</span>
        </div>
      </div>
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="slide-footer">
    <div class="footer-pills">
      <span class="footer-pill">FastAPI • Python 3.11</span>
      <span class="footer-pill">Flutter & React/Vite</span>
      <span class="footer-pill">n8n Workflow Engine</span>
      <span class="footer-pill">Docker & PostgreSQL</span>
      <span class="footer-pill">ONDC Beckn Retail v1.2</span>
    </div>
    <span>Engineered for the Ministry of Social Justice and Empowerment (MoSJE), Government of India</span>
  </footer>

</body>
</html>
"""

HTML_PATH = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public\workflow_slide.html"
PNG_OUT = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Updated_Workflow_Slide.png"
DOCS_OUT = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\docs\images\ShilpSetu_Updated_Workflow_Slide.png"

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(WORKFLOW_HTML)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1920,1080",
    f"--screenshot={PNG_OUT}",
    f"file:///{os.path.abspath(HTML_PATH).replace(os.sep, '/')}"
]

subprocess.run(cmd, check=True)
os.makedirs(os.path.dirname(DOCS_OUT), exist_ok=True)
shutil.copy(PNG_OUT, DOCS_OUT)
print("Rendered updated workflow slide successfully:", PNG_OUT)
