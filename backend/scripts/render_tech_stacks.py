import os
import subprocess
import shutil

LOGOS_DIR = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\tech_logos"

def get_svg(filename):
    p = os.path.join(LOGOS_DIR, filename)
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            c = f.read()
            if "<svg" in c:
                return c[c.find("<svg"):]
    return ""

flutter_svg = get_svg("flutter.svg")
dart_svg = get_svg("dart.svg")
react_svg = get_svg("react.svg")
vite_svg = get_svg("vite.svg")
tailwind_svg = get_svg("tailwindcss.svg")
python_svg = get_svg("python.svg")
fastapi_svg = get_svg("fastapi.svg")
docker_svg = get_svg("docker.svg")
opencv_svg = get_svg("opencv.svg")
html5_svg = get_svg("html5.svg")
materialui_svg = get_svg("materialui.svg")

# AWS SVG
aws_svg = get_svg("aws.svg")

# n8n SVG colored with signature brand coral
n8n_raw = get_svg("n8n.svg")
if "<path" in n8n_raw:
    n8n_svg = """<svg viewBox="0 0 24 24" width="100%" height="100%">
  <path fill="#EA4B71" d="M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632"/>
</svg>"""
else:
    n8n_svg = ""

# Meta Llama 3.2 Vision - Authentic Colorful Gradient Llama
llama_svg = """<svg viewBox="0 0 24 24" width="100%" height="100%">
  <defs>
    <linearGradient id="llama-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0064E0"/>
      <stop offset="45%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#F43F5E"/>
    </linearGradient>
  </defs>
  <path fill="url(#llama-grad)" d="M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z"/>
</svg>"""

# FFmpeg Green Zigzag / Film Strip SVG
ffmpeg_svg = """<svg viewBox="0 0 120 120" width="100%" height="100%">
  <rect x="10" y="10" width="100" height="100" rx="22" fill="#007808"/>
  <path d="M25 35h16l14 26 14-26h16l-22 40v20H47V75L25 35z" fill="#FFFFFF"/>
  <circle cx="88" cy="85" r="8" fill="#55D500"/>
</svg>"""

# Bhashini AI (Indian National Language Translation Mission - Tricolor Soundbars)
bhashini_svg = """<svg viewBox="0 0 120 120" width="100%" height="100%">
  <circle cx="60" cy="60" r="56" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="24" y="44" width="9" height="32" rx="4.5" fill="#FF9933"/>
  <rect x="39" y="28" width="9" height="64" rx="4.5" fill="#000080"/>
  <rect x="54" y="16" width="12" height="88" rx="6" fill="#FF9933"/>
  <rect x="72" y="28" width="9" height="64" rx="4.5" fill="#000080"/>
  <rect x="87" y="44" width="9" height="32" rx="4.5" fill="#138808"/>
</svg>"""

# ONDC (Open Network for Digital Commerce)
ondc_svg = """<svg viewBox="0 0 140 100" width="100%" height="100%">
  <circle cx="34" cy="50" r="22" fill="none" stroke="#00A859" stroke-width="11"/>
  <path d="M68 28v44l36-44v44" fill="none" stroke="#0066B3" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="122" cy="50" r="9" fill="#F59E0B"/>
</svg>"""

# SciPy Discrete Cosine Transform (GI Provenance Watermark)
scipy_svg = """<svg viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="46" fill="#00549F"/>
  <path d="M18 64 C32 20, 44 80, 56 36 C68 -4, 80 56, 88 38" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="7" fill="#F59E0B"/>
</svg>"""

# Uvicorn ASGI Server
uvicorn_svg = """<svg viewBox="0 0 100 100" width="100%" height="100%">
  <polygon points="50,8 92,88 8,88" fill="#24292E"/>
  <polygon points="50,22 80,82 20,82" fill="#20B2AA"/>
  <polygon points="50,38 68,76 32,76" fill="#FF5376"/>
</svg>"""

# Pydantic Crimson Hexagon
pydantic_svg = """<svg viewBox="0 0 100 100" width="100%" height="100%">
  <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="#E92063"/>
  <circle cx="50" cy="50" r="22" fill="#FFFFFF"/>
  <circle cx="50" cy="50" r="12" fill="#E92063"/>
</svg>"""

