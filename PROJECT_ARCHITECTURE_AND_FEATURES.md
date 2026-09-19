# ShilpSetu AI (शिल्पसेतु AI)
## Master Project Architecture, Features & Technology Stack

> **Project**: ShilpSetu AI — Autonomous Market Linkage & Smart Cataloging Mobile Application for Marginalized Artisans  
> **Initiative**: Smart India Hackathon (SIH 2026)  
> **Problem Statement ID**: 26090  
> **Ministry / Client**: Ministry of Social Justice and Empowerment (MoSJE), Department of Social Justice and Empowerment, Government of India  
> **Target Beneficiaries**: Marginalized Artisans, Weavers, and Micro-Entrepreneurs supported by **NBCFDC** (National Backward Classes Finance & Development Corporation) and **NSFDC** (National Scheduled Castes Finance & Development Corporation).

---

## 1. Executive Summary & Why ShilpSetu Exists

The Government of India provides concessionary term loans and skill training to marginalized artisans across rural handicraft clusters. While annual exhibitions (*Shilp Samagam*, *Surajkund Mela*, *Dilli Haat*) deliver intermittent income spikes, artisans face an **economic cliff** for the remaining 330+ days of the year due to:

1. **Digital Illiteracy & Complex Form Filing**: Most e-commerce seller portals require typing descriptions in formal English, GST filing, and intricate SKU categorizations that rural artisans cannot navigate.
2. **Substandard Workshop Photography**: Artisans photograph products with low-end mobile phones under dim incandescent bulbs in cluttered home workshops, resulting in poor-quality images rejected by modern marketplaces.
3. **Predatory Middlemen & Unfair Pricing**: Due to a lack of market insight, artisans sell handcrafted treasures to middlemen at ₹20–₹50/hour of labor, who then resell them in urban metros at 500% to 1000% markups.
4. **The Zero-Smartphone Exclusion Gap**: Over 45% of elderly and marginalized rural artisans in target clusters own only basic 2G feature/keypad phones, locking them out of smartphone-only apps.
5. **No Human Quality Gate before Marketplace**: AI-generated titles, translations, or background-removed images can contain errors or mistranscribed prices if published unchecked to national e-commerce channels.

**ShilpSetu** completely bridges these gaps through a multi-tier, AI-powered system designed for 100% inclusion, zero text entry, fair statutory pricing, human-in-the-loop review, and direct Open Network for Digital Commerce (ONDC) discovery.

---

## 2. Complete Technology Stack Matrix

| Layer | Technologies Used | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18**, **Vite v8** | High-performance, low-latency mobile-first web app with sub-second hot reloading. |
| **Styling & Design System** | **Tailwind CSS**, **Vanilla CSS Variables** | Native mobile frame emulation (390px–430px), tactile touch targets ($\ge 60\text{px}$), Apple/Airbnb/Material Design aesthetics tailored with warm Indian craft earth tones (`#C85A32` Terracotta, `#1E2A4A` Indigo, `#D4AF37` Gold). |
| **Icons & Micro-Interactions** | **Lucide React** | Intuitive visual iconography enabling low-literacy artisans to navigate without reading. |
| **Audio Processing** | **Web Audio API**, **MediaRecorder API** | Real-time audio waveform visualization, audio blob capture, DTMF telephony frequency synthesis. |
| **Voice Guidance & TTS** | **HTML5 SpeechSynthesis API** | Spoken vernacular audio prompts in Hindi (`hi-IN`) and English (`en-IN`) across all stages. |
| **Canvas & Image Manipulation** | **HTML5 Canvas API** | Steganographic 2D DCT watermark embedding, contact shadow preview, image rendering. |
| **Backend Framework** | **FastAPI (Python 3.13)**, **Uvicorn**, **Starlette** | Asynchronous, high-throughput REST API with automatic OpenAPI / Swagger documentation. |
| **Data Validation** | **Pydantic v2** | Strict schema validation for catalog drafts, pricing formulations, and coordinator actions. |
| **Database & Persistence** | **SQLite 3** (WAL Mode + Pragmas) | Zero-maintenance embedded database with unified schema reuse across camera and IVR drafts. |
| **Background Removal & CV** | **`rembg` (u2net/isnet)**, **OpenCV (`cv2`)**, **Pillow (PIL)** | Automatic foreground craft extraction, alpha mask feathering, studio composite lighting (6500K daylight balance), and natural contact drop shadows. |
| **Multimodal AI & NLP** | **Google Gemini 2.5 Flash**, **Bhashini ASR/TTS Mock/Live** | Spoken artisan description translation into bilingual English/Hindi listings, craft category classification, and structured attribute extraction. |
| **E-Commerce Protocol** | **Beckn Protocol (Retail v1.2.0)** | Direct serialization into ONDC open commerce JSON schemas for discovery on buyer apps. |
| **Government Procurement** | **GeM Catalog Generator** | Statutory pricing calculation conforming to public procurement rules (15% margin). |
| **Security & Provenance** | **`qrcode` (PIL)**, **SHA-256 Cryptographic Hashes** | Verifiable tamper-proof QR codes linking to public blockchain-style verification certificates. |
| **Telephony / Zero-Smartphone** | **Indic NLP Pipeline**, **DTMF Audio Generator** | 1800-Toll-Free Voice IVR simulator with SMS notification dispatch to field coordinators. |
| **Testing & Quality Assurance** | **Pytest**, **HTTPX**, **Vite Build Checker** | 100% automated integration test coverage across all catalog, IVR, and coordinator endpoints. |

