# ShilpSetu AI (शिल्पसेतु AI)
### Autonomous AI-Driven Smart Cataloging & Market Linkage System
**Client**: Ministry of Social Justice and Empowerment (MoSJE), Department of Social Justice and Empowerment, Government of India  
**Target Beneficiaries**: Marginalized Artisans, Weavers, and Micro-Entrepreneurs (NBCFDC & NSFDC)  

---

## 1. Executive Summary & Problem Statement

The Government of India provides financial support and term loans to marginalized micro-entrepreneurs and artisans to set up handicraft and handloom units. While periodic exhibitions (e.g., *Shilp Samagam*, *Surajkund Mela*, *Dilli Haat*) provide intermittent income spikes, artisans lack year-round digital market access. 

**Core Friction Points Solved**:
1. **Low Digital Literacy**: Zero text entry required. The entire digitization pipeline is 100% voice-driven and icon-based.
2. **Poor Photography Equipment**: Inadequate lighting and cluttered rural workshops are transformed into clean, 6500K daylight-balanced e-commerce catalog assets with natural contact drop shadows on a standard off-white (`#F8F9FA`) square canvas.
3. **Predatory Middleman Price Exploitation**: Proprietary statutory cost-plus living-wage formulation protects artisan labor floor (₹120/hr) and computes multi-channel tiers for B2C, wholesale B2B, and Government e-Marketplace (GeM) public procurement.
4. **Market Discovery**: Direct emission of Beckn Protocol Retail v1.2.0 Open Commerce schemas for discovery on ONDC buyer applications (Paytm, Pincode, Magicpin) without intermediaries.

---

## 2. System Architecture & 3-Tap Flow

```
[ 1. SNAP ]                      [ 2. SPEAK ]                    [ 3. PUBLISH ]
Camera Viewfinder               Giant 96px Pulsing Mic          Interactive Before/After Slider
Silhouette Guides (Pottery,      Regional Spoken Guidance        Statutory Living-Wage Pricing
Saree, Idol, Painting)       --> Live Web Audio Waveform     --> Bilingual Listing (EN & HI)
Tactile 72px Shutter             Bhashini ASR / Whisper          1-Tap Broadcast to ONDC & GeM
```

### 4 Breakthrough Ministry Showcase Innovations:
1. **AI Reel Storyteller**: 15-second 9:16 vertical video reel with Ken Burns pan-zoom, artisan heritage voiceover, ambient sitar/flute soundtrack, and dynamic ONDC scannable QR code.
2. **Bargain Guard**: Autonomous voice negotiator that intercepts lowball wholesale inquiries, alerts the artisan in Hindi about fair labor loss, and generates polished corporate B2B counter-offers.
3. **Steganographic Digital GI Watermark**: 2D Discrete Cosine Transform (DCT) frequency embedding of 64-bit payload `[MoSJE-Beneficiary-ID | Cluster-PIN | GI-Tag-Serial]` into the image luminance channel to combat industrial powerloom counterfeiting.
4. **ONDC Beckn Retail v1.2 Gateway**: Serialization into open network commerce JSON schemas ready for instant staging registry discovery.

---

## 3. Mathematical Models & Statutory Formulations

### Statutory Fair-Trade Living-Wage Formula:
$$\text{Labor Cost} = T_{\text{hours}} \times W_{\text{fair}}$$
$$\text{Overhead Cost} = 0.10 \times (C_{\text{raw}} + \text{Labor Cost})$$
$$\text{Direct Cost Baseline} = C_{\text{raw}} + \text{Labor Cost} + \text{Overhead Cost}$$

Where:
- $W_{\text{fair}} = ₹120.00/\text{hour}$ (Statutory skilled artisan fair living wage floor).
- $C_{\text{raw}}$: Raw material cost in INR.
- $C_{\text{overhead}}$: Workshop overhead, electricity, and tool depreciation (10%).

### Multi-Channel Pricing Tiers:
- **Direct-to-Consumer (B2C Retail)**:
  $$\text{Price}_{B2C} = \text{Direct Cost} \times M_{\text{craft}}$$
  *(Where $M_{\text{craft}}$ is craft complexity multiplier: Terracotta = 1.25, Handloom Silk = 1.45, Dhokra Brass = 1.50, Madhubani = 1.40).*
- **Wholesale / B2B Bulk Order (Min. 10 units)**:
  $$\text{Price}_{B2B} = \text{Direct Cost} \times \left(1 + (M_{\text{craft}} - 1) \times 0.40\right)$$
- **GeM (Government e-Marketplace) Institutional Tender**:
  $$\text{Price}_{GeM} = \text{Direct Cost} \times 1.15$$
  *(Conforms to statutory 15% public procurement margin).*
- **Underpricing Guard**:
  If an artisan's expected price $< \text{Direct Cost}$, an auditory alert in Hindi and high-contrast visual alert flags that labor costs are compromised.

---

## 4. Repository Structure

