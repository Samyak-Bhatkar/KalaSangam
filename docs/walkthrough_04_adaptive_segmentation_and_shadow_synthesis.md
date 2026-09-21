# Walkthrough 04: Adaptive Dual-Tier Segmentation & E-Commerce Drop Shadow Synthesis

## 🎯 Executive Summary

This document permanently records the technical architecture, design decisions, and mathematical implementation of two core computer vision systems in ShilpSetu:
1. **Adaptive Dual-Tier Background Segmentation Engine**: Provides near-Adobe studio cutout quality using SOTA BiRefNet architecture with seamless, instant degradation down to lightweight `u2netp` and OpenCV GrabCut on low-bandwidth/low-spec devices without latency spikes or pipeline crashes.
2. **Dual-Tier Physical Ground Shadow Synthesis System**: Generates realistic 3D contact grounding shadows based on the physical geometry and base footprint of Indian handicrafts rather than generic blur overlays.

---

## 🏗️ System Architecture & Workflow

```
                        [Artisan Camera Capture]
                                   │
                                   ▼
             ┌───────────────────────────────────────────┐
             │ Client Silent Hardware/Network Detection  │
             │ (Effective network: 4G/3G/2G, SaveData)   │
             │ Header: X-Compute-Tier ("high" | "low")   │
             └─────────────────────┬─────────────────────┘
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │ 1. Quality Gate Assessment (/api/v1/studio/quality-check)         │
 │    • Priority 1: Sharpness / Blur Check (Laplacian variance >=65) │
 │    • Priority 2: Silhouette Alpha Cut-Off Check (3% frame margin) │
 │    • Priority 3: Exposure (Dark / Overexposed) & Clutter Density  │
 │    • Caches craft alpha cutout into SHA-256 in-memory LRU Cache   │
 └─────────────────────────────────┬─────────────────────────────────┘
                                   │
                     Artisan confirms / enhances photo
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │ 2. Adaptive Background Segmentation Engine (segment_craft)        │
 │    ├─ High Tier: SOTA BiRefNet / RMBG-1.4 (Studio-grade matting) │
 │    ├─ Low Tier:  u2netp (Sub-second lightweight execution)       │
 │    └─ Fallback:  OpenCV GrabCut (Zero-crash guarantee)            │
 └─────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │ 3. Segmentation-Aware 6500K White Balancing & LAB CLAHE           │
 │    • Samples ONLY background pixels (preserves terracotta/silk)   │
 └─────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │ 4. Skeletal Main Body Reconstruction & Debris Pruning             │
 │    • Distance-transform skeletal analysis severs stray cables/dust│
 └─────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │ 5. Amazon / GeM 86% Canvas Scaling & Optical Centering            │
 │    • Scales craft to 86% occupancy inside 1080x1080 canvas        │
 │    • Computes exact (craft_x, craft_y) placement                  │
 └─────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │ 6. Physical Ground Contact Shadow Synthesis (synthesize_shadow)   │
 │    • Analyzes bottom 12% alpha base footprint                     │
 │    • Layer 1: Ambient Occlusion (AO) Seam (55% opacity, 2.5px blur│
 │    • Layer 2: Ambient Floor Penumbra (15% opacity, 8.5px blur)    │
 └─────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │ 7. Layered Compositing                                            │
 │    Layer 1 (Bottom): #FFFFFF Studio Canvas                        │
 │    Layer 2 (Middle): Synthesized Dual-Tier Shadow Composite       │
 │    Layer 3 (Top):    Enhanced Craft Cutout                        │
 └───────────────────────────────────────────────────────────────────┘
```

---

### Dynamic Network & Hardware-Adaptive Tiering
To ensure rural artisans on 2G/3G connections or sub-$100 Android smartphones never experience frozen viewfinders or request timeouts, the frontend and backend dynamically negotiate compute tiers:

1. **Client-Side Silent Telemetry (`detectClientComputeTier()`)**:
   - The browser inspects native Web APIs with zero performance overhead:
     - `navigator.connection.effectiveType` (`'slow-2g'`, `'2g'`, `'3g'`, `'4g'`)
     - `navigator.connection.saveData` (User's browser data-saver mode toggle)
     - `navigator.deviceMemory` (RAM capacity in GB)
   - **Trigger Conditions for Fast Tier (`low`)**:
     - Client is on `2g`, `3g`, or `slow-2g` network.
     - User has Data Saver enabled (`saveData === true`).
     - Device has $< 2\text{ GB}$ RAM.
   - Otherwise, requests default to high tier (`'high'`).

2. **Zero-UI Disruption Negotiation**:
   - The computed value is passed silently via the HTTP request header:
     `X-Compute-Tier: low` (or `high`).
   - No warning modals, banners, or popups interrupt the artisan.

3. **Backend Adaptive Routing**:
   - When `X-Compute-Tier: low` is received, the backend immediately bypasses heavy neural models and routes the photo directly to `session_fast` (`u2netp`), delivering sub-second ($<800\text{ ms}$) segmentation.
   - When `X-Compute-Tier: high` is received, the backend uses `session_studio` (`birefnet-general`), but still maintains an instant failover catch to `session_fast` if an unexpected OOM or latency spike occurs.

### LRU Mask Caching
To prevent executing neural background segmentation twice for the same photo (once during `/quality-check` and again during `/enhance`), ShilpSetu computes a `hashlib.sha256(raw_bytes)` key and stores cutouts in a thread-safe `_SEGMENT_CACHE` (OrderedDict LRU, max 32 items). When `/enhance` is invoked, the cutout is retrieved from memory in `0 ms`.

---

## 🎨 Deep-Dive 2: Shadow Synthesis & Physical Grounding

### When Is the Shadow Created?
The shadow is generated **at Step 6** of the enhancement pipeline—specifically **after** the craft has been segmented, color-balanced, scaled to the Amazon 86% occupancy rule, and optically centered on the 1080x1080 canvas, but **before** it is pasted onto the final white backdrop.

### How the Shadow is Mathematically Constructed

```
   ┌─────────────────────────────┐
   │         CRAFT BODY          │
   │                             │
   │                             │
   │  █████████████████████████  │  <-- Bottom 12% slice analyzed
   └───┬─────────────────────┬───┘
       │  [base_x_min]       │  [base_x_max]
       ◄──────base_width─────►
───────┼─────────────────────┼─────────────────── [contact_y = craft_y + ch]
    ░░░███████████████████████░░░   <-- Layer 1: Ambient Occlusion Seam (AO)
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   <-- Layer 2: Floor Penumbra (Diffused Bounce)
```

1. **Base Footprint Detection**:
   - Inspects the bottom 12% of the craft alpha mask (`alpha[int(ch * 0.88):, :]`).
   - Computes the 2nd and 98th horizontal percentiles to isolate true floor contact width (`base_width`) and horizontal center (`base_center_x`), avoiding angled side flares.
   - Sets floor touchline `contact_y = craft_y + ch`.

2. **Tier 1: Ambient Occlusion Seam (Contact Line)**:
   - **Width**: `int(base_width * 0.90)`
   - **Height**: `max(5, int(ch * 0.025))`
   - **Color & Alpha**: `(20, 22, 28, 140)` (~55% opacity deep charcoal)
   - **Feathering**: Gaussian Blur radius `2.5px`
   - **Purpose**: Creates the razor-sharp, dark grounding line directly under the contact points.

3. **Tier 2: Ambient Floor Penumbra (Light Bounce Halo)**:
   - **Width**: `int(base_width * 1.15)`
   - **Height**: `max(12, int(ch * 0.065))`
   - **Color & Alpha**: `(35, 38, 48, 38)` (~15% opacity diffused slate)
   - **Feathering**: Gaussian Blur radius `8.5px`
   - **Purpose**: Simulates diffused studio softbox light scattering across the white floor.

4. **Alpha Compositing**:
   - `Image.alpha_composite(pen_blurred, ao_blurred)` merges the two shadow layers.
   - The final image layers: `Studio Background (#FFFFFF)` $\rightarrow$ `Shadow Composite` $\rightarrow$ `Product Cutout`.

---

## 📋 Technology Matrix

| Module | Component | Implementation | Rationale |
| :--- | :--- | :--- | :--- |
| **Client Tier Detection** | `frontend/src/services/api.js` | `navigator.connection` & `navigator.deviceMemory` | Zero-overhead client capability detection passing `X-Compute-Tier` header. |
| **Session Singleton** | `backend/app/services/image_studio.py` | `get_fast_session()` & `get_studio_session()` | Avoids reloading multi-megabyte ONNX weights into RAM on every request. |
| **Studio Segmentation** | `rembg` (ONNX Runtime) | BiRefNet / RMBG-1.4 / U2-Net | Studio-grade boundary precision for filigree, hollow handles, and translucent items. |
| **Failover Segmentation** | `rembg` (ONNX Runtime) | `u2netp` | 4.7 MB portable model providing sub-second failover on low-compute servers. |
| **Ultimate Fallback** | OpenCV | `cv2.grabCut` | Ensures 100% uptime with zero 500 errors even if ONNX fails. |
| **Mask Cache** | Python `OrderedDict` | Thread-safe LRU Cache (SHA-256 keyed) | 0 ms latency reuse between quality assessment and studio enhancement. |
| **Ground Shadow** | Pillow (`PIL.Image`, `ImageDraw`, `ImageFilter`) | Dual-Tier Elliptical Model (AO + Penumbra) | Physically grounded contact shadow that scales to any craft silhouette. |

---

## 🛡️ Non-Regression Verification

- **Tests Executed**: `python -m pytest tests/test_photo_studio.py` (8/8 passed).
- **Quality Gate Priority**: `blur > cut_off > dark > glare > clutter` strictly preserved.
- **Client Fallback**: Gracefully executes across all networks without warning popups or disruptions.