# REST API & WebSockets badge
api_svg = """<svg viewBox="0 0 110 80" width="100%" height="100%">
  <rect x="2" y="2" width="106" height="76" rx="14" fill="#0F172A" stroke="#38BDF8" stroke-width="3"/>
  <circle cx="16" cy="14" r="3.5" fill="#EF4444"/>
  <circle cx="28" cy="14" r="3.5" fill="#F59E0B"/>
  <circle cx="40" cy="14" r="3.5" fill="#10B981"/>
  <text x="55" y="52" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="25" fill="#38BDF8" text-anchor="middle" letter-spacing="1.5">API</text>
  <path d="M86 46l4 2-4 2v-4z" fill="#38BDF8"/>
  <path d="M24 46l-4 2 4 2v-4z" fill="#38BDF8"/>
</svg>"""

# Edge TTS / Neural Voice
tts_svg = """<svg viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="tts-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="46" fill="url(#tts-g)"/>
  <path d="M38 32v36l16-10 14 10V32l-14 10-16-10z" fill="#FFFFFF"/>
  <circle cx="72" cy="50" r="4" fill="#FCD34D"/>
</svg>"""

# Google Stitch UI
stitch_svg = """<svg viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="st-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
  </defs>
  <rect x="15" y="15" width="70" height="70" rx="20" fill="url(#st-g)"/>
  <path d="M35 50L45 60L65 40" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="68" cy="32" r="5" fill="#FDE047"/>
</svg>"""


# ==========================================
# 1. MAIN TECH STACK SLIDE (14 CARDS) - WITH CLOUD (AWS) & n8n
# ==========================================
MAIN_TECH_14 = [
    # Row 1: Mobile, Frontend, Backend & Cloud
    ("Flutter", flutter_svg, "#02569B"),
    ("React.js", react_svg, "#61DAFB"),
    ("Tailwind CSS", tailwind_svg, "#38BDF8"),
    ("Python", python_svg, "#FFD43B"),
    ("FastAPI", fastapi_svg, "#05998B"),
    ("Docker", docker_svg, "#2496ED"),
    ("AWS Cloud", aws_svg, "#FF9900"),
    # Row 2: AI (Llama 3.2 Vision), Bhashini, n8n Automation, Media, ONDC & Security
    ("Llama 3.2 Vision", llama_svg, "#7C3AED"),
    ("Bhashini", bhashini_svg, "#FF9933"),
    ("n8n", n8n_svg, "#EA4B71"),
    ("OpenCV", opencv_svg, "#27B04D"),
    ("FFmpeg", ffmpeg_svg, "#007808"),
    ("ONDC", ondc_svg, "#00A859"),
    ("SciPy DCT", scipy_svg, "#00549F"),
]

def make_cards_html(items, card_height=320, logo_size=108, font_size=16):
    html = ""
    for name, svg, accent in items:
        html += f"""
        <div class="tech-card" style="border-color: #60A5FA; box-shadow: 0 10px 25px rgba(96, 165, 250, 0.16);">
          <div class="logo-container" style="width: {logo_size}px; height: {logo_size}px;">
            {svg}
          </div>
          <div class="tech-pill" style="box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 0 0 1.8px {accent}; font-size: {font_size}px;">
            {name}
          </div>
        </div>
        """
    return html

