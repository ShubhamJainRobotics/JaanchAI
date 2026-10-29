# JAANCH Structural UI/UX Redesign (Round 2) — Audit & Plan

## 1. Pre-Flight Baseline Results

- **Git Branch:** `ui-redesign` (verified clean working tree, not on `main`)
- **Lint Check:** PASSED (`check:no-secrets`, `check:banned-phrases`, `check:no-hardcoded-colors`, `typecheck`)
- **Typecheck:** PASSED across all workspaces (`shared`, `server`, `client`)
- **Unit & Integration Tests:** PASSED
  - Shared: 17 test files, 267 tests passed
  - Server: 5 test files, 38 tests passed
  - Client: 6 test files, 33 tests passed
  - **Total:** 329 tests passed
- **Offline Eval Regression Harness:** PASSED (25/25 corpus test cases passed: 100% precision & recall)
- **Data Flow Verification:** Completed and documented in [`/docs/privacy-copy-check.md`](./privacy-copy-check.md).

---

## 2. Round 2 UI Audit & Layout Problems Identified

### 2.1 Landing Page (`/`)
- **Hero:** Contains problem statement eyebrow pill ("Digital Trust & Safety — Problem Statement: 'Fake or Real'") that clutters the core student value proposition.
- **H1:** Long heading wraps unevenly on mobile; can leave solitary words on the last line at certain narrow viewports.
- **Missing Direct Action:** The landing page currently only has CTA buttons linking to `/analyze`, forcing anxious students to navigate to a new page before pasting anything.
- **Icon Tile Inconsistency:** The four feature cards have mixed icon backgrounds (two cards without tinted background, two with tinted background).
- **Illustrative Example:** Currently uses custom markup rather than reusing real results components, and lacks the full compact hierarchy.

### 2.2 Global Navigation & Layout
- **Mobile Navigation:** On `< 768px`, navigation links either crowd or collapse into an incomplete mobile header. An accessible drawer with focus trapping and Esc key support is needed.
- **Header Aesthetics:** Need solid background with subtle bottom border rather than blur/glass.
- **Footer:** Requires consistent landmark structure with clear standing disclaimer and national cyber fraud helpline (1930 / cybercrime.gov.in).

### 2.3 Analyze Page (`/analyze`)
- **Visual Clutter & Cognitive Load:** The page presents multiple configuration options, sender details, email headers, and privacy toggles at once, overwhelming students in a hurry.
- **Progressive Disclosure:** Sender details, organization matching, and privacy options should be organized into collapsed disclosures with clear summary badges.
- **Mobile Sticky CTA:** Must ensure sticky bottom bar accounts for mobile keyboard/focus scroll-into-view and doesn't overlap inputs.
- **Real-Time Progress:** Submission progress should show determinate-feeling progress states with `aria-live="polite"` and skeleton placeholders.

### 2.4 Results Page (`/results/:id`)
- **Mobile Above-the-Fold Contract (375×667):** Stressed students must see the status banner, payment alert, coverage meter, why this status, and a primary action ("See what to do next") without scrolling.
- **Desktop Two-Column Layout (≥ 1024px):** Main column for narrative (why, next steps, signals, evidence) with a sticky right sidebar for status chip, coverage meter, export actions, and "On this page" in-page jump list.
- **Evidence Noise:** Multiple cards within cards create visual fatigue. Needs flattened rows with dividers and progressive drill-downs.

---

## 3. Migration Roadmap (Round 2 Batches)

1. **Batch 1: Carry-Over Fixes & Global Shell**
   - Create unified `IconTile` component with tokens.
   - Restyle `Navbar` with solid background, active-route indicator, and `MobileNavDrawer` (focus trap, Esc key, scroll lock, links ≥ 44px).
   - Ensure skip link and landmarks `header/nav/main/footer`.
   - Update `Footer` with standing disclaimer and 1930 helpline.
   - Grep and eliminate any residual color utilities.

