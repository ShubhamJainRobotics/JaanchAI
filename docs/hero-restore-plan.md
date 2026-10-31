# JAANCH Landing Hero Restoration — Audit & Plan

## 1. Pre-Flight Baseline Results
- **Git Branch:** `main` (user authorized working directly on `main`)
- **Working Tree:** Clean
- **Lint Check:** PASSED (`check:no-secrets`, `check:banned-phrases`, `check:no-hardcoded-colors`, `typecheck`)
- **Typecheck:** PASSED across shared, server, client
- **Unit & Integration Tests:** 342/342 tests PASSED (shared: 267, server: 38, client: 37)
- **Offline Eval Regression Harness:** 25/25 corpus test cases PASSED (100% precision & recall)
- **Before Screenshots:** Captured 24 screenshots across 390×844, 768×1024, 1366×768, 1440×900 (light & dark) into `/docs/ui-shots/hero-restore-before/`.

---

## 2. Problem Statement & Mission
The landing page (`/`) currently opens with an inline analyzer (textarea, offer-type chips, "Analyze Offer" button) and modified headline.
The owner wants the landing page to work the way it did before:
- Clean, centered hero with **two buttons**:
  1. Primary: **"Check an Offer Now →"** with shield icon -> `/analyze`
  2. Secondary (outline): **"Inspect a Link"** with search icon -> `/link-check`
  3. No inline paste box.
- Preserve all other redesign achievements:
  - Electric Indigo palette and token system
  - Dark mode
  - Top navigation bar with theme toggle and mobile navigation drawer
  - Accessible footer and design token architecture
  - 4 plain-language feature cards directly below buttons
  - "How it works" steps, simplified sample report ("Example — fictional offer"), "What Jaanch can't do" limits strip, closing CTA band
- Verify copy accuracy (§4) across client code and remove inaccurate claims.
- Ensure strict above-the-fold contract and no orphan words for H1.

---

## 3. Plan & Implementation Batches

### Batch 1: Copy Accuracy Audit & Documentation (§4)
- Audit all claims in client code regarding "browser-side", "runs in your browser", "in your browser", "never stored", "private", "never uploaded", "no account", "free".
- Trace actual code paths:
  - Text analysis: Pasted text is sent via POST to `/api/analyze` (processed on server, rule engine, not stored for guests).
  - Screenshots / PDFs: Client-side OCR (`Tesseract.js`) and client-side PDF parsing (`pdfjs-dist`) extract text in the browser. File bytes are never uploaded.
  - Link check: Checks domain heuristics and calls server endpoint for lookalike checks without fetching target URL.
- Ensure copy is literally accurate and conservative.
- Document in `/docs/privacy-copy-check.md`.

### Batch 2: Hero Recomposition & Cleanup (§3)
- Create `/client/src/config/landing.ts` with `SHOW_PROBLEM_STATEMENT_BADGE = true`.
- Update `Hero.tsx`:
  - Problem statement badge (controlled by `SHOW_PROBLEM_STATEMENT_BADGE`).
  - H1 exact restoration: "Spot Warning Signs" (first clause, `foreground`) + "Before You Pay or Share Private&nbsp;Data" (accent clause, `bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to`).
  - Fix orphan "Data" with non-breaking space `Private&nbsp;Data`.
  - Sub-copy exact restoration: "Students encounter hundreds of internship offers, scholarships, and freelance messages online. Jaanch helps you understand **why** something may be risky and **what you should independently verify** before taking action."
  - Two buttons:
    - Primary: "Check an Offer Now →" with `ShieldCheck` icon -> `/analyze`.
    - Secondary: "Inspect a Link" with `Search` icon -> `/link-check`.
    - Both `>= 44px` tall, keyboard accessible, visible focus ring.
  - Four feature cards directly below buttons in Hero:
    - "Explains why", "Never says 'safe'", "Checks official sources", "Screenshots stay on your device".
    - Verified against copy audit findings.
    - 1 row on desktop (`lg:grid-cols-4`), 2×2 on tablet, stacked on mobile.
- Remove `HeroAnalyzer.tsx` from `Hero.tsx`. Check if used elsewhere; if unused, safely remove or deprecate.
- Verify below-the-fold sections:
  - "How it works" + simplified sample report preview (`HowItWorks.tsx`).
  - "What Jaanch can't do" (`LimitsStrip.tsx`).
  - Closing CTA band (`ClosingCta.tsx`) with the two buttons.

