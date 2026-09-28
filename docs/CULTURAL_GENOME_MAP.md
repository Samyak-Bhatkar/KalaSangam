# Cultural Genome Map (सांस्कृतिक जीनोम मानचित्र)
### SIH 2026 — Problem Statement 26197 (Heritage & Culture) | Add-On Architecture & Specification

---

## 1. Live App Analysis & Design System Findings (Step 0)

From interactive browser inspection of the live ShilpSetu application on `http://localhost:5173/?view=storefront` and the Bharat Heritage Atlas (`#toggle-view-map`), the visual identity, tokens, and UX patterns are synthesized below:

### 1.1 Visual Tokens & Color Palette
- **Background & Canvas**:
  - Base Background: `bg-slate-950` (`#020617`), Secondary Containers: `bg-slate-900` (`#0F172A`), Floating Panels: `bg-slate-900/90` with border `border-slate-800` (`#1E293B`).
  - Subtle map canvas grid pattern: `radial-gradient(#38BDF8 0.75px, transparent 0.75px)` at 24px pitch with 15% opacity.
- **Brand Accents**:
  - **Terracotta**: `#C85A32` (Hover: `#B44B24`, active fill: `#D97706` / `#EA580C`). Represents indigenous earth, clay, and artisan traditions.
  - **Amber / Gold**: `amber-400` (`#FBBF24`), `amber-500` (`#F59E0B`), gradient `from-amber-500 to-yellow-400`. Used for section headers, active tab highlights, and counts.
  - **Cyan / Sky Glow**: `cyan-400` / `#38BDF8`. Used for selection contours (`strokeWidth: 2.4`) and glow highlights via SVG Gaussian blur filter (`feGaussianBlur stdDeviation="3.5"`).
  - **Emerald Accent**: `emerald-400` (`#34D399`) for verified badges (`ONDC Live`, `Active GI`).
- **Typography & Bilingual Hierarchy**:
  - **Strict Bilingual Labelling**: Bold Devanagari (Hindi) on top (`font-black text-white text-base`), paired with English description / state code underneath (`text-slate-400 text-xs`).
  - Example: `महाराष्ट्र` over `Maharashtra (MH)`.
- **Micro-Interactions & Component Structures**:
  - **Quick-Pills Bar**: Floating frosted bar (`bg-slate-900/85 backdrop-blur-md border border-slate-700/60`) at the bottom for instant touch selection without fine-motor SVG tapping.
  - **Dynamic Follow Tooltip**: Floating rounded card displaying state metrics on hover.
  - **Side-Panel Dossier**: 380px fixed-width desktop drawer with MoSJE beneficiary tag, 2-column metrics grid, registered craft badges, tradition narrative, and live products list.

### 1.2 Reusable Pieces
- `INDIA_STATES_PATHS` & `INDIA_VIEWBOX` from `frontend/src/data/indiaMapData.js`: Official Survey of India depiction for state boundaries.
- `CRAFT_CLUSTERS` from `frontend/src/data/craftClusters.js`: Curated craft clusters and beneficiary associations.
- `mock_data.py` / storefront products: Existing catalog fixtures for craft linkage.
- Lucide React icons: `Compass`, `ShieldCheck`, `Sparkles`, `MapPin`, `Layers`, `ShoppingBag`, etc.

### 1.3 Identified Risks & Mitigations
1. **Offline Tile Failure during Demo Video**:
   - *Risk*: Relying on Mapbox/OpenStreetMap raster or vector tiles can fail without internet or during live recording.
   - *Mitigation*: MapLibre GL configured with a local, zero-external-tile style using a bundled GeoJSON of India boundaries and states following Survey of India depiction.
2. **Performance on Laptop / Low-Power Machines**:
   - *Risk*: Heavy canvas or vector rendering could cause frame drops.
   - *Mitigation*: Native GeoJSON layers (fill, line, circle, heatmap) optimized in MapLibre GL, with deterministic animation keyframes.
3. **Data Integrity & Hallucination**:
   - *Risk*: Hardcoding false folklore or fictitious coordinates.
   - *Mitigation*: Hard contract schemas with verified coordinates from official databases (ASI, Sahapedia, IndianCulture.gov.in, UNESCO ICH). Explicit validator script (`scripts/genome/validate.py`) checking schema, point-in-polygon state bounds, and source URLs.

