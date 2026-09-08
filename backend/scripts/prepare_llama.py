import os

p_ollama = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\tech_logos\ollama.svg"
p_out = r"c:\Users\thulp\OneDrive\Desktop\ShilpSetu AI\stitch_assets\tech_logos\llama_colored.svg"

with open(p_ollama, "r", encoding="utf-8") as f:
    c = f.read()

path_start = c.find("<path")
path_str = c[path_start:]
path_str = path_str.replace("<path d=", '<path fill="url(#llama-g)" d=')

llama_svg = f"""<svg viewBox="0 0 24 24" width="100%" height="100%">
  <defs>
    <linearGradient id="llama-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0064E0"/>
      <stop offset="45%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#F43F5E"/>
    </linearGradient>
  </defs>
  {path_str}
"""

with open(p_out, "w", encoding="utf-8") as f:
    f.write(llama_svg)

print("Saved llama_colored.svg successfully!")
