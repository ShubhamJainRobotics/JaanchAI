# Design System Master File — JAANCH

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Jaanch (Trust & Safety / Verification Tool for Indian Students)  
**Generated:** 2026-10-29  
**Core Mission:** Make UI consistent, calm, credible, accessible, and fast with a single design token system.

---

## 1. Global Tokens & Variables

### 1.1 Semantic Roles (Light & Dark)

Implemented via CSS custom properties in `/client/src/styles/tokens.css` and mapped to Tailwind utilities:

| Role | Light Value | Dark Value | CSS Variable |
|------|-------------|------------|--------------|
| Background | `#FAFAFF` | `#0F0D24` | `--color-background` |
| Surface | `#FFFFFF` | `#17143A` | `--color-surface` |
| Surface Raised | `#FFFFFF` | `#201C4D` | `--color-surface-raised` |
| Foreground | `#12102B` | `#F3F1FF` | `--color-foreground` |
| Muted Foreground | `#5B5878` | `#B9B4DE` | `--color-muted-foreground` |
| Border | `#E3DFF7` | `#2D2960` | `--color-border` |
| Ring | `#8F7BFF` | `#B7A8FF` | `--color-ring` |
| Primary | `#5B3DF5` (Electric Indigo) | `#8F7BFF` | `--color-primary` |
| Primary Hover | `#4B2FE0` | `#A594FF` | `--color-primary-hover` |
| Primary Pressed | `#3F26C4` | `#7C66FF` | `--color-primary-pressed` |
| Primary Foreground | `#FFFFFF` | `#0F0D24` | `--color-primary-foreground` |
| Primary Tint | `#F1EEFF` | `#2A2570` | `--color-primary-tint` |
| Primary Tint Border | `#D9D2FF` | `#3D368A` | `--color-primary-tint-border` |
| Link | `#5B3DF5` | `#8F7BFF` | `--color-link` |
| Marketing Highlight | `#FFD43B` (Warm marker) | `#FFD43B` | `--color-highlight` |
| Destructive | `#DC2626` | `#EF4444` | `--color-destructive` |
| Success | `#047857` | `#10B981` | `--color-success` |
| Warning | `#B45309` | `#F59E0B` | `--color-warning` |
| Info | `#5B3DF5` | `#8F7BFF` | `--color-info` |

### 1.2 Status Tokens (Icon + Text Label Mandatory)

| Status | Background (L/D) | Border (L/D) | Foreground (L/D) | Icon (`lucide-react`) |
|--------|------------------|--------------|------------------|-----------------------|
| `status-verified` | `#ECFDF5` / `#064E3B40` | `#A7F3D0` / `#065F46` | `#065F46` / `#34D399` | `ShieldCheck` (emerald) |
| `status-likely` | `#F0FDFA` / `#134E4A40` | `#99F6E4` / `#115E59` | `#115E59` / `#2DD4BF` | `CheckCircle2` (teal) |
| `status-review` | `#FFFBEB` / `#78350F30` | `#FDE68A` / `#92400E` | `#92400E` / `#FBBF24` | `AlertCircle` (amber) |
| `status-high-risk` | `#FEF2F2` / `#7F1D1D30` | `#FECACA` / `#991B1B` | `#991B1B` / `#F87171` | `AlertTriangle` (red) |
| `status-confirmed-scam`| `#FFF1F2` / `#88133730` | `#FECDD3` / `#9F1239` | `#9F1239` / `#FB7185` | `ShieldAlert` (dark rose) |

### 1.3 Outcome-Chip Tokens

- `pass`: Emerald text/border/bg, `Check` icon.
- `fail`: Red text/border/bg, `X` icon.
- `unknown`: Amber text/border/bg, `HelpCircle` icon.
- `none-found`: Neutral grey text/border/bg (`#F1F5F9` / `#475569`), `Minus` icon. **Never green.**
- `not-run`: Neutral slate text/border/bg, `CircleDashed` icon.
- `user-attested`: Blue text/border/bg, `UserCheck` icon.

### 1.4 Severity Tokens

- `critical`: Red
- `high`: Deep Orange / Red-600
- `medium`: Amber-600
- `low`: Sky-600
- `info`: Slate-500

### 1.5 Scales

- **Typography:**
  - Scales: `xs` (12px), `sm` (14px), `base` (16px), `lg` (18px), `xl` (20px), `2xl` (24px), `3xl` (30px).
  - Mobile base: 16px to prevent iOS auto-zoom on input.
  - Line height: 1.5 body, 1.2–1.3 headings.
  - Numbers/Counts: `font-variant-numeric: tabular-nums`.
  - Wrapping: `overflow-wrap: anywhere` on URLs and identifiers.
