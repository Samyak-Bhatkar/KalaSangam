# Walkthrough 03: Perspective-Aware Lifestyle Compositing & Tilt Guardrail

## 🎯 Executive Summary
Addresses a critical limitation in flat 2D lifestyle background compositing for rural artisans:
1. **Perspective Mismatch Limitation**: 2D compositing pastes product cutouts at a fixed anchor position (bottom 58% of canvas) without awareness of the camera's angle of capture, causing photos taken at oblique angles to clash with the background or appear to float unnatural in mid-air.
2. **Capture-Time Tilt Classification**: Reuses existing live mobile gyroscope data (`beta` pitch and `gamma` roll) to measure degrees from vertical and classify photos into `eye_level` ($<20^\circ$), `flat_lay` ($>60^\circ$), or `angled` ($20^\circ - 60^\circ$).
3. **Angle-Aware Stock Search Query Biasing**: Automatically augments Pexels/Pixabay stock queries with modifiers (`"front view"` / `"close-up"` for eye-level, `"top view"` / `"flat lay"` for flat-lays) to bias stock search results towards matching perspectives.
4. **Steep/Ambiguous Angle Guardrail**: Silently skips the "Choose a Background Setting" lifestyle UI when a photo is taken at an ambiguous oblique angle (`angled`), ensuring artisans only see pristine white Amazon/GeM 85% studio results and never an unnatural, broken lifestyle composite.
5. **Interactive Angle Rotation Nudge**: Added a $-15^\circ$ to $+15^\circ$ 2D rotation slider in `FineTuneStudioModal` with instant CSS transform preview, bilingual audio readout, 0° reset, and canvas baking.

---

## 🛠️ Tech Stack & Implementation Details

| Layer | Technology | Component / Module | Purpose |
| :--- | :--- | :--- | :--- |
| **Gyroscope Sensor Integration** | `DeviceOrientationEvent` | [`visionHeuristics.js`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/services/visionHeuristics.js) (`classifyShotAngle`) | Reads pitch (`beta`) at capture time and derives degrees from vertical ($\|90 - \|\beta\|\|$) |
| **Angle Classifier & Guardrail** | Pure JavaScript | [`visionHeuristics.js`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/services/visionHeuristics.js) | Categorizes into `eye_level` ($<20^\circ$), `flat_lay` ($>60^\circ$), or `angled` ($20^\circ-60^\circ$) with `isLifestyleEligible` boolean |
| **Capture Module Hook** | React `useRef` + `useState` | [`CameraViewfinder.jsx`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/components/CameraViewfinder.jsx) | Latches orientation reading at shutter click; defaults safely to `eye_level` for desktop/gallery uploads |
| **State Persistence** | React Context API | [`ArtisanContext.jsx`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/context/ArtisanContext.jsx) (`shotAngleInfo`) | Stores `shotAngleInfo` per angle photo in multi-angle studio catalog |
| **Query Biasing Engine** | Python / String Matching | [`stock_background_service.py`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/backend/app/services/stock_background_service.py) (`apply_angle_modifier`) | Biases stock image retrieval query with `"front view"` or `"flat lay"` |
| **Curated Fallback Engine** | Python PIL / Pexels URLs | `CURATED_FLAT_LAY_BACKGROUNDS` | High-res curated top-down surfaces (rustic wood flat-lay, stone top view, handloom weave) |
| **Compositing Engine with Rotation** | Pillow (`PIL.Image`) | [`stock_background_service.py`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/backend/app/services/stock_background_service.py) (`composite_lifestyle_scene`) | Supports `rotation_deg: float` with `Image.Resampling.BICUBIC` before shadow synthesis |
| **Interactive Rotation Nudge** | React + HTML5 Canvas | [`FineTuneStudioModal.jsx`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/components/FineTuneStudioModal.jsx) | $-15^\circ$ to $+15^\circ$ live CSS transform preview + canvas bake on apply |

---

## 💡 Why This Tech Stack Was Chosen

1. **Reusing Existing Sensor Hardware with Zero Latency**:
   - The device already captures gyroscope orientation for the live leveling bubble reticle. Reusing this data for capture-time tilt classification requires $0\text{ ms}$ server computation, $0\text{ MB}$ additional network traffic, and no extra user effort.
2. **Deterministic Guardrail vs Generative AI Overkill**:
   - Rather than attempting costly 3D neural reconstruction (e.g. NeRF/Gaussian Splatting) which would crash on low-end mobile devices and cheap cloud servers, ShilpSetu uses a simple, deterministic rule:
     - Clear perspective match $\rightarrow$ show matching lifestyle shot.
     - Ambiguous perspective mismatch $\rightarrow$ protect the artisan's brand by showing only the pristine white e-commerce studio shot.
3. **Accessibility-First Design**:
   - Artisans who take photos overhead (e.g., sarees laid out on the floor, flat stone carvings) automatically get top-down flat-lay backdrops without having to type queries in English.

---

