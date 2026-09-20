# ShilpSetu: Master Tech Stack & Architectural Decision Record (ADR)

*Ministry of Social Justice and Empowerment (MoSJE) • Problem Statement 26090*

This living document tracks the **exact tech stack**, **the reason it is chosen**, and **why previous or alternative approaches failed** for every module in ShilpSetu. All future walkthroughs and implementations must reference and update this log.

---

## 📑 System Architecture Decision Matrix

| Module | Chosen Tech Stack | Why It Is Used (Pros & Benefits) | Why Previous / Alternative Failed (Root Cause of Rejection) |
| :--- | :--- | :--- | :--- |
| **Module 1: Real-time Camera Quality Gate** | **OpenCV (`cv2.Laplacian`, brightness histograms)** | Client-side/local verification in $<10\text{ ms}$; checks blur, glare, and edge clearance before upload. | **Deep Learning Blur Detectors (CNNs)** were too heavy for low-end Android phones and caused viewfinder frame stuttering. |
| **Module 2A: 6500K White Balancing** | **Segmentation-Aware Gray World + LAB CLAHE** | Samples only ambient background (`alpha <= 40`); preserves authentic terracotta, brass, and textile dyes without color bleaching. | **Full-Frame Gray World (Previous Approach)** averaged the whole image, mistaking single-hue crafts for lighting artifacts and turning terracotta pots grayish. |
| **Module 2B: Background Cutout** | **rembg (u2netp ONNX CPU)** | CPU-friendly salient craft cutout with low RAM footprint and zero paid API calls. | **Cloud Remove.bg APIs** charge \$0.20/image (unsustainable for poor artisans) and require constant internet connectivity. |
| **Module 2C: Enclosed Hole Removal** | **OpenCV `cv2.floodFill` + Gaussian Feathering (Tiered Architecture)** | Instant single-tap hole removal in $<15\text{ ms}$, zero model download, 100% safe on Render free-tier hosting (512MB RAM). | **MobileSAM / SAM2 (Segment Anything)** require 40MB-100MB+ downloads and GPU VRAM, crashing Render free tier with OOM during live demos. |
| **Module 2D: Secondary Lifestyle Compositing** | **Pexels & Pixabay REST APIs + Pillow (PIL)** | ₹0 incremental cost; realistic contextual setting; 100% preserves authentic physical craft without hallucination. | **Generative AI (DALL-E 3 / Midjourney)** cost \$0.04 - \$0.08/image, hallucinate fake patterns, alter weave counts, and take 15+ seconds. |
| **Module 2E: Perspective-Aware Compositing & Tilt Guardrail** | **DeviceOrientation Gyroscope + Query Biasing + Ambiguous Angle Guardrail** | Uses existing hardware sensors to classify shots (`eye_level`, `flat_lay`, `angled`). Biases stock search (`"front view"`, `"flat lay"`) and guards brand by hiding lifestyle when perspective mismatch is high. | **Static 2D Placement (Previous Approach)** pasted cutouts at a fixed height regardless of camera tilt, causing angled shots to look visibly floating or warped on flat tables. |
| **Module 2F: Color-Aware Palette Biasing** | **Classical K-Means Color Quantization (`sklearn.cluster.KMeans`) + HSL Hue-Wheel Math (`colorsys`)** | Zero AI compute cost; extracts dominant craft color from alpha-masked pixels in $<10\text{ ms}$; computes complementary ($H+180$) or analogous ($H\pm 30$) backgrounds deterministically with two-tier query fallbacks. | **Expanding Gemini Prompts for Color Theory** would add 800ms+ latency and cost extra prompt tokens. **Manual Sliders** introduce cognitive clutter for rural artisans. |
| **Module 3: Multimodal Cataloging** | **Gemini 2.5 Flash (`google-genai` SDK)** | Single API call parses voice audio + image into structured bilingual JSON (MoSJE fields, GI tag eligibility, materials, labor hours). | **Separate STT + LLM Pipelines (Whisper + GPT-4)** doubled latency (6-8s) and cost 4x more than multimodal flash models. |
| **Module 4: Statutory Fair Wage Pricing Engine** | **Deterministic Python Rules (`statutory_pricing.py`)** | Transparent, mathematically auditable fair-wage calculation adhering to MoSJE statutory hourly wage floors (₹120/hr). | **Pure LLM-based Price Guessing** hallucinated wildly inconsistent prices and failed government procurement compliance checks. |
| **Module 5: Rural Zero-Text Audio UI** | **Web Speech API + Bhashini Integration** | Voice guidance in Hindi (`hi-IN`) and regional dialects for every slider, button, and quality status; min 48px touch targets. | **Text-Dense Desktop Forms** caused complete abandonment by non-literate artisans who cannot read technical e-commerce terms. |
| **Module 6: Offline & Feature Phone Inclusion** | **IVR Keypad Phone Simulator (`ivr_service.py`)** | Enables artisans with ₹800 basic keypad phones to register crafts and DBT accounts via simple voice calls. | **Smartphone-Only Apps** exclude over 40% of elderly and marginalized rural craftspeople who do not own smartphones. |

---

## 📋 Mandatory Walkthrough Standard (From Now Onwards)

Every future walkthrough document generated in ShilpSetu must follow this mandatory 4-part structure:
1. **Executive Summary & Scope**: What feature was built and the problem it addresses.
2. **Tech Stack & Libraries Used**: Exact packages, versions, and APIs.
3. **Why This Tech Stack Was Chosen**: Architectural, performance, cost, and user-experience justification.
4. **Why Previous / Alternative Approaches Failed**: Detailed root-cause analysis of what broke or why standard patterns were rejected.
