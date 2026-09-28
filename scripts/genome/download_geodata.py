import urllib.request
import json
import os

SOURCES = [
    "https://raw.githubusercontent.com/udit-001/india-maps-data/master/india-states.geojson",
    "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States",
    "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson"
]

output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/data/genome"))
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "india_states.geojson")

for url in SOURCES:
    try:
        print(f"Trying to fetch GeoJSON from: {url}")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            content = response.read().decode('utf-8')
            data = json.loads(content)
            
            # Normalize property name to 'name'
            for f in data.get('features', []):
                props = f.get('properties', {})
                name = props.get('ST_NM') or props.get('NAME_1') or props.get('name') or props.get('NAME') or props.get('state')
                props['name'] = name
                # Standardize state name spelling
                if name:
                    name_clean = name.strip()
                    if "Jammu" in name_clean:
                        props['name'] = "Jammu & Kashmir"
                    elif "Ladakh" in name_clean:
                        props['name'] = "Ladakh"
                    elif "Arunachal" in name_clean:
                        props['name'] = "Arunachal Pradesh"
            
            with open(output_path, "w", encoding="utf-8") as out:
                json.dump(data, out, ensure_ascii=False)
            
            file_size_kb = os.path.getsize(output_path) / 1024
            print(f"Successfully saved {len(data.get('features', []))} state features to {output_path} ({file_size_kb:.1f} KB)")
            break
    except Exception as e:
        print(f"Failed to fetch from {url}: {e}")
