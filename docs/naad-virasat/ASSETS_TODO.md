# Naad-Virasat (नाद विरासत) — Demo Carving Image Asset Checklist

> **Current Implementation**: All 8 curated demo carvings are rendered using procedural, zero-network SVG stone relief illustrations generated client-side in `frontend/src/features/naad-virasat/vision/demoCarvings.js`. This guarantees **100% offline availability** with zero broken image links during live judging.
>
> **Future Polish**: For exhibition deployment or marketing, the user can replace the SVG data URLs with authentic high-resolution field photographs under Creative Commons (CC-BY / CC0) or Archaeological Survey of India (ASI) public domain guidelines.

---

## Curated 8-Carving Image Asset Checklist

| # | Instrument | Carving / Relief Context | Suggested Public Domain / CC Photo Source | Target File Placement | Status |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Ekatantri Vina** | Saraswati / Celestial Musician relief at Chennakeshava Temple, Belur, Karnataka (12th Century CE, Hoysala) | Wikimedia Commons / ASI Belur sculpture archives (Search: *Chennakeshava Temple Vina sculpture*) | `frontend/public/assets/naad/belur_ekatantri.jpg` | 🟢 Offline SVG Active |
| **2** | **Sengotti Yazh** | Rock-cut arched bow-harp frieze at Thirumayam Cave Temple, Pudukkottai, Tamil Nadu (7th-8th Century CE) | IGNCA Photographic Archives / Tamil Nadu Archaeology Dept (Search: *Thirumayam cave harp relief*) | `frontend/public/assets/naad/thirumayam_yazh.jpg` | 🟢 Offline SVG Active |
| **3** | **Mridangam / Pushkara** | Dancing Karana drummer friezes on the Eastern Gopuram, Nataraja Temple, Chidambaram (10th-11th Century CE) | Wikimedia Commons (Search: *Chidambaram temple dancing drummer relief*) | `frontend/public/assets/naad/chidambaram_mridangam.jpg` | 🟢 Offline SVG Active |
| **4** | **Damaru** | Nataraja cosmic dance friezes at Cave 16 (Kailasa Temple), Ellora, Maharashtra (8th Century CE, Rashtrakuta) | Archaeological Survey of India Ellora Archives (Search: *Ellora Cave 16 Nataraja Damaru*) | `frontend/public/assets/naad/ellora_damaru.jpg` | 🟢 Offline SVG Active |
| **5** | **Venu / Bansuri** | Venugopala Krishna panel at Hoysaleshwara Temple, Halebidu, Karnataka (12th Century CE) | Wikimedia Commons / CC-BY Flickr (Search: *Halebidu Venugopala stone relief*) | `frontend/public/assets/naad/halebidu_venu.jpg` | 🟢 Offline SVG Active |
| **6** | **Shankha** | Vishnu avatar / Herald frieze at Shore Temple Complex, Mahabalipuram, Tamil Nadu (8th Century CE, Pallava) | ASI Mamallapuram Archives (Search: *Mahabalipuram shore temple shankha carving*) | `frontend/public/assets/naad/mahabalipuram_shankha.jpg` | 🟢 Offline SVG Active |
| **7** | **Temple Ghanta** | Monolithic doorway lintel bells at Kandariya Mahadeva Temple, Khajuraho (10th-11th Century CE, Chandela) | UNESCO World Heritage Khajuraho Documentation (Search: *Khajuraho temple mandapa bell carving*) | `frontend/public/assets/naad/khajuraho_ghanta.jpg` | 🟢 Offline SVG Active |
| **8** | **Manjira / Jalra** | Celestial musician dancer friezes at Sun Temple Natamandira, Konark, Odisha (13th Century CE, Eastern Ganga) | Konark Archaeological Museum / ASI (Search: *Konark sun temple female cymbal player*) | `frontend/public/assets/naad/konark_manjira.jpg` | 🟢 Offline SVG Active |

---

## Attribution & Licensing Guidelines
When replacing SVG placeholders with real photographs:
1. Ensure the license is explicitly **CC0 (Public Domain)**, **CC-BY 4.0**, or **CC-BY-SA 4.0**.
2. Include photographer attribution and temple GPS coordinates in `demoCarvings.js`.
3. Run photos through `preprocessCarvingImage()` to ensure resolution is standardized ($\le 1280\text{px}$) and file size is optimized ($< 250\text{KB}$ per photo).
