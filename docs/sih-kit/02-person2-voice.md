# Person 2 — Voice & Language Lead Prompt

### Checklist
- [ ] P0: Editable review screen confirmed working (user can edit AI-generated title/description before confirming)
- [ ] P0: 2+ new regional language fixtures added beyond the existing 4
- [ ] P0: Text-to-speech "read it back" button added (Hindi)
- [ ] P0: Confirmed `confidence_score` and `seo_keywords` fields are used in the UI
- [ ] P1: IVR concept — either a real telephony integration OR a clearly-labeled simulated demo
- [ ] Antigravity confirmed local build passed before pushing
- [ ] Told Integration Lead: "feature/voice ready to merge"

### Prompt for Antigravity
You are working in a cloned copy of the KalaSangam repository. I do not know git — you must handle all git operations yourself, exactly as instructed below. Do not ask me to run any git commands.

STEP 1 — Branch setup:
Run: git checkout -b feature/voice
If that fails because the branch already exists, run: git checkout feature/voice instead.

STEP 2 — Read before editing:
Open backend/app/services/catalog_engine.py, backend/app/models/mock_data.py, and frontend/src/components/VoiceRecorder.jsx to understand the current code before changing anything.

STEP 3 — Build these features:

A) Editable review screen:
In frontend/src/components/VoiceRecorder.jsx (or wherever the catalog result is shown after voice processing), make sure the artisan can tap on the generated title_en, title_hi, description_en, and description_hi text and edit them directly before confirming, rather than only seeing read-only text. If this already exists, confirm it works and skip.

B) More language fixtures:
In backend/app/models/mock_data.py, add at least 2 more regional craft fixtures beyond the existing 4 (Gorakhpur Terracotta, Chanderi Saree, Bastar Dhokra, Madhubani Painting). Follow the exact same structure as the existing fixtures. Pick from other well-known Indian crafts eligible for GI tags, e.g. Kutch embroidery, Warli painting, Pashmina, Kondapalli toys — your choice, just match the existing data shape exactly.

C) Text-to-speech playback:
Add a button next to the generated Hindi description that uses the browser's built-in SpeechSynthesis API to read the text aloud in Hindi. This does not require any new backend work — do it entirely in the frontend.

D) Confirm confidence_score and seo_keywords are surfaced:
Check the /api/v1/catalog/voice-process-json response — it should already include confidence_score and seo_keywords fields. Confirm the frontend actually displays these (e.g. as a small badge/tag list) rather than silently ignoring them. If they are missing from the response entirely, add them to backend/app/services/catalog_engine.py as ADDITIVE fields — do not change any existing field name.

E) IF TIME REMAINS (optional, do this last): document how a phone-based IVR flow would work, and if possible, build a minimal proof-of-concept webhook endpoint that accepts a phone transcript and calls the SAME internal catalog-generation function used by the app (do not duplicate the Gemini logic). If a real telephony integration is too complex, instead create a short recorded video/audio demo simulating the flow, and clearly label it "simulated for demo" in a comment. Do not let this block A/B/C/D.

STEP 4 — Mandatory pre-commit verification:
Before committing anything, run these commands and confirm they succeed:
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8001
(confirm it starts without crashing, then stop it)
cd ../frontend
npm install
npm run build
(confirm this completes with no errors)

If either step fails, fix the error yourself and re-run the check. Do NOT proceed to Step 5 until both pass.

STEP 5 — Commit and push:
git add .
git commit -m "Add voice catalog improvements, new fixtures, and TTS playback"
git push origin feature/voice
(If push asks about upstream, run exactly what it suggests, usually: git push --set-upstream origin feature/voice)

STEP 6 — Report back to me in plain English:
- What you built
- Confirm the build check passed
- Confirm you pushed to feature/voice (NOT main)
- List the exact new/changed files