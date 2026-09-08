"""ONDC Beckn Protocol Adapter
Client: Ministry of Social Justice and Empowerment (MoSJE)
Section 5, Innovation 4: Formats catalog listings into Beckn Retail Protocol v1.2.0
Open Commerce JSON schemas for immediate buyer-app discovery across India
"""

import time
import uuid
from typing import Dict, Any, Optional

def generate_beckn_catalog_payload(
    product_data: Dict[str, Any],
    pricing_data: Optional[Dict[str, Any]] = None,
    artisan_info: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Serializes artisan product and fair pricing into Beckn Retail Protocol v1.2.0 schema.
    Conforms to Open Network for Digital Commerce (ONDC) specification.
    """
    txn_id = f"txn_mosje_{uuid.uuid4().hex[:12]}"
    msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    item_id = product_data.get("id", f"item_mosje_{uuid.uuid4().hex[:8]}")
    title_en = product_data.get("title_en", "Traditional Handcrafted Artisan Item")
    title_hi = product_data.get("title_hi", "पारंपरिक हस्तनिर्मित शिल्प")
    desc_en = product_data.get("description_en", "Authentic Indian artisan craft under MoSJE empowerment initiatives.")
    craft_category = product_data.get("craft_category", "Handloom & Handicrafts")
    technique = product_data.get("technique", "Traditional Indigenous Craftsmanship")
    materials = product_data.get("materials_used", ["Natural Indigenous Elements"])
    gi_tag = product_data.get("gi_tag_eligible", False)

    # Pricing values
    b2c_price = pricing_data.get("b2c_price", 2450.0) if pricing_data else 2450.0
    b2b_price = pricing_data.get("b2b_price", 1950.0) if pricing_data else 1950.0
    gem_price = pricing_data.get("gem_price", 2150.0) if pricing_data else 2150.0
    direct_cost = pricing_data.get("base_cost", 1750.0) if pricing_data else 1750.0

    # Artisan / Provider details
    provider_id = artisan_info.get("beneficiary_id", "MoSJE-NBCFDC-CLUSTER-01") if artisan_info else "MoSJE-NBCFDC-CLUSTER-01"
    artisan_name = artisan_info.get("artisan_name", "Rural Artisan Collective") if artisan_info else "Rural Artisan Collective"
    cluster_pin = artisan_info.get("cluster_pin", "273001") if artisan_info else "273001"

    studio_url = product_data.get("studio_url", "https://shilpsetu.gov.in/static/uploads/default_studio.jpg")

    beckn_schema = {
        "context": {
            "domain": "ONDC:RET12",  # Fashion & Handicrafts Retail category in ONDC
            "country": "IND",
            "city": f"std:{cluster_pin[:3]}",
            "action": "on_search",
            "core_version": "1.2.0",
            "bap_id": "buyer-app.ondc.org",
            "bap_uri": "https://buyer-app.ondc.org/protocol/v1",
            "bpp_id": "shilpsetu.mosje.gov.in",
            "bpp_uri": "https://shilpsetu.mosje.gov.in/protocol/v1",
            "transaction_id": txn_id,
            "message_id": msg_id,
            "timestamp": timestamp,
            "ttl": "PT24H"
        },
        "message": {
            "catalog": {
                "bpp/descriptor": {
                    "name": "ShilpSetu MoSJE Artisan Direct Gateway",
                    "code": "MoSJE-NBCFDC-NSFDC",
                    "symbol": "https://shilpsetu.gov.in/assets/emblem.svg",
                    "short_desc": "Government of India Ministry of Social Justice and Empowerment Direct Artisan Marketplace",
                    "long_desc": "Connecting certified marginalized SC/OBC weavers, potters, and artisans directly with national retail and wholesale markets.",
                    "images": [
                        "https://shilpsetu.gov.in/assets/banner.jpg"
                    ]
                },
                "bpp/providers": [
                    {
                        "id": provider_id,
                        "descriptor": {
                            "name": artisan_name,
                            "short_desc": f"Empowered Artisan Unit, MoSJE PIN {cluster_pin}",
                            "images": [studio_url]
                        },
                        "locations": [
                            {
                                "id": f"loc_{cluster_pin}",
                                "gps": "26.7606,83.3732",
                                "address": {
                                    "street": "Rural Artisan Cluster Workstation",
                                    "locality": "Shilp Gram",
                                    "city": "District Headquarters",
                                    "state": "Uttar Pradesh / MP",
                                    "area_code": cluster_pin
                                }
                            }
                        ],
                        "categories": [
                            {
                                "id": "CAT-HANDICRAFTS",
                                "descriptor": {
                                    "code": craft_category,
                                    "name": craft_category
                                }
                            }
                        ],
                        "items": [
                            {
                                "id": item_id,
                                "descriptor": {
                                    "name": title_en,
                                    "code": f"GI-{cluster_pin}-{item_id[:6]}",
                                    "symbol": studio_url,
                                    "short_desc": desc_en[:140],
                                    "long_desc": desc_en,
                                    "images": [studio_url]
                                },
                                "category_id": "CAT-HANDICRAFTS",
                                "fulfillment_id": "FUL-INDIA-POST-01",
                                "price": {
                                    "currency": "INR",
                                    "value": f"{b2c_price:.2f}",
                                    "maximum_value": f"{(b2c_price * 1.20):.2f}"
                                },
                                "matched": True,
                                "tags": [
                                    {
                                        "code": "artisan_statutory_pricing",
                                        "list": [
                                            {"code": "direct_cost_inr", "value": f"{direct_cost:.2f}"},
                                            {"code": "fair_wage_floor_inr_hr", "value": "120.00"},
                                            {"code": "b2c_retail_price", "value": f"{b2c_price:.2f}"},
                                            {"code": "b2b_wholesale_price", "value": f"{b2b_price:.2f}"},
                                            {"code": "gem_government_tender_price", "value": f"{gem_price:.2f}"}
                                        ]
                                    },
                                    {
                                        "code": "craft_heritage_metadata",
                                        "list": [
                                            {"code": "title_hindi", "value": title_hi},
                                            {"code": "technique", "value": technique},
                                            {"code": "materials", "value": ", ".join(materials)},
                                            {"code": "gi_tag_certified", "value": str(gi_tag).lower()},
                                            {"code": "government_beneficiary_corporation", "value": "NBCFDC / NSFDC"}
                                        ]
                                    },
                                    {
                                        "code": "b2b_bulk_order_tier",
                                        "list": [
                                            {"code": "min_order_quantity", "value": "10"},
                                            {"code": "tier_unit_price", "value": f"{b2b_price:.2f}"},
                                            {"code": "lead_time_days", "value": "10"}
                                        ]
                                    }
                                ]
                            }
                        ],
                        "fulfillments": [
                            {
                                "id": "FUL-INDIA-POST-01",
                                "type": "Delivery",
                                "provider_id": "India Post Speed Post / Shiprocket",
                                "rating": "4.8",
                                "tracking": True
                            }
                        ]
                    }
                ]
            }
        }
    }

    return beckn_schema