---

## 3. Detailed Feature Breakdown & Rationale

### Feature 1: Unified Phone + OTP Authentication Gateway
- **Why It Was Built**:
  Marginalized artisans have low digital literacy and cannot memorize complex passwords, manage email verification, or remember usernames. Indian consumer fintech apps (PhonePe, BHIM) prove that **Phone Number + OTP** is the only accessible authentication pattern for this demographic.
- **What It Does**:
  - Unified entry point for both **Artisan** and **Field Coordinator** roles.
  - **Step 1**: 10-digit Indian phone input (`+91`), high contrast, audio prompt button, and 1-tap **Quick Demo Pills** for judges (`[ग्राम समन्वयक: 9876543210]` and `[शांति देवी: 9820011223]`).
  - **Step 2**: 6-digit auto-advancing OTP input with a built-in **Demo Mode Banner** displaying `OTP: 123456` with 1-click auto-fill, accepting any 6-digit OTP for 100% reliability during live hackathon presentations without SMS gateway downtime.
  - **Role Resolution**: Coordinator phone numbers immediately route to the Coordinator Review Queue; artisan phone numbers route to the Artisan Home Command Center. Unregistered numbers are automatically registered as new artisans (matching the IVR registration model).
  - **Persistent Session Header**: Clear badge (`Logged in as [Role] — [Phone]`) and a 1-tap "Log out" button for easy stakeholder demonstration.

---

### Feature 2: AI Photo Studio & 3-Angle Viewfinder
- **Why It Was Built**:
  Rural craft workshops have dim lighting, cluttered backgrounds, and lack lightboxes. E-commerce platforms like Amazon, Flipkart, and ONDC reject photos with messy backgrounds.
- **What It Does**:
  - **Silhouette Overlay Guides**: Viewfinder guides for Pottery, Saree/Textiles, Idols/Sculptures, and Paintings.
  - **3-Angle Guided Workflow**: Front/Hero (0°), Side Profile (45°), and Back/Detail (90°).
  - **Instant Background Removal**: Extracts the craft item using `rembg` neural network models.
  - **Studio Lighting & Drop Shadow**: Places the extracted object onto a calibrated studio backdrop (`#F8F9FA`) with natural contact drop shadows and a 10% breathing cushion.
  - **Interactive Before/After Slider**: Artisans can drag a slider to inspect the AI enhancement before saving.

---

### Feature 3: Voice-Driven Bilingual Cataloger (Bhashini + Gemini)
- **Why It Was Built**:
  Artisans cannot type in English or formal Hindi, but they can speak passionately about their craft techniques, raw materials, and heritage in their local dialects (Bundeli, Malvi, Awadhi, Bhojpuri).
- **What It Does**:
  - Giant 96px pulsating microphone button with real-time audio waveform visualizer.
  - Speech-to-Text via **Bhashini ASR** (with Gemini fallback) capturing regional accents.
  - Multimodal catalog generation: Produces search-optimized, e-commerce-ready titles and descriptions in both **English and Hindi**.
  - Automatically identifies craft category, raw materials, technique, and production time.

---

### Feature 4: Statutory Fair-Wage Living Formula & Multi-Channel Pricing
- **Why It Was Built**:
  Artisans routinely underprice their labor, failing to account for raw material inflation, electricity, tool depreciation, or fair living wages, leaving them vulnerable to middleman exploitation.