2. **Batch 2: Landing Page Restructure**
   - Move eyebrow pill to About page.
   - Refactor Hero with balanced fluid H1 (`clamp`, `text-wrap: balance`).
   - Implement `HeroAnalyzer` inline card with offer-type selector, min 20 char validation, prefilling to `/analyze` via `sessionStorage` (cleared on read), and verified privacy copy.
   - Implement `SampleReportPreview` static card using real results tokens and components, labelled "Example — fictional offer".
   - Implement `HowItWorks` (4 steps), `BenefitCard` (using `IconTile`), `LimitsStrip` ("What Jaanch can't do"), and closing CTA band.

3. **Batch 3: Analyze Page Streamlining**
   - Refactor to clean single-column `max-w-2xl` layout.
   - Step 1: Input method tabs + textarea with character count.
   - Step 2: `OfferTypeSelect` matching Hero.
   - Step 3: Collapsed disclosure "Add details for stronger checks (optional)" with summary count badge.
   - Step 4: Collapsed disclosure "Privacy options" with live summary line.
   - Step 5: Primary CTA with mobile sticky bar and keyboard-safe padding.
   - Progress list with `aria-live="polite"` and skeleton feedback.

4. **Batch 4: Results Page Hierarchy & Layout**
   - Implement 375×667 above-the-fold contract: Status banner → Payment alert → Meter → Why this status (first 2-3 bullets) → "See what to do next" CTA + More menu.
   - Implement 2-column desktop layout (≥ 1024px) with sticky right sidebar (`ResultsSidebar`) and active "On this page" scroll spy.
   - Sticky section chips under nav on mobile.
   - Flatten Signals into divider-separated rows (`SignalRow`) with severity icon, quote, and expandable "Why it matters".
   - Collapsible Evidence report summary on mobile.
   - High-risk variant with "Stop and protect yourself" block, prominent Report panel, hidden Safe Reply.

5. **Batch 5: Other Pages & Microcopy Pass**
   - History: table on desktop, cards on mobile, filter chips, delete confirmation dialog.
   - LinkCheck: single clean card.
   - Resources: accordion by offer type, 8 student safety rules.
   - About: "Fake or Real" statement, how Jaanch decides, honest limits, planned metrics disclaimer, team QuadCore.
   - Login / Signup / Settings: centered card, password toggle, error summary.
   - Microcopy: plain language (grade 8), active voice, no jargon or alarmist words.

6. **Batch 6: Polish, Accessibility & Enforcement**
   - Automated color check (`npm run check:no-hardcoded-colors`).
   - Structural acceptance tests across all viewports (`scripts/test-acceptance.mjs`).
   - Capture before/after screenshots at 375×667, 390×844, 768×1024, 1280×800, 1440×900 in `/docs/ui-shots/r2-after/final/`.
   - Final Quality Gate report against §10 criteria.

---

## 4. Final Quality Gate Summary

- **Structural Acceptance Tests (8/8):** ALL PASSED
  1. Landing structure (single h1, hero analyzer, sample preview inert & labelled fictional, 4 identical icon tiles): **PASS**
  2. H1 balanced text wrap without orphan words at 320–1440px: **PASS**
  3. Mobile nav drawer (dialog semantics, focus trap, Esc close, links ≥ 44px): **PASS**
  4. Analyze progressive disclosure (collapsed disclosures with live summaries, safe sticky bar): **PASS**
  5. Results 375×667 above-the-fold contract: **PASS**
  6. Desktop 1280×800 two-column layout with sticky sidebar and jump nav: **PASS**
  7. High-risk safety controls (Safe Reply hidden, Stop and protect block prominent): **PASS**
  8. Zero horizontal scroll across all viewports 320–1440px: **PASS**
- **Lint & Security:** PASSED (`check:no-secrets`, `check:banned-phrases`, `check:no-hardcoded-colors`, `typecheck`)
- **Unit & Integration Tests:** 338/338 PASSED across all packages
- **Offline Corpus Evaluation:** 25/25 fixtures PASSED (100% precision & recall)
- **Token Color Violations:** 0 hard-coded hex/rgb outside `tokens.css`
- **Screenshots:** 250+ responsive before/after captures across all 6 batches in `/docs/ui-shots/`
