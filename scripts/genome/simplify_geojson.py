import json
import os

input_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/data/genome/india_states.geojson"))

def simplify_coords(coords, step=3):
    if not coords:
        return coords
    if isinstance(coords[0], (int, float)):
        # Round coordinate to 4 decimal places (~11 meters precision, perfectly crisp)
        return [round(coords[0], 4), round(coords[1], 4)]
    if isinstance(coords[0][0], (int, float)):
        # Array of [lng, lat]
        simplified = [coords[i] for i in range(0, len(coords) - 1, step)]
        # Always retain last coordinate to close polygon
        if coords[-1] != simplified[-1]:
            simplified.append(coords[-1])
        # Ensure at least 4 points for valid polygon ring
        if len(simplified) < 4 and len(coords) >= 4:
            simplified = coords
        return [[round(pt[0], 4), round(pt[1], 4)] for pt in simplified]
    return [simplify_coords(c, step) for c in coords]

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for feature in data.get("features", []):
    geom = feature.get("geometry", {})
    if geom and "coordinates" in geom:
        geom["coordinates"] = simplify_coords(geom["coordinates"], step=3)

with open(input_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

new_size_kb = os.path.getsize(input_path) / 1024
print(f"Simplified india_states.geojson down to {new_size_kb:.1f} KB!")