HTML_14 = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Used Technology - ShilpSetu AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Inter:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1920px;
      height: 1080px;
      background: #F8FAFC;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
      padding: 36px;
    }}
    .outer-card {{
      width: 1848px;
      height: 1008px;
      background: #FFFFFF;
      border: 3.5px solid #0F172A;
      border-radius: 42px;
      padding: 44px 54px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
      position: relative;
    }}
    .outer-card::before {{
      content: "";
      position: absolute;
      top: -3.5px;
      left: 60px;
      width: 80px;
      height: 3.5px;
      background: #FFFFFF;
    }}
    .outer-card::after {{
      content: "";
      position: absolute;
      top: -3.5px;
      right: 60px;
      width: 80px;
      height: 3.5px;
      background: #FFFFFF;
    }}
    .title-box {{
      text-align: center;
      margin-bottom: 40px;
    }}
    .title-box h1 {{
      font-size: 56px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #0F172A;
      text-decoration: underline;
      text-underline-offset: 14px;
      text-decoration-thickness: 5px;
      text-transform: uppercase;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }}
    .subtitle {{
      font-size: 21px;
      color: #475569;
      font-weight: 700;
      margin-top: 14px;
      letter-spacing: 0.4px;
    }}
    .grid-container {{
      display: flex;
      flex-direction: column;
      gap: 36px;
      flex: 1;
      justify-content: center;
    }}
    .tech-row {{
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 26px;
    }}
    .tech-card {{
      background: #FFFFFF;
      border: 2.8px solid #60A5FA;
      border-radius: 28px;
      height: 320px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 26px 14px 22px 14px;
      transition: all 0.2s ease;
    }}
    .logo-container {{
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .logo-container svg {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }}
    .tech-pill {{
      background: #000000;
      color: #FFFFFF;
      border-radius: 9999px;
      padding: 9px 20px;
      font-weight: 800;
      letter-spacing: 0.2px;
      text-align: center;
      white-space: nowrap;
      max-width: 96%;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 12px;
    }}
    .footer-stamp {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1.5px solid #E2E8F0;
      color: #64748B;
      font-weight: 700;
      font-size: 16px;
    }}
    .badge {{
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1.5px solid #BFDBFE;
      padding: 6px 18px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 14px;
    }}
  </style>
</head>
<body>
  <div class="outer-card">
    <div class="title-box">
      <h1>USED TECHNOLOGY</h1>
      <p class="subtitle">ShilpSetu AI • Production Stack (Mobile, Web, Backend, Cloud, Llama 3.2 & n8n Automation)</p>
    </div>

    <div class="grid-container">
      <div class="tech-row">
        {make_cards_html(MAIN_TECH_14[:7], card_height=320, logo_size=108, font_size=16)}
      </div>
      <div class="tech-row">
        {make_cards_html(MAIN_TECH_14[7:], card_height=320, logo_size=108, font_size=15)}
      </div>
    </div>

    <div class="footer-stamp">
      <span class="badge">MoSJE • NBCFDC / NSFDC Sovereign Architecture</span>
      <span>100% Zero-Text Accessible • Llama 3.2 Vision • n8n Workflow Automation • AWS Cloud</span>
      <span class="badge">Ministry of Social Justice & Empowerment</span>
    </div>
  </div>
