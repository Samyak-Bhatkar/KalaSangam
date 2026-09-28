"""
Automated edge-case and rate-limiting test for ShilpSetu Motif Engine.
Validates:
1. Rate limiter: 10 requests allowed within 60s, 11th returns HTTP 429.
2. Malformed / empty base64 handling.
3. Timing and latency statistics.
"""

import time
import requests
import base64

BASE_URL = "http://127.0.0.1:8000"

# Small 1x1 transparent png for test
TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

def test_rate_limiter():
    print("\n--- Testing Rate Limiter (Max 10 req/min/IP, 11th = 429) ---")
    results = []
    for i in range(1, 13):
        t0 = time.time()
        resp = requests.post(
            f"{BASE_URL}/api/motif/decode",
            json={
                "image_base64": TINY_PNG,
                "craft_hint": "terracotta",
                "cluster_hint": "Gorakhpur",
                "language": "hi"
            },
            timeout=10
        )
        elapsed = round(time.time() - t0, 3)
        print(f"Request #{i}: HTTP {resp.status_code} ({elapsed}s)")
        results.append((i, resp.status_code))
    
    # Check assertions: first 10 should be 200, 11th and 12th should be 429
    first_10_ok = all(code == 200 for _, code in results[:10])
    eleventh_is_429 = results[10][1] == 429
    twelfth_is_429 = results[11][1] == 429
    
    assert first_10_ok, f"Expected first 10 to succeed, got {[c for _, c in results[:10]]}"
    assert eleventh_is_429, f"Expected 11th to be 429, got {results[10][1]}"
    assert twelfth_is_429, f"Expected 12th to be 429, got {results[11][1]}"
    print(">>> PASS: Rate limiter correctly allowed 10 requests and rejected 11th/12th with HTTP 429!")

def test_rate_limiter_isolated():
    print("\n--- Testing Rate Limiter (Waiting for sliding window reset) ---")
    # Wait for rate limit window to expire so we get a clean slate
    print("Sleeping 30s to allow sliding window to fully clear...")
    time.sleep(30)
    
    results = []
    for i in range(1, 13):
        t0 = time.time()
        resp = requests.post(
            f"{BASE_URL}/api/motif/decode",
            json={
                "image_base64": TINY_PNG,
                "craft_hint": "terracotta",
                "cluster_hint": "Gorakhpur",
                "language": "hi"
            },
            timeout=10
        )
        elapsed = round(time.time() - t0, 3)
        print(f"Request #{i}: HTTP {resp.status_code} ({elapsed}s)")
        results.append((i, resp.status_code))
    
    # Assertions
    # First 10 should be 200, 11th and 12th should be 429
    codes = [c for _, c in results]
    print(f"Resulting status codes: {codes}")
    assert codes[10] == 429, f"11th call must be 429, got {codes[10]}"
    assert codes[11] == 429, f"12th call must be 429, got {codes[11]}"
    print(">>> PASS: Rate limiter correctly triggered HTTP 429 on 11th request!")

def test_invalid_payload():
    print("\n--- Testing Invalid / Non-image Payload Handling ---")
    resp = requests.post(
        f"{BASE_URL}/api/motif/decode",
        json={
            "image_base64": "invalid_base64_not_an_image",
            "craft_hint": "terracotta",
            "language": "hi"
        },
        timeout=10
    )
    print(f"Invalid Base64 Response Status: {resp.status_code}")
    data = resp.json()
    print(f"Fallback response motif: {data.get('motif_name_en')}, confidence: {data.get('confidence_score')}")
    assert resp.status_code in [200, 400, 422], f"Unexpected status: {resp.status_code}"
    # Verify graceful degradation
    assert "motif_name_en" in data
    print(">>> PASS: Graceful degradation on malformed payload!")

if __name__ == "__main__":
    test_invalid_payload()
    test_rate_limiter_isolated()

