# KalaSangam — SIH Round 2 Team Execution Workflow

This repository uses a modular team execution workflow for SIH Round 2.

## Team Execution Kit Directory
Refer to the modular kit files located under `docs/sih-kit/`:
- [00-overview.md](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/sih-kit/00-overview.md) — Overview, branch strategy, safety rules, and architecture split
- [01-person1-vision.md](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/sih-kit/01-person1-vision.md) — Person 1 (Vision / Image Studio) prompt & checklist
- [02-person2-voice.md](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/sih-kit/02-person2-voice.md) — Person 2 (Voice / Cataloging) prompt & checklist
- [03-person3-finance.md](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/sih-kit/03-person3-finance.md) — Person 3 (Pricing & Financial Engine) prompt & checklist
- [04-person4-trust.md](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/sih-kit/04-person4-trust.md) — Person 4 (Trust, Provenance, ONDC & Reels) prompt & checklist
- [05-person5-lead.md](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/sih-kit/05-person5-lead.md) — Person 5 (Integration Lead) prompt & deployment routine

## Core Agent Rules for All Teammates:
1. **Never commit directly to `main`**: Always work on your designated feature branch.
2. **Additive Changes**: Add new endpoints, components, and helper utilities additively to minimize merge conflicts.
3. **Mandatory Build Verification**: Before committing or pushing, verify that `npm run build` succeeds cleanly without errors.
4. **Self-Contained Commits**: Only push code to your feature branch and summarize changes for the Integration Lead.
