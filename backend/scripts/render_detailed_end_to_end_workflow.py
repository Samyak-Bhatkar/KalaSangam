"""Detailed End-to-End Technical Workflow Slide Generator for ShilpSetu AI (MoSJE)
Traces the full journey: Rural Artisan ➔ Edge Capture ➔ AI Vision/Llama ➔ Statutory Fair Wage ➔ n8n Cloud ➔ ONDC/GeM Listing
Outputs:
- ShilpSetu_End_to_End_Technical_Workflow.png (1920x1080)
- docs/images/ShilpSetu_End_to_End_Technical_Workflow.png
"""

import os
import subprocess
import shutil

# Vector Tech Logos
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

n8n_svg = """<svg viewBox="0 0 24 24" width="100%" height="100%">
  <path fill="#EA4B71" d="M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632"/>
</svg>"""

bhashini_svg = """<svg viewBox="0 0 120 120" width="100%" height="100%">
  <circle cx="60" cy="60" r="56" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="24" y="44" width="9" height="32" rx="4.5" fill="#FF9933"/>
  <rect x="39" y="28" width="9" height="64" rx="4.5" fill="#000080"/>
  <rect x="54" y="16" width="12" height="88" rx="6" fill="#FF9933"/>
  <rect x="72" y="28" width="9" height="64" rx="4.5" fill="#000080"/>
  <rect x="87" y="44" width="9" height="32" rx="4.5" fill="#138808"/>
</svg>"""

ondc_svg = """<svg viewBox="0 0 140 100" width="100%" height="100%">
  <circle cx="34" cy="50" r="22" fill="none" stroke="#00A859" stroke-width="11"/>
  <path d="M68 28v44l36-44v44" fill="none" stroke="#0066B3" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="122" cy="50" r="9" fill="#F59E0B"/>
</svg>"""

whatsapp_svg = """<svg viewBox="0 0 24 24" width="100%" height="100%">
  <path fill="#25D366" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.74-.66-1.25-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.22-.16-.47-.28"/>
</svg>"""

