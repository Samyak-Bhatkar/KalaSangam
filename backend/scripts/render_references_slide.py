"""Renders the official 1920x1080 Widescreen Presentation Slide for ShilpSetu AI References & Technical Citations.
Includes accurate governmental links, open-source protocols, AI research papers, and the Google Stitch prototype.
"""

import os
import subprocess
import shutil

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShilpSetu AI - References & Technical Citations</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #0B0F19;
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(56, 189, 248, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.08) 0%, transparent 45%),
        linear-gradient(135deg, #0B0F19 0%, #0F172A 50%, #080C14 100%);
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      padding: 34px 48px;
      color: #F8FAFC;
      overflow: hidden;
      position: relative;
    }

    /* Subtle grid */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#1E293B 1px, transparent 1px);
      background-size: 32px 32px;
      opacity: 0.6;
      pointer-events: none;
    }

    /* HEADER */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #1E293B;
      padding-bottom: 16px;
      margin-bottom: 22px;
      position: relative;
      z-index: 10;
    }
    .header-left h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
      background: linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge-ref {
      font-size: 13px;
      font-weight: 800;
      background: rgba(56, 189, 248, 0.15);
      color: #38BDF8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .header-sub {
      font-size: 14.5px;
      color: #94A3B8;
      margin-top: 4px;
    }
    .header-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .meta-pill {
      background: #1E293B;
      border: 1px solid #334155;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12.5px;
      font-weight: 700;
      color: #E2E8F0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* GRID LAYOUT: 3 COLUMNS */
    .grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      flex: 1;
      position: relative;
      z-index: 10;
    }

    .category-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .category-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid;
    }
    .cat-blue { color: #38BDF8; border-color: #38BDF8; }
    .cat-purple { color: #C084FC; border-color: #C084FC; }
    .cat-green { color: #34D399; border-color: #34D399; }

    /* REFERENCE CARD */
    .ref-card {
      background: #131B2E;
      border: 1px solid #1E293B;
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: border-color 0.2s;
    }
    .ref-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ref-name {
      font-weight: 800;
      font-size: 14.5px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ref-tag {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(255,255,255,0.06);
      color: #94A3B8;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .ref-desc {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.4;
    }
    .ref-link {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #38BDF8;
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 5px 10px;
      border-radius: 6px;
      text-decoration: none;
      word-break: break-all;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
    }

    /* FOOTER */
    .footer {
      margin-top: 16px;
      border-top: 1px solid #1E293B;
      padding-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      color: #64748B;
      position: relative;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>

  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <h1>
        ShilpSetu AI
        <span class="badge-ref">Official References & Citations</span>
      </h1>
      <div class="header-sub">
        Technical standards, governmental acts, sovereign protocols, and foundational models powering the architecture
      </div>
    </div>
    <div class="header-meta">
      <div class="meta-pill">
        <span>🏛️</span>
        <span>MoSJE Approved Framework</span>
      </div>
      <div class="meta-pill">
        <span>🌐</span>
        <span>ONDC Beckn V1.2.0 Spec</span>
      </div>
    </div>
  </header>

  <!-- 3 COLUMNS -->
  <div class="grid-container">
    <!-- COLUMN 1: GOVERNMENT & COMMERCE -->
    <div class="category-col">
      <div class="category-title cat-blue">
        <span>🏛️</span> Government Mandates & Commerce
      </div>

      <!-- REF 1: MoSJE -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">Ministry of Social Justice & Empowerment</div>
          <span class="ref-tag">Statutory Body</span>
        </div>
        <div class="ref-desc">Central Ministry governing NBCFDC & NSFDC artisan upliftment, exhibitions, and PM-DAKSH.</div>
        <div class="ref-link">
          <span>socialjustice.gov.in</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 2: Code on Wages -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">Code on Wages, 2019 (Act No. 29)</div>
          <span class="ref-tag">Legal Floor</span>
        </div>
        <div class="ref-desc">Statutory basis for the national living wage floor (₹120/hr skilled artisan labor standard).</div>
        <div class="ref-link">
          <span>labour.gov.in/the_code_on_wages_2019.pdf</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 3: ONDC Protocol -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">ONDC (Open Network for Digital Commerce)</div>
          <span class="ref-tag">DPI Network</span>
        </div>
        <div class="ref-desc">DPI protocol democratizing digital commerce discovery across Buyer & Seller applications.</div>
        <div class="ref-link">
          <span>ondc.org/developer-guide</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 4: GeM ODOP -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">GeM (Government e-Marketplace)</div>
          <span class="ref-tag">Public Tender</span>
        </div>
        <div class="ref-desc">Saras Collection & ODOP institutional public procurement statutory margin (+15%).</div>
        <div class="ref-link">
          <span>gem.gov.in/odop</span>
          <span>↗</span>
        </div>
      </div>
    </div>

    <!-- COLUMN 2: FOUNDATIONAL AI & LANGUAGE -->
    <div class="category-col">
      <div class="category-title cat-purple">
        <span>🧠</span> AI Models & Language Infrastructure
      </div>

      <!-- REF 5: Meta Llama 3.2 -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">Meta Llama 3.2 Vision (11B / 90B)</div>
          <span class="ref-tag">Multimodal LLM</span>
        </div>
        <div class="ref-desc">Multimodal reasoning for visual craft recognition, attribute extraction, and bilingual cataloging.</div>
        <div class="ref-link">
          <span>ai.meta.com/blog/llama-3-2-connect-2024</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 6: Bhashini NLTM -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">Bhashini (National Language Translation Mission)</div>
          <span class="ref-tag">MeitY Indic ASR</span>
        </div>
        <div class="ref-desc">ULCA multilingual speech-to-text supporting 12+ Indic languages and regional artisan dialects.</div>
        <div class="ref-link">
          <span>bhashini.gov.in/ulca</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 7: Beckn Protocol -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">Beckn Protocol Core Specifications (v1.2.0)</div>
          <span class="ref-tag">Open Commerce</span>
        </div>
        <div class="ref-desc">Decentralized JSON schemas for search, select, init, confirm, status, and track payloads.</div>
        <div class="ref-link">
          <span>github.com/beckn/protocol-specifications</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 8: Google Stitch -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">Google Stitch Interactive Prototype</div>
          <span class="ref-tag">Tactile UI Design</span>
        </div>
        <div class="ref-desc">Official 4-stage vernacular artisan onboarding design system (#14738180325558078307).</div>
        <div class="ref-link">
          <span>stitch.withgoogle.com/projects/14738180325558078307</span>
          <span>↗</span>
        </div>
      </div>
    </div>

    <!-- COLUMN 3: COMPUTER VISION & PIPELINE -->
    <div class="category-col">
      <div class="category-title cat-green">
        <span>🔬</span> Computer Vision & Media Engineering
      </div>

      <!-- REF 9: Rembg U^2-Net -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">U^2-Net Salient Object Detection (Rembg)</div>
          <span class="ref-tag">Pattern Rec 2020</span>
        </div>
        <div class="ref-desc">Nested U-structure deep learning model for boundary-aware background removal without alpha matting.</div>
        <div class="ref-link">
          <span>arxiv.org/abs/2005.09007</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 10: SciPy DCT Steganography -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">SciPy 2D Discrete Cosine Transform (DCT)</div>
          <span class="ref-tag">IEEE GI Protection</span>
        </div>
        <div class="ref-desc">Frequency-domain 64-bit watermark embedding into image luminance (Y) to combat counterfeit textiles.</div>
        <div class="ref-link">
          <span>docs.scipy.org/doc/scipy/reference/generated/scipy.fftpack.dct.html</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 11: MoviePy & Edge-TTS -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">MoviePy & Edge-TTS Video Synthesis</div>
          <span class="ref-tag">Reel Engine</span>
        </div>
        <div class="ref-desc">Autonomous 15-second 9:16 vertical video reel rendering with Ken Burns pan-zoom and neural TTS.</div>
        <div class="ref-link">
          <span>zulko.github.io/moviepy • github.com/rany2/edge-tts</span>
          <span>↗</span>
        </div>
      </div>

      <!-- REF 12: n8n Workflow Automation -->
      <div class="ref-card">
        <div class="ref-header">
          <div class="ref-name">n8n & WhatsApp Cloud API Engine</div>
          <span class="ref-tag">Automation Mesh</span>
        </div>
        <div class="ref-desc">Asynchronous event webhook mesh executing Bargain Guard negotiation and MoSJE analytics sync.</div>
        <div class="ref-link">
          <span>docs.n8n.io • developers.facebook.com/docs/whatsapp</span>
          <span>↗</span>
        </div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="footer">
    <div>ShilpSetu AI • Developed for Ministry of Social Justice and Empowerment (MoSJE) • Digital India DPI Stack</div>
    <div>All protocols conform to National Open Public Standards (ONDC / Beckn / MeitY Bhashini)</div>
  </footer>
</body>
</html>
"""

html_path = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\backend\scripts\temp_references_slide.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(HTML_CONTENT)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_png = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_References_Slide.png"
out_docs = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\docs\images\ShilpSetu_References_Slide.png"
out_artifact = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\ShilpSetu_References_Slide.png"

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
print("Rendered ShilpSetu References Slide successfully:", out_png)
