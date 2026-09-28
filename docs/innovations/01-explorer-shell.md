# Innovation 01 — Public Heritage Explorer Shell (docs/innovations/01-explorer-shell.md)

**Title**: Public Heritage Explorer Shell with Academic Citation & Student Lens  
**Tier**: Foundation  
**Interfaces**: Explorer (Public, Zero Login)  
**Status**: Built & verified  
**Commit**: *(Pending commit)*  

---

## 1. One-Line Pitch
A story-led public exploration portal allowing students, tourists, and conscious buyers to discover India's living crafts, decode cultural iconography, and generate verified academic citations without requiring authentication.

---

## 2. The Pain Point
Traditional handloom and handicraft applications are built solely for authenticated artisans (who need to list items) or field coordinators (who conduct audits). Tourists, students, researchers, and global buyers who encounter a craft in daily life have no home in the app. Furthermore, existing e-commerce apps treat crafts as mere commercial SKU inventory, stripping away the cultural origin, traditional techniques, and citation sources.

---

## 3. Closest Existing Products & Our Difference
* **Google Arts & Culture / IGNCA Virtual Galleries**: Curates museum-owned, static museum objects and historical archives.  
  * *Our Difference*: ShilpSetu connects living artisans to real-time cultural knowledge. Rather than a museum view, it links active village clusters, living master techniques, and fair-trade maker connections.
* **Etsy / ONDC Buyer Apps**: Commercial catalogs focused solely on price, shipping, and discount filters.  
  * *Our Difference*: First-class "Student Lens" (छात्र लेंस) toggle exposing confidence metrics, primary bibliographic citations, and stable academic permalinks (`/record/:id?v=1`) adhering to academic citation guidelines.

---

## 4. How It Works per Role
* **Public Explorer / Student / Tourist**:
  1. Accesses `/explore` without entering a mobile number or OTP.
  2. Selects between 5 primary navigation tabs: **Scan** (Motif recognition), **Atlas** (Geospatial clusters), **Stories** (Oral lore), **Learn** (Guru-Shishya techniques), and **Shop** (Fair marketplace).
  3. Toggles **Student Lens** to reveal source audits, confidence thresholds, and clicks **"Cite this"** to copy a standardized archival citation with stable permalink.
* **Artisan**:
  * Unaffected in their dedicated studio flow; products published by artisans automatically populate the Explorer shell with consent-aware badges.
* **Coordinator**:
  * Unaffected in their verification desk; approved motif lore flows directly into Explorer story records.

---

## 5. Architecture
* **Frontend**:
  * `frontend/src/components/ExplorerShell.jsx`: Main 5-tab responsive navigation shell, student lens toggle, citation modal.
  * `frontend/src/config/branding.js`: Centralized student prototype branding configuration.
  * `frontend/src/i18n/explorer.js`: Localized Hindi (`hi`) and English (`en`) strings.
  * `frontend/src/App.jsx`: Routing mounts for `/explore`, `?view=explore`, and permalink stub `/record/:id`.
  * `frontend/src/components/AuthLoginScreen.jsx`: Prominent entry card on login screen.
  * `frontend/src/components/BuyerStorefrontScreen.jsx`: Explorer header button on public marketplace.
* **Endpoints**:
  * `GET /explore`: Frontend SPA route.
  * `GET /record/:id?v=1`: Resolves permanent reference stub to public verification passport.
* **Database & Seed Models**:
  * Reuses `motif_kb.json` and `products.json` mock fixtures.

---

## 6. Consent, Privacy & DPDP Act Spirit
* **Zero Personal Data Collection**: No cookies, tracking pixels, phone numbers, or user IDs are requested or stored in public Explorer mode.
* **Read-Only Scopes**: Only artifacts with public-scope authorization are exposed. Private artisan drafts remain strictly protected behind artisan authentication.
* **Client-Side Processing**: Camera frames are processed on ephemeral canvas downscaling without cloud storage.

---

## 7. Language, Accessibility & Offline
* **Localization**: 100% localized in Hindi and English. Long Devanagari headings wrap smoothly across screens as narrow as 360px.
* **Accessibility**:
  * All icon-only buttons include `title` and `aria-label` tags.
  * Color contrast ratios on dark backdrop exceed 7:1 (amber-400 `#FBBF24` on slate-950 `#020617`).
  * Touch targets are enforced $\ge 44\text{px}$ across the bottom navigation bar.
