import urllib.request
import os
from pathlib import Path

screens = {
    "1_home_command_center.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWFkNTk1NzcwN2M0Y2ExMjQzMzViYzE3EgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
    "2_smart_viewfinder.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWFiODcyZTYwN2M0ZWQ5OWJmMWZiMDczEgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
    "3_voice_catalog.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWE3Zjg0YmEwNzNhZmIyZmQyMGI3NTJlEgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
    "4_pricing_and_publish.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YWVhMWFjM2RlMzcwMzkyZDEzOGFhMDU1N2Q0EgsSBxCBobzu1AQYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDczODE4MDMyNTU1ODA3ODMwNw&filename=&opi=89354086",
}

out_dir = Path(__file__).resolve().parent.parent / "stitch_screens"
out_dir.mkdir(parents=True, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0'}

for fname, url in screens.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            with open(out_dir / fname, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Downloaded {fname} ({len(content)} chars)")
    except Exception as e:
        print(f"Failed to download {fname}: {e}")
