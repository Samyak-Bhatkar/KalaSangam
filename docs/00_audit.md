# ShilpSetu System Baseline Audit (docs/00_audit.md)

## 1. Startup Commands
* **Backend**: `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload` (from `backend/`)
* **Frontend**: `npm run dev` (from `frontend/`, default port: `5173`)
* **Test Commands**:
  * Backend: `pytest` or `python -m unittest discover`
  * Frontend: `npm run build` (vite build check)
  * Knowledge Base: `python scripts/kb_audit.py`

## 2. Roles & Existing Routes
* **Roles**:
  * `artisan` (Shanti Devi, Ramesh Kumar): studio camera, voice catalog, pricing card, craft draft.
  * `coordinator` (Gram Coordinator): verification queue, physical audit, motif suggestions review.
  * `buyer` / `public`: storefront browsing, cart, order confirmation, QR product verification.
* **Routes**:
  * `/` (or `/?role=artisan|coordinator|buyer`): Main role-switched application shell.
  * `/?view=scan`: Public zero-auth Motif Scanner modal.
  * `/verify/:id` (e.g. `/verify/CRAFT-NBCFDC-002`): Public provenance & authenticity check with Motif Story.
  * `/studio`: Camera viewfinder & studio lighting suite.
  * `/marketplace`: Buyer storefront.

## 3. Key Files by Module
* **Camera / Viewfinder**: `frontend/src/components/CameraViewfinder.jsx`, `frontend/src/components/StudioReviewScreen.jsx`
* **Decode Motif**: `frontend/src/components/MotifDecoder.jsx`, `backend/app/services/motif_engine.py`, `backend/app/data/motif_kb.json`
* **Voice Catalog**: `frontend/src/components/VoiceCatalogModal.jsx`, `backend/app/services/bhashini_service.py`
* **Pricing Calculator**: `frontend/src/components/PricingCalculatorModal.jsx`, `backend/app/services/pricing_engine.py`
* **IVR Simulator**: `frontend/src/components/IVRSimulatorModal.jsx`, `backend/app/services/ivr_service.py`
* **Watermark & Provenance**: `frontend/src/components/WatermarkModal.jsx`, `backend/app/services/watermark_service.py`
* **ONDC Export**: `frontend/src/components/ONDCExportModal.jsx`, `backend/app/services/ondc_service.py`
* **Marketplace**: `frontend/src/components/BuyerStorefrontScreen.jsx`, `backend/app/services/catalog_engine.py`
* **Coordinator Review**: `frontend/src/components/CoordinatorReviewPanel.jsx`, `backend/app/services/verification_service.py`
* **Public Verify Page**: `frontend/src/components/PublicVerifyScreen.jsx`, `backend/app/main.py` (`/api/v1/products/{id}/verify`)

## 4. Design Tokens & UI System
* **Colors**: Terracotta Amber (`#D97706`, `#B45309`, `#78350F`), Clay/Sand Neutral (`#FDFBF7`, `#F5F0E8`), Slate/Stone (`#1C1917`, `#292524`), Jade Green (`#059669`), Sky Blue (`#0284C7`).
* **Fonts**: `Outfit` / `Inter`, system fallback sans-serif.
* **Radii**: `rounded-2xl` (16px cards), `rounded-xl` (12px inputs/buttons), `rounded-full` (chips/badges).
* **Tap Targets**: Mobile touch targets enforced $\ge 44\text{px}$.

## 5. i18n & Offline Capabilities
* **i18n**: Multi-lingual support primarily in Hindi (`hi`) and English (`en`). Audio prompts support regional spoken dialects via Bhashini TTS with WebSpeech fallback.
* **Offline Mode**: Current baseline relies on server-assisted Gemini/Bhashini endpoints with offline heuristic fallbacks (`build_category_fallback_record`) when connectivity fails. Persistent offline queue via IndexedDB is scoped for upcoming heritage capture modules.

## 6. Three Interfaces Status
* **Artisan Interface**: **Active** (Studio, voice catalog, pricing, camera motif attach).
* **Coordinator Interface**: **Active** (Panchayat review desk, physical authenticity audit, motif suggestions approval).
* **Public Explorer Interface**: **Foundation Active** (Public motif scanner `/view=scan` and `/verify/:id` active; dedicated `/explore` shell scheduled in Card 1).