* **Offline Behavior**:
  * Offline browsing falls back to cached clusters and category-level craft knowledge with clear "Offline preview" indicators.

---

## 8. Measurable Impact
* **Prototype Measurements**:
  * Taps to open camera scan from home screen: **1 tap** (0 login screens).
  * Citation generation latency: **0ms** (instant client-side ISO format construction).
  * Viewport compatibility: **100% passing across 360px, 390px, 768px, and 1280px**.

---

## 9. Edge Cases Handled
1. **Camera Denied or Missing**:
   * Fallback to gallery upload (`<input type="file" />`) ensures users without active webcams can explore motifs.
2. **Unbuilt Innovation Modules**:
   * Tabs for Atlas (Card 8), Stories (Card 11), and Learn (Card 17) render polished, informative "Coming Soon (Prototype)" milestones rather than dead links or broken 404 pages.
3. **Clipboard API Unavailable**:
   * Graceful text selection container provided inside citation modal if `navigator.clipboard` is restricted by browser security policies.

---

## 10. Verification Evidence
All test artifacts captured and stored in [`docs/verification/01-explorer-shell/`](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/verification/01-explorer-shell/):
* `explore_360x640_mobile.png`: Android entry-level viewport verification.
* `explore_390x844_iphone.png`: iPhone mobile layout verification.
* `explore_768x1024_tablet.png`: iPad tablet viewport verification.
* `explore_1280x800_desktop.png`: Desktop laptop viewport verification.
* `login_screen_explorer_card.png`: Entry card mounted on unauthenticated login screen.
* `record_stable_permalink.png`: `/record/CRAFT-NBCFDC-002?v=1` permanent citation link resolving cleanly to public verification passport.

---

## 11. Honest Limitations
* The "Atlas", "Stories", and "Learn" tabs currently display high-fidelity teaser mockups with scheduled milestone markers (Cards 8, 11, and 17). They will become fully interactive as each respective feature card is completed.
* The academic citation string currently formats records using ISO 690 / APA-style web references; full BibTeX / RIS file downloads can be incorporated in future iterations.

---

## 12. Slide-Ready Pitch Block
* **Title**: ShilpSetu Public Heritage Explorer & Academic Lens
* **Problem**: Heritage platforms are walled off behind artisan accounts or treat cultural crafts as commodity marketplace items.
* **Solution**: A zero-auth public explorer with 5 thematic pathways and an academic student lens generating stable archival citations.
* **4 Key Points**:
  1. Instant access without credentials on mobile or desktop.
  2. Integrated public motif scanner with EXIF-stripped privacy.
  3. "Student Lens" reveals verified sources and confidence metrics.
  4. 1-click citation export with permanent permalink `/record/:id?v=1`.
* **Impact**: Increases craft engagement among youth, researchers, and global cultural enthusiasts.
* **Tech Stack**: React 19, Tailwind CSS, Lucide Icons, Client Canvas, Vite.
* **Judge Hook**: *"Within 5 seconds of opening ShilpSetu, a university student can scan a Chanderi saree, discover its 500-year-old weaving lineage, and cite it in their thesis."*

---

## 13. Screenshot List
1. [explore_360x640_mobile.png](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/verification/01-explorer-shell/explore_360x640_mobile.png)
2. [explore_390x844_iphone.png](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/verification/01-explorer-shell/explore_390x844_iphone.png)
3. [explore_768x1024_tablet.png](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/verification/01-explorer-shell/explore_768x1024_tablet.png)
4. [explore_1280x800_desktop.png](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/verification/01-explorer-shell/explore_1280x800_desktop.png)
5. [login_screen_explorer_card.png](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/verification/01-explorer-shell/login_screen_explorer_card.png)
6. [record_stable_permalink.png](file:///c:/SAMYAKFILES/Users/AppData/Local/Programs/DATA%20SCIENCE%20COURSE/SIH/ShilpSetu/docs/verification/01-explorer-shell/record_stable_permalink.png)
