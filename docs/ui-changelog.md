# JAANCH UI/UX Restyle Changelog

This document tracks all visual and interaction restyle batches, design system overrides, and verification results.

---

## Pre-Flight & Setup
- **Branch:** `ui-redesign` (verified working tree clean).
- **Skill:** `ui-ux-pro-max` initialized and referenced.
- **Design System Master:** Generated `design-system/jaanch/MASTER.md` with explicit "Overrides" section.
- **Baseline Verification:**
  - `npm run lint` PASSED
  - `npm run typecheck` PASSED
  - `npm run test` PASSED (329 tests passed across shared, server, client)
  - `npm run eval` PASSED (25/25 corpus fixtures passed)
- **Before Screenshots:** Captured 20 screenshots at 1440px and 375px in `/docs/ui-shots/before/`.

---

## Batch 1: Foundation (Tokens, Fonts, Theme Toggle, AppShell, Navbar, Footer)
- **Tokens System:** Implemented `client/src/styles/tokens.css` with:
  - Semantic roles (`background`, `surface`, `surface-raised`, `foreground`, `muted-foreground`, `border`, `ring`, `primary`, `destructive`, etc.)
  - Status tokens for 5 verification states with text contrast ≥ 7:1 in light and dark
  - Outcome chip tokens (`pass`, `fail`, `unknown`, `none-found` [neutral grey, never green], `not-run`, `user-attested`)
  - Severity tokens (`critical`, `high`, `medium`, `low`, `info`)
  - Scales: 4-pt spacing, typography scales, radii (`sm: 6px`, `md: 10px`, `lg: 14px`), 2 subtle shadow levels (`sm`, `md`), focus ring (`2px`, offset `2px`)
- **Tailwind Mapping:** Updated `client/tailwind.config.ts` mapping all tokens and setting `darkMode: 'class'`.
- **Self-Hosted Typography:**
  - Removed external Google Fonts CDN links from `client/index.html` to comply with CSP.
  - Configured `@font-face` in `client/src/styles/index.css` with local Noto Sans and Noto Sans Devanagari fallbacks.
  - Enforced `font-display: swap` and `tabular-nums`.
- **Theme Toggle & State:**
  - Added `useTheme` hook with `localStorage` (try/catch protected) and `prefers-color-scheme` support.
  - Added theme toggle button (Sun/Moon) to Navbar with ≥ 44×44px touch targets.
  - Injected inline anti-flicker script in `index.html`.
- **Accessibility:**
  - Added skip link in `AppShell` jumping to `#main-content`.
  - Added automated contrast test suite (`client/src/__tests__/tokensContrast.test.ts`) asserting WCAG 2.2 AA ≥ 4.5:1 for body and ≥ 7:1 for status banners.
  - Added anti-pattern scan ensuring 0 numeric risk % and 0 fake marketing claims.
- **Verification:** All 33 client tests, 38 server tests, and 267 shared tests passed. Screenshots saved to `docs/ui-shots/after/batch-1/`.

---

## Batch 2: Status Components
- **StatusBanner Restyle:**
  - Migrated from hardcoded arbitrary colors to semantic status tokens (`status-verified`, `status-likely`, `status-review`, `status-high-risk`, `status-confirmed-scam`).
  - Added `data-testid="status-banner"` and `data-testid="coverage-meter"`.
  - Icon + text pairing enforced for all statuses with `lucide-react` vector icons (stroke 1.75px).
  - Integrated verification coverage meter as a clean, thin progress bar (`role="progressbar"`) with accessible aria labeling and tabular-nums.
- **Payment Alert Notice:**
  - Added `data-testid="payment-alert"` with calm, high-contrast framing (`status-high-risk` border/bg/fg tokens).
  - Preserved verbatim non-negotiable safety copy including 1930 and cybercrime.gov.in guidance.
- **Pattern Insight Card:**
  - Restyled using `surface-card`, semantic `warning` accents, and single-level elevation.
  - Added `data-testid="pattern-insight-card"` and clean structured list for "Don't send yet".
- **Input Adjusted Notices:**
  - Standardized across `Results.tsx` and `Analyze.tsx` with `data-testid="input-adjusted-notice"`.
- **Verification:**
  - Vitest test suites passed (33 client tests including contrast test assertions).
  - Screenshots captured across 1440px and 375px into `/docs/ui-shots/after/batch-2/`.


