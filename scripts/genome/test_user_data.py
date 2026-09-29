import json
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/data/genome"))
GEOJSON_PATH = os.path.join(BASE_DIR, "india_states.geojson")

import validate

new_elements = [
    {
      "id": "bastar_dussehra",
      "name_en": "Bastar Dussehra",
      "name_hi": "बस्तर दशहरा",
      "type": "festival",
      "state": "Chhattisgarh",
      "district": "Bastar",
      "place_name": "Jagdalpur",
      "lat": 19.0740,
      "lng": 82.0290,
      "precision": "town",
      "start_year": 1400,
      "end_year": None,
      "typical_month": 10,
      "description_en": "A 75-day long indigenous festival unlike traditional Dussehra, revolving around the congregation of local tribal deities and goddess Danteshwari, featuring a massive wooden chariot.",
      "description_hi": "75 दिनों तक चलने वाला स्वदेशी त्योहार जो पारंपरिक दशहरे से अलग है। यह मुख्य रूप से स्थानीय आदिवासी देवी-देवताओं और दंतेश्वरी देवी के इर्द-गिर्द घूमता है।",
      "rarity": 2,
      "documentation_status": "well",
      "sources": [{"title": "Bastaria Dussehra", "url": "http://www.sahapedia.org/bastaria-dussehra-coming-together-of-deities"}],
      "confidence": "high"
    },
    {
      "id": "margamkali",
      "name_en": "Margamkali",
      "name_hi": "मार्गमकली",
      "type": "dance",
      "state": "Kerala",
      "district": "Kottayam",
      "place_name": "Kottayam",
      "lat": 10.5929,
      "lng": 76.5239,
      "precision": "town",
      "start_year": 300,
      "end_year": None,
      "typical_month": None,
      "description_en": "A rare group dance created by the Knanaya Christians. Performed by men singing a 14-stanza hymn to St. Thomas around a traditional lamp, originally without any instruments.",
      "description_hi": "क्नानाया ईसाइयों द्वारा बनाया गया एक दुर्लभ समूह नृत्य। इसे बिना वाद्य यंत्रों के 14-छंदों वाले भजनों को गाकर एक पारंपरिक दीपक के चारों ओर किया जाता है।",
      "rarity": 4,
      "documentation_status": "well",
      "sources": [{"title": "Margamkali: Melodic Rendering of the Apostolic Acts", "url": "http://www.sahapedia.org/margamkali-1"}],
      "confidence": "medium"
    },
    {
      "id": "khatamband",
      "name_en": "Khatamband",
      "name_hi": "खतमबंद",
      "type": "craft",
      "state": "Jammu and Kashmir",
      "district": "Srinagar",
      "place_name": "Srinagar",
      "lat": 34.0911,
      "lng": 74.7973,
      "precision": "town",
      "start_year": 1500,
      "end_year": None,
      "typical_month": None,
      "description_en": "A highly precise and rare Kashmiri woodwork craft where intricately carved geometric wooden pieces are fitted together without nails, predominantly used for elegant ceilings.",
      "description_hi": "एक अत्यधिक सटीक और दुर्लभ कश्मीरी लकड़ी शिल्प जहाँ जटिल ज्यामितीय लकड़ी के टुकड़ों को बिना कीलों के एक साथ जोड़ा जाता है, मुख्य रूप से छत के लिए उपयोग किया जाता है।",
      "rarity": 4,
      "documentation_status": "partial",
      "sources": [{"title": "The Last Defenders", "url": "http://www.sahapedia.org/last-defenders"}],
      "confidence": "high"
    },
    {
      "id": "chatapati",
      "name_en": "Chatapati",
      "name_hi": "चटापटी",
      "type": "textile",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "place_name": "Lucknow",
      "lat": 26.8467,
      "lng": 80.9462,
      "precision": "town",
      "start_year": 1700,
      "end_year": None,
      "typical_month": None,
      "description_en": "A lesser-known, intricate fabric cutwork and appliqué technique from the Awadh region, heavily utilized in traditional royal garments but historically overshadowed by Chikankari.",
      "description_hi": "अवध क्षेत्र से एक कम ज्ञात, जटिल फैब्रिक कटवर्क और एप्लिक तकनीक, जिसका उपयोग पारंपरिक शाही कपड़ों में भारी रूप से किया जाता है।",
      "rarity": 5,
      "documentation_status": "poor",
      "sources": [{"title": "From Royal Courts to Modern Runways", "url": "http://www.sahapedia.org/royal-courts-modern-runways"}],
      "confidence": "medium"
    },
    {
      "id": "fardi_kamdani",
      "name_en": "Fardi and Kamdani",
      "name_hi": "फरदी और कामदानी",
      "type": "textile",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "place_name": "Lucknow",
      "lat": 26.8467,
      "lng": 80.9462,
      "precision": "town",
      "start_year": 1700,
      "end_year": None,
      "typical_month": None,
      "description_en": "A highly delicate wire embroidery art form from Lucknow. Kamdani forms motifs on sheer fabric, while Fardi involves placing small metallic silver or gold dots to create starry patterns.",
      "description_hi": "लखनऊ की एक अत्यधिक नाजुक तार कढ़ाई कला। कामदानी शीर कपड़े पर रूपांकन बनाती है, जबकि फरदी छोटी धातु की बिंदी का उपयोग करती है।",
      "rarity": 4,
      "documentation_status": "partial",
      "sources": [{"title": "From Royal Courts to Modern Runways", "url": "http://www.sahapedia.org/royal-courts-modern-runways"}],
      "confidence": "high"
    },
    {
      "id": "chadar_badar",
      "name_en": "Chadar Badar",
      "name_hi": "चादर बादर",
      "type": "craft",
      "state": "Jharkhand",
      "district": "Dumka",
      "place_name": "Dumka",
      "lat": 24.2687,
      "lng": 87.2493,
      "precision": "town",
      "start_year": 1800,
      "end_year": None,
      "typical_month": None,
      "description_en": "A rare form of indigenous Santhal wooden puppetry involving a complex mechanical box with gears. The miniature figures dance to the rhythm of tribal drums.",
      "description_hi": "स्वदेशी संथाल लकड़ी की कठपुतली का एक दुर्लभ रूप जिसमें गियर के साथ एक जटिल यांत्रिक बॉक्स शामिल है। इसमें आदिवासी ढोल की थाप पर लघु आकृतियाँ नृत्य करती हैं।",
      "rarity": 5,
      "documentation_status": "poor",
      "sources": [{"title": "Traditional Craftsmanship", "url": "https://www.indianculture.gov.in/intangible-cultural-heritage/traditional-craftsmanship"}],
      "confidence": "high"
    },
    {
      "id": "damphu",
      "name_en": "Damphu",
      "name_hi": "डंफू",
      "type": "instrument",
      "state": "Sikkim",
      "district": "Namchi",
      "place_name": "Namchi",
      "lat": 27.1670,
      "lng": 88.3540,
      "precision": "town",
      "start_year": 1700,
      "end_year": None,
      "typical_month": None,
      "description_en": "A very rare, traditional circular percussion instrument belonging to the indigenous Tamang community. Often carved from wood with a stretched hide, used intimately in local dances.",
      "description_hi": "स्वदेशी तमांग समुदाय से संबंधित एक बहुत ही दुर्लभ, पारंपरिक गोलाकार वाद्ययंत्र, जिसे अक्सर लकड़ी से उकेरा जाता है और स्थानीय नृत्यों में उपयोग किया जाता है।",
      "rarity": 4,
      "documentation_status": "partial",
      "sources": [{"title": "Damphu", "url": "https://www.indianculture.gov.in/musical-instruments-of-india/avanaddha-vadya/title=DAMPHU/nid=2687924"}],
      "confidence": "high"
    },
    {
      "id": "kurmi_comb_cut_murals",
      "name_en": "Kurmi Comb-Cut Murals",
      "name_hi": "कुर्मी कंघी-कट भित्ति चित्र",
      "type": "craft",
      "state": "Jharkhand",
      "district": "Hazaribagh",
      "place_name": "Hazaribagh",
      "lat": 23.9925,
      "lng": 85.3638,
      "precision": "town",
      "start_year": 1800,
      "end_year": None,
      "typical_month": None,
      "description_en": "An obscure domestic mud mural technique where a black manganese clay layer is coated with white kaolin, which is then wet-scraped with a broken comb to reveal dark linear patterns.",
      "description_hi": "एक अस्पष्ट घरेलू मिट्टी भित्ति तकनीक जहां काले मैंगनीज मिट्टी की परत को सफेद काओलिन के साथ लेपित किया जाता है और फिर कंघी से खुरचा जाता है।",
      "rarity": 5,
      "documentation_status": "well",
      "sources": [{"title": "Mural Traditions of Jharkhand", "url": "http://www.sahapedia.org/mural-traditions-of-jharkhand-0"}],
      "confidence": "high"
    },
    {
      "id": "santoor_making",
      "name_en": "Kashmiri Santoor Crafting",
      "name_hi": "कश्मीरी संतूर शिल्प",
      "type": "craft",
      "state": "Jammu and Kashmir",
      "district": "Srinagar",
      "place_name": "Srinagar",
      "lat": 34.0911,
      "lng": 74.7973,
      "precision": "town",
      "start_year": 1400,
      "end_year": None,
      "typical_month": None,
      "description_en": "The highly specialized and endangered traditional craft of carving the many-stringed Santoor instrument from seasoned Kashmiri walnut wood, now fading into obscurity due to lack of new artisans.",
      "description_hi": "कश्मीरी अखरोट की लकड़ी से कई तारों वाले संतूर वाद्य यंत्र को तराशने का एक अत्यधिक विशिष्ट और लुप्तप्राय पारंपरिक शिल्प।",
      "rarity": 4,
      "documentation_status": "partial",
      "sources": [{"title": "The Last Defenders", "url": "http://www.sahapedia.org/last-defenders"}],
      "confidence": "medium"
    },
    {
      "id": "gombeyatta",
      "name_en": "Gombeyatta Puppetry",
      "name_hi": "गोम्बेयट्टा कठपुतली",
      "type": "craft",
      "state": "Karnataka",
      "district": "Udupi",
      "place_name": "Udupi",
      "lat": 13.3409,
      "lng": 74.7421,
      "precision": "town",
      "start_year": 1600,
      "end_year": None,
      "typical_month": None,
      "description_en": "A rare and highly stylized wooden string puppetry tradition of coastal Karnataka deeply linked to Yakshagana theater, enacting mythological tales like the Ramayana.",
      "description_hi": "तटीय कर्नाटक की एक दुर्लभ और अत्यधिक शैलीबद्ध लकड़ी की स्ट्रिंग कठपुतली परंपरा जो यक्षगान रंगमंच से गहराई से जुड़ी है।",
      "rarity": 4,
      "documentation_status": "well",
      "sources": [{"title": "Visual Manifestations of Ramayana", "url": "http://www.sahapedia.org/visual-manifestations-ramayana-folk-performances"}],
      "confidence": "high"
    },
    {
      "id": "kharsawan_chhau",
      "name_en": "Kharsawan Chhau",
      "name_hi": "खरसावां छऊ",
      "type": "dance",
      "state": "Jharkhand",
      "district": "Kharsawan",
      "place_name": "Kharsawan",
      "lat": 22.8028,
      "lng": 85.8275,
      "precision": "village",
      "start_year": 1800,
      "end_year": None,
      "typical_month": None,
      "description_en": "A lesser-known variant of the Chhau martial dance. It lacks the massive institutional backing of Purulia or Seraikela Chhau and eagerly awaits appreciation from wider audiences.",
      "description_hi": "छऊ मार्शल नृत्य का एक कम ज्ञात संस्करण। इसमें पुरुलिया या सरायकेला छऊ के संस्थागत समर्थन का अभाव है और यह व्यापक दर्शकों का इंतजार कर रहा है।",
      "rarity": 5,
      "documentation_status": "partial",
      "sources": [{"title": "Stories Behind the Masks", "url": "http://www.sahapedia.org/stories-behind-the-masks"}],
      "confidence": "medium"
    }
]

with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
    geo_data = json.load(f)

state_features = {}
for feat in geo_data.get("features", []):
    s_name = feat.get("properties", {}).get("name", "")
    if s_name:
        state_features[validate.normalize_state_name(s_name)] = feat

all_ok = True
for el in new_elements:
    norm_s = validate.normalize_state_name(el['state'])
    feat = state_features.get(norm_s)
    if not feat:
        print(f"FAILED: State {el['state']} not found")
        all_ok = False
    else:
        in_poly = validate.point_in_feature(el['lng'], el['lat'], feat)
        print(f"[{'PASS' if in_poly else 'FAIL'}] {el['id']}: {el['state']} ({el['lat']}, {el['lng']})")
        if not in_poly:
            all_ok = False

if all_ok:
    print("ALL 11 NEW ELEMENTS PASS POINT-IN-POLYGON!")
