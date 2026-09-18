# Person 5 — Integration & Merge Lead Prompt & Routine

### Checklist
- [ ] P0: Products database table created with columns matching Persons 1/3/4
- [ ] P0: POST `/api/v1/products/save` and GET `/api/v1/products` endpoints built
- [ ] P0: Simple dashboard screen listing saved products
- [ ] P0: GitHub Actions CI file added
- [ ] P0: Daily branch integration & Render verification complete

### Initial Setup Prompt for Antigravity
You are working in a cloned copy of the KalaSangam repository. I do not know git deeply, so explain any command before running it, but you should execute it yourself rather than asking me to.

STEP 1 — Add persistence:
In backend/app/, add a SQLite database using SQLAlchemy. Create a "products" table with these columns: id, image_url, title_en, title_hi, price_b2c, price_b2b, price_gem, category, status (default "draft"), created_at. Add two new endpoints: POST /api/v1/products/save (accepts a product's data and saves it) and GET /api/v1/products (returns all saved products, newest first). Do not modify any existing endpoint in main.py while doing this — only add new routes.

STEP 2 — Add a simple dashboard:
Create a new frontend page/component that calls GET /api/v1/products and displays them as a simple list or grid — image, title, prices, status. This does not need to be fancy, it just needs to prove the app has persistent state.

STEP 3 — Add GitHub Actions CI:
Create a file at .github/workflows/build-check.yml with a workflow that, on every push to any branch, runs: (1) cd backend && pip install -r requirements.txt (2) a basic import check that the FastAPI app loads without errors (3) cd frontend && npm install && npm run build. This should show a green checkmark or red X directly on GitHub for every push, so teammates can see if their code is deployable without needing Render access.

STEP 4 — Mandatory pre-commit verification (same as everyone else):
cd backend && pip install -r requirements.txt && uvicorn app.main:app --port 8001 (confirm it starts, then stop it)
cd ../frontend && npm install && npm run build (confirm no errors)
Only proceed once both pass.

STEP 5 — Commit and push to main (this is the one branch allowed to push directly to main, since this is the integration role):
git add .
git commit -m "Add product persistence, dashboard, and CI build checks"
git push origin main

STEP 6 — Report back:
Confirm the build check passed, confirm the push succeeded, and show me the exact new files created.

---

### Ongoing Daily Merge Routine (Repeat for each teammate branch)
When merging `feature/<name>` into `main`:
1. `git fetch origin`
2. `git checkout main`
3. `git pull origin main`
4. `git merge origin/feature/<name>`
5. If there are merge conflicts, inspect conflicting files and resolve them.
6. Run local verification:
   - `cd backend && pip install -r requirements.txt && uvicorn app.main:app --port 8001` (confirm no crash, then stop)
   - `cd ../frontend && npm install && npm run build` (confirm no errors)
7. If both pass: `git push origin main`
8. Check Render's auto-deploy dashboard and verify the live browser site.