- **Spacing:** 4-pt grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **Radii:** `sm: 6px`, `md: 10px`, `lg: 14px`.
- **Shadows:** Two subtle levels only:
  - `sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
  - `md`: `0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`
- **Focus Ring:** 2px solid, offset 2px, ≥ 3:1 contrast against adjacent surface.
- **Motion:** 150–200ms ease-out transitions; disabled when `prefers-reduced-motion: reduce`.
- **Touch Targets:** Minimum 44×44 px with ≥ 8 px spacing between interactive targets.

---

## 2. Component Specifications

### 2.1 Buttons
- **Primary:** Background `var(--color-primary)`, text `var(--color-primary-foreground)`, rounded `var(--radius-md)`, min-h 44px, font-weight 600.
- **Secondary:** Background transparent, border 1px solid `var(--color-border)`, text `var(--color-foreground)`.
- **Destructive:** Background `var(--color-destructive)`, text white.
- **Touch target:** Minimum 44×44 px hit area.

### 2.2 Inputs & Form Controls
- Height: min 44px.
- Padding: 10px 14px.
- Border: 1px solid `var(--color-border)`, rounded `var(--radius-md)`.
- Focus: `ring-2 ring-ring ring-offset-2`.
- Form validation: inline field validation + error summary box at top of form (`role="alert"`).

### 2.3 Cards
- Background: `var(--color-surface)`.
- Border: 1px solid `var(--color-border)`.
- Radius: `var(--radius-md)` (10px) or `var(--radius-lg)` (14px).
- Shadow: `var(--shadow-sm)`.
- Max two levels of visual nesting; use dividers/spacing instead of cards-inside-cards.

---

## 3. Anti-Patterns (Strictly Forbidden)

- ❌ **No fake marketing content:** Never invent user counts, accuracy claims, press mentions, partner logos, or fake reviews.
- ❌ **No numeric risk percentages:** Risk is categorical (`HIGH_RISK`, `NEEDS_REVIEW`, `LIKELY_GENUINE`), never a % score.
- ❌ **No emojis as UI icons:** Use `lucide-react` SVGs with consistent stroke width.
- ❌ **No hard-coded color literals:** No `#hex`, `rgb()`, or arbitrary Tailwind color classes outside `tokens.css`.
- ❌ **No color-only indicators:** Status, outcome, and severity must always render an icon + text label.
- ❌ **No layout-shifting hover transforms:** Drop `translateY` hover animations.
- ❌ **No external CDN font links:** CSP forbids Google Fonts / CDN stylesheets.

---

## 4. Overrides (Deviations from Generated Output & Rationale)

1. **Pattern / Tone Override:**  
   *Generated:* "Contact Sales / Get Quote", "Pricing", "Proof logos".  
   *Override:* Jaanch is a non-profit/public-good student trust-and-safety utility. Commercial CTAs, pricing tiers, partner badges, and sales speak are completely removed. Tone is calm, reassuring, and factual.
2. **Typography Self-Hosting Override:**  
   *Generated:* Google Fonts CDN `@import url('https://fonts.googleapis.com/css2?family=Lexend...')`.  
   *Override:* Security & CSP policies forbid CDN font links. Self-hosted local WOFF2/TTF fonts (`/fonts/NotoSans...`, `/fonts/NotoSansDevanagari...`, and system sans) are used with `font-display: swap` and Devanagari fallback for Hindi quotes.
3. **Shadow Scale Override:**  
   *Generated:* 4 shadow levels up to `--shadow-xl` (25px blur).  
   *Override:* Security and safety interfaces require crisp, calm elevation. Only 2 subtle shadow levels (`sm`, `md`) are allowed.
4. **Color Palette & Status Tokens Override (Round 3 Electric Indigo):**  
   *Generated:* Single accent `#0369A1` with general UI colors.  
   *Override:* Replaced teal-blue with Electric Indigo (`#5B3DF5` light, `#8F7BFF` dark). Ensures brand primary maintains a minimum 30° hue separation from all 5 verification status hues (emerald, teal, amber, red, dark rose), eliminating brand-status collision. Status tokens remain strictly isolated. Added marketing-only warm highlight (`#FFD43B`) strictly for landing page display markers.
5. **Border Radius Override:**  
   *Generated:* Arbitrary 8px/12px/16px mix.  
   *Override:* Standardized 3-tier scale: `sm: 6px`, `md: 10px`, `lg: 14px`.
6. **Hover Transitions Override:**  
   *Generated:* `transform: translateY(-2px)` on all card hover states.  
   *Override:* Prohibited in core application views and on mobile touch devices to eliminate layout shifts. Subtle hover lift is permitted strictly on desktop marketing cards when `prefers-reduced-motion: no-preference`.
7. **Monospace Strict Containment (Round 3):**  
   *Generated:* Monospace applied broadly across badges, section headers, and timestamps.  
   *Override:* Monospace font (`font-mono`) is strictly restricted to quoted message content, code tokens, and rule IDs; eliminated from all UI labels, badges, and timestamps.
