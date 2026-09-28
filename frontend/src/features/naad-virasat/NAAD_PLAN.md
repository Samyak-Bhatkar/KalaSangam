# NAAD-VIRASAT (नाद विरासत) — Architecture & Implementation Plan

**Feature**: Naad-Virasat (Cross-Modal Artifact-to-Acoustic Revival)  
**Problem Statement**: AICTE PS 26197 (Heritage & Culture)  
**Target Delivery**: Production-grade, zero-crash, 90-second jaw-dropping live judge demo.

---

## 1. Architectural Overview & Boundaries

Naad-Virasat enables users to point their camera or upload a photo of ancient temple stone carvings, museum artifacts, or fresco paintings, detect historical musical instruments, and interact with a live, tactile acoustic playing synthesizer directly overlaid onto the carving.

### Core Hard Constraints Adherence:
- **Strictly Add-On**: 100% self-contained inside `frontend/src/features/naad-virasat/`.
- **CSS Isolation**: All classes strictly namespaced under `nv-*` or inline styling; zero global theme tampering.
- **Dedicated AudioContext**: Isolated `AudioContext` lifecycle with automatic unlock on first user gesture (Safari iOS compliant), suspension on tab hide (`visibilitychange`), and voice cleanup on unmount.
- **Zero Web Audio DelayNode Clamping Trap**:
  - Web Audio `DelayNode` feedback loops clamp minimum delay to 128 samples (~2.9ms at 44.1kHz), capping pitch at ~340Hz and completely breaking higher octaves.
  - Naad-Virasat generates exact physical fractional-delay Karplus-Strong AudioBuffers and modal resonance responses directly via DSP buffer generation / mathematical synthesis.
- **Honesty Guardrails**:
  - UI Tagline: *"We don't resurrect lost sounds. We give you an evidence-based, playable approximation of instruments frozen in stone."*
  - Latency is labeled "near-instant" (with real-time latency measurement in `?debug=1`).
  - No fabricated citations. Sources default to `verified: false`.
  - Natyashastra 4-fold taxonomy strictly preserved: तत (Tata), सुषिर (Sushira), अवनद्ध (Avanaddha), घन (Ghana).
  - Ragas strictly audited (e.g. Mohanam = Sa Ri2 Ga3 Pa Da2 pentatonic; Bhairav = heptatonic).

---

## 2. File Organization

```
frontend/src/features/naad-virasat/
├── NAAD_PLAN.md                          # This architecture specification
├── index.js                              # Clean export interface (React.lazy entry)
├── NaadVirasatContainer.jsx              # Main view & state container with ErrorBoundary
├── audio/
│   ├── NaadAudioEngine.js                # Core Web Audio manager, master limiter, latency tracker
│   ├── KarplusStrongSynth.js             # High-precision fractional string synthesis (Tata)
│   ├── ModalDrumSynth.js                 # Modal resonance & pitch-drop percussion synthesis (Avanaddha)
│   ├── WindSynth.js                      # Breath noise & formant filtered aerophone synthesis (Sushira)
│   ├── BellSynth.js                      # FM inharmonic metallic synthesis (Ghana)
│   ├── MandapaConvolver.js               # Procedural stone temple impulse response generator
│   └── AudioTester.js                    # Pitch accuracy unit tester (+/- 10 cents autocorrelation)
├── data/
│   ├── instruments.json                  # Curated 8 instruments with Natyashastra classes & sources
│   ├── scales.json                       # Verified swara frequencies & ragas (Mohanam, Bhairav, etc.)
│   └── validator.js                      # Build-time dataset validator script
├── vision/
│   ├── visionAdapter.js                  # Frontend adapter calling backend /api/naad/decode + fallback cascade
│   └── demoCarvings.js                   # 8 pre-cached demo carvings with validated bounding boxes (100% offline)
├── components/
│   ├── ScanViewfinder.jsx                # Camera capture, file upload, pre-processing (EXIF strip, contrast)
│   ├── PlayingStudio.jsx                 # Overlay canvas aligning strings/pads onto carving bounding box
│   ├── TataStringOverlay.jsx             # Interactive strum-able strings with pointer intersection physics
│   ├── AvanaddhaDrumOverlay.jsx          # Velocity-sensitive center-vs-rim drum pads with classical Bols
│   ├── SushiraWindOverlay.jsx            # Continuous pitch-slide & breath swell controller
│   ├── GhanaBellOverlay.jsx              # Strike-and-ring metallic cymbal/bell surface
│   ├── EvidenceProvenanceDrawer.jsx      # Credibility drawer: carving vs text vs approximation & sources
│   ├── DescendantCompareModal.jsx        # A/B timeline comparison with modern descendant instrument
│   └── JudgeDemoOverlay.jsx              # Automated 90s offline scripted walkthrough (?demo=1)
└── assets/
    └── demo_images/                      # Curated high-res historical carving & sculpture photos
```