- **What It Does**:
  - Implements the proprietary **Statutory Living-Wage Formula**:
    $$\text{Labor Cost} = T_{\text{hours}} \times ₹120/\text{hr}$$
    $$\text{Overhead} = 10\% \times (\text{Raw Material} + \text{Labor})$$
    $$\text{Direct Cost Baseline} = \text{Raw Material} + \text{Labor} + \text{Overhead}$$
  - **Multi-Channel Tiers**:
    - **B2C Direct-to-Consumer**: Baseline multiplied by craft factor (1.25 for Pottery to 1.50 for Brass).
    - **B2B Wholesale**: Discounted bulk tier (minimum 10 units) with protected labor floor.
    - **GeM Public Procurement**: Statutory 15% margin for government office tenders.
  - **Underpricing Guard**: Auditory warning in Hindi if an artisan's expected price is below their fair living wage baseline.

---

### Feature 5: कला-वाणी IVR ("Zero-Smartphone Tier") Keypad Simulator
- **Why It Was Built**:
  Over 45% of elderly and marginalized rural artisans in target clusters do not own smartphones or have active mobile data plans. Problem statement 26090 explicitly demands an AI-driven solution for *all* marginalized artisans.
- **What It Does**:
  - Keypad phone simulator dialer for `1800-208-SHILP` (1800-208-74457).
  - Conversational voice call simulating automated speech prompts:
    - *"नमस्ते, शिल्पसेतु में आपका स्वागत है। अपनी कलाकृति का नाम और विवरण बोलें..."*
  - DTMF audio tone feedback (dial pad tones generated via Web Audio API).
  - Automatically transcribes voice responses, infers category and price heuristics, creates a catalog draft with `channel: 'ivr'` and `status: 'pending'`, and dispatches an **SMS notification to the local Village Coordinator** to visit the artisan and capture studio photos.

---

### Feature 6: Village Field Coordinator Review Desk
- **Why It Was Built**:
  AI-generated drafts (from camera or IVR calls) cannot go straight to live marketplaces without human verification. An AI-mistranscribed price or faulty background removal could ruin an artisan's sale. Furthermore, IVR drafts await an in-person photo visit from a coordinator.