### Batch 3: Test Updates & Acceptance Testing (§5)
- Update `test-acceptance.mjs` and Playwright/acceptance tests:
  - Verify H1 exact text "Spot Warning Signs Before You Pay or Share Private Data" (ignoring whitespace/line breaks).
  - Verify NO textarea in hero.
  - Verify two buttons: "Check an Offer Now" -> `/analyze` and "Inspect a Link" -> `/link-check`.
  - Verify above-the-fold at 1440×900 and 1366×768: H1, subcopy, and both buttons visible without scrolling; top edge of feature cards visible. At 390×844 H1 and primary button visible without scrolling.
  - Verify word "Data" is never orphaned on last line across 320, 375, 390, 768, 1024, 1280, 1366, 1440, 1920 px.
  - Verify badge toggle via `SHOW_PROBLEM_STATEMENT_BADGE`.
  - Verify `/analyze` works independently without errors.
  - Add client test checking for removed misleading phrases ("Analysis runs in your browser", "Verify Indian Internships") and unverifiable absolutes (`100%`, `guaranteed`, `instant`) outside safety content.
- Capture after screenshots into `/docs/ui-shots/hero-restore-after/`.
- Ensure all quality gates pass (`lint`, `typecheck`, `test`, `eval`).


---

## 4. Execution & Verification Results

### Pre & Post Test Comparison
| Check | Pre-Flight Baseline | Post-Implementation | Status |
|---|---|---|---|
| **Lint & Security** (`check:no-secrets`) | Passed | Passed | PASS |
| **Banned Phrases** (`check:banned-phrases`) | Passed (4 tests) | Passed (4 tests) | PASS |
| **Design Tokens** (`check:no-hardcoded-colors`) | Passed | Passed (0 hardcoded literals) | PASS |
| **Typecheck** (`tsc --noEmit` on 3 workspaces) | Passed | Passed | PASS |
| **Shared Unit Tests** | 267 / 267 passed | 267 / 267 passed | PASS |
| **Server Tests** | 38 / 38 passed | 38 / 38 passed | PASS |
| **Client Tests** | 37 / 37 passed | 41 / 41 passed (+4 new tests) | PASS |
| **Total Test Count** | 342 passed | 346 passed | PASS |
| **Corpus Eval Regression** | 25 / 25 passed (100% P/R) | 25 / 25 passed (100% P/R) | PASS |
| **Acceptance Criteria Suite** | N/A | 10 / 10 criteria PASSED | PASS |

### Acceptance Suite Results (`scripts/test-acceptance.mjs`)
1. **Criterion 1 (Landing Structure):** PASSED — Single H1 exact wording, no textarea in hero, two action links to `/analyze` and `/link-check`, problem statement badge rendered.
2. **Criterion 2 (Above-The-Fold Contract):** PASSED — At 1440×900 and 1366×768, H1 (bottom ~365px), subcopy (bottom ~473px), and both buttons (bottom ~555px) are completely visible above the fold; at 390×844 H1 (bottom ~262px) and primary button (bottom ~488px) are completely visible without scrolling.
3. **Criterion 3 (Orphan Word Prevention):** PASSED — Word "Data" is never orphaned alone across 320, 375, 390, 768, 1024, 1280, 1366, 1440, 1920 px via `Private\u00A0Data`.
4. **Criterion 4 (Feature Cards):** PASSED — 4 feature cards with `IconTile` inside Hero; peek affordance at 1440×900 verified (`top` ~694px < 900px).
5. **Criterion 5 (Mobile Nav Drawer):** PASSED — Dialog semantics, Esc to close, >= 44px tap targets.
6. **Criterion 6 (Analyze Progressive Disclosure):** PASSED — Collapsed by default, summaries present, sticky CTA safe spacing.
7. **Criterion 7 (Results 375×667 Fold & Protection):** PASSED — Top section, CTA button, and "Stop and protect yourself" block present.
8. **Criterion 8 (Desktop Two-Column & Sticky Sidebar):** PASSED — 1280×800 two-column layout, sticky sidebar, 4 jump links.
9. **Criterion 9 (High-Risk Variant):** PASSED — Safe reply hidden, "Stop and protect yourself" prominent.
10. **Criterion 10 (Zero Horizontal Scroll):** PASSED — Zero horizontal scroll across all 6 main routes at 320, 375, 390, 768, 1024, 1280, 1366, 1440, 1920 px.

### Screenshots
- Baseline screenshots (24): `docs/ui-shots/hero-restore-before/`
- Post-restoration screenshots (24): `docs/ui-shots/hero-restore-after/`