</body>
</html>
"""

# ==========================================
# 2. 16-CARD SLIDE (2 ROWS OF 8) - WITH DART, VITE, CLOUD & n8n
# ==========================================
TECH_16 = [
    # Row 1: Frontend, Mobile & Core Cloud
    ("Flutter", flutter_svg, "#02569B"),
    ("Dart", dart_svg, "#0175C2"),
    ("React.js", react_svg, "#61DAFB"),
    ("Vite", vite_svg, "#BD34FE"),
    ("Tailwind CSS", tailwind_svg, "#38BDF8"),
    ("Python", python_svg, "#FFD43B"),
    ("FastAPI", fastapi_svg, "#05998B"),
    ("AWS Cloud", aws_svg, "#FF9900"),
    # Row 2: AI, n8n, Media, Protocols & DevOps
    ("Llama 3.2 Vision", llama_svg, "#7C3AED"),
    ("Bhashini", bhashini_svg, "#FF9933"),
    ("n8n", n8n_svg, "#EA4B71"),
    ("OpenCV", opencv_svg, "#27B04D"),
    ("FFmpeg", ffmpeg_svg, "#007808"),
    ("ONDC", ondc_svg, "#00A859"),
    ("Docker", docker_svg, "#2496ED"),
    ("SciPy DCT", scipy_svg, "#00549F"),
]

HTML_16 = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Used Technology 16 - ShilpSetu AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Inter:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1920px;
      height: 1080px;
      background: #F8FAFC;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', 'Plus Jakarta Sans', sans-serif;
      padding: 36px;
    }}
    .outer-card {{
      width: 1848px;
      height: 1008px;
      background: #FFFFFF;
      border: 3.5px solid #0F172A;
      border-radius: 42px;
      padding: 44px 50px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
      position: relative;
    }}
    .title-box {{
      text-align: center;
      margin-bottom: 38px;
    }}
    .title-box h1 {{
      font-size: 54px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #0F172A;
      text-decoration: underline;
      text-underline-offset: 14px;
      text-decoration-thickness: 5px;
      text-transform: uppercase;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }}
    .subtitle {{
      font-size: 20px;
      color: #475569;
      font-weight: 700;
      margin-top: 14px;
      letter-spacing: 0.4px;
    }}
    .grid-container {{
      display: flex;
      flex-direction: column;
      gap: 32px;
      flex: 1;
      justify-content: center;
    }}
    .tech-row {{
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 20px;
    }}
    .tech-card {{
      background: #FFFFFF;
      border: 2.6px solid #60A5FA;
      border-radius: 26px;
      height: 310px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 24px 10px 20px 10px;
      transition: all 0.2s ease;
    }}
    .logo-container {{
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .logo-container svg {{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }}
    .tech-pill {{
      background: #000000;
      color: #FFFFFF;
      border-radius: 9999px;
      padding: 8px 16px;
      font-weight: 800;
      letter-spacing: 0.2px;
      text-align: center;
      white-space: nowrap;
      max-width: 96%;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 10px;
    }}
    .footer-stamp {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1.5px solid #E2E8F0;
      color: #64748B;
      font-weight: 700;
      font-size: 16px;
    }}
    .badge {{
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1.5px solid #BFDBFE;
      padding: 6px 18px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 14px;
    }}
  </style>
</head>
<body>
  <div class="outer-card">
    <div class="title-box">
      <h1>USED TECHNOLOGY</h1>
      <p class="subtitle">ShilpSetu AI • Production Stack (Mobile, Web, Backend, Cloud, Llama 3.2 & n8n Automation)</p>
    </div>

    <div class="grid-container">
      <div class="tech-row">
        {make_cards_html(TECH_16[:8], card_height=310, logo_size=98, font_size=15)}
      </div>
      <div class="tech-row">
        {make_cards_html(TECH_16[8:], card_height=310, logo_size=98, font_size=14)}
      </div>
    </div>

    <div class="footer-stamp">
      <span class="badge">MoSJE • NBCFDC / NSFDC Sovereign Architecture</span>
      <span>100% Zero-Text Accessible • Llama 3.2 Vision • n8n Workflow Automation • AWS Cloud</span>
      <span class="badge">Ministry of Social Justice & Empowerment</span>
    </div>
  </div>
</body>
</html>
"""

# Save HTML files
HTML_14_PATH = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public\tech_stack_14.html"
HTML_16_PATH = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public\tech_stack_16.html"

with open(HTML_14_PATH, "w", encoding="utf-8") as f:
    f.write(HTML_14)

with open(HTML_16_PATH, "w", encoding="utf-8") as f:
    f.write(HTML_16)

print("Saved HTML templates with AWS & n8n.")

# Chrome headless renderer
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

PNG_14 = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Used_Technology.png"
PNG_16 = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_Used_Technology_16.png"
DOCS_DIR = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\docs\images"
os.makedirs(DOCS_DIR, exist_ok=True)

# Render 14-tech slide (Primary)
cmd14 = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1920,1080",
    f"--screenshot={PNG_14}",
    f"file:///{os.path.abspath(HTML_14_PATH).replace(os.sep, '/')}"
]
subprocess.run(cmd14, check=True)
shutil.copy(PNG_14, os.path.join(DOCS_DIR, "ShilpSetu_Used_Technology.png"))
print("Rendered 14-card slide successfully:", PNG_14)

# Render 16-tech slide
cmd16 = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1920,1080",
    f"--screenshot={PNG_16}",
    f"file:///{os.path.abspath(HTML_16_PATH).replace(os.sep, '/')}"
]
subprocess.run(cmd16, check=True)
shutil.copy(PNG_16, os.path.join(DOCS_DIR, "ShilpSetu_Used_Technology_16.png"))
print("Rendered 16-card slide successfully:", PNG_16)
