import os
import json
import urllib.request

DEST_DIR = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets"
IMG_DIR = os.path.join(DEST_DIR, "images")
CODE_DIR = os.path.join(DEST_DIR, "code")
FLUTTER_IMG_DIR = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\mobile_flutter\assets\images"
FRONTEND_PUB_DIR = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public"

os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(CODE_DIR, exist_ok=True)
os.makedirs(FLUTTER_IMG_DIR, exist_ok=True)
os.makedirs(FRONTEND_PUB_DIR, exist_ok=True)

DOWNLOADS = [
    # 2. ShilpSetu Brand Emblem
    {
        "id": "2d79825c823649fc8b1bb1df2a6d82a1",
        "title": "ShilpSetu Brand Emblem",
        "type": "image",
        "url": "https://lh3.googleusercontent.com/aida/AEtjO1WB6xaEcvK8ZTDz-ndt2uN7HFpHD2IxEKestPGsJZk-rzxFm429qqqtavVW_wSKaKnKWVivGEBL_WyDkjg83TcoF1F0hbOWYaeW-qFpWx7hfrqArsCGuQC-S8Yq_chaePreN5m73Kp6eYa9ioVeWUVMhoZMq9ICbA74bi0a7_WKqyifV39_GOlNeOO1ggLTrirJlCpmbVq9SvlSzIc87Keg1fhnD6HcDe0Xtp76mIxxTzO8goHlHmCnApw",
        "filename": "brand_emblem.png"
    },
    # 3. Close-up portrait of rural Indian artisan woman weaver (Shanti Devi)
    {
        "id": "994cac623bb64aa8a63145f9e5f50cf8",
        "title": "Artisan Shanti Devi Portrait",
        "type": "image",
        "url": "https://lh3.googleusercontent.com/aida/AEtjO1V0hYIN6iwi9n_pcx_3JkJ0RncJC0uROUKzByqCCqsh0Tt0nqPJ3mzdHsaUqnxtvetqOulN-RA0-qTlN9vJQzpd5-MWMl5IbKvtBXlStA4f2bRXdp3nMZtJ25ghhAK7V3NoJbQJrl3bXO_Dt1yc3dYH_MkV3x86f6sD2JaSadT1Yb1uPIA0D4mbG7kMQAZq4iglwFDUXcqgiUv_pRX4W4pOl6P34MKaXTXRTYV3Nmeh1NmYQw40rnDyxsA",
        "filename": "artisan_shanti_devi.png"
    },
    # 4. Authentic royal blue and golden zari Chanderi silk saree
    {
        "id": "144a1da0f1cc4dd28595c4b3a2c1db46",
        "title": "Chanderi Silk Saree",
        "type": "image",
        "url": "https://lh3.googleusercontent.com/aida/AEtjO1XaAo5KpSM45kMR4aKO2ti1dkLiCmeh1u1EMVonA1Y_ljcwVtlWepL7MCosIWG1-f6ViG4nHaMjwXcn1rJgcKQTx47f0a3xMdnQ6nnfXXiaz5V9zfMgFa_rNi5cQJm3jyoQUhEHMoN8_ZEOtQBdr4AR5k8jfWaKgjpa3YioLduEtd2LfBV4jotE5QmLhZxtckpaj2RtdeY-N__GdOGM-MQmPJzz8eUPGFRxaa1qt1VVEOCtZ302B9E57Lc",
        "filename": "chanderi_saree.png"
    },
    # 5. Handcrafted Indian terracotta clay cooking handi pot
    {
        "id": "6819be60f3374cae844d68e1107d0ca0",
        "title": "Terracotta Cooking Handi Pot",
        "type": "image",
        "url": "https://lh3.googleusercontent.com/aida/AEtjO1Wu7m3zLazvYrhq7ipSTM2cwPq8oV16xQhoru786FWQ6Mr7S4HmsjG0CQuWbNBpkWYQXt6JA3X3O1NazF0ax58z5E5JtC9EWRZiMKEX816iUFSur-RAiLYTujw2By69ivaPwPLGMPlDYhvqkrkSgFi0JR7H6vM6WCZg1pWIHAZb6n0ojyp5vIwZEbv7dtnDf1QSpFjbYLAeL5dlGJiaZiRFIkNTeGmFCPUnwu7o78MS5L53fpiZbxno05aa",
        "filename": "terracotta_pot.png"
    },
    # 6. ShilpSetu 3-Tap Home Command Center (Screen screenshot & HTML)
    {
        "id": "96a98e821928457e83a7787efec2335e",
        "title": "ShilpSetu 3-Tap Home Command Center",
        "type": "screen",
        "screenshot_url": "https://lh3.googleusercontent.com/aida/AEtjO1Xh1IjYrnQUNe6KVuN_MsZWHBc0w9onFwBN4Bbf71LwUFS_vifWPWsYZLZ6vaMnTX_MtMZnust5r2hkMlpesEXpTfHNiofWFnGh3z8LaPbtT0IwDVIJg-Cv8pnltr2xkKSHO3CEGXlMvRk4XQLli2QOZxRKQbX28DKL1Uqyye04hyNpsbOxlmP86VIkCr_9oHo9MLwQTW6ROerw63im4fhS_m-KUF5994C974tdH64xrxcxBPsw7F17-GQ",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWFkNTk1NzcwN2M0Y2ExMjQzMzViYzE3EgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
        "screenshot_file": "screen_home_command_center.png",
        "html_file": "1_home_command_center.html"
    },
    # 7. ShilpSetu Smart Viewfinder & Studio AI
    {
        "id": "f54174dba0534ae1beabed0315f8cfb9",
        "title": "ShilpSetu Smart Viewfinder & Studio AI",
        "type": "screen",
        "screenshot_url": "https://lh3.googleusercontent.com/aida/AEtjO1WhPoETRVG8N-PZYbOyzLg-wU_zPRTDugdvJKWPr2YyPDYXN-sdnCd3zjq5FQoC9nqQeSfrFITpgknew57pgxNozTp62S-F9N7wFJs9EygyC-DQJIHFBJk1RZ0mE9pW6jNTjIJZ9Fga1QEMBuBT3rcesBWLYqRJ4XQVZhE9yW8-5q-QdY4_zXw1KsYdY_SPaoz_KI115fCv4UTK6wyk3lxHJx4MaH7yVBUa11O_i0ghnZgqSlLPdqorLs4",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWFiODcyZTYwN2M0ZWQ5OWJmMWZiMDczEgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
        "screenshot_file": "screen_smart_viewfinder.png",
        "html_file": "2_smart_viewfinder.html"
    },
    # 8. ShilpSetu Multilingual Voice Catalog
    {
        "id": "9af79390f1924684b60e3ea54e048133",
        "title": "ShilpSetu Multilingual Voice Catalog",
        "type": "screen",
        "screenshot_url": "https://lh3.googleusercontent.com/aida/AEtjO1XQmaR2VTrN-uATROrCKSEFGhR3PEWkbP1LmvmlC3iOkAybsInt5XbtQq3LJwDZW4TKyk89jZVHlEVfIV6WLSwNAp0ShaWdK06B5pdqKlNnxZKKzGb-uk4FgXr7ASvkrYKNN6SHgQMQKKQSXtu-KSaMpLGrJcQXzqy37AOTLxUByWhp6Yf1joGjfjIZmF-Gr_fGhgbW5bRnsnfgvh1y_Su8LXyDcHj2cjINkagJGMjxM4gSkIZ0lJ0l7dw",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWE3Zjg0YmEwNzNhZmIyZmQyMGI3NTJlEgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
        "screenshot_file": "screen_voice_catalog.png",
        "html_file": "3_voice_catalog.html"
    },
    # 9. ShilpSetu Fair Wage Pricing & Publish
    {
        "id": "94b77a620ca94ea8ac765abb554e6753",
        "title": "ShilpSetu Fair Wage Pricing & Publish",
        "type": "screen",
        "screenshot_url": "https://lh3.googleusercontent.com/aida/AEtjO1Vc6BLO5B4pvD52IBHrEZU2IdGVkHgzIP5aSG6_DeCusXF08b0cSLozkMoyeeLy6FT-Cw72jatrHTZLP8nlSSk2ep4ZG8aiKZptwYEddlAyv3pqO2aeSxgbi5KZUjl4Kiez-dYOgpFOsB7Jsn_s6pqtJ6LsPGfLNMwko6y4oaEc0K2ZbTwjQn4Ojjn0fH599eh_foVcF1eKVrFEgTnWwJdBT6U7axHKN1vFlbJrTwb720EI5dmDFGDv7r4",
        "html_url": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWFjM2RlMzcwMzkyZDEzOGFhMDU1N2Q0EgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
        "screenshot_file": "screen_fair_wage_pricing.png",
        "html_file": "4_fair_wage_pricing.html"
    }
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

print("=== DOWNLOADING STITCH ASSETS ===")
for item in DOWNLOADS:
    if item["type"] == "image":
        dest_path = os.path.join(IMG_DIR, item["filename"])
        print(f"Downloading image: {item['title']} -> {dest_path}")
        req = urllib.request.Request(item["url"], headers=headers)
        with urllib.request.urlopen(req) as resp, open(dest_path, "wb") as out_f:
            data = resp.read()
            out_f.write(data)
            print(f"  Saved {len(data)} bytes")
            # Also copy to flutter & frontend
            with open(os.path.join(FLUTTER_IMG_DIR, item["filename"]), "wb") as f_out:
                f_out.write(data)
            with open(os.path.join(FRONTEND_PUB_DIR, item["filename"]), "wb") as f_out:
                f_out.write(data)

    elif item["type"] == "screen":
        # Screenshot
        s_path = os.path.join(IMG_DIR, item["screenshot_file"])
        print(f"Downloading screen preview: {item['title']} -> {s_path}")
        req = urllib.request.Request(item["screenshot_url"], headers=headers)
        with urllib.request.urlopen(req) as resp, open(s_path, "wb") as out_f:
            data = resp.read()
            out_f.write(data)
            print(f"  Saved screenshot {len(data)} bytes")

        # HTML
        h_path = os.path.join(CODE_DIR, item["html_file"])
        print(f"Downloading screen HTML: {item['title']} -> {h_path}")
        req = urllib.request.Request(item["html_url"], headers=headers)
        with urllib.request.urlopen(req) as resp, open(h_path, "wb") as out_f:
            data = resp.read()
            out_f.write(data)
            print(f"  Saved HTML {len(data)} bytes")

# 1. Save Design System
DESIGN_MD = """---
name: ShilpSetu Vernacular Craft
colors:
  surface: '#fff8f5'
  surface-dim: '#e2d8d3'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2ec'
  surface-container: '#f6ece7'
  surface-container-high: '#f0e6e1'
  surface-container-highest: '#ebe0db'
  on-surface: '#1f1b18'
  on-surface-variant: '#57423b'
  inverse-surface: '#352f2c'
  inverse-on-surface: '#f9efea'
  outline: '#8a726a'
  outline-variant: '#dec0b7'
  surface-tint: '#a23e18'
  primary: '#9f3c16'
  on-primary: '#ffffff'
  primary-container: '#bf542c'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59c'
  secondary: '#4059aa'
  on-secondary: '#ffffff'
  secondary-container: '#8fa7fe'
  on-secondary-container: '#1d3989'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#822801'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#fff8f5'
  on-background: '#1f1b18'
  surface-variant: '#ebe0db'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-xl:
    fontFamily: Noto Sans
    fontSize: 19px
    fontWeight: '600'
    lineHeight: 30px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Noto Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  label-voice-prominent:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-action:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0.02em
  caption-numeral:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  touch-min: 3.75rem
  touch-lg: 4.5rem
  pad-card: 1.25rem
  pad-screen: 1.0rem
  gap-compact: 0.75rem
  gap-standard: 1.0rem
  gap-generous: 1.5rem
  sheet-bottom-pad: 2.5rem
---
"""

ds_path = os.path.join(DEST_DIR, "design_system.md")
with open(ds_path, "w", encoding="utf-8") as f:
    f.write(DESIGN_MD)
print(f"Saved design system to {ds_path}")

print("=== ALL STITCH ASSETS DOWNLOADED SUCCESSFULLY ===")
