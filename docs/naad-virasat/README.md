# Naad-Virasat (नाद विरासत) — Aural Heritage Reconstruction

> **Problem Statement**: AICTE PS 26197 (Heritage & Culture)  
> **Tagline**: *"We don't resurrect lost sounds. We give you an evidence-based, playable approximation of instruments frozen in stone."*

---

## 1. Architectural Overview

Naad-Virasat is a self-contained, cross-modal artifact-to-acoustic revival module within ShilpSetu. It allows users, researchers, and festival judges to point a smartphone camera or select high-resolution photographs of ancient temple carvings, detect historical musical instruments, and interact with a live, tactile acoustic playing synthesizer directly overlaid onto the carving.

### Core System Design:
1. **Isolated Web Audio DSP Engine**:
   - Dedicated `AudioContext({ latencyHint: 'interactive' })`.
   - **No DelayNode Loop Pitfall**: Standard Web Audio DelayNode cycles are clamped to a 128-sample quantum (~2.9ms at 44.1kHz), capping pitch near 340Hz and detuning high notes. Naad-Virasat employs algorithmic `AudioBuffer` pre-rendering with sub-sample fractional-delay interpolation, achieving pitch accuracy within $\pm 10$ cents up to C5 (523Hz) and above.
   - Master chain includes a `DynamicsCompressorNode` brickwall limiter, `AnalyserNode` for real-time sound-reactive stone pulsation, and an impulse-response `ConvolverNode` simulating monolithic granite stone mandapas.
2. **Organological Vision & Resilience Cascade**:
   - Pre-processes images in memory by downscaling ($\le 1280\text{px}$) and re-drawing to a clean HTML5 canvas to immediately strip all EXIF/GPS metadata.
   - 3-tier resilience cascade:
     1. Live Gemini Flash organology endpoint (`/api/motif/decode`) with 8s timeout and 1 retry.
     2. Cached exact analysis for curated offline temple carvings.
     3. Heuristic organological fallback with manual picker. **The studio never fails to open.**
3. **Four Natyashastra Instrumental Classes (चतुर्विध वाद्य)**:
   - **तत (Tata / Chordophone)**: Ekatantri Vina, Sengotti Yazh (strum/pluck pointer intersection, jivari bridge buzz).
   - **अवनद्ध (Avanaddha / Membranophone)**: Mridangam / Pushkara, Damaru (center-vs-rim velocity sensitivity, classical bols).
   - **सुषिर (Sushira / Aerophone)**: Venu Bansuri, Shankha (continuous breath ribbon with microtonal gamaka slide; swelling conch blow).
   - **घन (Ghana / Idiophone)**: Temple Ghanta, Manjira (multi-partial inharmonic bronze decay with slow FM beat shimmer).

---

## 2. File Organization

```
frontend/src/features/naad-virasat/
├── NAAD_PLAN.md                  # Complete architectural plan & specs
├── index.js                      # React.lazy entry point
├── NaadVirasatContainer.jsx      # Root state machine with <NaadErrorBoundary>
├── audio/
│   ├── NaadAudioEngine.js        # Core Web Audio lifecycle, master limiter, latency tracker
│   ├── KarplusStrongSynth.js     # Fractional-delay physical string synthesis (Tata)
│   ├── ModalDrumSynth.js         # Membrane modal resonance & pitch-drop synthesis (Avanaddha)
│   ├── WindSynth.js              # Breath noise & formant filtered aerophone synthesis (Sushira)
│   ├── BellSynth.js              # FM inharmonic metallic synthesis (Ghana)
│   ├── MandapaConvolver.js       # Procedural granite stone temple impulse response
│   └── AudioTester.js            # Pitch accuracy & geometry unit test suite
├── data/
│   ├── instruments.json          # Curated 8 instruments with Natyashastra taxonomies
│   ├── scales.json               # Verified swara ratios & ragas (Mohanam, Bhairav, Bilawal)
│   └── validator.js              # Dataset integrity validation script
├── vision/
│   ├── visionAdapter.js          # Preprocessing, EXIF stripping, API timeout & cascade
│   └── demoCarvings.js           # 8 pre-cached demo carvings with validated boxes
└── components/
    ├── ScanViewfinder.jsx        # Camera capture, upload, laser sweep, candidate ranking
    ├── PlayingStudio.jsx         # Overlaid touch synthesizer with lift-out reveal
    ├── TataStringOverlay.jsx     # Pointer-strummed strings with vibration physics
    ├── AvanaddhaDrumOverlay.jsx  # Touch drum pads with classical Devanagari bols
    ├── SushiraWindOverlay.jsx    # Continuous pitch-slide ribbon & Shankha swell
    ├── GhanaBellOverlay.jsx      # Multi-zone metallic strike surfaces
    ├── EvidenceProvenanceDrawer.jsx # 4-pillar academic credibility drawer
    ├── DescendantCompareModal.jsx   # A/B timeline comparison with modern descendant
    └── JudgeDemoOverlay.jsx      # Scripted 90-second offline projector demo (?demo=1)
```