---

## 3. Integration Hooks (Minimal & Additive)

1. **Explorer Shell (`frontend/src/components/ExplorerShell.jsx`)**:
   - Add a 6th navigation tab or enhance the Aural Heritage button:
     - `const NaadVirasatContainer = React.lazy(() => import('../features/naad-virasat'));`
     - Wrapped in `React.Suspense` with an isolated `<NaadErrorBoundary>`.
2. **Backend Proxy (`backend/app/main.py`)**:
   - Additive route `POST /api/naad/decode` implementing temple-art organologist Gemini vision prompt with strict JSON output schema and fallback to local cached taxonomy.
3. **Motif Decoder (`frontend/src/components/MotifDecoder.jsx`)**:
   - Optional small pill button: when an acoustic craft (e.g. Dhokra Bell) is detected, provide `"वाद्य ध्वनि सुनें / Hear Sound"` passing the motif hint to Naad-Virasat.

---

## 4. Curated 8-Instrument Dataset
1. **Ekatantri Vina** (Tata / Chordophone) — 11th-12th Century Hoysala/Chola temple stone reliefs.
2. **Yazh** (Tata / Chordophone) — Sangam era bow-harp found in Thirumayam and Amaravati stone carvings.
3. **Mridangam / Pakhawaj** (Avanaddha / Membranophone) — Nataraja temple friezes at Chidambaram.
4. **Venu / Bansuri** (Sushira / Aerophone) — Krishna stone sculptures at Halebidu.
5. **Shankha** (Sushira / Sacred Aerophone) — Ritual temple stone carvings across Tamil Nadu and Odisha.
6. **Ghanta** (Ghana / Idiophone) — Cast bronze ritual temple bells, Bastar Dhokra bell tradition.
7. **Manjira / Jalra** (Ghana / Idiophone) — Devotional cymbals depicted in Konark sun temple musicians.
8. **Damaru** (Avanaddha / Hourglass Drum) — Cosmic Nataraja bronze and stone iconography.

---

## 5. Milestone Execution Checklist
- [ ] **M1: Data Model & DSP Synth Engine**: `instruments.json`, `scales.json`, `validator.js`, DSP generators (Karplus-Strong, Modal Drum, FM Bell, Wind), `AudioTester.js` testing pitch within +/- 10 cents.
- [ ] **M2: Playing Studio Overlay**: Overlaid string strumming (pointer path intersection), drum pads, bell strike, stone mandapa convolver reverb, sound-reactive RMS visualizer.
- [ ] **M3: Vision Pipeline & Resilience Cascade**: Image normalizer (EXIF strip, contrast), backend proxy `POST /api/naad/decode`, offline pre-cached demo carvings, confidence ranking UX.
- [ ] **M4: Credibility & Context**: Evidence & Provenance drawer (`verified: false` sources, text citations), A/B modern descendant comparison modal.
- [ ] **M5: Judge Mode & Verification**: Scripted 90s offline walkthrough (`?demo=1`), keyboard play, accessibility audit, documentation in `docs/naad-virasat/`.