```
c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint, CORS, static mounts
│   │   ├── config.py                # MoSJE constants, API keys, paths
│   │   ├── models/
│   │   │   ├── schemas.py           # Pydantic v2 schemas
│   │   │   └── mock_data.py         # Authentic Indian craft fixtures (NBCFDC & NSFDC)
│   │   ├── services/
│   │   │   ├── image_studio.py      # ISNet/u2net segmentation, 10% cushion, drop shadow
│   │   │   ├── catalog_engine.py    # Bhashini ASR + Gemini 2.5 Flash multimodal cataloger
│   │   │   ├── pricing_engine.py    # Statutory fair-wage formulation & channel tiers
│   │   │   ├── reel_generator.py    # 15s 9:16 vertical video reel engine
│   │   │   ├── negotiator.py        # Bargain Guard B2B autonomous voice negotiator
│   │   │   ├── watermark.py         # Steganographic Digital GI DCT watermark
│   │   │   └── ondc_adapter.py      # Beckn Protocol Retail v1.2.0 schema emitter
│   │   └── static/
│   │       ├── audio/               # Raag Bhupali flute/sitar ambient soundtrack
│   │       └── samples/             # Authentic sample artisan craft images
│   ├── requirements.txt
│   ├── Dockerfile
│   └── scripts/
│       ├── test_all_services.py     # Automated unit & integration test suite
│       ├── generate_sample_crafts.py# Visual craft asset generator
│       └── download_stitch_assets.py# Stitch assets and screens downloader
├── mobile_flutter/                  # Production-Grade Flutter Mobile App
│   ├── pubspec.yaml                 # Flutter dependencies (google_fonts, qr_flutter, etc.)
│   ├── assets/images/               # Downloaded Stitch high-res assets & portraits
│   └── lib/
│       ├── main.dart                # Mobile application shell & bottom nav
│       ├── theme/app_theme.dart     # Stitch Vernacular Craft theme tokens & palette
│       ├── models/                  # Craft & Pricing domain models
│       ├── services/api_service.dart# FastAPI client & offline fallback cache
│       ├── widgets/app_header.dart  # Vernacular header with Shanti Devi avatar & verified badge
│       └── screens/
│           ├── home_command_center_screen.dart # Stitch Screen 1: Command Center
│           ├── smart_viewfinder_screen.dart    # Stitch Screen 2: Smart Viewfinder
│           ├── voice_catalog_screen.dart       # Stitch Screen 3: Multilingual Voice Mic
│           ├── pricing_publish_screen.dart     # Stitch Screen 4: Fair Wage Pricing
│           ├── reel_storyteller_sheet.dart     # 15s AI Reel Bottom Sheet
│           ├── bargain_guard_sheet.dart        # Bargain Guard Voice Negotiator Sheet
│           └── digital_gi_sheet.dart           # Steganographic Digital GI Sheet
├── stitch_assets/                   # Google Stitch Project 14738180325558078307
│   ├── design_system.md             # Stitch Design System tokens & typography
│   ├── images/                      # 8 Original high-res screen previews & craft assets
│   └── code/                        # 4 Complete responsive HTML/Tailwind templates
├── frontend/                        # React/Vite Mobile-First Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomeCommandCenter.jsx# Stitch Screen 1: Command Center & earnings banner
│   │   │   ├── CameraViewfinder.jsx # Stitch Screen 2: Viewfinder & framing guides
│   │   │   ├── VoiceRecorder.jsx    # Stitch Screen 3: 96px pulsating mic & waveform
│   │   │   ├── StudioReviewCard.jsx # Stitch Screen 4: Interactive Before/After slider
│   │   │   ├── PricingCard.jsx      # Stitch Screen 4: Fair wage cost bar & tiers
│   │   │   ├── ReelPreviewModal.jsx # Breakthrough 1: 15s vertical video player
│   │   │   ├── BargainGuard.jsx     # Breakthrough 2: B2B voice negotiator simulator
│   │   │   ├── DigitalGIWatermarkModal.jsx # Breakthrough 3: DCT watermark inspector
│   │   │   └── ONDCExportBadge.jsx  # Breakthrough 4: Beckn v1.2 JSON schema & publish
│   │   ├── context/
│   │   │   └── ArtisanContext.jsx   # Global state machine & audio synthesis
│   │   ├── services/
│   │   │   └── api.js               # Frontend API client
│   │   ├── App.jsx                  # 4-stage flow controller & navigation
│   │   ├── index.css                # Tailwind directives & MoSJE palette
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.11+
- Node.js v18+

### Step 1: Install Backend & Run Server
```bash
# In project root
cd backend
python -m pip install -r requirements.txt

# Run automated tests to verify all 7 backend services
python scripts/test_all_services.py

# Launch FastAPI backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Interactive API Swagger Documentation*: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Step 2: Install Frontend & Launch Web App
```bash
# In a second terminal
cd frontend
npm install
npm run dev
```
*Web Application URL*: [http://localhost:5173](http://localhost:5173)

### Step 3: Run Flutter Mobile Application
```bash
# In a third terminal (requires Flutter SDK)
cd mobile_flutter
flutter pub get
flutter run
```
*Supports*: Android, iOS, Chrome Web, and Windows Desktop targets.

---

## 6. Zero-Fail Hackathon Mode

The system is engineered to run flawlessly even without external API credentials or during connectivity interruptions:
- **No Gemini API Key**: Seamlessly engages the built-in intelligent heuristic engine with authentic craft fixtures (Chanderi Silk Saree, Gorakhpur Terracotta Urn, Bastar Dhokra Bell Metal, Madhubani Folk Art).
- **No Bhashini API Key**: Automatically falls back to browser Web Speech Recognition and client-side synthesized voice.
- **No FFmpeg in Host PATH**: Backend synthesizes video frames with OpenCV and Pillow while the frontend vertical reel player provides real-time ambient Raag Bhupali flute/sitar audio playback and Ken Burns synchronization.

---

## 7. License & MoSJE Attribution
Engineered for the **Ministry of Social Justice and Empowerment (MoSJE)**, Department of Social Justice and Empowerment, Government of India.
Developed to empower **NBCFDC** (National Backward Classes Finance & Development Corporation) and **NSFDC** (National Scheduled Castes Finance and Development Corporation) artisan collectives across India.
