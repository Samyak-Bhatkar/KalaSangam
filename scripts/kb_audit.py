#!/usr/bin/env python3
import sys
from pathlib import Path

# Forward to backend/scripts/kb_audit.py
backend_script = Path(__file__).resolve().parent / "backend" / "scripts" / "kb_audit.py"
if not backend_script.exists():
    backend_script = Path(__file__).resolve().parent.parent / "backend" / "scripts" / "kb_audit.py"

import subprocess
res = subprocess.run([sys.executable, str(backend_script)])
sys.exit(res.returncode)