---

## 2. Technical Architecture & File Layout

Adhering strictly to the **Hard Rules: Add-On Only**:
```
frontend/
├── genome.html                         # Dedicated standalone HTML entry point (/genome.html)
├── src/
│   └── genome/
│       ├── main.jsx                    # Vite React mount for genome.html
│       ├── GenomeApp.jsx               # Master application container
│       ├── genome.css                  # Custom styling, glow utilities, and MapLibre dark style
│       ├── data.js                     # Unified Data Access Module (contracts & loader)
│       ├── INTEGRATION.patch           # 4-line patch for optional storefront button
│       ├── components/
│       │   ├── GenomeMap.jsx           # MapLibre GL map engine (offline local GeoJSON)
│       │   ├── LayerToggles.jsx        # 10 cultural type chips & visibility controls
│       │   ├── ElementDossier.jsx      # Side-panel with EN/HI, metrics, and sources
│       │   ├── CulturalDNAExplorer.jsx # Warli hero similarity graph & glowing heat blobs
│       │   ├── StoryModal.jsx          # Folk narrative cards + Web Speech audio narration
│       │   ├── TimeSlider.jsx          # Kathak 1200-2026 spatial-temporal timeline
│       │   ├── UnknownIndiaDrawer.jsx  # Rarity >= 4 discovery mode with "Did You Know?"
│       │   ├── JourneyPlanner.jsx      # Curated Mumbai-Nashik-Sambhajinagar cultural route
│       │   ├── CommerceHookModal.jsx   # "Support this tradition" -> ShilpSetu craft bridge
│       │   └── DemoControlBar.jsx      # Keys 1-7, deterministic presets, and sources panel
│       └── utils/
│           ├── speech.js               # Web Speech synthesis wrapper with Hindi/English voice
│           ├── geojsonConverter.js     # Turns cultural_elements into MapLibre GeoJSON sources
│           └── soundEffects.js         # Ambient sound & subtle UI feedback
├── public/
│   └── data/
│       └── genome/
│           ├── india_states.geojson    # Official Survey of India GeoJSON (J&K, Ladakh, Arunachal)
│           ├── cultural_elements.json  # 10 types (dance, music, instrument, cuisine, etc.)
│           ├── relations.json          # Inter-element semantic relations & weights
│           ├── stories.json            # Folklore, Lok-Kathas, and oral stories
│           └── timeline_events.json    # Temporal milestones for Kathak (1200-2026)
scripts/
└── genome/
    ├── validate.py                     # Schema, point-in-polygon, and source URL validator
    └── generate_geojson.py             # Generates clean GeoJSON from Survey of India source
```

---

## 3. Implementation Plan by Phase

- [x] **Step 0**: Analyse live app, study tokens, write `docs/CULTURAL_GENOME_MAP.md`.
- [ ] **Phase 1**: Data layer + Validator. Install `maplibre-gl` in `package.json`, create schemas, seed valid verified datasets, and write `scripts/genome/validate.py`.
- [ ] **Phase 2**: Map & Layer Toggles. Standalone entry `genome.html`, MapLibre local offline GeoJSON, 10 type toggles, element pins, and side-panel dossier.
- [ ] **Phase 3**: Cultural DNA Explorer & Similarity Heatmap. Warli hero demo, dynamic relational links, and border-agnostic glowing heat blobs.
- [ ] **Phase 4**: Story Map. Cultural story cards, Web Speech API narration ("AI-narrated retelling - Source: X").
- [ ] **Phase 5**: Time Slider (Kathak Heritage). 1200 → 1500 → 1800 → 1947 → Today temporal progression.
- [ ] **Phase 6**: "Unknown India" Discovery Mode. Zoom-triggered discovery of rarity >= 4 elements with "Did You Know?" cards.
- [ ] **Phase 7**: Journey Planner. Curated Mumbai → Nashik → Chhatrapati Sambhajinagar heritage trail.
- [ ] **Phase 8**: Commerce Hook & Storefront Link. "Support this tradition" connecting back to ShilpSetu artisans without editing existing files.
- [ ] **Phase 9**: Demo Mode (`/genome.html?demo=1`), keyboard shortcuts (1-7), `INTEGRATION.patch`, and QA audit.
