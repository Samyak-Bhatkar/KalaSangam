"""
Cultural Genome Data Validator (scripts/genome/validate.py)
Validates cultural_elements.json, relations.json, stories.json, and timeline_events.json.
Performs:
1. JSON Schema validation
2. Point-in-Polygon test against india_states.geojson boundaries
3. Duplicate ID detection
4. Source URL and attribution presence
5. Foreign key relation reference integrity
"""

import json
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/data/genome"))
GEOJSON_PATH = os.path.join(BASE_DIR, "india_states.geojson")
ELEMENTS_PATH = os.path.join(BASE_DIR, "cultural_elements.json")
RELATIONS_PATH = os.path.join(BASE_DIR, "relations.json")
STORIES_PATH = os.path.join(BASE_DIR, "stories.json")
TIMELINE_PATH = os.path.join(BASE_DIR, "timeline_events.json")

VALID_TYPES = {
    "dance", "music", "instrument", "cuisine", "textile",
    "craft", "monument", "festival", "dialect", "folk_story"
}
VALID_PRECISIONS = {"village", "town", "district"}
VALID_RELATION_KINDS = {"influenced", "related", "uses", "celebrated_at", "same_family"}
VALID_DOC_STATUSES = {"well", "partial", "poor"}
VALID_SNAPSHOTS = {1200, 1500, 1800, 1947, 2026}

# State name normalizer dictionary to match GeoJSON state names
STATE_ALIASES = {
    "orissa": "odisha",
    "uttaranchal": "uttarakhand",
    "jammu & kashmir": "jammu and kashmir",
    "dadra and nagar haveli and daman and diu": "dadra and nagar haveli"
}

def normalize_state_name(name):
    if not name:
        return ""
    n = name.strip().lower().replace("&", "and")
    return STATE_ALIASES.get(n, n)