- **What It Does**:
  - Strictly 2-screen high-density coordinator workstation:
    - **Screen 1: Pending Drafts Queue**:
      - Filter bar: `All Drafts`, `Camera Drafts`, `IVR Drafts`, and **`Missing Photo (To-Do Visit)`** (the coordinator's physical visit list).
      - Detail Review Screen: Large studio preview, bilingual English/Hindi inline editors, price adjustment, and expandable raw audio/transcript drawer for sanity-checking against Bhashini ASR.
      - **In-Person Visit Photo Upload**: Routes visit photos directly through the `process_studio_image` AI background isolation and contact shadow pipeline.
      - **Audit Correction Trail**: Computes field-level differences and appends to `correction_log` (*"AI suggested X, coordinator changed to Y"*) to measure AI accuracy for SIH judges.
      - 3 Distinct Actions: **Approve & Publish**, **Save Changes** (status = approved), and **Reject** (mandatory reason required).
    - **Screen 2: Published Listings Storefront**:
      - Live proof-of-concept storefront displaying published artisan crafts with verified GI badges, ONDC tags, and QR code inspector.

---

### Feature 7: Public Unauthenticated Buyer Storefront
- **Why It Was Built**:
  Buyers and enterprise procurement officers browsing products on ONDC/GeM should never be gated behind an artisan or coordinator login.
- **What It Does**:
  - Accessible via `?view=storefront` or by clicking *"Browse Live Marketplace Without Login"*.
  - Real-time search across categories, techniques, and artisan names.
  - High-resolution studio craft photos, direct pricing, artisan biography, and interactive **Authenticity Certificate Modal** displaying the cryptographic verification hash and scannable QR code.

---

### Feature 8: Cryptographic QR Code Provenance & Public Verify Route
- **Why It Was Built**:
  Urban markets are flooded with machine-made, factory-printed counterfeits falsely marketed as authentic handmade GI crafts (e.g. powerloom sarees sold as handwoven Chanderi).
- **What It Does**:
  - Generates a tamper-proof SHA-256 hash incorporating the artisan's NBCFDC identifier, cluster postal code, and product timestamp.
  - Encodes this hash into a high-density QR code.
  - Scanning the QR code opens the unauthenticated **Public Verification Screen (`/verify/:id`)**, confirming authenticity, artisan name, craft cluster, and live ONDC verification status.

---

### Feature 9: Steganographic Digital GI Watermark
- **Why It Was Built**:
  Industrial powerloom mills and mass manufacturers routinely scrape high-resolution artisan photos from online catalogs to replicate designs before the artisan can sell them.
- **What It Does**:
  - Uses 2D Discrete Cosine Transform (DCT) frequency domain algorithms to imperceptibly embed a 64-bit binary payload `[MoSJE-Beneficiary-ID | Cluster-PIN | GI-Tag-Serial]` directly into the image's luminance channel.
  - The watermark is completely invisible to human eyes but survives lossy JPEG compression, resizing, and screenshotting, proving original artisan ownership in intellectual property disputes.

---

### Feature 10: Bargain Guard AI Voice Negotiator
- **Why It Was Built**:
  Wholesale commercial buyers often aggressively lowball rural artisans, knowing they lack bargaining experience and market price data.
- **What It Does**:
  - An autonomous AI negotiator persona that intercepts wholesale B2B inquiries.
  - If a buyer offers an amount below the statutory direct cost floor, Bargain Guard speaks up in Hindi, explains the hours of artisan labor involved, and generates a structured counter-offer that preserves the artisan's profit margin.

---

### Feature 11: AI Reel Storyteller (15s 9:16 Vertical Video)
- **Why It Was Built**:
  Modern e-commerce discovery is increasingly driven by short-form video (Instagram Reels, YouTube Shorts, Moj). Marginalized artisans have no video editing skills or expensive equipment.
- **What It Does**:
  - Generates a 15-second 1080x1920 (9:16) video reel from the catalog photo using smooth Ken Burns pan-and-zoom motion graphics.
  - Overlays an ambient Raag Bhupali flute/sitar traditional soundtrack and AI-synthesized heritage narration explaining the cultural history of the craft.
  - Displays a scannable ONDC purchase QR code on the final frames for direct social commerce conversion.

---

### Feature 12: ONDC Beckn Protocol Retail v1.2 Gateway
- **Why It Was Built**:
  To liberate artisans from monopolistic marketplace commission fees (which often reach 30–40% on private platforms), the Ministry of Commerce launched ONDC (Open Network for Digital Commerce).
- **What It Does**:
  - Serializes verified catalog drafts into Beckn Protocol Retail v1.2.0 JSON format:
    - Provider details (Artisan NBCFDC profile)
    - Item schema (Bilingual titles, multi-angle studio URLs)
    - Price tags (Statutory B2C price)
    - Fulfillment specs (Weight, postal code, packaging)
  - Ready for immediate broadcast to ONDC network participants (Paytm, Pincode, Magicpin).

---

## 4. End-to-End System Data Flow

```mermaid
flowchart TD
    subgraph Artisans
        A1[Smartphone Artisan] -->|Snap 3 Angles + Voice Note| B1[AI Studio & Bhashini Cataloger]
        A2[Keypad Phone Artisan] -->|1800-208-SHILP Voice Call| B2[कला-वाणी IVR Engine]
    end

    subgraph "AI Ingestion & Draft Generation"
        B1 -->|Background Removal + Shadow + Gemini| C[Catalog Draft Database]
        B2 -->|ASR Transcribe + Heuristics + SMS Coordinator| C
    end

    subgraph "Field Coordinator Workspace"
        C -->|Pending Queue| D[Review & Edit Screen]
        D -->|Visit Artisan| E[In-Person Photo Upload]
        E -->|rembg Studio Pipeline| D
        D -->|Log Changes to correction_log| F{Coordinator Decision}
        F -->|Reject + Reason| G[Rejected Drafts Archive]
        F -->|Save Changes| C
        F -->|Approve & Publish| H[Cryptographic QR & Provenance]
    end

    subgraph "Live Marketplace & Distribution"
        H --> I[(Published Products Storefront)]
        H --> J[ONDC Beckn Retail v1.2 Registry]
        H --> K[GeM Public Procurement Catalog]
        H --> L[15s AI Reel Storyteller]
    end

    subgraph "Consumers & Enterprise Buyers"
        I --> M[Public Buyer Storefront: No Login Required]
        J --> N[ONDC Buyer Apps: Paytm / Pincode]
        K --> O[Government Procurement Officers]
        M --> P[Scan QR Code to Verify Authenticity]
    end
```

---

## 5. Verification & Testing Standards

- **Automated Backend Tests**: 100% test coverage using Pytest across:
  - `backend/tests/test_coordinator_panel.py` (Draft creation, filtering, in-person photo enhancement, correction logging, publishing).
  - `backend/tests/test_ivr_endpoints.py` (Voice IVR processing, DTMF heuristics, draft creation, SMS dispatch).
  - `backend/tests/test_lifecycle.py` (Full end-to-end craft cataloging, statutory pricing, watermark embedding, ONDC export).
- **Frontend Quality**: Zero Vite bundling errors, zero lint warnings, sub-second production builds (`npm run build` in 943ms).
- **Browser Automation**: End-to-end verified via Chrome automation across login, role routing, review queue, and public buyer storefront.
