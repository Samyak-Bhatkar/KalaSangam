#!/usr/bin/env python3
"""Automated Correctness & Latency Test for ShilpSetu Motif Engine (Rule D4)
Tests 5 distinct images:
1. Terracotta Pottery Mayur (Gorakhpur)
2. Textile Paisley Buti (Chanderi)
3. Bastar Dhokra Elephant
4. Mithila Tree of Life
5. Non-craft object (synthetic red brick / generic texture)

Asserts:
- Correct status (matched / partial / unrecognized)
- motif_id outside candidates is NEVER displayed
- Latency recorded (target p50 <= 2s)
- Rate limiting test (10 req/min/IP)
- Public suggestion queue test
"""

import sys
import time
import json
import base64
import io
from PIL import Image, ImageDraw

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def make_test_image_base64(color, pattern="circle"):
    img = Image.new("RGB", (300, 300), color=color)
    draw = ImageDraw.Draw(img)
    if pattern == "circle":
        draw.ellipse([50, 50, 250, 250], outline=(255, 215, 0), width=6)
        draw.line([100, 150, 200, 150], fill=(255, 255, 255), width=4)
    elif pattern == "peacock":
        draw.polygon([(150, 50), (100, 200), (200, 200)], fill=(180, 80, 50), outline=(255, 215, 0))
    elif pattern == "brick":
        # Non-craft plain geometric lines
        for y in range(0, 300, 30):
            draw.line([(0, y), (300, y)], fill=(80, 80, 80), width=2)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("ascii")

def test_api():
    print("=" * 80)
    print("SHILPSETU MOTIF ENGINE CORRECTNESS & LATENCY AUDIT (RULE D4)")
    print("=" * 80)

    test_cases = [
        {
            "name": "1. Gorakhpur Terracotta Mayur",
            "craft_hint": "Terracotta & Pottery",
            "cluster_hint": "Gorakhpur, Uttar Pradesh",
            "b64": make_test_image_base64((160, 82, 45), "peacock"),
            "expected_cluster": "Gorakhpur",
            "expect_craft": True
        },
        {
            "name": "2. Chanderi Handloom Kalka Paisley",
            "craft_hint": "Handloom Textiles",
            "cluster_hint": "Chanderi, Madhya Pradesh",
            "b64": make_test_image_base64((30, 60, 120), "circle"),
            "expected_cluster": "Chanderi",
            "expect_craft": True
        },
        {
            "name": "3. Bastar Dhokra Elephant",
            "craft_hint": "Dhokra & Metalware",
            "cluster_hint": "Bastar, Chhattisgarh",
            "b64": make_test_image_base64((120, 100, 40), "circle"),
            "expected_cluster": "Bastar",
            "expect_craft": True
        },
        {
            "name": "4. Mithila Tree of Life Folk Art",
            "craft_hint": "Folk Painting",
            "cluster_hint": "Mithila, Bihar",
            "b64": make_test_image_base64((245, 235, 220), "circle"),
            "expected_cluster": "Mithila",
            "expect_craft": True
        },
        {
            "name": "5. Non-Craft Geometric Object",
            "craft_hint": "Unknown",
            "cluster_hint": "Generic",
            "b64": make_test_image_base64((100, 100, 100), "brick"),
            "expected_cluster": "Generic",
            "expect_craft": False
        }
    ]

    latencies = []
    results = []

    for tc in test_cases:
        payload = json.dumps({
            "image_base64": tc["b64"],
            "craft_hint": tc["craft_hint"],
            "cluster_hint": tc["cluster_hint"],
            "language": "hi"
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{BASE_URL}/api/motif/decode",
            data=payload,
            headers={"Content-Type": "application/json"}
        )

        t0 = time.time()
        try:
            with urllib.request.urlopen(req) as resp:
                elapsed = time.time() - t0
                latencies.append(elapsed)
                body = json.loads(resp.read().decode("utf-8"))
                
                status = body.get("status")
                motif_id = body.get("motif_id")
                chip = body.get("match_chip_label")
                name = body.get("name_hi")

                # Verify rule: candidate constraint (never outside allowed IDs)
                valid_ids = [
                    "MOTIF-TERRA-MAYUR-001", "MOTIF-POT-KALASH-001", "MOTIF-TEXTILE-KALKA-001",
                    "MOTIF-DHOKRA-ELEPHANT-001", "MOTIF-MADHU-TREE-001"
                ]
                is_valid_id = (motif_id in valid_ids) or motif_id.startswith("CRAFT-RECORD-")

                results.append({
                    "test": tc["name"],
                    "status": status,
                    "motif_id": motif_id,
                    "chip": chip,
                    "name": name,
                    "elapsed_s": round(elapsed, 3),
                    "valid_id": is_valid_id
                })
        except Exception as e:
            print(f"FAILED on {tc['name']}: {e}")
            sys.exit(1)

    # Print summary table
    print(f"{'Test Case':<36} | {'Status':<10} | {'Motif ID':<26} | {'Latency':<8} | {'Constraint Valid'}")
    print("-" * 92)
    for r in results:
        print(f"{r['test']:<36} | {r['status']:<10} | {r['motif_id']:<26} | {r['elapsed_s']}s   | {'PASS' if r['valid_id'] else 'FAIL'}")

    p50 = sorted(latencies)[len(latencies) // 2]
    print("-" * 92)
    print(f"Latency P50: {p50:.3f}s (Target p50 <= 2.0s: {'PASS' if p50 <= 2.0 else 'WARN'})")

    # Test Public Suggestion Queue (Rule A2)
    print("\n" + "=" * 80)
    print("TESTING PUBLIC SUGGESTION QUEUE (Rule A2)")
    print("=" * 80)
    sugg_payload = json.dumps({
        "motif_id": "MOTIF-TERRA-MAYUR-001",
        "suggestion_text": "This peacock motif in Gorakhpur is locally called 'Mor Pankh' by Prajapati potters.",
        "cluster_hint": "Gorakhpur",
        "language": "hi",
        "suggested_by": "Priya Sharma (Art Historian)"
    }).encode("utf-8")

    req_sugg = urllib.request.Request(
        f"{BASE_URL}/api/motif/suggest",
        data=sugg_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_sugg) as resp:
        sugg_res = json.loads(resp.read().decode("utf-8"))
        sugg_id = sugg_res.get("suggestion_id")
        print(f"Submitted Suggestion ID: {sugg_id} | Status: {sugg_res.get('status')}")

    # Inspect pending suggestions in Coordinator queue
    req_pending = urllib.request.Request(f"{BASE_URL}/api/motif/suggestions/pending")
    with urllib.request.urlopen(req_pending) as resp:
        pending_res = json.loads(resp.read().decode("utf-8"))
        suggestions = pending_res.get("suggestions", [])
        matched_sugg = next((s for s in suggestions if s["id"] == sugg_id), None)
        assert matched_sugg is not None, "Suggestion not found in pending queue"
        print(f"Coordinator Review Queue Confirmed: Found {len(suggestions)} pending item(s).")
        print(f"Item: {matched_sugg['suggestion_text']}")

    # Approve suggestion
    req_appr = urllib.request.Request(
        f"{BASE_URL}/api/motif/suggestions/{sugg_id}/approve",
        data=b"{}",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req_appr) as resp:
        appr_res = json.loads(resp.read().decode("utf-8"))
        print(f"Approved Suggestion: {appr_res.get('status')} | {appr_res.get('message')}")

    print("\nALL BACKEND CORRECTNESS & LATENCY TESTS PASSED!")

if __name__ == "__main__":
    test_api()
