#!/usr/bin/env python3
"""
generate_youtube_demo_pdf.py
Generates a masterclass, professional 3-4 minute YouTube Demo Speech & Video Production Script
for SIH 2026 Problem Statement 26197 (Heritage & Culture - Student Innovation).
Cleanly paginated 4-page master document.
"""

import os
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
HTML_OUT = BASE_DIR / "ShilpSetu_SIH2026_YouTube_Demo_Speech_and_Script.html"
PDF_OUT = BASE_DIR / "ShilpSetu_SIH2026_YouTube_Demo_Speech_and_Script.pdf"

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShilpSetu - SIH 2026 YouTube Demo Speech & Video Script (PS 26197)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap');

    @page {
      size: A4 portrait;
      margin: 11mm 12mm 11mm 12mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 7.5pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 8.8pt;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* HEADER BANNER */
    .header-banner {
      background: linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%);
      border-radius: 8px;
      padding: 14px 18px;
      color: #ffffff;
      margin-bottom: 12px;
      border-left: 5px solid #f59e0b;
      position: relative;
    }

    .badge-row {
      display: flex;
      gap: 6px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-emerald { background: #d1fae5; color: #065f46; }
    .badge-purple { background: #f3e8ff; color: #6b21a8; }
    .badge-rose { background: #ffe4e6; color: #9f1239; }

    .title-main {
      font-family: 'Outfit', sans-serif;
      font-size: 17pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.15;
      color: #ffffff;
    }

    .title-sub {
      font-size: 9.5pt;
      color: #94a3b8;
      margin-top: 3px;
      font-weight: 500;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 10px;
      padding-top: 9px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 7.5pt;
    }

    .meta-item strong {
      display: block;
      color: #f59e0b;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-item span {
      color: #e2e8f0;
      font-weight: 600;
    }

    /* SECTION HEADERS */
    h2.section-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 11.5pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 12px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    h2.section-heading span.num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: #0f172a;
      color: #f59e0b;
      border-radius: 50%;
      font-size: 7.5pt;
      font-weight: 800;
    }

    /* CALLOUT BOXES */
    .callout-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #3b82f6;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 10px;
      font-size: 8pt;
      line-height: 1.45;
    }

    .callout-box strong { color: #1e3a8a; }

    /* SCRIPT TABLE */
    table.script-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 8.5pt;
    }

    table.script-table th {
      background: #0f172a;
      color: #f8fafc;
      padding: 6px 8px;
      text-align: left;
      font-weight: 700;
      font-size: 7.5pt;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    table.script-table td {
      padding: 7px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }

    table.script-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    .col-time {
      width: 11%;
      font-family: 'Fira Code', monospace;
      font-weight: 700;
      color: #b45309;
      font-size: 7.5pt;
      white-space: nowrap;
    }

    .col-action {
      width: 39%;
      border-right: 1px dashed #cbd5e1;
      padding-right: 10px;
    }

    .col-speech {
      width: 50%;
      padding-left: 10px;
    }

    .action-header {
      font-weight: 700;
      color: #0f172a;
      font-size: 8pt;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .key-badge {
      display: inline-block;
      background: #e0e7ff;
      color: #3730a3;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: 'Fira Code', monospace;
      font-size: 7pt;
      font-weight: 700;
      border: 1px solid #c7d2fe;
    }

    .action-steps {
      font-size: 7.5pt;
      color: #334155;
      line-height: 1.35;
      list-style-type: square;
      padding-left: 12px;
    }

    .action-steps li { margin-bottom: 2px; }

    .speech-bubble {
      font-size: 8.5pt;
      color: #090d16;
      line-height: 1.45;
    }

    .speech-bubble em.stage-dir {
      color: #64748b;
      font-size: 7.5pt;
      font-style: italic;
      display: block;
      margin-bottom: 2px;
    }

    .speech-bubble strong.voice-punch {
      color: #0284c7;
      font-weight: 700;
    }

    .speech-bubble span.pause {
      display: inline-block;
      padding: 0 2px;
      color: #d97706;
      font-size: 7pt;
      font-family: 'Fira Code', monospace;
      font-weight: 600;
    }

    /* COMPARISON TABLE */
    table.comp-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.8pt;
      margin-top: 6px;
      margin-bottom: 10px;
    }

    table.comp-table th {
      background: #1e293b;
      color: #ffffff;
      padding: 5px 7px;
      text-align: left;
      font-weight: 600;
    }

    table.comp-table td {
      padding: 5px 7px;
      border-bottom: 1px solid #cbd5e1;
    }

    table.comp-table tr:nth-child(even) td { background: #f8fafc; }

    table.comp-table tr.highlight td {
      background: #eff6ff;
      font-weight: 600;
    }

    /* CHECKLIST */
    .checklist-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 6px;
      margin-bottom: 10px;
    }

    .checklist-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 7.5pt;
    }

    .checklist-card h4 {
      font-size: 8pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .checklist-card ul {
      list-style-type: none;
      padding-left: 0;
    }

    .checklist-card li {
      margin-bottom: 3px;
      padding-left: 14px;
      position: relative;
    }

    .checklist-card li::before {
      content: "✔";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
    }

    .footer-note {
      margin-top: 10px;
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 7pt;
      color: #475569;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PAGE 1: COVER & EXECUTIVE STRATEGY -->
  <!-- ========================================================================= -->
  <div class="header-banner">
    <div class="badge-row">
      <span class="badge badge-amber">SIH 2026 Screening Video</span>
      <span class="badge badge-blue">Problem Statement ID: 26197</span>
      <span class="badge badge-emerald">AICTE &bull; MIC Student Innovation</span>
      <span class="badge badge-purple">Category: Software &bull; Heritage &amp; Culture</span>
    </div>
    <div class="title-main">SHILPSETU &amp; BHARAT CULTURAL GENOME</div>
    <div class="title-sub">Official 3:30 Minute Screenplay, Timed Voiceover Script &amp; Production Walkthrough</div>
    <div class="meta-grid">
      <div class="meta-item">
        <strong>Target Video Length</strong>
        <span>3 Minutes 30 Seconds</span>
      </div>
      <div class="meta-item">
        <strong>Total Word Count</strong>
        <span>486 Words (138 WPM)</span>
      </div>
      <div class="meta-item">
        <strong>Audio Tone</strong>
        <span>Authoritative &bull; Passionate &bull; Academic</span>
      </div>
      <div class="meta-item">
        <strong>Target Resolution</strong>
        <span>1080p 60fps (1920 &times; 1080)</span>
      </div>
    </div>
  </div>

  <div class="callout-box">
    <strong>Executive Pitch for Judges (One-Liner):</strong>
    <em>"India's rich cultural heritage faces a dual crisis: sacred traditions and ancient instruments remain frozen in silent stone carvings, while living traditional artisans are marginalized by generic e-commerce algorithms. ShilpSetu unites an offline-first Cultural Genome Map and Aural Heritage DSP Synthesizer with zero-smartphone voice cataloging and statutory living-wage protections to create India's first end-to-end Cultural Heritage &amp; Living Artisan Ecosystem."</em>
  </div>

  <h2 class="section-heading"><span class="num">1</span> Video Structure &amp; Strategic Timeline Overview</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 7.8pt; margin-bottom: 12px;">
    <thead>
      <tr style="background: #1e293b; color: white;">
        <th style="padding: 5px 8px; width: 12%;">Segment</th>
        <th style="padding: 5px 8px; width: 15%;">Timestamp</th>
        <th style="padding: 5px 8px; width: 38%;">Visual Focus (Screen Recording)</th>
        <th style="padding: 5px 8px; width: 35%;">Strategic Judging Hook</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 8px; font-weight: 700;">Scene 1</td>
        <td style="padding: 4px 8px; font-family: 'Fira Code', monospace; color: #b45309;">0:00 &ndash; 0:35</td>
        <td style="padding: 4px 8px;">The Dual Heritage Crisis: Silent Temple vs Struggling Artisan</td>
        <td style="padding: 4px 8px;">Immediate emotional and systemic hook aligning with MoSJE &amp; AICTE.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
        <td style="padding: 4px 8px; font-weight: 700;">Scene 2</td>
        <td style="padding: 4px 8px; font-family: 'Fira Code', monospace; color: #b45309;">0:35 &ndash; 1:15</td>
        <td style="padding: 4px 8px;">The Cultural Genome Map: 10 Layers, DNA Heatmap &amp; Timeline</td>
        <td style="padding: 4px 8px;">Proves traditions transcend political state borders with 100% offline MapLibre.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 8px; font-weight: 700;">Scene 3</td>
        <td style="padding: 4px 8px; font-family: 'Fira Code', monospace; color: #b45309;">1:15 &ndash; 1:55</td>
        <td style="padding: 4px 8px;">Naad-Virasat: Physical String/Drum DSP on Temple Carvings</td>
        <td style="padding: 4px 8px;">"We give voice to stone" &mdash; 4 Natyashastra instrument synthesis.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
        <td style="padding: 4px 8px; font-weight: 700;">Scene 4</td>
        <td style="padding: 4px 8px; font-family: 'Fira Code', monospace; color: #b45309;">1:55 &ndash; 2:30</td>
        <td style="padding: 4px 8px;">Cultural Motif Decoder &amp; Student Citation Lens</td>
        <td style="padding: 4px 8px;">Honest Knowledge Vault: zero AI hallucinations &amp; 1-click thesis citations.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 8px; font-weight: 700;">Scene 5</td>
        <td style="padding: 4px 8px; font-family: 'Fira Code', monospace; color: #b45309;">2:30 &ndash; 3:05</td>
        <td style="padding: 4px 8px;">The Artisan Economic Engine: Zero-Smartphone IVR &amp; Living Wage</td>
        <td style="padding: 4px 8px;">Direct linkage to NBCFDC/NSFDC makers with statutory &#8377;43.75/hr floor.</td>
      </tr>
      <tr style="background: #eff6ff;">
        <td style="padding: 4px 8px; font-weight: 700;">Scene 6</td>
        <td style="padding: 4px 8px; font-family: 'Fira Code', monospace; color: #b45309;">3:05 &ndash; 3:30</td>
        <td style="padding: 4px 8px;">Digital GI Sovereign Passport &amp; Viksit Bharat Vision</td>
        <td style="padding: 4px 8px;">Memorable, inspiring patriotic closing on safeguarding 5,000 years of culture.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-heading"><span class="num">2</span> Why ShilpSetu Beats Existing Platforms</h2>
  <table class="comp-table">
    <thead>
      <tr>
        <th style="width: 25%;">Dimension / Capability</th>
        <th style="width: 18%;">Google Arts &amp; Culture</th>
        <th style="width: 18%;">IGNCA / Govt Archives</th>
        <th style="width: 19%;">E-Commerce (Etsy, Amazon)</th>
        <th style="width: 20%;">ShilpSetu (Our Prototype)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cultural Reach</strong></td>
        <td>Static Museum Objects</td>
        <td>Textual PDF Catalogues</td>
        <td>Commercial SKU Listing</td>
        <td><strong>Living Artisans &amp; Deep Lore</strong></td>
      </tr>
      <tr>
        <td><strong>Ancient Instrument Acoustics</strong></td>
        <td>None (Silent Photos)</td>
        <td>Rare Academic Recordings</td>
        <td>None</td>
        <td><strong>Live Touch Web Audio DSP Synthesizer</strong></td>
      </tr>
      <tr>
        <td><strong>Geographic Lineages</strong></td>
        <td>Isolated Point Pins</td>
        <td>State-by-State Folders</td>
        <td>Shipping Postal Codes</td>
        <td><strong>Border-Agnostic Cultural DNA Heatmap</strong></td>
      </tr>
      <tr>
        <td><strong>Marginalized Maker Access</strong></td>
        <td>No Maker Linkage</td>
        <td>Archival Only</td>
        <td>Requires Smartphone &amp; English</td>
        <td><strong>Zero-Smartphone Dialpad IVR (Bhashini)</strong></td>
      </tr>
      <tr class="highlight">
        <td><strong>Artisan Wage Protection</strong></td>
        <td>None</td>
        <td>None</td>
        <td>Race to Bottom Price Slashing</td>
        <td><strong>Statutory Living-Wage Floor (&#8377;43.75/hr)</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ========================================================================= -->
  <!-- PAGE 2: DIRECTOR'S CUT SCRIPT (SCENES 1 TO 3) -->
  <!-- ========================================================================= -->
  <h2 class="section-heading"><span class="num">3</span> Complete Director's Cut Screenplay (Part 1: Scenes 1 &ndash; 3)</h2>

  <table class="script-table">
    <thead>
      <tr>
        <th class="col-time">Time</th>
        <th class="col-action">Screen Recording Actions (What to Show &amp; Click)</th>
        <th class="col-speech">Verbatim Spoken Voiceover (Read with Passion)</th>
      </tr>
    </thead>
    <tbody>

      <!-- SCENE 1 -->
      <tr>
        <td class="col-time">0:00 &ndash; 0:35<br><span style="font-size:7pt; color:#64748b;">(35 sec)</span></td>
        <td class="col-action">
          <div class="action-header">
            <span>SCENE 1: The Problem &amp; Vision</span>
          </div>
          <ul class="action-steps">
            <li><strong>0:00</strong>: Start on unauthenticated Home / Explorer Shell at <code>/explore</code>.</li>
            <li><strong>0:10</strong>: Split or pan briefly to an authentic craft photo (e.g. Gorakhpur Terracotta Handi or Chanderi silk).</li>
            <li><strong>0:20</strong>: Pan over to the <strong>Bharat Heritage Atlas</strong> showing the map of India.</li>
            <li><strong>0:28</strong>: Transition to the master header logo: <em>"ShilpSetu: Ministry of Social Justice &amp; Empowerment / AICTE PS 26197"</em>.</li>
          </ul>
        </td>
        <td class="col-speech">
          <div class="speech-bubble">
            <em class="stage-dir">[Tone: Serious, urgent, visionary. Start at a measured, confident pace.]</em>
            "India is home to over <strong class="voice-punch">five thousand years</strong> of continuous artistic civilization. <span class="pause">[0.5s pause]</span> Yet today, our sacred cultural heritage faces a devastating double crisis.
            <br><br>
            Ancient musical instruments and temple motifs remain <strong class="voice-punch">frozen in silent stone carvings</strong>, while millions of traditional grassroots artisans are pushed to the economic margins by algorithms that treat sacred heritage as disposable commodities.
            <br><br>
            <em class="stage-dir">[Inspiring shift]</em>
            Welcome to <strong class="voice-punch">ShilpSetu and the Bharat Cultural Genome</strong> &mdash; India's first autonomous, AI-powered Cultural Intelligence and Living Artisan Ecosystem."
          </div>
        </td>
      </tr>

      <!-- SCENE 2 -->
      <tr>
        <td class="col-time">0:35 &ndash; 1:15<br><span style="font-size:7pt; color:#64748b;">(40 sec)</span></td>
        <td class="col-action">
          <div class="action-header">
            <span>SCENE 2: Cultural Genome Map</span>
            <span class="key-badge">Keys 1, 3, 5</span>
          </div>
          <ul class="action-steps">
            <li><strong>0:35</strong>: Switch to <code>/genome.html</code>. Press <span class="key-badge">1</span> to showcase all 10 cultural layers with Survey of India boundaries.</li>
            <li><strong>0:48</strong>: Press <span class="key-badge">3</span> (Warli Painting). Watch glowing cyan-amber <strong>Cultural DNA Heatmap</strong> link Maharashtra to Gujarat (Pithora), Odisha (Saura), and MP (Gond).</li>
            <li><strong>1:02</strong>: Press <span class="key-badge">5</span> (Kathak Timeline). Drag the slider across <strong>1200 &rarr; 1500 &rarr; 1800 &rarr; 1947 &rarr; Today</strong> as the camera flies across cities.</li>
          </ul>
        </td>
        <td class="col-speech">
          <div class="speech-bubble">
            <em class="stage-dir">[Tone: Analytical, astonished, pointing out breakthroughs.]</em>
            "We begin with the <strong class="voice-punch">Bharat Cultural Genome Map</strong>, operating completely offline on native vector layers.
            <br><br>
            Culture does not stop at modern political boundaries. <span class="pause">[0.4s pause]</span> When we explore Warli art, our <strong class="voice-punch">Cultural DNA Algorithm</strong> illuminates its kinship with Pithora in Gujarat, Saura in Odisha, and Gond in Madhya Pradesh &mdash; mapping shared tribal motifs, natural pigments, and centuries of migration.
            <br><br>
            Through our <strong class="voice-punch">Spatial-Temporal Timeline</strong>, students can trace the 800-year evolution of Kathak &mdash; from temple storytelling in Braj, through Mughal royal courts, to the global concert stages of today."
          </div>
        </td>
      </tr>

      <!-- SCENE 3 -->
      <tr>
        <td class="col-time">1:15 &ndash; 1:55<br><span style="font-size:7pt; color:#64748b;">(40 sec)</span></td>
        <td class="col-action">
          <div class="action-header">
            <span>SCENE 3: Naad-Virasat (Audio DSP)</span>
          </div>
          <ul class="action-steps">
            <li><strong>1:15</strong>: Navigate to <code>/explore</code> &rarr; <strong>Naad Virasat</strong> tab (or <code>/?view=naad-virasat</code>).</li>
            <li><strong>1:20</strong>: Detect the 12th-century Hoysala temple relief of <strong>सरस्वती वीणा (Saraswati Vina)</strong> from Belur.</li>
            <li><strong>1:27</strong>: Click <strong>"Lift Out &amp; Enter Playing Studio"</strong> &mdash; strum the strings directly over the stone relief; note the granite pulse.</li>
            <li><strong>1:38</strong>: Click <strong>"Evolutionary Lineage" (कालक्रम)</strong> &mdash; toggle <strong>Ancient Approximation</strong> vs <strong>Modern Thanjavur Saraswati Vina</strong>.</li>
            <li><strong>1:48</strong>: Briefly flash <strong>Evidence &amp; Provenance</strong> drawer showing <em>Natyashastra</em>, <em>Sangita Ratnakara</em>, and ASI citations.</li>
          </ul>
        </td>
        <td class="col-speech">
          <div class="speech-bubble">
            <em class="stage-dir">[Tone: Mesmerizing, reverent, showcasing cutting-edge DSP.]</em>
            "Next is our most poetic breakthrough: <strong class="voice-punch">Naad-Virasat &mdash; Aural Heritage Reconstruction</strong>.
            <br><br>
            We don't merely look at sculptures; <strong class="voice-punch">we give voice to stone</strong>. <span class="pause">[0.4s pause]</span> Here, our vision pipeline identifies a 12th-century Hoysala relief of <strong class="voice-punch">Goddess Saraswati holding the sacred Vina</strong> from Belur temple.
            <br><br>
            In the Playing Studio, we physically synthesize its acoustic vibrations using fractional-delay string modeling and monolithic mandapa convolution reverb.
            <br><br>
            Our <strong class="voice-punch">Evolutionary Lineage A/B Comparison</strong> lets users hear how this ancient temple form evolved over 800 years into the modern <strong class="voice-punch">Thanjavur Saraswati Vina</strong> &mdash; with an <strong class="voice-punch">Evidence and Provenance drawer</strong> anchoring every tone in the <em>Natyashastra</em>, <em>Sangita Ratnakara</em>, and ASI surveys."
          </div>
        </td>
      </tr>

    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ========================================================================= -->
  <!-- PAGE 3: DIRECTOR'S CUT SCRIPT (SCENES 4 TO 6) -->
  <!-- ========================================================================= -->
  <h2 class="section-heading"><span class="num">3</span> Complete Director's Cut Screenplay (Part 2: Scenes 4 &ndash; 6)</h2>

  <table class="script-table">
    <thead>
      <tr>
        <th class="col-time">Time</th>
        <th class="col-action">Screen Recording Actions (What to Show &amp; Click)</th>
        <th class="col-speech">Verbatim Spoken Voiceover (Read with Passion)</th>
      </tr>
    </thead>
    <tbody>

      <!-- SCENE 4 -->
      <tr>
        <td class="col-time">1:55 &ndash; 2:30<br><span style="font-size:7pt; color:#64748b;">(35 sec)</span></td>
        <td class="col-action">
          <div class="action-header">
            <span>SCENE 4: Motif Decoder &amp; Student Lens</span>
          </div>
          <ul class="action-steps">
            <li><strong>1:55</strong>: Open <strong>Motif Scanner</strong> via login screen or header button.</li>
            <li><strong>2:05</strong>: Trigger photo scan of Gorakhpur terracotta peacock motif with <strong>Golden Reticle Viewfinder</strong>.</li>
            <li><strong>2:15</strong>: Toggle <strong>"Student Lens" (छात्र लेंस)</strong>. Show source confidence badges, primary references, and click <strong>"Cite this"</strong> to reveal the permanent archival link.</li>
          </ul>
        </td>
        <td class="col-speech">
          <div class="speech-bubble">
            <em class="stage-dir">[Tone: Clear, scholarly, emphasizing honesty &amp; privacy.]</em>
            "Our <strong class="voice-punch">Cultural Motif Decoder</strong> elevates computer vision into an honest scholar.
            <br><br>
            Unlike commercial AI that hallucinates fake centuries or fictional GI certificates, ShilpSetu operates on a verified, audited knowledge base.
            <br><br>
            Through the <strong class="voice-punch">Student Lens</strong>, researchers and university students inspect primary archaeological citations and generate standardized academic citations with a single click &mdash; complete with immutable archival permalinks, all processed with zero-login DPDP privacy."
          </div>
        </td>
      </tr>

      <!-- SCENE 5 -->
      <tr>
        <td class="col-time">2:30 &ndash; 3:05<br><span style="font-size:7pt; color:#64748b;">(35 sec)</span></td>
        <td class="col-action">
          <div class="action-header">
            <span>SCENE 5: The Artisan Economic Engine</span>
          </div>
          <ul class="action-steps">
            <li><strong>2:30</strong>: In <code>/genome.html</code>, click <strong>"Support this Living Tradition"</strong> &rarr; opens artisan craft listing.</li>
            <li><strong>2:40</strong>: Cut quickly to the <strong>Keypad Phone Simulator</strong>: show an artisan dialing IVR and speaking Hindi/Bhojpuri to catalog a craft via Bhashini.</li>
            <li><strong>2:52</strong>: Show <strong>Vyapar-Niti Fair Pricing Card</strong>: point to statutory living-wage floor (&#8377;43.75/hr) and <strong>ONDC Publish Badge</strong>.</li>
          </ul>
        </td>
        <td class="col-speech">
          <div class="speech-bubble">
            <em class="stage-dir">[Tone: Passionate, pragmatic, socially impactful.]</em>
            "Crucially, heritage cannot survive if its makers starve. <span class="pause">[0.4s pause]</span>
            <br><br>
            ShilpSetu bridges cultural research directly to grassroots economic survival. For artisans without smartphones or literacy, our <strong class="voice-punch">Zero-Smartphone Voice-IVR Engine</strong> lets them catalog crafts over a standard keypad phone call in their native dialect.
            <br><br>
            Our <strong class="voice-punch">Vyapar-Niti Pricing Engine</strong> guarantees a statutory living wage, protecting artisans from middleman exploitation before publishing directly onto the national ONDC network."
          </div>
        </td>
      </tr>

      <!-- SCENE 6 -->
      <tr>
        <td class="col-time">3:05 &ndash; 3:30<br><span style="font-size:7pt; color:#64748b;">(25 sec)</span></td>
        <td class="col-action">
          <div class="action-header">
            <span>SCENE 6: Sovereign Passport &amp; Conclusion</span>
          </div>
          <ul class="action-steps">
            <li><strong>3:05</strong>: Open <code>/verify/CRAFT-NBCFDC-002</code> showing the <strong>Digital GI Sovereign Seal</strong> with DCT steganographic watermark.</li>
            <li><strong>3:15</strong>: Pan back to the grand view of the Cultural Genome Map with festive ribbons and artisan clusters glowing across India.</li>
            <li><strong>3:26</strong>: End on full screen title card: <em>"ShilpSetu: Preserving Heritage &bull; Empowering Artisans &bull; Viksit Bharat 2047"</em>.</li>
          </ul>
        </td>
        <td class="col-speech">
          <div class="speech-bubble">
            <em class="stage-dir">[Tone: Inspiring, patriotic, commanding final call to action.]</em>
            "Every authentic craft carries an invisible, tamper-proof 2D-DCT watermark &mdash; a sovereign digital passport linking physical buyer to living maker.
            <br><br>
            From temple carvings frozen in stone to the hands of rural artisans weaving our future &mdash; <strong class="voice-punch">ShilpSetu protects India's rich cultural memory and builds a self-reliant Viksit Bharat</strong>. <span class="pause">[0.5s pause]</span>
            <br><br>
            Jai Hind. Thank you."
          </div>
        </td>
      </tr>

    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ========================================================================= -->
  <!-- PAGE 4: RECORDING INSTRUCTIONS & HOTKEY CHEAT-SHEET -->
  <!-- ========================================================================= -->
  <h2 class="section-heading"><span class="num">4</span> 5-Minute Practical Screen Recording Checklist</h2>

  <div class="checklist-grid">
    <div class="checklist-card">
      <h4>🖥️ Browser Setup &amp; Window Framing</h4>
      <ul>
        <li>Open Chrome or Edge in a maximized <strong>1920 &times; 1080 (16:9)</strong> window.</li>
        <li>Set browser zoom to <strong>100%</strong> (press <code>Ctrl + 0</code>).</li>
        <li>Hide the bookmarks bar (press <code>Ctrl + Shift + B</code>) for a clean presentation canvas.</li>
        <li>Pre-open the following tabs in order:
          <ol style="padding-left: 14px; margin-top: 3px; font-size: 7.2pt;">
            <li><code>http://localhost:5173/explore</code> (Public Explorer)</li>
            <li><code>http://localhost:5173/genome.html?demo=1</code> (Cultural Genome Map)</li>
            <li><code>http://localhost:5173/?view=naad-virasat</code> (Naad-Virasat Studio)</li>
            <li><code>http://localhost:5173/?view=storefront</code> (Artisan Storefront)</li>
            <li><code>http://localhost:5173/verify/CRAFT-NBCFDC-002</code> (GI Passport)</li>
          </ol>
        </li>
      </ul>
    </div>

    <div class="checklist-card">
      <h4>🎙️ Voiceover &amp; Audio Recording</h4>
      <ul>
        <li>Use a USB microphone or headset in a quiet room with minimal echo.</li>
        <li>Keep recording software (OBS Studio or Windows Game Bar <code>Win + G</code>) set to <strong>1080p 60fps, 320kbps AAC Audio</strong>.</li>
        <li>Speak in a relaxed, confident cadence at ~135&ndash;140 words per minute.</li>
        <li>Observe the <code>[pause]</code> markers in the script &mdash; deliberate 0.5-second pauses give the judges time to absorb the visual animations.</li>
        <li>Keep background music faint (10&ndash;12% volume) with an ambient tanpura or flute drone so your voice stays crystal clear.</li>
      </ul>
    </div>
  </div>

  <h2 class="section-heading" style="margin-top: 10px;"><span class="num">5</span> Cultural Genome Map Live Demo Hotkeys (Quick Reference)</h2>

  <table style="width: 100%; border-collapse: collapse; font-size: 7.6pt; margin-top: 4px;">
    <thead>
      <tr style="background: #0f172a; color: white;">
        <th style="padding: 4px 7px; width: 9%;">Key</th>
        <th style="padding: 4px 7px; width: 28%;">Feature / Scene Name</th>
        <th style="padding: 4px 7px; width: 63%;">What Happens on Screen (Automated &amp; Deterministic)</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">1</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">All 10 Cultural Layers</td>
        <td style="padding: 4px 7px;">Resets view to pan-India extent; activates all 10 layer chips (Dance, Music, Crafts, Architecture).</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">2</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Warli Painting Deep Dossier</td>
        <td style="padding: 4px 7px;">Flies camera to Dahanu, Maharashtra; opens side dossier with Devanagari narrative &amp; MoSJE tag.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">3</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Cultural DNA Similarity Heatmap</td>
        <td style="padding: 4px 7px;">Illuminates glowing organic blobs linking Warli to Pithora (GJ), Saura (OD), and Gond (MP) with weights.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">4</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Oral Lore &amp; Web Speech Narration</td>
        <td style="padding: 4px 7px;">Opens Warli marriage lore story card; triggers bilingual audio narration with source citation.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">5</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Kathak 800-Year Timeline Slider</td>
        <td style="padding: 4px 7px;">Animates spatial-temporal evolution of Kathak across 1200 &rarr; 1500 &rarr; 1800 &rarr; 1947 &rarr; Today.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">6</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Unknown India Discovery Drawer</td>
        <td style="padding: 4px 7px;">Filters rarity &ge; 4 endangered traditions; opens "Did You Know?" curiosity cards.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">7</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Curated Heritage Journey Planner</td>
        <td style="padding: 4px 7px;">Draws SVG trail from Mumbai &rarr; Nashik &rarr; Chhatrapati Sambhajinagar with workshop stops.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">8</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Festival Pulse Calendar Ribbon</td>
        <td style="padding: 4px 7px;">Expands 12-month calendar ribbon linking living craft cycles to seasonal sacred festivals.</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">9</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Ask the Atlas Bilingual Search</td>
        <td style="padding: 4px 7px;">Opens real-time smart search modal with instant camera flight to any tradition in Hindi/English.</td>
      </tr>
      <tr style="background: #f1f5f9;">
        <td style="padding: 4px 7px; font-weight: 700; color: #b45309;"><span class="key-badge">Esc</span></td>
        <td style="padding: 4px 7px; font-weight: 600;">Close Overlays / Clear View</td>
        <td style="padding: 4px 7px;">Closes any active modal, drawer, or search overlay cleanly back to full map view.</td>
      </tr>
    </tbody>
  </table>

  <div class="footer-note">
    <strong>Smart India Hackathon 2026 &bull; Problem Statement 26197 (Heritage &amp; Culture)</strong> &bull; Generated autonomously for Team ShilpSetu &bull; All rights reserved &bull; MoSJE &amp; AICTE MIC Student Innovation
  </div>

</body>
</html>
"""

def main():
    print(f"Writing updated 4-page HTML speech & script to: {HTML_OUT}")
    with open(HTML_OUT, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    ]
    browser_exe = None
    for p in edge_paths:
        if os.path.exists(p):
            browser_exe = p
            break
            
    if not browser_exe:
        print("ERROR: Neither Edge nor Chrome found.")
        return 1

    cmd = [
        browser_exe,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={PDF_OUT}",
        f"file:///{str(HTML_OUT).replace(os.sep, '/')}"
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(PDF_OUT) and os.path.getsize(PDF_OUT) > 0:
        print(f"SUCCESS! 4-page PDF successfully compiled: {PDF_OUT} ({os.path.getsize(PDF_OUT):,} bytes)")
        return 0
    else:
        print(f"FAILED: {res.stderr}")
        return 1

if __name__ == "__main__":
    exit(main())
