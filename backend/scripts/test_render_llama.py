import os
import subprocess

p_llama = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\tech_logos\llama_colored.svg"
with open(p_llama, "r", encoding="utf-8") as f:
    svg = f.read()

html = f"""<!DOCTYPE html>
<html>
<body style="background:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="width:180px;height:180px;">
    {svg}
  </div>
</body>
</html>"""

out_html = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\frontend\public\test_llama.html"
with open(out_html, "w", encoding="utf-8") as f:
    f.write(html)

out_png = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\test_llama.png"
cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--disable-gpu",
    "--window-size=400,400",
    f"--screenshot={out_png}",
    f"file:///{os.path.abspath(out_html).replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print("Rendered test_llama.png successfully!")
