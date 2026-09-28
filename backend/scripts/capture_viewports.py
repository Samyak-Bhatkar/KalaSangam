import subprocess
import os

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
QA_DIR = os.path.abspath("docs/qa")

TARGETS = [
    ("viewport_360x640_android.png", 360, 640, "http://localhost:5173/?view=scan"),
    ("viewport_412x915_pixel7.png", 412, 915, "http://localhost:5173/?view=scan"),
    ("viewport_844x390_landscape.png", 844, 390, "http://localhost:5173/?view=scan"),
    ("verify_craft_nbcfdc_002.png", 390, 844, "http://localhost:5173/verify/CRAFT-NBCFDC-002"),
]

for filename, w, h, url in TARGETS:
    outpath = os.path.join(QA_DIR, filename)
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        f"--window-size={w},{h}",
        f"--screenshot={outpath}",
        "--virtual-time-budget=3000",
        url
    ]
    print(f"Capturing {filename} at {w}x{h} -> {url}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(outpath):
        print(f"  OK: {filename} ({os.path.getsize(outpath)} bytes)")
    else:
        print(f"  FAILED: {filename}, returncode={res.returncode}")
        if res.stderr:
            print(f"  stderr: {res.stderr}")

print("Capture run finished.")
