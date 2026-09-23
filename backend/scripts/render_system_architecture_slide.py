"""
Renders the SIH 2026 Interconnected System Architecture Slide for ShilpSetu (Team INVINCIBLE).
Features 100% authentic ShilpSetu architecture and data flow, styled in the clean,
light-mint academic presentation layout with 3D cylinder pipes, scalloped clouds,
sidebar capsules, and bottom tech-stack ribbon.
"""

import os
import subprocess

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShilpSetu AI — System Architecture (Team INVINCIBLE - SIH 2026)</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap">
  
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      background: #E8F7F5;
      color: #0F172A;
      font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    .viewport-wrapper {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #E8F7F5;
    }

    /* Fixed-aspect 1920x1080 Stage Canvas */
    #slide-stage {
      width: 1920px;
      height: 1080px;
      position: absolute;
      transform-origin: center center;
      background: linear-gradient(135deg, #E6F7F4 0%, #EDFBF8 50%, #E2F5F2 100%);
      overflow: hidden;
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 0 60px rgba(0, 0, 0, 0.08);
    }

    /* TOP HEADER */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0 10px;
      z-index: 20;
    }

    .top-left-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .brand-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 32px;
      font-weight: 900;
      color: #000000;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-tag {
      font-size: 13px;
      font-weight: 800;
      background: #EF4444;
      color: #FFFFFF;
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 1px;
    }

    .brand-sub {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
    }

    .top-right-header {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .sih-meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sih-logo-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
    }

    .sih-brain-icon {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: conic-gradient(from 180deg, #F97316 0%, #10B981 100%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-size: 13px;
      font-weight: 900;
    }

    .sih-title-large {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 40px;
      font-weight: 700;
      color: #000000;
      letter-spacing: -0.5px;
      line-height: 1;
      margin-top: 4px;
    }

    /* MAIN DIAGRAM CONTAINER */
    .diagram-body {
      position: relative;
      width: 1872px;
      height: 870px;
      margin-top: 4px;
    }

    /* LEFT SIDEBAR: API & DATA LAYER CAPSULES */
    .left-sidebar {
      position: absolute;
      left: 6px;
      top: 10px;
      width: 195px;
      height: 820px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      z-index: 15;
    }

    .sidebar-section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 21px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 6px;
      text-align: center;
    }

    .pill-capsule {
      width: 186px;
      border-radius: 40px;
      padding: 12px 10px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .pill-api {
      background: linear-gradient(180deg, #EEF4FF 0%, #DBEAFE 100%);
      border: 2.8px solid #1D4ED8;
    }

    .pill-data {
      background: linear-gradient(180deg, #E6FFFA 0%, #CCFBF1 100%);
      border: 3px solid #0D9488;
    }

    .pill-title {
      font-size: 15px;
      font-weight: 800;
      color: #000000;
      line-height: 1.2;
    }

    .pill-sub {
      font-size: 10.5px;
      font-weight: 700;
      color: #334155;
      margin-top: 2px;
    }

    .v-arrow-double {
      width: 20px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* CENTRAL BOUNDING BOX */
    .central-stage-box {
      position: absolute;
      left: 245px;
      top: 5px;
      width: 960px;
      height: 835px;
      background: #FFFFFF;
      border: 1.8px solid #334155;
      border-radius: 22px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
      z-index: 10;
    }

    /* INSIDE CENTRAL BOX: ARTISAN CRAFT INGESTION BOX */
    .origin-data-box {
      position: absolute;
      left: 18px;
      top: 305px;
      width: 220px;
      height: 240px;
      background: linear-gradient(180deg, #99F6E4 0%, #5EEAD4 100%);
      border: 2.8px solid #000000;
      border-radius: 28px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 20px 12px;
      text-align: center;
      z-index: 12;
    }

    .origin-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 23px;
      font-weight: 800;
      color: #000000;
      line-height: 1.15;
    }

    .origin-sub {
      font-size: 11px;
      font-weight: 700;
      color: #064E3B;
    }

    /* 3D HORIZONTAL CYLINDERS */
    .cylinder-pipeline-wrap {
      position: absolute;
      left: 135px;
      width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .cylinder-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 19px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 6px;
    }

    .cylinder-3d-tube {
      position: relative;
      width: 430px;
      height: 72px;
      border: 2px solid #000000;
      border-radius: 40px;
      background: linear-gradient(180deg, #FFFFFF 0%, #EEF2F6 40%, #CBD5E1 100%);
      box-shadow: inset 0 3px 6px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 24px;
    }

    .cylinder-3d-tube::before {
      content: "";
      position: absolute;
      left: -2px;
      top: -2px;
      bottom: -2px;
      width: 28px;
      border-radius: 40px 0 0 40px;
      border: 2px solid #000000;
      border-right: 1.5px solid #64748B;
      background: linear-gradient(90deg, #E2E8F0 0%, #F1F5F9 100%);
    }

    .cylinder-main-text {
      font-size: 15px;
      font-weight: 800;
      color: #0F172A;
      text-align: center;
      line-height: 1.2;
    }

    .cylinder-sub-text {
      font-size: 10.5px;
      font-weight: 600;
      color: #475569;
      text-align: center;
      margin-top: 2px;
    }

    /* SCALLOPED CLOUD CALLOUTS */
    .cloud-shape {
      position: absolute;
      background: #EDE4F9;
      border: 2.2px solid #000000;
      border-radius: 36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 14px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .cloud-shape::before, .cloud-shape::after {
      content: "";
      position: absolute;
      background: #EDE4F9;
      border: 2.2px solid #000000;
      border-radius: 50%;
      z-index: -1;
    }

    .cloud-shape::before {
      width: 44px;
      height: 44px;
      top: -16px;
      left: 28px;
    }

    .cloud-shape::after {
      width: 50px;
      height: 50px;
      top: -20px;
      right: 28px;
    }

    .cloud-text {
      font-size: 13.5px;
      font-weight: 800;
      color: #000000;
      line-height: 1.2;
    }

    .cloud-sub {
      font-size: 10px;
      font-weight: 700;
      color: #6B21A8;
      margin-top: 2px;
    }

    /* REASONABILITY REPORT GRAPHIC */
    .report-wrap {
      position: absolute;
      left: 245px;
      top: 500px;
      width: 195px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .report-card {
      width: 82px;
      height: 108px;
      background: #FFFFFF;
      border: 2.5px solid #10B981;
      border-radius: 10px;
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.2);
      padding: 8px 6px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .report-card::after {
      content: "✓ ₹120/hr";
      position: absolute;
      bottom: -10px;
      right: -16px;
      background: #10B981;
      color: #FFF;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
      border: 1.5px solid #FFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .report-bar {
      height: 6px;
      border-radius: 4px;
      background: #E2E8F0;
    }
    .report-bar-green { background: #10B981; width: 85%; }
    .report-bar-teal { background: #14B8A6; width: 65%; }
    .report-bar-orange { background: #F97316; width: 75%; }

    /* AI & VISION ORCHESTRATOR VERTICAL COLUMN */
    .ml-ensemble-box {
      position: absolute;
      right: 18px;
      top: 18px;
      width: 240px;
      height: 795px;
      background: linear-gradient(180deg, #F8F1FF 0%, #EDE0FF 100%);
      border: 2.6px solid #000000;
      border-radius: 36px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      z-index: 12;
    }

    .ml-ensemble-header {
      font-size: 15px;
      font-weight: 800;
      color: #000000;
      border-bottom: 2px solid #000000;
      padding-bottom: 2px;
      margin-bottom: 4px;
      text-align: center;
    }

    .model-capsule-stack {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .model-capsule {
      background: #FFFFFF;
      border: 1.8px solid #000000;
      border-radius: 20px;
      padding: 5px 8px;
      text-align: center;
      font-size: 10.5px;
      font-weight: 800;
      color: #000000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }

    .ml-inner-box {
      background: #FFFFFF;
      border: 2px solid #000000;
      border-radius: 12px;
      padding: 6px 10px;
      width: 180px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.06);
    }

    .ml-inner-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #000000;
      line-height: 1.2;
    }

    .ml-inner-sub {
      font-size: 9.5px;
      font-weight: 700;
      color: #475569;
    }

    .ml-multimodal-card {
      width: 100%;
      background: linear-gradient(180deg, #E0E7FF 0%, #C7D2FE 100%);
      border: 2.5px solid #000000;
      border-radius: 24px;
      padding: 12px 8px;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    /* RIGHT SECTION: OUTPUT & CLASSIFICATION */
    .right-section {
      position: absolute;
      left: 1235px;
      top: 5px;
      width: 630px;
      height: 835px;
      z-index: 15;
    }

    .output-box-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .output-label {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 6px;
    }

    .output-cyan-box {
      width: 170px;
      height: 135px;
      background: linear-gradient(180deg, #BAE6FD 0%, #7DD3FC 100%);
      border: 3px solid #000000;
      border-radius: 30px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px;
      text-align: center;
    }

    .output-cyan-title {
      font-size: 17px;
      font-weight: 800;
      color: #000000;
      line-height: 1.2;
    }

    .output-cyan-sub {
      font-size: 11px;
      font-weight: 700;
      color: #0369A1;
      margin-top: 4px;
    }

    .composite-score-box {
      position: absolute;
      left: 210px;
      top: 325px;
      width: 165px;
      height: 165px;
      background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
      border: 3px solid #000000;
      border-radius: 20px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 14px;
      text-align: center;
    }

    .composite-title {
      font-size: 17px;
      font-weight: 800;
      color: #000000;
      line-height: 1.25;
    }

    .composite-sub {
      font-size: 11px;
      font-weight: 700;
      color: #1E293B;
      margin-top: 6px;
    }

    .outcome-pills-col {
      position: absolute;
      left: 410px;
      top: 195px;
      width: 215px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .outcome-pill {
      background: linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%);
      border: 2.6px solid #000000;
      border-radius: 22px;
      padding: 12px 14px;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .outcome-title {
      font-size: 15.5px;
      font-weight: 800;
      color: #000000;
      line-height: 1.2;
    }

    .outcome-sub {
      font-size: 10.5px;
      font-weight: 700;
      color: #475569;
      margin-top: 2px;
    }

    /* BOTTOM RIBBON: TECH STACK ARCHES */
    .tech-stack-ribbon {
      width: 100%;
      height: 80px;
      background: linear-gradient(90deg, #F8FAFC 0%, #EEF2FF 50%, #ECFDF5 100%);
      border: 2.6px solid #000000;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      z-index: 20;
    }

    .tech-stack-badge {
      background: #FFFFFF;
      border: 2.6px solid #000000;
      border-radius: 999px;
      padding: 8px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tech-stack-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 900;
      color: #000000;
      text-decoration: underline;
    }

    .tech-category-segment {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 0 16px;
      position: relative;
    }

    .tech-icons-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tech-chip {
      background: #FFFFFF;
      border: 1.5px solid #000000;
      border-radius: 8px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .tech-category-label {
      font-size: 13.5px;
      font-weight: 800;
      color: #000000;
    }

    /* SVG CONNECTOR OVERLAY */
    .connector-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 11;
    }
  </style>
</head>
<body>

  <div class="viewport-wrapper">
    <div id="slide-stage">

      <!-- ==================== TOP HEADER ==================== -->
      <div class="top-header">
        <div class="top-left-title">
          <div class="brand-title">
            SHILPSETU AI!
            <span class="brand-tag">INVINCIBLE</span>
          </div>
          <div class="brand-sub">End-to-End Artisan Multimodal Ingestion & Sovereign Commerce Platform</div>
        </div>

        <div class="top-right-header">
          <div class="sih-meta-row">
            <div class="sih-logo-badge">
              <span class="sih-brain-icon">🧠</span>
              <span>SMART INDIA HACKATHON 2026 • Problem ID: 26090</span>
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #475569; padding-left: 8px; border-left: 2px solid #CBD5E1;">
              🏛️ MoSJE • NBCFDC / NSFDC Sovereign Rails
            </div>
          </div>
          <div class="sih-title-large">System Architecture</div>
        </div>
      </div>

      <!-- ==================== MAIN ARCHITECTURE STAGE ==================== -->
      <div class="diagram-body">

        <!-- SVG CONNECTING ARROWS & PATHS -->
        <svg class="connector-svg" viewBox="0 0 1872 870" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow-black" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#000000"/>
            </marker>
          </defs>

          <!-- 1. Left Sidebar Double Horizontal Connectors to Central Box -->
          <line x1="195" y1="418" x2="242" y2="418" stroke="#000000" stroke-width="2.6" marker-end="url(#arrow-black)"/>
          <line x1="242" y1="432" x2="195" y2="432" stroke="#000000" stroke-width="2.6" marker-end="url(#arrow-black)"/>

          <!-- 2. Inside Central Box: Artisan Ingestion -> Top Vision Cylinder -->
          <path d="M 360,390 L 360,110 L 375,110" stroke="#000000" stroke-width="2.8" marker-end="url(#arrow-black)" fill="none"/>

          <!-- 3. Inside Central Box: Artisan Ingestion -> Bottom Speech Cylinder -->
          <path d="M 360,460 L 360,740 L 375,740" stroke="#000000" stroke-width="2.8" marker-end="url(#arrow-black)" fill="none"/>

          <!-- 4. Top Cylinder -> AI Orchestrator -->
          <line x1="815" y1="110" x2="960" y2="110" stroke="#000000" stroke-width="2.8" marker-end="url(#arrow-black)"/>

          <!-- 5. Bottom Cylinder -> Multimodal LLM -->
          <line x1="815" y1="740" x2="960" y2="740" stroke="#000000" stroke-width="2.8" marker-end="url(#arrow-black)"/>

          <!-- 6. Cloud 1 to AI Orchestrator -->
          <path d="M 700,240 C 735,240 755,275 790,275" stroke="#000000" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#arrow-black)" fill="none"/>

          <!-- 7. Cloud 2 to Living Wage Report -->
          <path d="M 605,480 C 605,510 590,520 545,550" stroke="#000000" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#arrow-black)" fill="none"/>

          <!-- 8. AI Orchestrator -> Top Output Box -->
          <line x1="1205" y1="110" x2="1275" y2="110" stroke="#000000" stroke-width="2.8" marker-end="url(#arrow-black)"/>

          <!-- 9. AI Orchestrator -> Bottom Output Box -->
          <line x1="1205" y1="740" x2="1275" y2="740" stroke="#000000" stroke-width="2.8" marker-end="url(#arrow-black)"/>

          <!-- 10. Converging lines into Composite Karigar Score -->
          <path d="M 1450,110 L 1495,110 L 1495,405 L 1445,405" stroke="#000000" stroke-width="2.8" fill="none"/>
          <path d="M 1450,740 L 1495,740 L 1495,405 L 1445,405" stroke="#000000" stroke-width="2.8" fill="none"/>
          <line x1="1410" y1="405" x2="1445" y2="405" stroke="#000000" stroke-width="2.8" marker-end="url(#arrow-black)"/>

          <!-- 11. Middle Cloud with dashed arrow to Pricing Tiers -->
          <path d="M 1390,445 C 1425,530 1425,630 1380,660" stroke="#000000" stroke-width="2.4" stroke-dasharray="6 4" marker-end="url(#arrow-black)" fill="none"/>

          <!-- 12. Composite Score -> 4 Output Rails -->
          <line x1="1610" y1="405" x2="1645" y2="405" stroke="#000000" stroke-width="2.8"/>
          <path d="M 1645,405 L 1645,230 L 1655,230" stroke="#000000" stroke-width="2.4" marker-end="url(#arrow-black)" fill="none"/>
          <path d="M 1645,405 L 1645,320 L 1655,320" stroke="#000000" stroke-width="2.4" marker-end="url(#arrow-black)" fill="none"/>
          <path d="M 1645,405 L 1645,475 L 1655,475" stroke="#000000" stroke-width="2.4" marker-end="url(#arrow-black)" fill="none"/>
          <path d="M 1645,405 L 1645,565 L 1655,565" stroke="#000000" stroke-width="2.4" marker-end="url(#arrow-black)" fill="none"/>
        </svg>

        <!-- ==================== LEFT SIDEBAR CAPSULES ==================== -->
        <div class="left-sidebar">
          <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <div class="sidebar-section-title">API Layer</div>
            <div class="pill-capsule pill-api">
              <div class="pill-title">FastAPI Backend</div>
              <div class="pill-sub">Stateless Async Gateway</div>
            </div>
            
            <div class="v-arrow-double">
              <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                <path d="M 9 2 L 4 7 M 9 2 L 14 7 M 9 2 L 9 22 M 9 22 L 4 17 M 9 22 L 14 17" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="pill-capsule pill-api">
              <div class="pill-title">Vyapar-Niti Engine</div>
              <div class="pill-sub">Statutory ₹120/hr Wage Floor</div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <div class="pill-capsule pill-data">
              <div class="pill-title">Data Layer</div>
              <div class="pill-sub">SQLite WAL & PostgreSQL</div>
            </div>

            <div class="v-arrow-double">
              <svg width="18" height="24" viewBox="0 0 18 24" fill="none">
                <path d="M 9 2 L 4 7 M 9 2 L 14 7 M 9 2 L 9 22 M 9 22 L 4 17 M 9 22 L 14 17" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="pill-capsule pill-data">
              <div class="pill-title">Data Verification</div>
              <div class="pill-sub">2D DCT Stego & SHA-256</div>
            </div>
          </div>
        </div>

        <!-- ==================== CENTRAL WHITE BOUNDING BOX ==================== -->
        <div class="central-stage-box">

          <!-- Left Inside: Artisan Craft Ingestion -->
          <div class="origin-data-box">
            <div style="font-size: 26px;">📸 🎙️</div>
            <div>
              <div class="origin-title">Artisan Craft<br>Ingestion</div>
              <div class="origin-sub">Audio Dialect + Raw Photo</div>
            </div>
            <div style="font-size: 22px;">🧶 📱</div>
          </div>

          <!-- Top Branch: 3D Cylinder -->
          <div class="cylinder-pipeline-wrap" style="top: 15px;">
            <div class="cylinder-title">Photometric Studio Vision Pipeline</div>
            <div class="cylinder-3d-tube">
              <div class="cylinder-main-text">Neural Matting, Color Science & Shadow Synthesis</div>
              <div class="cylinder-sub-text">rembg (BiRefNet), OpenCV 6500K Studio Balance & Skeleton Pruning</div>
            </div>
          </div>

          <!-- Bottom Branch: 3D Cylinder -->
          <div class="cylinder-pipeline-wrap" style="top: 675px;">
            <div class="cylinder-3d-tube">
              <div class="cylinder-main-text">Indic Speech Recognition & Multimodal Entity Extraction</div>
              <div class="cylinder-sub-text">MeitY Bhashini ASR (22 Langs) & IndicTrans v2 Story Engine</div>
            </div>
            <div class="cylinder-title" style="margin-top: 6px;">Indic Multimodal Speech Pipeline</div>
          </div>

          <!-- Cloud 1: Contextual Storytelling -->
          <div class="cloud-shape" style="left: 375px; top: 195px; width: 175px;">
            <div class="cloud-text">Contextual Craft<br>Extraction</div>
            <div class="cloud-sub">Dialect & Story Normalization</div>
          </div>

          <!-- Cloud 2: Statutory Wage Floor Check -->
          <div class="cloud-shape" style="left: 375px; top: 410px; width: 175px;">
            <div class="cloud-text">Statutory Living<br>Wage Calc</div>
            <div class="cloud-sub">MoSJE ₹120/hr Living Wage Check</div>
          </div>

          <!-- Fair Price Report with reasonability -->
          <div class="report-wrap">
            <div class="cylinder-title" style="font-size: 15px; margin-bottom: 8px;">Fair Price Report<br>with reasonability</div>
            <div class="report-card">
              <div style="font-size: 9px; font-weight:800; color:#10B981; border-bottom:1px solid #E2E8F0; padding-bottom:2px;">FAIR WAGE</div>
              <div class="report-bar report-bar-green"></div>
              <div class="report-bar report-bar-teal"></div>
              <div class="report-bar report-bar-orange"></div>
              <div style="font-size: 8px; color:#64748B; font-weight:700;">₹120/hr Guard</div>
            </div>
          </div>

          <!-- Right Inside: AI & Vision Orchestrator Box -->
          <div class="ml-ensemble-box">
            <div class="ml-ensemble-header">AI & Vision Orchestrator</div>

            <div class="model-capsule-stack">
              <div class="model-capsule" style="background:#FEF08A;">Model 1: BiRefNet Matting (Sub-2s)</div>
              <div class="model-capsule" style="background:#BAE6FD;">Model 2: 6500K Studio Balance</div>
              <div class="model-capsule" style="background:#FED7AA;">Model n: GrabCut Fallback</div>
            </div>

            <svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M 7 1 L 7 15 M 2 10 L 7 15 L 12 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round"/></svg>

            <div class="ml-inner-box">
              <div class="ml-inner-title">CLIP Similarity</div>
              <div class="ml-inner-sub">Visual Deduplication & Price Index</div>
            </div>

            <svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M 7 1 L 7 15 M 2 10 L 7 15 L 12 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round"/></svg>

            <div class="ml-inner-box">
              <div class="ml-inner-title">K-Means Cluster</div>
              <div class="ml-inner-sub">Regional GI Craft Taxonomy</div>
            </div>

            <svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M 7 1 L 7 15 M 2 10 L 7 15 L 12 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round"/></svg>

            <div class="ml-inner-box">
              <div class="ml-inner-title">Wage Floor Engine</div>
              <div class="ml-inner-sub">Statutory Minimum Wage Audit</div>
            </div>

            <svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M 7 1 L 7 15 M 2 10 L 7 15 L 12 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round"/></svg>

            <div class="ml-inner-box">
              <div class="ml-inner-title">IndicTrans v2</div>
              <div class="ml-inner-sub">Buyer-Ready Story Formulation</div>
            </div>

            <svg width="14" height="18" viewBox="0 0 14 18" fill="none"><path d="M 7 1 L 7 15 M 2 10 L 7 15 L 12 10" stroke="#000000" stroke-width="2.4" stroke-linecap="round"/></svg>

            <div class="ml-multimodal-card">
              <div style="font-size: 16px; font-weight: 900; color: #000;">Multimodal LLM</div>
              <div style="font-size: 11px; font-weight: 700; color: #1E1B4B; margin-top:2px;">Gemini 2.5 Flash + Llama 3.2</div>
            </div>
          </div>

        </div>

        <!-- ==================== RIGHT SECTION: OUTPUTS ==================== -->
        <div class="right-section">

          <!-- Top Output: Sovereign Catalog Listing -->
          <div class="output-box-wrap" style="position: absolute; left: 45px; top: 15px;">
            <div class="output-label">Output</div>
            <div class="output-cyan-box">
              <div class="output-cyan-title">Sovereign<br>Catalog<br>Listing</div>
              <div class="output-cyan-sub">ONDC & GeM Catalog Payload</div>
            </div>
          </div>

          <!-- Middle Cloud: Artisan Cluster & GI Registry -->
          <div class="cloud-shape" style="left: 20px; top: 340px; width: 220px; border-radius: 40px;">
            <div class="cloud-text">Artisan Cluster<br>&amp; GI Registry<br>Mapping</div>
            <div class="cloud-sub">Authenticity & Traceability</div>
          </div>

          <!-- Bottom Output: Vyapar-Niti Pricing Tiers -->
          <div class="output-box-wrap" style="position: absolute; left: 45px; top: 660px;">
            <div class="output-cyan-box">
              <div class="output-cyan-title">Vyapar-Niti<br>Pricing Tiers</div>
              <div class="output-cyan-sub">B2C 1.35x / B2B Wholesale MOQ</div>
            </div>
          </div>

          <!-- Composite Karigar Score Box -->
          <div class="composite-score-box">
            <div class="composite-title">Composite<br>Karigar<br>Score</div>
            <div class="composite-sub">Karigar Trust Score & 2D DCT Watermark</div>
          </div>

          <!-- Rightmost 4 Outcome Rails -->
          <div class="outcome-pills-col">
            <div class="outcome-pill">
              <div class="outcome-title">Direct B2C<br>Storefront</div>
              <div class="outcome-sub">Flutter Mobile & React Web Apps</div>
            </div>

            <div class="outcome-pill">
              <div class="outcome-title">ONDC Open<br>Network</div>
              <div class="outcome-sub">Beckn Protocol v1.2 Discovery</div>
            </div>

            <div class="outcome-pill">
              <div class="outcome-title">GeM Public<br>Procurement</div>
              <div class="outcome-sub">15% Price Preference / Govt Orders</div>
            </div>

            <div class="outcome-pill">
              <div class="outcome-title">GI Registry &amp;<br>Provenance</div>
              <div class="outcome-sub">Export Certificate & Tamper-proof QR</div>
            </div>
          </div>

        </div>

      </div>

      <!-- ==================== BOTTOM RIBBON: TECH STACK ==================== -->
      <div class="tech-stack-ribbon">
        
        <div class="tech-stack-badge">
          <span style="font-size: 26px;">🧑‍💻</span>
          <span class="tech-stack-title">Tech Stack</span>
        </div>

        <!-- Segment 1: AI & Vision -->
        <div class="tech-category-segment">
          <div class="tech-icons-row">
            <span class="tech-chip">🐍 Python</span>
            <span class="tech-chip">⚡ PyTorch</span>
            <span class="tech-chip">👁️ OpenCV</span>
            <span class="tech-chip">✂️ rembg</span>
            <span class="tech-chip">🖼️ Pillow</span>
            <span class="tech-chip">🔍 CLIP</span>
          </div>
          <div class="tech-category-label">AI & Vision</div>
        </div>

        <div style="width: 2px; height: 42px; background: #000;"></div>

        <!-- Segment 2: Speech & NLP -->
        <div class="tech-category-segment">
          <div class="tech-icons-row">
            <span class="tech-chip">🇮🇳 Bhashini ASR</span>
            <span class="tech-chip">🧠 Gemini Flash</span>
            <span class="tech-chip">🦙 Llama 3.2</span>
            <span class="tech-chip">🔄 IndicTrans v2</span>
          </div>
          <div class="tech-category-label">Speech & NLP</div>
        </div>

        <div style="width: 2px; height: 42px; background: #000;"></div>

        <!-- Segment 3: Backend & Core -->
        <div class="tech-category-segment">
          <div class="tech-icons-row">
            <span class="tech-chip">⚡ FastAPI</span>
            <span class="tech-chip">🦄 Uvicorn</span>
            <span class="tech-chip">🛡️ Pydantic v2</span>
            <span class="tech-chip">🗄️ SQLite / Postgres</span>
          </div>
          <div class="tech-category-label">Backend & Core</div>
        </div>

        <div style="width: 2px; height: 42px; background: #000;"></div>

        <!-- Segment 4: Frontend & Rails -->
        <div class="tech-category-segment">
          <div class="tech-icons-row">
            <span class="tech-chip">📱 Flutter</span>
            <span class="tech-chip">⚛️ React 18</span>
            <span class="tech-chip">🌐 ONDC Beckn</span>
            <span class="tech-chip">🏛️ GeM</span>
          </div>
          <div class="tech-category-label">Frontend & Rails</div>
        </div>

      </div>

    </div>
  </div>

  <!-- Dynamic Responsive Scaler -->
  <script>
    function fitSlide() {
      const stage = document.getElementById('slide-stage');
      if (!stage) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(w / 1920, h / 1080);
      stage.style.transform = `scale(${scale})`;
    }
    window.addEventListener('resize', fitSlide);
    window.addEventListener('DOMContentLoaded', fitSlide);
    fitSlide();
  </script>

</body>
</html>
"""

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_public = os.path.join(os.path.dirname(base_dir), "frontend", "public")
    frontend_dist = os.path.join(os.path.dirname(base_dir), "frontend", "dist")
    html_path = os.path.join(frontend_public, "system_architecture_slide.html")
    png_path = os.path.join(frontend_public, "ShilpSetu_System_Architecture_INVINCIBLE.png")

    os.makedirs(frontend_public, exist_ok=True)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    print(f"Saved system architecture slide HTML to: {html_path}")

    # Also sync to dist if dist exists
    if os.path.exists(frontend_dist):
        dist_html = os.path.join(frontend_dist, "system_architecture_slide.html")
        with open(dist_html, "w", encoding="utf-8") as f:
            f.write(HTML_CONTENT)

    # Render screenshot using Chrome or Edge
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    if os.path.exists(chrome_path):
        cmd = [
            chrome_path,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--window-size=1920,1080",
            f"--screenshot={png_path}",
            f"file:///{html_path.replace(os.sep, '/')}"
        ]
        print("Rendering PNG screenshot via headless browser...")
        subprocess.run(cmd, check=True)
        print(f"Generated PNG screenshot at: {png_path}")
    else:
        print("Browser executable not found for screenshot generation.")

if __name__ == "__main__":
    main()
