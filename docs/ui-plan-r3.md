# JAANCH Hero Recomposition & Vivid Palette (Round 3) — Audit & Plan

## 1. Pre-Flight Baseline Results
- **Git Branch:** `ui-redesign` (verified clean working tree)
- **Restore Point Tag:** `ui-round2-final`
- **Lint Check:** PASSED (`check:no-secrets`, `check:banned-phrases`, `check:no-hardcoded-colors`, `typecheck`)
- **Typecheck:** PASSED across shared, server, client
- **Unit & Integration Tests:** 338/338 tests PASSED (shared: 267, server: 38, client: 33)
- **Offline Eval Regression Harness:** 25/25 corpus test cases PASSED (100% precision & recall)

---

## 2. Round 3 Audit: Identified Issues

1. **Main Action Below Fold:**
   - At 1920×1080 and 1366×768, the "Analyze offer" button sits near or below the viewport edge due to extensive vertical space taken up by two-column hero copy and side-by-side layout.
2. **Right-Hand Sample Report Visual Clutter:**
   - The sample report preview contains stacked boxes with multiple red-tinted containers (status banner + payment alert box + evidence quotes), creating visual competition with the primary action on a marketing page.
3. **Offer-Type Chips Wrapping:**
   - On narrower viewports, offer-type chips wrap onto a second line with "Website" / "Other" orphaned.
4. **Monospace Leaking into UI Sans Labels:**
   - Monospace font is used on UI labels (`"WhatsApp / Telegram / Email"`, `"EXAMPLE — FICTIONAL OFFER"`, `"Sample Preview"`). Monospace should only appear in code/quotes/IDs.
5. **Brand Palette Collision with "Likely Genuine":**
   - The previous teal-blue primary (`#006B7D` / `#008299`) sat in the same hue space as the "Likely Genuine" status teal (`#008299`). Brand identity must be completely distinct from all 5 status hues.
6. **Flatness & Energy:**
   - Page lacks visual energy, dynamic hierarchy, and clear focal hierarchy.

---

## 3. Plan & Implementation Batches

- **Batch 1: Vivid Electric Indigo Palette & Contrast Validation**
  - Define new palette in `tokens.css` (primary `#5B3DF5`, hover `#4B2FE0`, pressed `#3F26C4`, tint `#F1EEFF`, tint-border `#D9D2FF`, background `#FAFAFF`, surface `#FFFFFF`, foreground `#12102B`, muted `#5B5878`, border `#E3DFF7`, ring `#8F7BFF`, marketing highlight `#FFD43B`, display gradient `#5B3DF5` -> `#8B5CF6`).
  - Dark mode tokens: background `#0F0D24`, surface `#17143A`, surface-raised `#201C4D`, border `#2D2960`, foreground `#F3F1FF`, muted `#B9B4DE`, primary `#8F7BFF`, tint `#2A2570`.
  - Update contrast test suite (`client/src/__tests__/tokensContrast.test.ts`) and add hue distance collision test ensuring brand hue distance > 30° from all status colors.
  - Update `design-system/jaanch/MASTER.md` Overrides section.

- **Batch 2: Global Polish & Monospace Cleanup**
  - Buttons: solid primary, outline secondary, ghost, 44px min-height, focus ring.
  - Navigation: logo tile in primary, active route indicator, theme toggle, mobile drawer.
  - Fix monospace font usage: restrict `font-mono` strictly to `Quote`, `CodeValue`, `RuleId`, URLs, and Devanagari numerals where appropriate.
  - Add test asserting monospace is not leaked into generic UI labels.

- **Batch 3: Landing Page Recomposition**
  - Centered, single-column hero (`max-w-3xl` content) with static CSS-only radial glow backdrop and faint dot grid.
  - Fluid H1 with balanced wrap, gradient accent on second clause, marketing `highlight` hand-drawn marker under *"Before You Pay"*.
  - Shortened sub-copy (max 2 lines).
  - Analyzer card centered directly under sub-copy with 1-row offer-type selector (horizontal scroll-snap on mobile) and prominent Analyze button.
  - Trust row: 3 verified truth pills under card.
  - "See what a report looks like" section below hero: How it works (left) + Simplified sample report (right) with neutral card borders and 1 red badge only.
  - Benefits grid with subtle hover lift; Limits strip; Full-bleed primary closing CTA band.

- **Batch 4: Verification, Quality Gates & Screenshots**
  - Verify analyze, results, history, resources, about, login in light and dark mode.
  - Capture before/after screenshots at 390×844, 768×1024, 1366×768, 1440×900 in light and dark mode.
  - Final PASS/FAIL report against §8 criteria.

---

## 4. Execution & Quality Gate Results (Round 3 Complete)

### Baseline & Quality Gates
- **`npm run lint`**: **PASSED** (0 hardcoded colors outside `tokens.css`, 0 banned phrases, 0 secret leaks, typecheck passed).
- **`npm run test`**: **PASSED** (342/342 tests passed: shared 267, server 38, client 37).
- **`npm run eval -w shared`**: **PASSED** (25/25 corpus test cases passed: 100% precision & recall).
- **`node scripts/test-acceptance.mjs`**: **PASSED** all 10 acceptance criteria:
  1. Landing Structure (single H1, hero analyzer, fictional sample label, sample inert, 10 icon tiles): **PASS**
  2. Landing Above-The-Fold (1440×900: button bottom 682px <= 900px, 1366×768: button bottom 682px <= 768px): **PASS**
  3. Offer-Type Chips Single-Row (all 7 chips on a single horizontal row on desktop): **PASS**
  4. H1 Balanced Text Wrap with no orphans across 320-1440px: **PASS**
  5. Mobile Nav Drawer (dialog, focus trap, Esc close, min 44px tap targets): **PASS**
  6. Analyze Progressive Disclosure (details and privacy collapsed by default, summaries, sticky CTA safe spacing): **PASS**
  7. Results 375×667 Above-The-Fold Contract & Stop-and-protect block: **PASS**
  8. Desktop 1280×800 Two-Column Layout & Sticky Sidebar: **PASS**
  9. High-Risk Variant Safety Controls (Safe Reply hidden, Stop and protect prominent): **PASS**
  10. Zero Horizontal Scroll across routes at 320-1440px: **PASS**

### Screenshots
- Baseline Before: 24 screenshots saved in `docs/ui-shots/r3-before/`.
- Batch 1 After: 24 screenshots saved in `docs/ui-shots/r3-after/batch-1/`.
- Batch 2 After: 24 screenshots saved in `docs/ui-shots/r3-after/batch-2/`.
- Batch 3 After: 24 screenshots saved in `docs/ui-shots/r3-after/batch-3/`.
- Final After: 24 screenshots saved in `docs/ui-shots/r3-after/final/`.

