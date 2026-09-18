# Person 3 — Finance & Negotiation Lead Prompt

### Checklist
- [ ] P0: Market-trend multiplier added to pricing calculation
- [ ] P0: Underpricing warning has a visual red/green indicator
- [ ] P0: Bargain Guard UI shows buyer offer vs. counter-offer side by side clearly
- [ ] P1: Micro-Credit Scorecard (depends on Person 5's products table)
- [ ] Antigravity confirmed local build passed before pushing
- [ ] Told Integration Lead: "feature/finance ready to merge"

### Prompt for Antigravity
You are working in a cloned copy of the KalaSangam repository. I do not know git — you must handle all git operations yourself, exactly as instructed below. Do not ask me to run any git commands.

STEP 1 — Branch setup:
Run: git checkout -b feature/finance
If that fails because the branch already exists, run: git checkout feature/finance instead.

STEP 2 — Read before editing:
Open backend/app/services/pricing_engine.py, backend/app/services/negotiator.py, and frontend/src/components/PricingCard.jsx and frontend/src/components/BargainGuard.jsx to understand the current code before changing anything.

STEP 3 — Build these features:

A) Market-trend multiplier:
In backend/app/services/pricing_engine.py, add a small dictionary mapping craft categories (e.g. "Handloom Textiles", "Terracotta & Pottery", "Metal Casting", "Folk Painting") to an approximate market average price adjustment factor (e.g. 0.9 to 1.15). Use this to adjust the final b2c_price by up to plus or minus 15%, layered on top of the existing calculation — do not replace the existing statutory wage-floor logic, only adjust the result. Add a new field "market_trend_applied": true/false and "market_trend_factor": <number> to the response as ADDITIVE fields. Do not rename or remove b2c_price, b2b_price, gem_price, is_underpriced, or any other existing field.

B) Visual underpricing indicator:
In frontend/src/components/PricingCard.jsx, make the existing underpricing warning show a clear red banner/icon when is_underpriced is true, and a green checkmark/banner when it is false. Right now confirm whether this is text-only and upgrade it visually if so.

C) Bargain Guard side-by-side view:
In frontend/src/components/BargainGuard.jsx, make sure the buyer's offer (buyer_offer_inr) and the counter-offer (counter_offer_inr) are shown next to each other clearly, with the loss_per_unit_inr and margin_recovered_inr also visible. If this already exists, confirm it's visually clear and skip.

D) IF TIME REMAINS AND ONLY IF a products database table already exists (ask me to confirm this before starting — do not build this against assumptions): build a new endpoint GET /api/v1/artisan/credit-score that reads from the products table (fields like number of products, total sale value, listing consistency over time) and returns a simple 0-100 score with a one-line plain-English explanation, e.g. {"score": 72, "explanation": "Consistent seller with 8 listed products"}. This is a transparent formula, not a real ML model — do not claim otherwise in comments or UI text.

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
git commit -m "Add market trend pricing, visual pricing warnings, and credit score"
git push origin feature/finance
(If push asks about upstream, run exactly what it suggests, usually: git push --set-upstream origin feature/finance)

STEP 6 — Report back to me in plain English:
- What you built
- Confirm the build check passed
- Confirm you pushed to feature/finance (NOT main)
- List the exact new/changed files