## ❌ Why Previous & Alternative Approaches Failed

| Approach | Root Cause of Failure | Impact & Why It Was Discarded |
| :--- | :--- | :--- |
| **Static 2D Placement (Previous Approach)** | **Perspective Blindness** | Regardless of camera angle, the craft was placed at 58% canvas height resting at bottom. Photos taken at $45^\circ$ angles looked visually broken and floating when placed on eye-level tables. |
| **Generative AI Inpainting / Diffusion** | **Cost & Latency Prohibitive** | Stable Diffusion ControlNet or Midjourney inpainting takes $6-15\text{ s}$ per image and requires expensive GPU instances ($\ge \$0.02 - \$0.05$ per call), which is completely unviable for free MoSJE rural artisan deployments. |
| **3D Mesh / Homography Estimation** | **Instability on Organic Crafts** | Standard homography estimation requires clean planar rectangles (like a page of paper or building facade). Handcrafted terracotta pots, wooden toys, and brass idols have organic curved shapes where planar homography fails completely. |
| **Complex User Prompting** | **Cognitive Friction for Rural Users** | Asking artisans to select "What camera angle did you use?" adds friction, confusion, and language barriers. Capturing tilt automatically from the phone's gyroscope eliminates all user input. |

---

## 🔄 Architectural Workflow

```mermaid
flowchart TD
    A[Artisan Points Camera at Craft] --> B[Gyroscope Sensor Reads beta Pitch]
    B --> C[classifyShotAngle: tiltDegrees = |90 - |beta||]
    C --> D{Evaluate Tilt}
    D -- Tilt < 20° --> E[Class: eye_level]
    D -- Tilt > 60° --> F[Class: flat_lay]
    D -- 20° <= Tilt <= 60° --> G[Class: angled - Ambiguous]

    E --> H[Append 'front view' to Search Query]
    F --> I[Append 'flat lay' to Search Query]
    G --> J[GUARDRAIL TRIGGERED: isLifestyleEligible = false]

    H --> K[Fetch Pexels/Pixabay + Eye-Level Curated Fallbacks]
    I --> L[Fetch Pexels/Pixabay + Flat-Lay Curated Fallbacks]
    J --> M[Studio Review Card: Completely Hide Lifestyle Section]

    K --> N[Surface 'Choose a Background Setting' with [📐 Eye Level] Badge]
    L --> O[Surface 'Choose a Background Setting' with [📐 Top View] Badge]
    M --> P[Render Pure E-Commerce Studio Amazon 85% Result Only]

    N --> Q[Optional: Fine-Tune Modal with -15° to +15° Rotation Nudge Slider]
    O --> Q
```

---

## 🧪 Verification & Test Results

### 1. Automated Backend Unit Tests ([`backend/tests/test_perspective_lifestyle.py`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/backend/tests/test_perspective_lifestyle.py))
Command run:
```powershell
python -m pytest tests/test_perspective_lifestyle.py -v
```
Results:
```text
tests/test_perspective_lifestyle.py::test_apply_angle_modifier PASSED            [ 25%]
tests/test_perspective_lifestyle.py::test_get_background_options_guardrail_and_biasing PASSED [ 50%]
tests/test_perspective_lifestyle.py::test_composite_lifestyle_scene_with_rotation PASSED [ 75%]
tests/test_perspective_lifestyle.py::test_api_background_options_endpoint PASSED [100%]

======================== 4 passed in 7.15s ========================
```

### 2. Frontend Production Compilation
Command run:
```powershell
npm run build
```
Results:
```text
vite v8.2.2 building client environment for production...
✓ 1865 modules transformed.
dist/index.html                   0.47 kB │ gzip:   0.30 kB
dist/assets/index-DscuzE6P.css  135.02 kB │ gzip:  17.86 kB
dist/assets/index-B5YOppNQ.js   593.63 kB │ gzip: 155.97 kB
✓ built in 1.40s
```

---

## 📁 Source File Cross-References

- Sensor Heuristics: [`frontend/src/services/visionHeuristics.js`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/services/visionHeuristics.js#L38-L101)
- Capture Integration: [`frontend/src/components/CameraViewfinder.jsx`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/components/CameraViewfinder.jsx#L230-L245)
- Context Storage: [`frontend/src/context/ArtisanContext.jsx`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/context/ArtisanContext.jsx#L106-L135)
- Backend Compositing & Query Modifier: [`backend/app/services/stock_background_service.py`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/backend/app/services/stock_background_service.py#L62-L240)
- Guardrail UI & Badges: [`frontend/src/components/StudioReviewCard.jsx`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/components/StudioReviewCard.jsx#L65-L105)
- Rotation Slider in Fine-Tune: [`frontend/src/components/FineTuneStudioModal.jsx`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/frontend/src/components/FineTuneStudioModal.jsx#L518-L565)
- Unit Tests: [`backend/tests/test_perspective_lifestyle.py`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/backend/tests/test_perspective_lifestyle.py)
