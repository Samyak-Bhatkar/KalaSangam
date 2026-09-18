"""
KalaSangam - Authentic Craft Test Dataset Downloader
Ministry of Social Justice and Empowerment (MoSJE) - Problem Statement 26090
Downloads authentic cluttered-background test images for craft domains:
1. Terracotta & Clay Pottery (Potter workshop, kiln, mud floor)
2. Handloom Textiles & Saree (Rural loom, wooden shuttle, cluttered table)
3. Dhokra Bell Metal / Brass Casting (Foundry workshop, charcoal, tools)
4. Madhubani & Folk Painting (Painting mat, natural dye pots)
5. Wood Carving & Lacquered Toy (Wood shavings, carpenter bench)

All images are saved into 'test_dataset/crafts/' which is excluded from git.
"""

import os
import sys
import urllib.request
from pathlib import Path

# Base directories
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATASET_DIR = PROJECT_ROOT / "test_dataset" / "crafts"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

# Curated high-res open-access images of Indian crafts with authentic cluttered workshop backgrounds
TEST_SAMPLES = [
    {
        "filename": "terracotta_pottery_cluttered.jpg",
        "craft_category": "Terracotta & Clay Pottery",
        "description": "Clay pottery vessel in traditional artisan workshop with mud floor and pottery tools",
        "url": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Traditional_pottery_making.jpg/1280px-Traditional_pottery_making.jpg"
    },
    {
        "filename": "handloom_textile_saree.jpg",
        "craft_category": "Handloom Weaving & Silk Saree",
        "description": "Handwoven silk fabric on traditional wooden pit loom with thread bobbins and workshop clutter",
        "url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Handloom_weaving_India.jpg/1280px-Handloom_weaving_India.jpg"
    },
    {
        "filename": "dhokra_brass_sculpture.jpg",
        "craft_category": "Dhokra Bell Metal & Brass Casting",
        "description": "Lost-wax brass cast tribal figurine on rough artisan wooden bench with metalworking tools",
        "url": "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Dhokra_craft_Bastar.jpg/1280px-Dhokra_craft_Bastar.jpg"
    },
    {
        "filename": "madhubani_folk_painting.jpg",
        "craft_category": "Madhubani & Folk Art",
        "description": "Traditional handmade folk painting canvas on artisan floor with dye containers and brushes",
        "url": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Madhubani_painting_demonstration.jpg/1280px-Madhubani_painting_demonstration.jpg"
    },
    {
        "filename": "wooden_carving_toy.jpg",
        "craft_category": "Wood Carving & Channapatna Toy",
        "description": "Handcrafted wooden artifact surrounded by carpenter shavings and rustic workshop texture",
        "url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Channapatna_toys_display.jpg/1280px-Channapatna_toys_display.jpg"
    },
    {
        "filename": "edgecase_artisan_hand_clay.jpg",
        "craft_category": "Edge Case 1: Artisan Hand Occlusion",
        "description": "Artisan hands actively holding and crafting a terracotta clay vessel on the wheel",
        "url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Hands_at_potter%27s_wheel.jpg/1280px-Hands_at_potter%27s_wheel.jpg"
    },
    {
        "filename": "edgecase_brass_specular_reflections.jpg",
        "craft_category": "Edge Case 2: Specular Metallic Reflections",
        "description": "Polished traditional Indian brass vessel reflecting workshop lights and surroundings",
        "url": "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Brass_utensils_India.jpg/1280px-Brass_utensils_India.jpg"
    },
    {
        "filename": "edgecase_filigree_negative_space.jpg",
        "craft_category": "Edge Case 3: Intricate Hollows & Negative Space",
        "description": "Lattice and filigree metal craft where background is visible through intricate holes",
        "url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Filigree_ornament.jpg/1280px-Filigree_ornament.jpg"
    },
    {
        "filename": "edgecase_translucent_silk_fringe.jpg",
        "craft_category": "Edge Case 4: Translucent Threads & Fringes",
        "description": "Fine handwoven fabric with delicate translucent fringe and loose tassels",
        "url": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Silk_weaving_yarn.jpg/1280px-Silk_weaving_yarn.jpg"
    },
    {
        "filename": "edgecase_low_contrast_brick_pottery.jpg",
        "craft_category": "Edge Case 5: Low Contrast Foreground/Background",
        "description": "Terracotta clay items blending into red brick and earth kiln background",
        "url": "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1200&q=80",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Terracotta_pots_rural.jpg/1280px-Terracotta_pots_rural.jpg"
    }
]

def download_image(url: str, fallback_url: str, destination: Path) -> bool:
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    for target in [url, fallback_url]:
        try:
            req = urllib.request.Request(target, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as response, open(destination, 'wb') as out_file:
                out_file.write(response.read())
            print(f"[SUCCESS] Downloaded: {destination.name} ({destination.stat().st_size // 1024} KB)")
            return True
        except Exception as e:
            print(f"[WARN] Failed fetching from {target[:45]}...: {e}")
    return False

def main():
    print("=" * 70)
    print("SHILPSETU TEST DATASET DOWNLOADER (MoSJE Problem Statement 26090)")
    print(f"Target Directory: {DATASET_DIR}")
    print("=" * 70)
    
    success_count = 0
    for item in TEST_SAMPLES:
        dest_path = DATASET_DIR / item["filename"]
        print(f"\nFetching {item['craft_category']}...")
        if dest_path.exists() and dest_path.stat().st_size > 10000:
            print(f"[CACHE] Already exists: {dest_path.name}")
            success_count += 1
            continue
            
        if download_image(item["url"], item.get("fallback_url", ""), dest_path):
            success_count += 1
            
    print("\n" + "=" * 70)
    print(f"Dataset ready: {success_count}/{len(TEST_SAMPLES)} craft images available in:")
    print(f"  --> {DATASET_DIR}")
    print("Note: This directory is registered in .gitignore and will NOT be committed.")
    print("=" * 70)

if __name__ == "__main__":
    main()
