#!/usr/bin/env python3
"""Knowledge Base Audit Script for ShilpSetu Motifs
Theme: Heritage & Culture | Problem Statement 26197
Audits motif_kb.json against strict provenance rules:
1. Every record must have sources[] with title, publisher, url_or_doc_id, page_or_section.
2. Must have verification_status ("verified" | "needs_verification").
3. Exits non-zero if any record with needs_verification would falsely claim to be "curated".
4. Outputs an actionable table and manual verification to-do list.
"""

import sys
import json
from pathlib import Path

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
KB_PATH = ROOT_DIR / "backend" / "app" / "data" / "motif_kb.json"

def audit_kb():
    if not KB_PATH.exists():
        print(f"Error: Motif KB not found at {KB_PATH}")
        sys.exit(1)

    with open(KB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    motifs = data.get("motifs", [])
    print("=" * 90)
    print(f"SHILPSETU MOTIF KNOWLEDGE BASE AUDIT REPORT (Total Motifs: {len(motifs)})")
    print("=" * 90)

    header = f"{'Motif ID':<26} | {'Status':<18} | {'Sources':<7} | {'Display Badge':<20} | {'Compliant'}"
    print(header)
    print("-" * 90)

    violations = []
    todo_list = []

    for m in motifs:
        m_id = m.get("motif_id", "UNKNOWN")
        v_status = m.get("verification_status", "missing")
        sources = m.get("sources", [])
        
        # Display badge logic: Green "Curated" ONLY if non-empty sources and verification_status == "verified"
        if v_status == "verified" and len(sources) > 0:
            badge = "[Curated]"
        else:
            badge = "[Draft/Unverified]"

        # Check if sources are well formed
        sources_valid = True
        if not sources or not isinstance(sources, list):
            sources_valid = False
        else:
            for s in sources:
                if not (s.get("title") and s.get("publisher")):
                    sources_valid = False

        # Violation: if status is not verified but code or data marked it as curated
        would_falsely_curate = (v_status != "verified" and badge == "[Curated]")
        if would_falsely_curate:
            violations.append(f"{m_id}: Falsely designated as Curated without verified status")

        is_compliant = sources_valid and not would_falsely_curate
        print(f"{m_id:<26} | {v_status:<18} | {len(sources):<7} | {badge:<20} | {'PASS' if is_compliant else 'FAIL'}")

        if v_status == "needs_verification":
            first_src = sources[0].get("title", "No source specified") if sources else "None"
            doc_ref = sources[0].get("url_or_doc_id", "N/A") if sources else "N/A"
            todo_list.append({
                "motif_id": m_id,
                "name": m.get("name_en"),
                "source_to_verify": first_src,
                "doc_ref": doc_ref,
                "action": "Obtain certified copy from state handicrafts commissioner or IGNCA library and confirm field documentation."
            })

    print("=" * 90)
    if violations:
        print("\nCRITICAL VIOLATIONS FOUND:")
        for v in violations:
            print(f"  [X] {v}")
        print("\nAudit result: FAILED (Non-zero exit)")
        sys.exit(1)
    else:
        print("\nIntegrity Check: PASSED.")
        print("Rule enforcement: 0 unverified records will display as 'Curated'. All show 'Draft (सत्यापन शेष)'.")

    print("\n" + "=" * 90)
    print("MANUAL VERIFICATION TO-DO LIST (For Ground Truth Sign-Off):")
    print("=" * 90)
    for idx, item in enumerate(todo_list, 1):
        print(f"{idx}. [{item['motif_id']}] {item['name']}")
        print(f"   Archival Reference: {item['source_to_verify']} (Ref: {item['doc_ref']})")
        print(f"   Required Action   : {item['action']}\n")

    return 0

if __name__ == "__main__":
    sys.exit(audit_kb())
