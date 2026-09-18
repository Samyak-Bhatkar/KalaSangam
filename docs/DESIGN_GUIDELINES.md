# ShilpSetu (KalaSangam) — Design System & Visual Guidelines
**Client**: Ministry of Social Justice and Empowerment (MoSJE), Department of Social Justice and Empowerment, Government of India  
**Problem Statement ID**: 26090  
**Design Standard**: Staff Product Designer at Apple + ex-Airbnb Design Lead + Material Design 3 + SIH Grand Finale Judge criteria.

---

## The Core Philosophy: Light, Editorial & Trustworthy
Every screen must be presentation-ready for SIH Grand Finale judges and effortlessly intuitive for marginalized rural artisans. **No dark mode** — the aesthetic is clean, luminous, airy, and warm.

### 1. Palette & Surface Tokens
| Role | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Canvas Background** | `#F8F9FA` | Standard e-commerce off-white daylight studio canvas |
| **Card Surface** | `#FFFFFF` | Elevated pure white surfaces with subtle 1px border |
| **Primary Text** | `#0F172A` | Slate-900 high-contrast legible typography (WCAG AAA) |
| **Secondary Text** | `#64748B` | Slate-500 muted metadata and technical subtext |
| **Border / Divider** | `#E2E8F0` | Slate-200 delicate hairline borders |
| **Artisan Amber / Rust** | `#C2410C` | Terracotta / warm heritage accent (indicative of craft) |
| **MoSJE Saffron Accent** | `#D97706` | Primary action highlights and status chips |
| **Verification Emerald** | `#059669` | Authenticity badges, GI tag verification, living wage pass |

### 2. Typography
- **Primary Font**: `Inter`, `SF Pro Display`, or system sans-serif.
- **Headings**: Clean, optical kerning, high visual weight without being clunky.
- **Micro-Copy**: Uppercase, letter-spaced (`letter-spacing: 0.05em`) 11px badges.

### 3. Surface Physics (Contact Drop Shadow)
- Rather than diffuse dark glows, studio objects cast realistic, directional ambient occlusion:
  - Vertical elliptical scale: $Y = 0.22X$
  - Soft blur radius: 16px - 20px
  - Opacity: 20% - 28% natural gray-black contact base

### 4. Accessibility Rules (WCAG 2.1 AA)
- Minimum contrast ratio of 4.5:1 for all readable text.
- Minimum tap target size of 48px × 48px for all mobile touch targets.
- High-visibility bilingual indicators (Hindi + English) on all interactive controls.
