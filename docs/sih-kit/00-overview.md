# KalaSangam — SIH Round 2 Team Execution Kit
5 people, zero git/code knowledge assumed, safe-by-design deployment

### 0. How the System Works
Each person is given exactly one prompt to paste into their Antigravity chat. That prompt makes the agent:
- Create their own branch (never touches `main`)
- Do the actual coding work
- Run a local build check before committing anything — if it fails, the agent fixes it and retries, it does not ask the human to debug
- Commit and push to their own branch only
- Report back a plain-English summary

**Why this is safe:** Render is configured to deploy only from `main`. Nobody except the Integration Lead pushes to `main`. Teammate mistakes cannot reach the live site directly; they can only cause a messy merge, which the pre-commit build-check step prevents.

### 1. Universal Rules
- Never edit `main` directly.
- Only **ADD** new fields to existing API responses — never rename or remove one (this ensures independent branches remain mergeable).
- Always verify the app still builds/runs locally before committing.
- Never push directly to `main`.

### 2. Feature Ownership Split
| Feature | Status Today | Assigned Owner |
| :--- | :--- | :--- |
| **Image Studio (enhance)** | ✅ Working | Person 1 — adds capture guidance + damage marking |
| **Voice-to-Catalog** | ✅ Working (Bhashini stubbed) | Person 2 — polish + fixtures + IVR concept |
| **Pricing Engine** | ✅ Working | Person 3 — adds market-trend multiplier |
| **Bargain Guard Negotiation** | ✅ Working | Person 3 — UI polish only |
| **Digital GI Watermark** | ✅ Working | Person 4 — reuses for Craft Certificate |
| **Video Reel + QR** | ✅ Working | Person 4 — reuses QR pattern for Trust features |
| **ONDC Export** | ✅ Working | No new work needed |
| **Video Integrity Guard** | ❌ Not started | Person 4 — new |
| **Micro-Credit Scorecard** | ❌ Not started | Person 3 — new (depends on Person 5's DB) |
| **360° / Spin View** | ❌ Not started | Person 1 — new (P1 stretch) |
| **Conversational IVR** | ❌ Not started | Person 2 — new (P1 stretch) |
| **Product Persistence (DB)** | ❌ Not started | Person 5 — new (everyone depends on this) |