---

## 3. How to Add a New Instrument

Naad-Virasat is 100% data-driven. To add an instrument:
1. Open `frontend/src/features/naad-virasat/data/instruments.json`.
2. Add a new JSON object adhering to the schema:
   ```json
   {
     "id": "rudra-vina",
     "names": { "en": "Rudra Vina", "hi": "रुद्र वीणा", "sa": "रुद्रवीणा" },
     "family": "tata",
     "status": "rare",
     "evidenceLevel": "well_documented",
     "era": "14th - 17th Century CE",
     "carvingContext": "Reliefs at Ellora and Vijayanagara mandapas",
     "modernDescendantId": "saraswati-vina",
     "modernDescendantName": "Modern Concert Vina",
     "comparisonRationale": "Twin-gourd chordophone with raised wooden frets fixed with wax.",
     "synth": {
       "type": "karplus-strong",
       "damping": 0.989,
       "stiffness": 0.0018,
       "pluckComb": 0.2,
       "jivariBuzz": 0.22,
       "decaySeconds": 4.2,
       "bodyResonanceHz": 175
     },
     "layout": { "type": "strings", "numStrings": 5 },
     "scales": ["mohanam", "bhairav"],
     "sources": [
       {
         "title": "Sangita Ratnakara",
         "authorOrInstitution": "Sarangadeva",
         "kind": "treatise",
         "verified": false
       }
     ]
   }
   ```
3. Run the validator:
   ```bash
   node frontend/src/features/naad-virasat/data/validator.js
   ```
   The build automatically validates that family is in `[tata, sushira, avanaddha, ghana]`, status is valid, and sources exist.

---

## 4. How to Disable Naad-Virasat (Feature Flag)

- **Client Runtime**: In browser console or admin shell:
  ```javascript
  localStorage.setItem('nv_enabled', 'false');
  ```
  Refresh the page; the feature will display a graceful disabled banner.
- **To re-enable**:
  ```javascript
  localStorage.removeItem('nv_enabled');
  ```
- **Code Removal / Rollback**: Remove the lazy import and `<NaadVirasatContainer />` hook in `ExplorerShell.jsx` (2 additive lines). The entire feature folder can be removed without touching any core logic.

---

## 5. Verification & Tests

Run the automated pitch accuracy and schema validator:
```bash
node frontend/src/features/naad-virasat/audio/AudioTester.js
```
Expected output:
```
✅ [PASS] Dataset schema validator passes (8 instruments)
✅ [PASS] Pitch accuracy for Sa (C3) within +/- 10 cents
✅ [PASS] Pitch accuracy for Sa (C4) within +/- 10 cents
✅ [PASS] Pitch accuracy for Pa (G4) within +/- 10 cents
✅ [PASS] Pitch accuracy for Sa^ (C5) within +/- 10 cents
✅ [PASS] Swipe crossing string detects intersection
✅ [PASS] Normalized bounding box sanity clamping [0..1]
```
