import os
import subprocess
import shutil

# Delegate to render_tech_stacks or run the complete suite
script_dir = os.path.dirname(os.path.abspath(__file__))
render_script = os.path.join(script_dir, "render_tech_stacks.py")

if os.path.exists(render_script):
    subprocess.run(["python", render_script], check=True)
else:
    print("render_tech_stacks.py not found!")