HTML_CONTENT = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShilpSetu AI - Accurate End-to-End Technical Workflow</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 1920px;
      height: 1080px;
      background: #080B14;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      padding: 26px 36px;
      color: #F8FAFC;
      overflow: hidden;
      position: relative;
    }}

    /* CIRCUIT GRID ACCENT */
    body::before {{
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        radial-gradient(circle at 15% 20%, rgba(249, 115, 22, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 50% 80%, rgba(124, 58, 237, 0.06) 0%, transparent 45%),
        radial-gradient(circle at 85% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
        linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 100% 100%, 36px 36px, 36px 36px;
      pointer-events: none;
    }}

    /* HEADER */
    .header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid rgba(148, 163, 184, 0.16);
      padding-bottom: 14px;
      margin-bottom: 18px;
      position: relative;
      z-index: 10;
    }}
    .header-left {{
      display: flex;
      flex-direction: column;
      gap: 3px;
    }}
    .header-title {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
      background: linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .tag-mosje {{
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(245, 158, 11, 0.16);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.4);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      letter-spacing: 0.5px;
    }}
    .header-sub {{
      font-size: 14px;
      color: #94A3B8;
      font-weight: 500;
    }}
    .header-right {{
      text-align: right;
    }}
    .header-right .gov {{
      font-size: 13px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }}
    .header-right .dept {{
      font-size: 11px;
      color: #64748B;
      font-weight: 600;
    }}

    /* 6-STAGE TECHNICAL PIPELINE GRID */
    .pipeline-grid {{
      display: grid;
      grid-template-columns: 1fr 1.05fr 1.05fr 1.05fr 1.1fr 1.05fr;
      gap: 14px;
      flex: 1;
      position: relative;
      z-index: 10;
    }}

    /* STAGE COLUMNS */
    .stage-col {{
      background: rgba(13, 19, 34, 0.82);
      border-radius: 20px;
      border: 1.8px solid #1E293B;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(14px);
      position: relative;
    }}

    /* GLOW BORDERS */
    .col-step1 {{ border-color: #F97316; box-shadow: 0 0 20px rgba(249, 115, 22, 0.15); }}
    .col-step2 {{ border-color: #0284C7; box-shadow: 0 0 20px rgba(2, 132, 199, 0.15); }}
    .col-step3 {{ border-color: #7C3AED; box-shadow: 0 0 20px rgba(124, 58, 237, 0.18); }}
    .col-step4 {{ border-color: #EAB308; box-shadow: 0 0 20px rgba(234, 179, 8, 0.16); }}
    .col-step5 {{ border-color: #EC4899; box-shadow: 0 0 20px rgba(236, 72, 153, 0.18); }}
    .col-step6 {{ border-color: #10B981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.16); }}

    .stage-badge {{
      padding: 8px 10px;
      border-radius: 10px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      text-align: center;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }}
    .b-step1 {{ background: rgba(249, 115, 22, 0.16); color: #FB923C; border: 1px solid rgba(249, 115, 22, 0.4); }}
    .b-step2 {{ background: rgba(2, 132, 199, 0.16); color: #38BDF8; border: 1px solid rgba(2, 132, 199, 0.4); }}
    .b-step3 {{ background: rgba(124, 58, 237, 0.16); color: #C084FC; border: 1px solid rgba(124, 58, 237, 0.4); }}
    .b-step4 {{ background: rgba(234, 179, 8, 0.16); color: #FACC15; border: 1px solid rgba(234, 179, 8, 0.4); }}
    .b-step5 {{ background: rgba(236, 72, 153, 0.16); color: #F472B6; border: 1px solid rgba(236, 72, 153, 0.4); }}
    .b-step6 {{ background: rgba(16, 185, 129, 0.16); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); }}

    /* INNER CARDS */
    .card-list {{
      display: flex;
      flex-direction: column;
      gap: 11px;
      flex: 1;
    }}
    .detail-card {{
      background: #090E1B;
      border: 1px solid #223046;
      border-radius: 14px;
      padding: 11px 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }}
    .card-header {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .card-title {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #F8FAFC;
    }}
    .card-text {{
      font-size: 11px;
      color: #94A3B8;
      line-height: 1.42;
    }}
    .card-pill {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #CBD5E1;
      align-self: flex-start;
      margin-top: 2px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }}
    .logo-box {{
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }}

    /* HIGHLIGHT BANNERS */
    .hero-statutory {{
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.08));
      border: 1.5px solid rgba(234, 179, 8, 0.55);
      border-radius: 14px;
      padding: 10px;
      text-align: center;
      margin-bottom: 8px;
    }}
    .hero-statutory .val {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #FBBF24;
      margin: 1px 0;
    }}
    .hero-statutory .lbl {{
      font-size: 9.5px;
      color: #CBD5E1;
      font-weight: 700;
      letter-spacing: 0.5px;
    }}

    .hero-llama {{
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(244, 63, 94, 0.12));
      border: 1.8px solid rgba(192, 132, 252, 0.65);
      box-shadow: 0 4px 18px rgba(124, 58, 237, 0.2);
    }}

    .hero-n8n {{
      background: linear-gradient(135deg, rgba(234, 75, 113, 0.18), rgba(37, 211, 102, 0.1));
      border: 1.8px solid rgba(251, 113, 133, 0.65);
      box-shadow: 0 4px 18px rgba(234, 75, 113, 0.2);
    }}

    /* BOTTOM PIPELINE STATUS BAR */
    .footer {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid rgba(148, 163, 184, 0.16);
      padding-top: 12px;
      margin-top: 16px;
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
      position: relative;
      z-index: 10;
    }}
    .flow-badges {{
      display: flex;
      gap: 8px;
    }}
    .f-badge {{
      background: #131B2E;
      border: 1px solid #283750;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      color: #94A3B8;
      font-weight: 600;
    }}
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <div class="header-title">
        ShilpSetu AI (शिल्पसेतु AI)
        <span class="tag-mosje">MoSJE • NBCFDC / NSFDC</span>
      </div>
      <p class="header-sub">Complete Autonomous Technical Pipeline: From Rural Artisan Workshop to National ONDC & GeM Listing</p>
    </div>
    <div class="header-right">
      <div class="gov">Ministry of Social Justice and Empowerment</div>
      <div class="dept">Government of India • National Scheduled Castes & Backward Classes Corporations</div>
    </div>
  </header>

  <!-- 6-STAGE TECHNICAL PIPELINE -->
  <main class="pipeline-grid">

    <!-- 1. EDGE INGESTION -->
    <div class="stage-col col-step1">
      <div class="stage-badge b-step1">1. Edge Capture</div>
      <div class="card-list">
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">📸</span>
            <span class="card-title">AR Viewfinder</span>
          </div>
          <p class="card-text">Silhouette framing guides for Pottery, Saree, Brass Idol & Folk Painting with 10% safety margin.</p>
          <span class="card-pill">Flutter & React SPA</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">🎙️</span>
            <span class="card-title">96px Tactile Mic</span>
          </div>
          <p class="card-text">Zero-text interface with live Web Audio API FFT waveform frequency visualizer for low-literacy artisans.</p>
          <span class="card-pill">Vernacular UX</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <div class="logo-box">{bhashini_svg}</div>
            <span class="card-title">Bhashini ASR</span>
          </div>
          <p class="card-text">National Language Translation Mission ASR with ambient noise cancellation for rural workshop audio.</p>
          <span class="card-pill">Indic Dialects</span>
        </div>
      </div>
    </div>

    <!-- 2. CV STUDIO -->
    <div class="stage-col col-step2">
      <div class="stage-badge b-step2">2. CV Studio Core</div>
      <div class="card-list">
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">✂️</span>
            <span class="card-title">rembg Saliency</span>
          </div>
          <p class="card-text">BiRefNet neural network isolates craft from cluttered rural workshop clutter under 500ms.</p>
          <span class="card-pill">OpenCV GrabCut Fallback</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">☀️</span>
            <span class="card-title">6500K Studio</span>
          </div>
          <p class="card-text">Gray-World color temperature normalization balances tungsten light to 6500K daylight with soft drop shadow.</p>
          <span class="card-pill">#F8F9FA Canvas (1080x1080)</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">🔒</span>
            <span class="card-title">DCT GI Watermark</span>
          </div>
          <p class="card-text">SciPy 2D-DCT embeds 64-bit payload [MoSJE-ID | PIN | GI-Serial] into Luminance (Y) channel.</p>
          <span class="card-pill">Anti-Powerloom Steg</span>
        </div>
      </div>
    </div>

    <!-- 3. LLAMA MULTIMODAL -->
    <div class="stage-col col-step3">
      <div class="stage-badge b-step3">3. Llama Vision AI</div>
      <div class="card-list">
        <div class="detail-card hero-llama">
          <div class="card-header">
            <div class="logo-box">{llama_svg}</div>
            <span class="card-title" style="color: #FFFFFF;">Llama 3.2 Vision</span>
          </div>
          <p class="card-text" style="color: #F1F5F9;">Multimodal reasoning ingests studio image + voice transcript to generate verified heritage descriptions.</p>
          <span class="card-pill" style="border-color: #C084FC; color: #F5D0FE;">Llama 3.2 11B/90B</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">📝</span>
            <span class="card-title">Schema Extraction</span>
          </div>
          <p class="card-text">Pydantic v2 extracts craft technique, raw materials, labor hours, and bilingual English/Hindi tags.</p>
          <span class="card-pill">Strict JSON Mode</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">🏷️</span>
            <span class="card-title">GI Verification</span>
          </div>
          <p class="card-text">Matches craft parameters against national Geographical Indications registry for authenticity certificate.</p>
          <span class="card-pill">Govt GI Registry</span>
        </div>
      </div>
    </div>

    <!-- 4. FAIR WAGE ENGINE -->
    <div class="stage-col col-step4">
      <div class="stage-badge b-step4">4. Fair Wage Engine</div>
      <div class="hero-statutory">
        <div class="lbl">STATUTORY LIVING WAGE FLOOR</div>
        <div class="val">₹120 / hr</div>
        <div class="lbl">+ 10% Workshop Overhead</div>
      </div>
      <div class="card-list">
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">🛡️</span>
            <span class="card-title">Underpricing Guard</span>
          </div>
          <p class="card-text">Hindi voice alert warns artisan if expected price < baseline direct production cost.</p>
          <span class="card-pill" style="color: #F87171; border-color: #F87171;">Labor Protection</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">📊</span>
            <span class="card-title">Multi-Channel Tiers</span>
          </div>
          <p class="card-text">
            • <b>B2C Retail</b>: Cost x Multiplier<br>
            • <b>B2B Wholesale</b>: Volume Margin<br>
            • <b>GeM Public Sector</b>: 15% statutory
          </p>
          <span class="card-pill">Statutory Formula</span>
        </div>
      </div>
    </div>

    <!-- 5. N8N AUTOMATION -->
    <div class="stage-col col-step5">
      <div class="stage-badge b-step5">5. n8n Automation</div>
      <div class="card-list">
        <div class="detail-card hero-n8n">
          <div class="card-header">
            <div class="logo-box">{n8n_svg}</div>
            <span class="card-title" style="color: #FFFFFF;">n8n WhatsApp Bot</span>
          </div>
          <p class="card-text" style="color: #FFE4E6;">Evaluates lowball wholesale bids; sends WhatsApp Hindi voice note + [Counter] / [Reject] buttons.</p>
          <div style="display: flex; gap: 4px;">
            <span class="card-pill" style="border-color: #FDA4AF; color: #FFE4E6;">WhatsApp Cloud API</span>
            <span class="card-pill" style="border-color: #FDA4AF; color: #FFE4E6;">Twilio</span>
          </div>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">🎬</span>
            <span class="card-title">Async 15s Reel</span>
          </div>
          <p class="card-text">Background queue renders 9:16 vertical video reel with Ken Burns zoom, Raag Bhupali audio & QR code.</p>
          <span class="card-pill">AWS S3 / GCS Cloud</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">📈</span>
            <span class="card-title">MoSJE Analytics</span>
          </div>
          <p class="card-text">Streams real-time living wage hours & inventory to Ministry Google Sheets / PostgreSQL ledger.</p>
          <span class="card-pill">Postgres 15 • Docker</span>
        </div>
      </div>
    </div>

    <!-- 6. SOVEREIGN COMMERCE -->
    <div class="stage-col col-step6">
      <div class="stage-badge b-step6">6. Market Listing</div>
      <div class="card-list">
        <div class="detail-card">
          <div class="card-header">
            <div class="logo-box">{ondc_svg}</div>
            <span class="card-title">ONDC Beckn Gateway</span>
          </div>
          <p class="card-text">Emits ONDC:RET12 JSON schemas to Open Commerce registry for instant discovery on Paytm, Pincode & Magicpin.</p>
          <span class="card-pill">Zero Commission</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">🏛️</span>
            <span class="card-title">GeM Procurement</span>
          </div>
          <p class="card-text">Auto-submits tender catalog drafts for Government public procurement under MSME/MoSJE quotas.</p>
          <span class="card-pill">Public Sector Tenders</span>
        </div>
        <div class="detail-card">
          <div class="card-header">
            <span style="font-size: 18px;">📱</span>
            <span class="card-title">B2C & Social Linkage</span>
          </div>
          <p class="card-text">Multi-channel publication with scannable dynamic QR codes directly linking buyer payments to artisan UPI.</p>
          <span class="card-pill">Direct Artisan Payout</span>
        </div>
      </div>
    </div>

  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="flow-badges">
      <span class="f-badge">FastAPI • Python 3.11</span>
      <span class="f-badge">Flutter & React 19</span>
      <span class="f-badge">Meta Llama 3.2 Vision</span>
      <span class="f-badge">n8n Workflow Automation</span>
      <span class="f-badge">Docker & AWS S3 / GCS</span>
      <span class="f-badge">ONDC Beckn Retail v1.2</span>
      <span class="f-badge">GeM Public Procurement</span>
    </div>
    <span>Engineered for the Ministry of Social Justice and Empowerment (MoSJE), Government of India</span>
  </footer>

</body>
</html>
"""

HTML_PATH = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public\detailed_workflow_slide.html"
PNG_OUT = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\ShilpSetu_End_to_End_Technical_Workflow.png"
DOCS_OUT = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\docs\images\ShilpSetu_End_to_End_Technical_Workflow.png"
ARTIFACT_OUT = r"C:\Users\thulp\.gemini\antigravity-ide\brain\b6168191-e330-47f1-8469-16e18ada79c9\ShilpSetu_End_to_End_Technical_Workflow.png"

with open(HTML_PATH, "w", encoding="utf-8") as f:
    f.write(HTML_CONTENT)

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
shutil.copy(PNG_OUT, ARTIFACT_OUT)
print("Rendered detailed end-to-end technical workflow slide successfully:", PNG_OUT)
