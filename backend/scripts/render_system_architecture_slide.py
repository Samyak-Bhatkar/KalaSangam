"""
Renders the SIH 2026 Interconnected System Architecture Slide for ShilpSetu (Team INVINCIBLE).
Optimized for:
1. Zero render-blocking assets (instant <10ms load time, no perpetual loading spinner)
2. Dynamic auto-scaling to fit any user screen (1366x768, 1536x864, 1080p, 4K)
3. Zero badge overlap with stacked pills
4. Complete offline/local fallback support
"""

import os
import subprocess

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShilpSetu AI — Interconnected System Architecture (Team INVINCIBLE)</title>
  
  <!-- Non-blocking asynchronous font loading with instant system-UI fallbacks -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=JetBrains+Mono:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
  
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      background: #04070D;
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    /* Outer centering container */
    .viewport-wrapper {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #04070D;
    }

    /* Fixed-aspect 1920x1080 Stage Canvas that auto-scales dynamically */
    #slide-stage {
      width: 1920px;
      height: 1080px;
      position: absolute;
      transform-origin: center center;
      background: #060A12;
      overflow: hidden;
      padding: 20px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 0 80px rgba(0, 0, 0, 0.9);
    }

    /* Ambient Circuit & Grid Background */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle at 50% 15%, rgba(56, 189, 248, 0.08) 0%, transparent 55%),
        radial-gradient(circle at 88% 70%, rgba(139, 92, 246, 0.07) 0%, transparent 45%),
        radial-gradient(circle at 12% 70%, rgba(16, 185, 129, 0.07) 0%, transparent 45%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 100% 100%, 34px 34px, 34px 34px;
      pointer-events: none;
      z-index: 0;
    }

    /* Top Bar Header */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 24px;
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 16px;
      backdrop-filter: blur(16px);
      position: relative;
      z-index: 20;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .team-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(220, 38, 38, 0.38) 100%);
      border: 1.5px solid #EF4444;
      border-radius: 999px;
      color: #FCA5A5;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.28);
    }

    .team-badge::before {
      content: "";
      width: 8px;
      height: 8px;
      background: #EF4444;
      border-radius: 50%;
      box-shadow: 0 0 8px #EF4444;
      animation: pulse-dot 2s infinite ease-in-out;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .project-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 25px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.3px;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .project-title span.hindi {
      font-size: 19px;
      color: #F59E0B;
      font-weight: 700;
    }

    .project-subtitle {
      font-size: 13px;
      color: #94A3B8;
      font-weight: 500;
      margin-left: 6px;
      padding-left: 12px;
      border-left: 1.5px solid rgba(255,255,255,0.15);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sih-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .sih-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15px;
      font-weight: 800;
      background: linear-gradient(90deg, #F59E0B 0%, #F97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.6px;
    }

    .sih-sub {
      font-size: 11.5px;
      color: #94A3B8;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }

    .govt-tag {
      padding: 6px 14px;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 700;
      color: #E2E8F0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Diagram Stage Container */
    .diagram-stage {
      position: relative;
      width: 1856px;
      height: 875px;
      margin-top: 8px;
      z-index: 10;
    }

    /* SVG Overlay Layer for Exact Connectors */
    .svg-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 1856px;
      height: 875px;
      z-index: 15;
      pointer-events: none;
    }

    /* Category Cards Base Style */
    .cat-card {
      position: absolute;
      border-radius: 18px;
      background: rgba(15, 23, 42, 0.92);
      border: 2px solid;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(14px);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);
      z-index: 25;
    }

    .cat-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .cat-icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .cat-title-wrap {
      flex: 1;
    }

    .cat-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      margin-bottom: 2px;
      display: block;
    }

    .cat-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.25;
    }

    .cat-sub {
      font-size: 10.5px;
      color: #94A3B8;
      font-weight: 500;
      margin-top: 1px;
    }

    /* Internal Tech Items List */
    .tech-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
      flex: 1;
    }

    .tech-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 6px 8px;
    }

    .tech-item-icon {
      font-size: 14px;
      line-height: 1.2;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .tech-item-content {
      flex: 1;
      line-height: 1.35;
    }

    .tech-item-name {
      font-size: 11.5px;
      font-weight: 700;
      color: #F1F5F9;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tech-pill-mini {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(255,255,255,0.08);
      color: #CBD5E1;
    }

    .tech-item-desc {
      font-size: 9.5px;
      color: #94A3B8;
      font-weight: 400;
      margin-top: 2px;
    }

    /* CARD 1: Frontend & UI (Blue) */
    .card-frontend {
      width: 250px;
      height: 470px;
      left: 18px;
      top: 220px;
      border-color: #3B82F6;
      box-shadow: 0 12px 35px rgba(59, 130, 246, 0.22);
    }
    .card-frontend .cat-icon-badge {
      background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      color: #FFFFFF;
      border: 1.5px solid #60A5FA;
    }
    .card-frontend .cat-tag { color: #60A5FA; }

    /* CARD 2: Backend & Core Architecture (Green) */
    .card-backend {
      width: 255px;
      height: 470px;
      left: 366px;
      top: 220px;
      border-color: #10B981;
      box-shadow: 0 12px 35px rgba(16, 185, 129, 0.22);
    }
    .card-backend .cat-icon-badge {
      background: linear-gradient(135deg, #065F46 0%, #10B981 100%);
      color: #FFFFFF;
      border: 1.5px solid #34D399;
    }
    .card-backend .cat-tag { color: #34D399; }

    /* CARD 3: AI Computer Vision & Studio (Purple) - Branch 1 */
    .card-vision {
      width: 285px;
      height: 340px;
      left: 775px;
      top: 60px;
      border-color: #8B5CF6;
      box-shadow: 0 12px 35px rgba(139, 92, 246, 0.22);
    }
    .card-vision .cat-icon-badge {
      background: linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%);
      color: #FFFFFF;
      border: 1.5px solid #A78BFA;
    }
    .card-vision .cat-tag { color: #A78BFA; }

    /* CARD 4: Speech & Multimodal Intelligence (Orange) - Branch 2 */
    .card-speech {
      width: 285px;
      height: 340px;
      left: 775px;
      top: 450px;
      border-color: #F97316;
      box-shadow: 0 12px 35px rgba(249, 115, 22, 0.22);
    }
    .card-speech .cat-icon-badge {
      background: linear-gradient(135deg, #9A3412 0%, #F97316 100%);
      color: #FFFFFF;
      border: 1.5px solid #FB923C;
    }
    .card-speech .cat-tag { color: #FB923C; }

    /* CARD 5: Market Linkage & Pricing (Teal) */
    .card-market {
      width: 280px;
      height: 470px;
      left: 1205px;
      top: 220px;
      border-color: #0D9488;
      box-shadow: 0 12px 35px rgba(13, 148, 136, 0.22);
    }
    .card-market .cat-icon-badge {
      background: linear-gradient(135deg, #115E59 0%, #0D9488 100%);
      color: #FFFFFF;
      border: 1.5px solid #2DD4BF;
    }
    .card-market .cat-tag { color: #2DD4BF; }

    /* CARD 6: Security, Trust & Provenance (Red) */
    .card-security {
      width: 260px;
      height: 470px;
      left: 1572px;
      top: 220px;
      border-color: #EF4444;
      box-shadow: 0 12px 35px rgba(239, 68, 68, 0.22);
    }
    .card-security .cat-icon-badge {
      background: linear-gradient(135deg, #991B1B 0%, #EF4444 100%);
      color: #FFFFFF;
      border: 1.5px solid #F87171;
    }
    .card-security .cat-tag { color: #F87171; }

    /* Stacked Compact Flow Badges */
    .arrow-badge-stack {
      position: absolute;
      z-index: 30;
      padding: 5px 9px;
      border-radius: 12px;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 2px;
      backdrop-filter: blur(16px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.65);
      transform: translate(-50%, -50%);
      line-height: 1.2;
    }

    .arrow-badge-top-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 800;
      white-space: nowrap;
    }

    .arrow-badge-sub-row {
      font-size: 8.5px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      opacity: 0.9;
      white-space: nowrap;
    }

    .arrow-badge-num {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 900;
      color: #FFFFFF;
      flex-shrink: 0;
    }

    /* Color variations for labels */
    .badge-blue {
      background: rgba(15, 35, 75, 0.96);
      border: 1.5px solid #38BDF8;
      color: #E0F2FE;
    }
    .badge-blue .arrow-badge-num { background: #2563EB; }

    .badge-purple {
      background: rgba(45, 18, 85, 0.96);
      border: 1.5px solid #A855F7;
      color: #F3E8FF;
    }
    .badge-purple .arrow-badge-num { background: #7C3AED; }

    .badge-orange {
      background: rgba(65, 25, 10, 0.96);
      border: 1.5px solid #FB923C;
      color: #FFEDD5;
    }
    .badge-orange .arrow-badge-num { background: #EA580C; }

    .badge-teal {
      background: rgba(13, 45, 42, 0.96);
      border: 1.5px solid #2DD4BF;
      color: #CCFBF1;
    }
    .badge-teal .arrow-badge-num { background: #0F766E; }

    .badge-red {
      background: rgba(65, 15, 15, 0.96);
      border: 1.5px solid #F87171;
      color: #FEE2E2;
    }
    .badge-red .arrow-badge-num { background: #DC2626; }

    .badge-green {
      background: rgba(6, 45, 32, 0.96);
      border: 1.5px solid #34D399;
      color: #D1FAE5;
    }
    .badge-green .arrow-badge-num { background: #059669; }

    /* Bottom Legend / Status Bar */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 24px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      backdrop-filter: blur(12px);
      position: relative;
      z-index: 20;
    }

    .footer-legend {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 11px;
      color: #94A3B8;
      font-weight: 600;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .footer-stats {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748B;
      display: flex;
      gap: 16px;
    }

    .stat-highlight {
      color: #10B981;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <div class="viewport-wrapper">
    <div id="slide-stage">
      <div class="bg-grid"></div>

      <!-- ==================== HEADER BAR ==================== -->
      <div class="header-bar">
        <div class="header-left">
          <div class="team-badge">INVINCIBLE</div>
          <div class="project-title">
            ShilpSetu AI <span class="hindi">शिल्पसेतु AI</span>
            <span class="project-subtitle">Interconnected End-to-End System Architecture & Data Flow</span>
          </div>
        </div>
        <div class="header-right">
          <div class="sih-badge">
            <span class="sih-title">SMART INDIA HACKATHON 2026</span>
            <span class="sih-sub">Problem Statement ID: 26090</span>
          </div>
          <div class="govt-tag">
            🏛️ MoSJE • NBCFDC / NSFDC Sovereign Rails
          </div>
        </div>
      </div>

      <!-- ==================== MAIN ARCHITECTURE STAGE ==================== -->
      <div class="diagram-stage">

        <!-- SVG Layer for Interconnecting Connectors & Merge Nodes -->
        <svg class="svg-layer" viewBox="0 0 1856 875" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Arrowhead Markers -->
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8"/>
            </marker>
            <marker id="arrow-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#A855F7"/>
            </marker>
            <marker id="arrow-orange" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FB923C"/>
            </marker>
            <marker id="arrow-teal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2DD4BF"/>
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F87171"/>
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#34D399"/>
            </marker>

            <!-- Drop shadow & glow filter -->
            <filter id="glow-junction" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#2DD4BF" flood-opacity="0.9"/>
            </filter>
          </defs>

          <!-- 1. Frontend -> Backend (REST / WebSocket Ingestion) -->
          <line x1="268" y1="455" x2="358" y2="455" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-blue)" filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))"/>

          <!-- 2. Backend -> Vision Pipeline (Branch 1 - Upper) -->
          <path d="M 621,310 C 690,310 710,230 767,230" fill="none" stroke="#A855F7" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-purple)" filter="drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))"/>

          <!-- 3. Backend -> Speech Pipeline (Branch 2 - Lower) -->
          <path d="M 621,600 C 690,600 710,620 767,620" fill="none" stroke="#FB923C" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-orange)" filter="drop-shadow(0 0 5px rgba(251, 146, 60, 0.5))"/>

          <!-- 4. Convergence / Merge: Vision (Card 3) + Speech (Card 4) -> Market Linkage (Card 5) -->
          <path d="M 1060,230 C 1100,230 1120,400 1135,455" fill="none" stroke="#A855F7" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M 1060,620 C 1100,620 1120,510 1135,455" fill="none" stroke="#FB923C" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="1135" y1="455" x2="1197" y2="455" stroke="#2DD4BF" stroke-width="3.5" stroke-linecap="round" marker-end="url(#arrow-teal)" filter="drop-shadow(0 0 7px rgba(45, 212, 191, 0.7))"/>
          <circle cx="1135" cy="455" r="5.5" fill="#2DD4BF" stroke="#FFFFFF" stroke-width="2" filter="url(#glow-junction)"/>

          <!-- 5. Market Linkage -> Security, Trust & Provenance -->
          <line x1="1485" y1="455" x2="1564" y2="455" stroke="#F87171" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-red)" filter="drop-shadow(0 0 6px rgba(248, 113, 113, 0.6))"/>

          <!-- 6. Security -> Backend & Core Architecture (Persistence Return Loop) -->
          <path d="M 1702,690 L 1702,835 C 1702,845 1680,845 1650,845 L 515,845 C 493,845 493,835 493,698" fill="none" stroke="#34D399" stroke-width="2.5" stroke-dasharray="7 4" stroke-linecap="round" marker-end="url(#arrow-green)" filter="drop-shadow(0 0 5px rgba(52, 211, 153, 0.45))"/>

          <!-- 7. Security -> Market Linkage (Broadcast Loop Back via ONDC/GeM) -->
          <path d="M 1572,280 C 1540,250 1515,250 1493,275" fill="none" stroke="#2DD4BF" stroke-width="2.5" stroke-linecap="round" marker-end="url(#arrow-teal)" filter="drop-shadow(0 0 4px rgba(45, 212, 191, 0.5))"/>

          <!-- 8. Market Linkage -> Frontend & UI (Live Listing Feed) -->
          <path d="M 1345,220 L 1345,26 C 1345,14 1325,14 1290,14 L 165,14 C 143,14 143,26 143,212" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="7 4" stroke-linecap="round" marker-end="url(#arrow-blue)" filter="drop-shadow(0 0 5px rgba(56, 189, 248, 0.45))"/>
        </svg>

        <!-- ==================== 1. FRONTEND & UI (BLUE) ==================== -->
        <div class="cat-card card-frontend">
          <div class="cat-card-header">
            <div class="cat-icon-badge">📱</div>
            <div class="cat-title-wrap">
              <span class="cat-tag">Layer 01 • Ingestion</span>
              <h3 class="cat-title">Frontend & UI</h3>
              <p class="cat-sub">Multi-Channel Artisan Access</p>
            </div>
          </div>
          <div class="tech-list">
            <div class="tech-item">
              <span class="tech-item-icon">📱</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Flutter (Mobile) <span class="tech-pill-mini">Dart 3</span></div>
                <div class="tech-item-desc">Cross-platform app, zero-bandwidth offline queue, 60px tactile touch targets</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">⚛️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">React 18 + Vite <span class="tech-pill-mini">Web</span></div>
                <div class="tech-item-desc">Responsive buyer marketplace, coordinator audit desk & live analytics</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">📞</span>
              <div class="tech-item-content">
                <div class="tech-item-name">2G IVR Telephony <span class="tech-pill-mini">Hotline</span></div>
                <div class="tech-item-desc">Keypad feature phone simulation, Web Audio DTMF tones & automated flow</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🎨</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Tailwind + M3 <span class="tech-pill-mini">Design</span></div>
                <div class="tech-item-desc">Zero-text icon navigation, warm terracotta aesthetic, accessible WCAG 2.1</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow 1 Stacked Label: Frontend -> Backend -->
        <div class="arrow-badge-stack badge-blue" style="left: 317px; top: 455px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">1</span>
            <span>Capture & Ingestion</span>
          </div>
          <div class="arrow-badge-sub-row">REST / WebSocket</div>
        </div>

        <!-- ==================== 2. BACKEND & CORE ARCHITECTURE (GREEN) ==================== -->
        <div class="cat-card card-backend">
          <div class="cat-card-header">
            <div class="cat-icon-badge">⚙️</div>
            <div class="cat-title-wrap">
              <span class="cat-tag">Layer 02 • Core Gateway</span>
              <h3 class="cat-title">Backend & Core</h3>
              <p class="cat-sub">High-Concurrency Orchestrator</p>
            </div>
          </div>
          <div class="tech-list">
            <div class="tech-item">
              <span class="tech-item-icon">⚡</span>
              <div class="tech-item-content">
                <div class="tech-item-name">FastAPI <span class="tech-pill-mini">Python 3.13</span></div>
                <div class="tech-item-desc">Stateless async microservices gateway, parallel pipeline dispatch & routing</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🦄</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Uvicorn ASGI <span class="tech-pill-mini">Async IO</span></div>
                <div class="tech-item-desc">High-throughput event loop, handling multi-part audio/image streams</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🛡️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Pydantic v2 <span class="tech-pill-mini">Validation</span></div>
                <div class="tech-item-desc">Strict schema contracts, craft entity sanitization & coordinator approval logs</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🗄️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">SQLite WAL / Postgres <span class="tech-pill-mini">DB</span></div>
                <div class="tech-item-desc">Zero-lock draft catalog persistence, artisan profiles & audit trail log</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow 2 Stacked Label: Backend -> Vision (Branch 1) -->
        <div class="arrow-badge-stack badge-purple" style="left: 698px; top: 230px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">2</span>
            <span>Image Payload</span>
          </div>
          <div class="arrow-badge-sub-row">Vision Processing</div>
        </div>

        <!-- Arrow 3 Stacked Label: Backend -> Speech (Branch 2) -->
        <div class="arrow-badge-stack badge-orange" style="left: 698px; top: 620px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">3</span>
            <span>Audio Payload</span>
          </div>
          <div class="arrow-badge-sub-row">Voice-to-Catalog</div>
        </div>

        <!-- ==================== 3. AI COMPUTER VISION & STUDIO (PURPLE) ==================== -->
        <div class="cat-card card-vision">
          <div class="cat-card-header">
            <div class="cat-icon-badge">👁️</div>
            <div class="cat-title-wrap">
              <span class="cat-tag">Layer 03A • Visual AI</span>
              <h3 class="cat-title">Computer Vision</h3>
              <p class="cat-sub">Photometric Studio Pipeline</p>
            </div>
          </div>
          <div class="tech-list">
            <div class="tech-item">
              <span class="tech-item-icon">✂️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">rembg (BiRefNet/U2Net) <span class="tech-pill-mini">Matting</span></div>
                <div class="tech-item-desc">Sub-2s neural background removal with high-res boundary preservation</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🖼️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">OpenCV & Pillow <span class="tech-pill-mini">Color Science</span></div>
                <div class="tech-item-desc">6500K studio color-cast balancing, Gaussian drop-shadow synthesis</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🦴</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Skeleton Pruning <span class="tech-pill-mini">Topology</span></div>
                <div class="tech-item-desc">Multi-component craft retention for intricate chanderi zari & pottery rims</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🛡️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">GrabCut Fallback <span class="tech-pill-mini">Resilience</span></div>
                <div class="tech-item-desc">Low-resource iterative graph-cut engine if neural VRAM constrained</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 4. SPEECH & MULTIMODAL INTELLIGENCE (ORANGE) ==================== -->
        <div class="cat-card card-speech">
          <div class="cat-card-header">
            <div class="cat-icon-badge">🎙️</div>
            <div class="cat-title-wrap">
              <span class="cat-tag">Layer 03B • Multimodal</span>
              <h3 class="cat-title">Speech & LLM Intel</h3>
              <p class="cat-sub">Indic Dialect Extraction</p>
            </div>
          </div>
          <div class="tech-list">
            <div class="tech-item">
              <span class="tech-item-icon">🇮🇳</span>
              <div class="tech-item-content">
                <div class="tech-item-name">MeitY Bhashini ASR <span class="tech-pill-mini">Dhruva</span></div>
                <div class="tech-item-desc">Conformer Indic ASR across 22 scheduled languages & colloquial dialects</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🧠</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Gemini 2.5 Flash <span class="tech-pill-mini">Multimodal</span></div>
                <div class="tech-item-desc">Combined audio transcript + image entity extraction for craft metadata</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🦙</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Meta Llama 3.2 Vision <span class="tech-pill-mini">Edge Fallback</span></div>
                <div class="tech-item-desc">Offline/on-prem multimodal fallback for zero-cloud sovereignty</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🔄</span>
              <div class="tech-item-content">
                <div class="tech-item-name">IndicTrans v2 <span class="tech-pill-mini">Translation</span></div>
                <div class="tech-item-desc">Regional dialect to English product title, materials & craft story</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow 4 Stacked Label: Convergence Node -> Market Linkage -->
        <div class="arrow-badge-stack badge-teal" style="left: 1135px; top: 405px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">4</span>
            <span>Catalog + Image data</span>
          </div>
          <div class="arrow-badge-sub-row">→ Pricing Engine (Merge)</div>
        </div>

        <!-- ==================== 5. MARKET LINKAGE & PRICING (TEAL) ==================== -->
        <div class="cat-card card-market">
          <div class="cat-card-header">
            <div class="cat-icon-badge">⚖️</div>
            <div class="cat-title-wrap">
              <span class="cat-tag">Layer 04 • Sovereign Commerce</span>
              <h3 class="cat-title">Market Linkage</h3>
              <p class="cat-sub">Statutory Wage & Open Rails</p>
            </div>
          </div>
          <div class="tech-list">
            <div class="tech-item">
              <span class="tech-item-icon">📈</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Vyapar-Niti Engine <span class="tech-pill-mini">Fair Wage</span></div>
                <div class="tech-item-desc">MoSJE statutory ₹120/hr wage floor, B2C (1.35x), B2B wholesale MOQ tiers</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🔍</span>
              <div class="tech-item-content">
                <div class="tech-item-name">CLIP Similarity <span class="tech-pill-mini">Visual Index</span></div>
                <div class="tech-item-desc">Image embeddings to cross-reference market pricing & prevent duplication</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🌐</span>
              <div class="tech-item-content">
                <div class="tech-item-name">ONDC Beckn v1.2 <span class="tech-pill-mini">Protocol</span></div>
                <div class="tech-item-desc">BAP/BPP catalog serialization, open discovery across Buyer Apps</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🏛️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">GeM Procurement <span class="tech-pill-mini">Gov Orders</span></div>
                <div class="tech-item-desc">Direct 15% price preference listing for institutional public procurement</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow 5 Stacked Label: Market Linkage -> Security -->
        <div class="arrow-badge-stack badge-red" style="left: 1528px; top: 455px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">5</span>
            <span>Finalized Listing</span>
          </div>
          <div class="arrow-badge-sub-row">Watermark & Fingerprint</div>
        </div>

        <!-- ==================== 6. SECURITY, TRUST & PROVENANCE (RED) ==================== -->
        <div class="cat-card card-security">
          <div class="cat-card-header">
            <div class="cat-icon-badge">🔒</div>
            <div class="cat-title-wrap">
              <span class="cat-tag">Layer 05 • Trust & GI</span>
              <h3 class="cat-title">Security & Trust</h3>
              <p class="cat-sub">Cryptographic Provenance</p>
            </div>
          </div>
          <div class="tech-list">
            <div class="tech-item">
              <span class="tech-item-icon">🔏</span>
              <div class="tech-item-content">
                <div class="tech-item-name">2D DCT Steganography <span class="tech-pill-mini">SciPy</span></div>
                <div class="tech-item-desc">Invisible frequency-domain luminance watermark with artisan GI & timestamp</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🏷️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">SHA-256 Fingerprint <span class="tech-pill-mini">Integrity</span></div>
                <div class="tech-item-desc">Cryptographic payload digest preventing catalog tampering & counterfeit claims</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">📱</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Dynamic Authenticity QR <span class="tech-pill-mini">Verify</span></div>
                <div class="tech-item-desc">Scannable buyer certificate linking directly to artisan cluster & GI registry</div>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-item-icon">🎖️</span>
              <div class="tech-item-content">
                <div class="tech-item-name">Karigar Trust Score <span class="tech-pill-mini">Ledger</span></div>
                <div class="tech-item-desc">Fulfillment history, material authenticity & craft ratings credit scoring</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow 6 Stacked Label: Security -> Backend (Persistence Return Loop) -->
        <div class="arrow-badge-stack badge-green" style="left: 1098px; top: 845px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">6</span>
            <span>Persist Verified Listing</span>
          </div>
          <div class="arrow-badge-sub-row">DB State Sync (SQLite/PostgreSQL)</div>
        </div>

        <!-- Arrow 7 Stacked Label: Security -> Market Linkage (Broadcast Loop Back) -->
        <div class="arrow-badge-stack badge-teal" style="left: 1528px; top: 245px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">7</span>
            <span>Broadcast Listing</span>
          </div>
          <div class="arrow-badge-sub-row">ONDC / Beckn / GeM</div>
        </div>

        <!-- Arrow 8 Stacked Label: Market Linkage -> Frontend (Live Consumer/Artisan Feed) -->
        <div class="arrow-badge-stack badge-blue" style="left: 744px; top: 14px;">
          <div class="arrow-badge-top-row">
            <span class="arrow-badge-num">8</span>
            <span>Live Listing Feed</span>
          </div>
          <div class="arrow-badge-sub-row">Artisan Dashboard & Buyer Apps</div>
        </div>

      </div>

      <!-- ==================== FOOTER STATUS BAR ==================== -->
      <div class="footer-bar">
        <div class="footer-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#3B82F6;"></span> 1. Ingestion</div>
          <div class="legend-item"><span class="legend-dot" style="background:#8B5CF6;"></span> 2. Vision AI</div>
          <div class="legend-item"><span class="legend-dot" style="background:#F97316;"></span> 3. Speech & LLM</div>
          <div class="legend-item"><span class="legend-dot" style="background:#0D9488;"></span> 4. Fair Wage Pricing</div>
          <div class="legend-item"><span class="legend-dot" style="background:#EF4444;"></span> 5. Provenance & GI</div>
          <div class="legend-item"><span class="legend-dot" style="background:#10B981;"></span> 6. Persistent Ledger</div>
          <div class="legend-item"><span class="legend-dot" style="background:#2DD4BF;"></span> 7. Open Rails</div>
          <div class="legend-item"><span class="legend-dot" style="background:#38BDF8;"></span> 8. Live Sync</div>
        </div>
        <div class="footer-stats">
          <span>Pipeline Latency: <strong class="stat-highlight">&lt; 4.2s End-to-End</strong></span>
          <span>•</span>
          <span>Living Wage Guard: <strong class="stat-highlight">100% Protected (₹120/hr)</strong></span>
          <span>•</span>
          <span>Sovereignty: <strong class="stat-highlight">ONDC + GeM Ready</strong></span>
        </div>
      </div>

    </div>
  </div>

  <!-- Dynamic Responsive Scaler (Instant Fit for 1366x768, 1080p, 4K, Mobile) -->
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
