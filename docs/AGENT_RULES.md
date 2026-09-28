# AGENT RULES (apply to every task)

1. SCOPE. One feature per task. Add-only: never change existing behaviour of login, studio, camera, voice catalog, pricing, IVR simulator, watermark, ONDC export, marketplace, coordinator review. Existing files may get minimal mount points only (a route, button, tab, import). If a change to existing behaviour is unavoidable, log it in docs/DECISIONS_NEEDED.md and stop. No refactors, no re-auditing the whole repo (use docs/00_audit.md).

2. HONESTY. Never invent facts, statistics, GI numbers, ages, centuries, sources or "verified" labels. Unknown = null + needs_verification. Seed/demo data has is_demo=true and shows a small "Demo data" marker. Simulated things (IVR telephony, WhatsApp, ONDC publish) are labelled "simulated". Never write "first in the world", "no one else", "tamper-proof", "guaranteed". Never say a step passed without evidence (screenshot or log).

3. CONSENT AND PRIVACY (in the spirit of DPDP Act 2023; do not claim legal compliance). Consent before any recording is stored. Nothing public without an explicit public scope. Withdrawal must remove content everywhere. Collect the minimum. Notice in the user's language.

4. PROVENANCE LABELS on every cultural claim: green = community-verified (real source or approved review), yellow = AI-observed (inference), blue = artisan-told (attributed, consented), grey = draft/unverified. Several attributed interpretations may be shown side by side.

5. UX. Reuse existing design tokens and components; no new visual identity. Every artisan action: icon + Hindi label + English label, optional audio hint. Core artisan action in 3 taps or fewer. Bottom sheets on mobile, skeleton loaders, friendly empty/error states. All text from i18n files (hi, en); dialect words are kept verbatim with glosses. Tap targets >= 44px.

6. VERIFICATION (after implementing, using the running app in the browser; store evidence in docs/verification/<NN>-<slug>/):
   a. Start the app clean: no console errors or failed requests.
   b. Open every affected screen at 360x640, 390x844, 768x1024, 1280x800: no horizontal scroll, no overlap/clipping, long Hindi text wraps.
   c. Test each flow for each role that can reach it, including back/cancel/refresh.
   d. Backend and API: valid, invalid, oversized, unauthorised input; correct status codes; run existing tests.
   e. Database: inspect rows after the flow; migrations work on a fresh DB; withdrawal/deletion works.
   f. Accessibility: labels on icon buttons, contrast >= 4.5:1, visible focus, reduced-motion respected, audio has captions/transcript.
   g. Edge cases: empty state, long text, slow network, API 429/500, camera/mic denied, offline (must queue or degrade honestly, never show a fake result).
   h. Language: Hindi and English fully localised.
   i. Regression: smoke-test existing features (studio slider, voice catalog, pricing, IVR simulator, watermark modal, ONDC export, storefront, coordinator review).
   j. Fix every bug, repeat until two clean passes. If it still fails after 3 cycles, do not commit: write it to docs/KNOWN_ISSUES.md and stop.

7. GIT. Work on feat/heritage-innovations. One clean commit per feature, only after verification. Message: feat(module): short description (fix(...) or docs(...) when appropriate). Include code, tests, seed data, i18n strings, the feature doc and evidence. Never force-push or rewrite history.

8. FEATURE DOC. Create docs/innovations/<NN>-<slug>.md with: Title; Tier; Interfaces; Commit hash; Status (Built & verified / Partial); One-line pitch; The pain point; Closest existing products and our difference (mark uncertain items UNVERIFIED); How it works per role; Architecture (files, endpoints, tables, AI models); Consent and privacy; Language/accessibility/offline; Measurable impact (only real prototype measurements, e.g. taps and seconds, labelled "prototype measurement"); Edge cases handled; Verification evidence; Honest limitations; Slide-ready block (Title / Problem / Solution / 4 key points / Impact / Tech / Judge hook); Screenshot list. Then update docs/INDEX.md and docs/PROGRESS.md.

9. DISCIPLINE. Keep replies short. Do only the task in front of you. Do not start another feature. When finished, print: files touched, commit hash, verification result, known issues.
