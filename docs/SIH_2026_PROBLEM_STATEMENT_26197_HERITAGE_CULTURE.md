# Smart India Hackathon (SIH 2026) — Problem Statement 26197
## Theme: Heritage & Culture | AICTE Student Innovation

---

## 1. Problem Statement Identification

| Attribute | Details |
| :--- | :--- |
| **Problem Statement ID** | `26197` |
| **Problem Statement Title** | **Student Innovation — Ideas that showcase the rich cultural heritage and traditions of India.** |
| **Category** | Software |
| **Theme** | **Heritage & Culture** |
| **Organization** | All India Council for Technical Education (AICTE) |
| **Department** | AICTE, MIC-Student Innovation (Ministry of Education's Innovation Cell) |
| **Project Title** | **ShilpSetu (KalaSangam) — The Living Heritage Knowledge Vault & Provenance Protocol** |
| **Team Name** | **INVINCIBLE** |
| **Team Leader** | Samyak Anil Bhatkar (`samyakbhatkar9@gmail.com`) |
| **Repository** | [https://github.com/Samyak-Bhatkar/KalaSangam](https://github.com/Samyak-Bhatkar/KalaSangam) |

---

## 2. Executive Summary & Innovation Thesis

India is the repository of over **3,000 distinct artisanal craft clusters** and hundreds of Geographical Indication (GI) heritage crafts. However, India's traditional crafts face a dual crisis:
1. **Commercial Erasure**: Cheap, synthetic powerloom/factory counterfeits dilute market value, leaving master artisans impoverished.
2. **Knowledge Extinction**: The *intangible cultural heritage*—oral folk stories (*Lok-Kathas*), generational guru lineages, regional dialects, and indigenous technical processes—is stored entirely in the memories of elderly masters and is dying out with them.

### Our Solution: ShilpSetu (KalaSangam)
Rather than building a standard, dry e-commerce app, **ShilpSetu transforms every handicraft into a Living Cultural Archive**. 

Using **Multimodal AI (Gemini 2.5/Flash), MeitY Bhashini Speech Models, and Feature Phone IVR**, ShilpSetu empowers low-literacy artisans to:
- **Showcase & Decode Heritage**: Scan sacred motifs, traditional tools, and crafting steps with computer vision.
- **Archive Dying Oral Traditions**: Collect folklore (*Lok-Kathas*), technique recipes, and dialect vocabulary through voice and toll-free keypad phones.
- **Prove Authentic Provenance**: Generate a verifiable **Heritage Passport** with GI validation, lineage trees, and "Hear the Maker" audio for global buyers on ONDC.

---

## 3. The 20 Architectural Add-On Innovations

All 20 innovations attach seamlessly as new options or tabs to existing ShilpSetu modules, preserving 100% of the tested core architecture while dramatically amplifying cultural depth.

```
                             SHILPSETU HERITAGE ARCHITECTURE
                                            │
   ┌───────────────────┬────────────────────┼───────────────────┬───────────────────┐
   │                   │                    │                   │                   │
Camera Module       Voice Studio         Kala-Vani IVR       Pricing & Trust    Buyer Storefront
(Vision AI)        (Oral Vault)         (Feature Phone)     (Provenance)        (Atlas & ONDC)
   │                   │                    │                   │                   │
   ├─ Decode Motif     ├─ Record Technique  ├─ Press 2: Katha   ├─ Heritage Premium ├─ Heritage Atlas
   ├─ Making-Of Steps  ├─ Lok-Katha Mode    └─ Press 3: Guru    ├─ Why This Price   ├─ Festival Tags
   ├─ Heritage Wall    ├─ Lineage Tree                          ├─ Heritage Passport├─ Hear the Maker
   └─ Tool Scanner     └─ Dialect Glossary                      └─ Endangered Badge └─ Gift a Story
```

### Module 1: Camera & Computer Vision (New Modes)
1. **Decode Motif**: Point the camera at a saree, shawl, or terracotta pot. Gemini Vision identifies the sacred motif (e.g., *Mayur/Peacock*, *Kalash*, *Kalka/Paisley*, *Tree of Life*), explaining its symbolic meaning, historical roots, and regional mythology with bilingual Hindi/English voiceover.
2. **Making-Of Capture**: A step-by-step guided sequence (e.g., Clay Wedging → Wheel Spinning → Sun Baking → Pit Firing → Natural Glazing) creating an authentic chronological timeline for the product.
3. **Heritage Backdrops**: Inside the Studio Review, add culturally immersive virtual environments (Chanderi stone arches, Warli mud-wall textures, Jaipur courtyards, Kutch desert earthen walls) alongside clean white e-commerce backdrops.
4. **Tool Scanner**: Photograph a loom, fly shuttle, traditional potter's wheel (*chaak*), or hand chisel (*tanka*). AI identifies the tool, documents its indigenous vernacular name, and appends it to the craft's heritage archive.

### Module 2: Voice Recorder & Craft Knowledge Vault
5. **Record Technique**: The artisan speaks freely about secret techniques (natural indigo fermentation, vegetable mordanting, warp-weft density). AI transcribes and formats this into a structured **Craft Technique Recipe** in the permanent Knowledge Vault.
6. **Lok-Katha Mode**: The artisan narrates the folk tale, legend, or spiritual ballad tied to their craft. Stored in raw regional audio and published as an audio story with the product.
7. **Lineage Recorder**: Prompts *"Who taught you this craft?"* to map an ancestral generation tree (e.g., *5th-generation master weaver from Chanderi*).
8. **Dialect Glossary**: Automatically extracts rare craft-specific jargon in Bundeli, Malvi, Bhojpuri, Maithili, or Awadhi, generating an active dictionary with Hindi and English etymology.

### Module 3: Kala-Vani IVR (Feature Phone Accessibility)
9. **Press 2 — Katha Line**: Elderly masters without smartphones dial a toll-free number from basic keypad phones to sing folk songs, narrate craft legends, or recite folklore directly into the national archive.
10. **Press 3 — Guru Line**: Senior artisans narrate manufacturing recipes and oral guidance over a standard phone call, feeding the Knowledge Vault without requiring an internet connection.

### Module 4: Pricing & Cultural Provenance
11. **Heritage Premium Calculator**: Computes a transparent, quantifiable value-add on top of the base labor wage for Geographical Indication (GI) registration, master artisan generational pedigree, and endangered craft conservation.
12. **"Why This Price" Card**: Buyer-facing visual breakdown contrasting human artisan hours (e.g., *18 days of hand-weaving & natural vat dyeing*) versus synthetic mass-produced copies, justifying fair pricing.

### Module 5: Provenance Certificate (`/verify/:id`)
13. **Heritage Passport**: Upgrades the digital authenticity certificate into an artisan passport containing the maker's photograph, verified GPS cluster, audio greeting, ancestral lineage tree, and making-of timeline.
14. **Endangered Craft Badge**: Prominently highlights UNESCO/Ministry-listed vulnerable crafts (<100 surviving practitioners), allowing conscious consumers to directly fund cultural preservation.

### Module 6: Buyer Storefront & ONDC Experience
15. **Heritage Atlas**: An interactive cultural map of India pinned with GI clusters. Clicking a pin opens regional craft history, active artisans, and live listings.
16. **Festival Tags**: Real-time tagging categorized by Indian festivals (*Diwali diyas*, *Chhath Puja supli*, *Ganesh Utsav clay idols*, *Pongal pots*, *Karva Chauth thalis*) with a "Shop by Festival" filter.
17. **Hear the Maker**: An audio button on every product card playing the artisan's personal greeting and voice in their native mother tongue, paired with synchronized English captions.
18. **Gift a Story**: Buyers gifting handicrafts can generate a custom QR gift tag that plays the artisan's blessing and the heritage folk story for the recipient.

### Module 7: Home Command Center
19. **Heritage Impact Dashboard**: Displays live macro counters:
    - *Techniques Digitally Archived*
    - *Lok-Kathas & Folk Songs Recorded*
    - *Generations Documented*
    - *Endangered Crafts Protected*
20. **Guru–Shishya Digital Learn Tab**: A digital apprentice portal where master artisans upload short technique voice/video clips, enabling rural youth to learn hereditary crafts and track progress.

---

## 4. The "Top 6" High-Impact Demo Features for Video

For the official SIH 3-minute evaluation video, these 6 features create the highest emotional and technological resonance with the judges:

| Feature | Screen Time | Innovation Highlight | Why Judges Love It |
| :--- | :--- | :--- | :--- |
| **1. Decode Motif (#1)** | 10 sec | Camera points at pot/saree → Gemini Vision names the motif (*Kalash / Peepal leaf*), gives history & audio explanation. | Direct AI demonstration connecting computer vision to ancient Indian art iconography. |
| **2. Record Technique (#5)** | 10 sec | Artisan speaks in Hindi → AI extracts structured recipe into the *Craft Knowledge Vault*. | Tangible preservation of intangible heritage before master artisans pass away. |
| **3. Heritage Passport (#13)** | 10 sec | `/verify/:id` shows artisan photo, audio greeting, GI verification, and making-of sequence. | Destroys counterfeit powerloom fakes with unforgeable cultural provenance. |
| **4. Heritage Atlas (#15)** | 10 sec | Interactive India map with GI cluster pins across Kashmir, Gujarat, UP, Bengal, and Tamil Nadu. | Visual proof of pan-India cultural diversity and geographic reach. |
| **5. Hear the Maker (#17)** | 10 sec | Click "Hear Maker" on storefront → Artisan speaks in native tongue with English subtitles. | Emotional connection; bridges rural artisan hearts directly with urban global buyers. |
| **6. Impact Dashboard (#19)** | 5 sec | Home screen displays counters for techniques archived, stories saved, and crafts sustained. | Demonstrates scalable, quantifiable national impact to AICTE & Ministry of Education. |

---

## 5. Strategic Alignment with AICTE & MIC Objectives

| AICTE / MIC Evaluation Criteria | ShilpSetu Fulfillment |
| :--- | :--- |
| **Theme Alignment (Heritage & Culture)** | 100% focused on preserving, documenting, and showcasing traditional arts, crafts, motifs, and oral history. |
| **Novelty & Innovation** | World-first combination of Computer Vision for Motif Decoding + Feature Phone IVR for Folk Song/Story Archival. |
| **Inclusivity & Low-Literacy Access** | Works on basic button phones (Kala-Vani IVR) for elderly rural gurus without smartphones. |
| **Economic Sustainability** | Connects heritage conservation directly to livelihood via fair wages and ONDC e-commerce. |
| **Technical Rigor** | Full-stack production architecture with FastAPI, PyTorch Rembg, MeitY Bhashini, and Gemini 2.5/Flash. |
