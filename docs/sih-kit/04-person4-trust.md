# Person 4 — Trust & Verification Lead Prompt

### Checklist
- [ ] P0: Random challenge code generated and displayed before video recording
- [ ] P0: Camera-only capture enforced (gallery/file upload disabled)
- [ ] P0: New endpoint that records/verifies the video was captured live
- [ ] P0: QR code generated linking to a simple public verification page
- [ ] Antigravity confirmed local build passed before pushing
- [ ] Told Integration Lead: "feature/trust ready to merge"

### Prompt for Antigravity
You are working in a cloned copy of the KalaSangam repository. I do not know git — you must handle all git operations yourself, exactly as instructed below. Do not ask me to run any git commands.

STEP 1 — Branch setup:
Run: git checkout -b feature/trust
If that fails because the branch already exists, run: git checkout feature/trust instead.

STEP 2 — Read before editing:
Open backend/app/services/watermark.py and backend/app/services/reel_generator.py (it already generates QR codes — reuse this pattern, do not build QR generation from scratch) before writing any new code.

STEP 3 — Build these features:

A) Video Integrity Guard — challenge code:
Create a new frontend flow where, right before recording a short "pre-dispatch" video of the finished product, the app generates a random 3-digit code and displays it prominently on screen. The artisan must say the code aloud or hold it up on paper while recording. Build a new backend endpoint POST /api/v1/trust/generate-challenge that returns {"challenge_code": "123", "session_id": "<random string>", "expires_at": "<timestamp 30 minutes from now>"}.

B) Camera-only capture:
In the recording UI, disable any file/gallery upload option for this specific step — the only way to provide the video must be live in-app recording.

C) Verification endpoint:
Create POST /api/v1/trust/verify-video that accepts {"session_id": string, "video_metadata": {...}} and checks that the session_id matches an unexpired challenge from step A. Return {"verified": true/false, "reason": "<string>"}. For this hackathon version, focus on the session/timestamp validation — do not attempt heavy video content analysis yet.

D) Verified Craft Certificate QR:
Reuse the existing QR generation pattern from backend/app/services/reel_generator.py (it already uses the Python qrcode library). Create a new endpoint POST /api/v1/trust/generate-certificate that takes a product_id and beneficiary_id and returns a QR code (base64 image) linking to a simple public page showing the artisan name, product, and verification status from step C. Do not modify the existing watermark embed/verify endpoints in watermark.py — only add new code.

E) IF TIME REMAINS AND ONLY IF Person 1's damage_marks feature has already been merged into main (ask me to confirm before starting this part): extend the video verification to check that the video includes a close-up pan near the coordinates in damage_marks, by comparing a cropped region of a video frame against the corresponding cropped region of the original photo. Do not attempt this until damage_marks actually exists in the merged code — building against a guess will break later.

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
git commit -m "Add video integrity guard and verified craft certificate"
git push origin feature/trust
(If push asks about upstream, run exactly what it suggests, usually: git push --set-upstream origin feature/trust)

STEP 6 — Report back to me in plain English:
- What you built
- Confirm the build check passed
- Confirm you pushed to feature/trust (NOT main)
- List the exact new/changed files