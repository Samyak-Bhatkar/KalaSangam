# Person 1 — Vision & Capture Lead Prompt

### Checklist
- [ ] P0: Live capture guidance (brightness/blur/angle text hints) added to `CameraViewfinder.jsx`
- [ ] P0: Tap-to-mark damage feature — tapping the enhanced photo stores `{x, y}` coordinates
- [ ] P0: Circle + arrow overlay renders at the tapped point
- [ ] P0: `damage_marks: [{x, y}]` array added to the `/api/v1/studio/enhance` response (additive only)
- [ ] P1: Guided 360° capture flow (8 rotation shots) + swipeable spin viewer component
- [ ] Confirmed: existing `enhanced_image_url`/`studio_url`/`processed_base64` keys unchanged
- [ ] Antigravity confirmed local build passed before pushing
- [ ] Told Integration Lead: "feature/vision ready to merge"

### Prompt for Antigravity
You are working in a cloned copy of the KalaSangam repository. I do not know git — you must handle all git operations yourself, exactly as instructed below. Do not ask me to run any git commands.

STEP 1 — Branch setup:
Run: git checkout -b feature/vision
If that fails because the branch already exists, run: git checkout feature/vision instead.

STEP 2 — Read before editing:
Open backend/app/services/image_studio.py and frontend/src/components/CameraViewfinder.jsx and frontend/src/components/StudioReviewCard.jsx to understand the current code before changing anything.

STEP 3 — Build these features:

A) Live capture guidance (frontend/src/components/CameraViewfinder.jsx):
Add real-time on-screen text hints while the camera preview is active: detect if the frame is too dark (average pixel brightness) and show "Move to better light"; detect if the frame is blurry (simple sharpness check) and show "Hold steady"; show a generic "Center the product" hint if no other issue is detected. Use lightweight checks — this must run smoothly on a live camera feed, not a heavy AI model.

B) Damage marking:
After a photo is enhanced via the existing /api/v1/studio/enhance flow, let the user tap anywhere on the resulting image. On tap, store the tap's {x, y} coordinate (as a percentage of image width/height, not raw pixels, so it works at any display size). Draw a circle with a short arrow pointing to that exact spot, rendered as an overlay on top of the image (do not modify the underlying image file). Allow multiple taps (multiple marks). Show a small text input next to each mark so the user can optionally add a one-word label like "chip" or "crack".

C) Backend change (backend/app/models/schemas.py and backend/app/main.py):
In the response of POST /api/v1/studio/enhance, ADD a new optional field: "damage_marks": [] (empty array by default). Do NOT rename, remove, or change the type of any existing field in that response (enhanced_image_url, studio_url, processed_base64, width, height, lighting_normalized, drop_shadow_applied must all stay exactly as they are). This new field will be populated by a follow-up request once the user has tapped their marks — design a simple new endpoint POST /api/v1/studio/damage-marks that accepts {studio_url: string, marks: [{x: float, y: float, label: string}]} and stores/returns them alongside the studio_url.

D) IF TIME REMAINS (optional, do this last): build a guided 360° capture flow — show rotation instructions ("rotate right slightly", "tilt down") across 8 photo captures, then display them in a simple swipeable viewer component. This is a nice-to-have, do not let it block A/B/C.

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
git commit -m "Add capture guidance and damage marking to image studio"
git push origin feature/vision
(If push asks about upstream, run exactly what it suggests, usually: git push --set-upstream origin feature/vision)

STEP 6 — Report back to me in plain English:
- What you built
- Confirm the build check passed
- Confirm you pushed to feature/vision (NOT main)
- List the exact new/changed files