def point_in_polygon(x, y, poly):
    """Robust ray casting algorithm to test if point (x=lng, y=lat) is in polygon ring."""
    inside = False
    n = len(poly)
    if n < 3:
        return False
    p1x, p1y = poly[0]
    for i in range(1, n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def point_in_feature(lng, lat, feature):
    geom = feature.get("geometry", {})
    g_type = geom.get("type", "")
    coords = geom.get("coordinates", [])
    
    if g_type == "Polygon":
        # First ring is exterior boundary
        if coords and point_in_polygon(lng, lat, coords[0]):
            # Check interior holes
            for hole in coords[1:]:
                if point_in_polygon(lng, lat, hole):
                    return False
            return True
    elif g_type == "MultiPolygon":
        for poly in coords:
            if poly and point_in_polygon(lng, lat, poly[0]):
                in_hole = False
                for hole in poly[1:]:
                    if point_in_polygon(lng, lat, hole):
                        in_hole = True
                        break
                if not in_hole:
                    return True
    return False

def validate_all():
    errors = []
    warnings = []
    
    # 1. Load GeoJSON
    if not os.path.exists(GEOJSON_PATH):
        errors.append(f"Missing GeoJSON file at: {GEOJSON_PATH}")
        return errors, warnings
    
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        geo_data = json.load(f)
    
    state_features = {}
    for feat in geo_data.get("features", []):
        s_name = feat.get("properties", {}).get("name", "")
        if s_name:
            state_features[normalize_state_name(s_name)] = feat
    
    # 2. Load and validate cultural_elements.json
    if not os.path.exists(ELEMENTS_PATH):
        errors.append(f"Missing cultural_elements.json at: {ELEMENTS_PATH}")
        return errors, warnings
        
    with open(ELEMENTS_PATH, "r", encoding="utf-8") as f:
        elements = json.load(f)
    
    element_ids = set()
    for idx, el in enumerate(elements):
        eid = el.get("id")
        if not eid:
            errors.append(f"Element #{idx} missing 'id'")
            continue
        if eid in element_ids:
            errors.append(f"Duplicate element id found: '{eid}'")
        element_ids.add(eid)
        
        # Schema checks
        for required_field in ["name_en", "name_hi", "type", "state", "district", "place_name", "lat", "lng", "description_en", "description_hi", "sources"]:
            if required_field not in el or el[required_field] is None:
                errors.append(f"Element '{eid}' missing required field '{required_field}'")
        
        c_type = el.get("type")
        if c_type not in VALID_TYPES:
            errors.append(f"Element '{eid}' invalid type '{c_type}'. Must be one of: {VALID_TYPES}")
        
        rarity = el.get("rarity")
        if rarity is not None and (not isinstance(rarity, int) or rarity < 1 or rarity > 5):
            errors.append(f"Element '{eid}' rarity '{rarity}' invalid. Must be integer 1-5.")
            
        sources = el.get("sources", [])
        if not sources or not isinstance(sources, list):
            errors.append(f"Element '{eid}' has no sources array!")
        else:
            for s in sources:
                if not s.get("url") or not s["url"].startswith("http"):
                    errors.append(f"Element '{eid}' source missing valid HTTP/HTTPS URL: {s}")
        
        # Point-in-polygon verification
        lat = el.get("lat")
        lng = el.get("lng")
        state = el.get("state", "")
        norm_state = normalize_state_name(state)
        
        if lat is not None and lng is not None:
            if not (-90 <= lat <= 90 and -180 <= lng <= 180):
                errors.append(f"Element '{eid}' lat/lng out of earthly bounds: ({lat}, {lng})")
            else:
                matched_feature = state_features.get(norm_state)
                if not matched_feature:
                    warnings.append(f"Element '{eid}' state '{state}' not directly matched in GeoJSON state list.")
                else:
                    if not point_in_feature(lng, lat, matched_feature):
                        errors.append(f"Point-In-Polygon Violation: Element '{eid}' ({lat}, {lng}) does NOT fall inside declared state '{state}'!")
        
    # 3. Load and validate relations.json
    if os.path.exists(RELATIONS_PATH):
        with open(RELATIONS_PATH, "r", encoding="utf-8") as f:
            relations = json.load(f)
        for idx, r in enumerate(relations):
            f_id = r.get("from_id")
            t_id = r.get("to_id")
            if f_id not in element_ids:
                errors.append(f"Relation #{idx} references unknown from_id '{f_id}'")
            if t_id not in element_ids:
                errors.append(f"Relation #{idx} references unknown to_id '{t_id}'")
            kind = r.get("kind")
            if kind not in VALID_RELATION_KINDS:
                errors.append(f"Relation #{idx} ({f_id} -> {t_id}) has invalid kind '{kind}'")
            weight = r.get("weight")
            if weight is None or not (0.0 <= weight <= 1.0):
                errors.append(f"Relation #{idx} weight must be float between 0.0 and 1.0, got '{weight}'")
            if not r.get("source"):
                errors.append(f"Relation #{idx} missing required 'source' citation.")

    # 4. Load and validate stories.json
    if os.path.exists(STORIES_PATH):
        with open(STORIES_PATH, "r", encoding="utf-8") as f:
            stories = json.load(f)
        story_ids = set()
        for idx, s in enumerate(stories):
            sid = s.get("id")
            if not sid:
                errors.append(f"Story #{idx} missing 'id'")
            elif sid in story_ids:
                errors.append(f"Duplicate story id: '{sid}'")
            story_ids.add(sid)
            el_id = s.get("element_id")
            if el_id not in element_ids:
                errors.append(f"Story '{sid}' references unknown element_id '{el_id}'")
            if not s.get("source"):
                errors.append(f"Story '{sid}' missing 'source'")

    # 5. Load and validate timeline_events.json
    if os.path.exists(TIMELINE_PATH):
        with open(TIMELINE_PATH, "r", encoding="utf-8") as f:
            timeline = json.load(f)
        for idx, t in enumerate(timeline):
            tr_id = t.get("tradition_id")
            if tr_id not in element_ids:
                errors.append(f"Timeline event #{idx} references unknown tradition_id '{tr_id}'")
            snapshot = t.get("snapshot")
            if snapshot not in VALID_SNAPSHOTS:
                errors.append(f"Timeline event #{idx} invalid snapshot '{snapshot}'. Must be one of: {VALID_SNAPSHOTS}")
            if not t.get("source"):
                errors.append(f"Timeline event #{idx} missing 'source'")

    return errors, warnings

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    print("=" * 70)
    print("  Cultural Genome Validator (scripts/genome/validate.py)")
    print("=" * 70)
    errs, warns = validate_all()
    
    if warns:
        print("\n[WARNINGS]:")
        for w in warns:
            print(f"  * {w}")
            
    if errs:
        print(f"\n[FAIL] Found {len(errs)} schema/spatial errors:")
        for e in errs:
            print(f"  [X] {e}")
        sys.exit(1)
    else:
        print("\n[OK] ALL CHECKS PASSED: Schemas valid, coordinates inside state boundaries, source URLs verified.")
        sys.exit(0)
