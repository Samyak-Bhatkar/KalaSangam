# Naad-Virasat (नाद विरासत) — 90-Second Live Judge Demo Script

> **Setting**: AICTE PS 26197 Live Evaluation (Projector & Judges' Smartphones)  
> **Target Duration**: Exactly 90 Seconds  
> **Key Objective**: Deliver a flawless, jaw-dropping demo showing cross-modal AI artifact analysis, physical audio synthesis, and rigorous academic transparency with zero crashes.

---

## Pre-Demo Setup Checklist (30 seconds before judging)
- [ ] Connect laptop to projector (1920x1080 or 1280x800).
- [ ] Ensure system audio is connected to stage speakers.
- [ ] Open browser to `http://localhost:5173`.
- [ ] Click **"Heritage Explorer"** in the top navigation or open `http://localhost:5173/?tab=naad`.
- [ ] Optional: Add `?demo=1` to the URL or simply click the golden **"⭐ Judge Demo (90s)"** button on top.

---

## Timestamped 90-Second Walkthrough

| Time | Action on Screen | What to Say (Spoken Script) | Technical Wow Beat |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:15** | Tap **"⭐ Judge Demo (90s)"** or select **"Hoysala Saraswati Relief (Belur)"** in demo gallery. | *"Namaste respected jury members. Across India's ancient temples, hundreds of classical musical instruments are sculpted in stone — yet to the modern eye, they remain frozen and silent. With Naad-Virasat, we introduce an informed, evidence-based cross-modal reconstruction system."* | Client-side EXIF/GPS stripping immediately executes in temporary memory; no user image stored. |
| **00:15 - 00:30** | Golden laser sweep scans the carving; detection box snaps over the danda tube with 94% confidence. | *"Our organology model analyzes the morphological contours against the Natyashastra taxonomy. It identifies this carving from the 12th-century Belur Chennakeshava Temple as a Tata Vadya — the single-stringed Ekatantri Vina."* | Natyashastra 4-fold taxonomy (तत, सुषिर, अवनद्ध, घन) enforced; bounding box normalized. |
| **00:30 - 00:48** | Tap **"Lift Out & Enter Playing Studio"**. Background stone dims; golden glowing strings appear overlaid directly onto the carved danda. Swipe across strings with mouse/finger. | *"Notice the lift-out reveal: the stone background dims, and virtual strings appear directly on the carving. We do not use sample recordings — every note is physically synthesized via fractional-delay Karplus-Strong physical modeling, tuned to the ancient pentatonic Mohanam raga."* | Fractional-delay string DSP avoids Web Audio's 128-sample cycle clamp. Pointer intersection detects swipe velocity. |
| **00:48 - 01:05** | Tap **"🏛️ Stone Mandapa"** toggle. Tap a string again; note the majestic granite pillar echo. Notice stone pulsing with sound. | *"Now, listen as I engage the 'Stone Mandapa' acoustics. Our procedural convolution engine simulates the dense reflections and high-frequency absorption of a monolithic granite pillared hall with an RT60 decay of 2.4 seconds. Notice how the stone carving itself pulses to the acoustic RMS energy."* | Procedural granite impulse response generated on-the-fly; CSS variable `--nv-sound-rms` drives responsive stone pulsation. |
| **01:05 - 01:20** | Tap **"⚖️ A/B Compare Modern"**. Modal opens showing Ekatantri Vina vs modern Saraswati Vina. Tap **"Play Ancient"** then **"Play Modern"**. | *"How did this instrument reach the modern concert stage? Through our evolutionary timeline, judges can compare the 12th-century single-string danda with the 24-fretted Saraswati Vina, hearing how gut strings evolved into brass resonance across a millennium."* | 3-step historical progression timeline with instantaneous A/B acoustic comparison. |
| **01:20 - 01:30** | Close compare, tap **"📜 Evidence & Provenance"**. Highlight Natyashastra citation and honesty banner. | *"Finally, our credibility moment: we never claim to resurrect the exact audio of 900 years ago. Every reconstruction is backed by four pillars: carving evidence, treatise citations from Natyashastra Chapter 28, physical DSP parameters, and transparent status badges. Thank you — please try playing the strings yourselves!"* | Academic integrity: cites verified works at title level, transparently marked `[verified: false]` pending archival confirmation. |

---

## Post-Demo Handover to Judges
- Click **"Exit to Play Freely ✕"** on the Judge Demo banner.
- Invite judges to:
  1. Strum the strings using multi-touch or keyboard keys (`A`, `S`, `D`, `F`, `G`).
  2. Switch between **Mohanam** (5-note pentatonic) and **Bhairav** (7-note heptatonic).
  3. Try percussion instruments (**Mridangam** center vs rim stroke) or aerophones (**Shankha** press-and-hold sacred conch swell).
- Show hidden `?debug=1` overlay displaying measured tap-to-sound latency (`< 2.5 ms`).
