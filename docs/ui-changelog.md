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

---

## Batch 3: Evidence Components
- **CheckRow & Outcome Chips:**
  - Standardized outcome chips (`pass`, `fail`, `unknown`, `none_found`, `not_run`, `user_attested`) using designated outcome tokens.
  - Ensured `none_found` uses neutral grey (`bg-outcome-none-found-bg`, `text-outcome-none-found-fg`), never green.
  - Every chip renders vector icon + text label.
  - Added `data-testid="check-row"`.
- **SignalCard & Severity Badges:**
  - Severity tokens mapped for `critical`, `high`, `medium`, `low`, and `info`.
  - Icon + text pairing enforced for all severity badges (`AlertOctagon`, `AlertTriangle`, `AlertCircle`, `Info`, `HelpCircle`).
  - Added `data-testid="signal-card"`, formatted quote display with `overflow-wrap: anywhere break-words`.
- **SignalList:**
  - Categorized signal grouping with semantic headers and clean empty state.
  - Added `data-testid="signals-section"`.
- **LinkInspectorCard:**
  - Restyled with semantic tokens, risk badge with icon + text label, accessible touch targets for RDAP live check.
- **EvidenceReport:**
  - Clean `surface-card` styling with progressive disclosure drill-downs (`aria-expanded` and keyboard navigation).
  - Grouped not-run inline input form fields with semantic buttons and accessible touch targets.
- **Verification:**
  - All 33 client tests, 38 server tests, and 267 shared tests passed.
  - Screenshots captured across 1440px and 375px into `/docs/ui-shots/after/batch-3/`.

---

## Batch 4: Next Steps Panel
- **NextStepsPanel Restyle:**
  - Consolidated 3-part layout (Part 1: Jaanch Already Checked; Part 2: Your Turn / Protect Yourself; Part 3: Standing Student Protection Rules).
  - Added `data-testid="next-steps-panel"`.
- **AlreadyCheckedList & AlreadyCheckedRow:**
  - Added `data-testid="already-checked-list"` and `data-testid="already-checked-row"`.
  - Mapped outcome chips (`pass`, `fail`, `unknown`, `not_run`, `none_found`, `user_attested`) with icon + text label.
  - Integrated actionable triggers with ≥ 44×44px hit containers and visible focus states.
- **YourTurnList & ProtectYourselfList:**
  - Added `data-testid="your-turn-list"` and `data-testid="protect-yourself-list"`.
  - Styled live progress meter with `tabular-nums` and accessible aria attributes.
  - Restyled `AlreadyPaidToggle` with `data-testid="already-paid-toggle"`.
- **NextStepCard:**
  - Added `data-testid="next-step-card"`.
  - Accessible checkbox hit area (min 44×44px container), visible keyboard focus ring.
  - Sub-checks cleanly nested in `surface-card-raised` with user-attestation badge.
  - Action buttons with min 44px touch targets.
- **ProtectionBanner:**
  - Added `data-testid="protection-banner"`.
  - Restyled using calm warning/safety tokens while strictly preserving all text.
- **Verification:**
  - All 33 client tests, 38 server tests, and 267 shared tests passed.
  - Screenshots captured across 1440px and 375px into `/docs/ui-shots/after/batch-4/`.

---

## Batch 5: Analyze Page, Forms & Mobile CTA
- **Analyze Page Layout & Top Error Summary:**
  - Added top error summary alert box (`role="alert"`) linking directly to the input field `#input-message-text` with keyboard focus management.
  - Replaced hardcoded borders, shadows, and text colors with design tokens (`surface`, `border`, `foreground`, `muted-foreground`, `shadow-elevation-1`).
  - Added **sticky bottom CTA bar on mobile** (`sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-sm border-t border-border z-30 shadow-elevation-2`) with min 48px height for thumb-friendly mobile submission.
  - Added bottom padding on mobile layout (`pb-28 sm:pb-12`) to prevent content overlap.
- **Input Method Tabs (InputTabs.tsx):**
  - Full tablist semantics (`role="tablist"`, `aria-label`, `role="tab"`, `aria-selected`, `aria-controls`, `id`).
  - Arrow key navigation (Left/Right/Home/End) with automated focus switching.
  - Minimum 44px touch targets.
- **Upload Panels (ImageUploadPanel.tsx & PdfUploadPanel.tsx):**
  - Tabpanel semantics (`role="tabpanel"`, `aria-labelledby`).
  - Accessible dropzones with keyboard trigger support (Enter/Space).
  - OCR / PDF extraction progress bars with tokens and `aria-live="polite"` real-time status.
- **ExtractedTextEditor.tsx:**
  - Sample preset selector styled with tokens and min 38px height.
  - Clear text button with minimum 44×44px touch target.
  - Textarea with semantic token focus states (`focus-visible:ring-2 focus-visible:ring-ring`).
  - Font-mono character count with `tabular-nums`.
- **DetectedLinksList.tsx:**
  - Restyled container with tokens and `overflow-wrap: anywhere break-all` on URLs to prevent overflow.
  - Safety advisory banner with `warning` tokens.
- **Metadata Selectors (DomainSelect.tsx, ChannelSelect.tsx, ClaimedOrgInput.tsx):**
  - DomainSelect: Radiogroup semantics (`role="radiogroup"`, `role="radio"`, `aria-checked`), min 64px card buttons.
  - ChannelSelect & ClaimedOrgInput: Semantic token selects/inputs with min 44px touch heights.
- **SenderDetailsSection.tsx & OrganizationAutocomplete.tsx:**
  - Accordion trigger with min 52px hit area and `aria-expanded`.
  - Freemail live hint styled with calm warning tokens.
  - Autocomplete dropdown with min 44px keyboard-accessible options.
  - Token-styled email headers textarea and official listing cross-check tabs.
- **ConsentToggles.tsx & HeadersHelpDialog.tsx:**
  - Plain language consent explanations preserved with min 44px label targets.
  - Accessible modal dialog with backdrop blur, Esc key close listener, and min 44×44px close target.
- **Verification:**
  - All 33 client vitest tests passed.
  - Full workspace typecheck passed.
  - Production client build passed (Vite + TypeScript).
  - Screenshots captured across 1440px and 375px into `/docs/ui-shots/after/batch-5/`.

---

## Batch 6: Remaining Pages (Landing, History, LinkCheck, Resources, About, Privacy, Auth, Settings, NotFound)
- **Landing Page & Landing Components:**
  - Restyled `Hero.tsx`: Removed AI gradient texts and glow blobs; used clear semantic primary text and token cards for trust guarantees.
  - Restyled `FiveStepFlow.tsx`: Clean token cards with tabular numerals and min 44px icon containers.
  - Restyled `ExampleWalkthrough.tsx`: Clearly labelled fictional case with status token badges, no fake metrics, stroke 1.75 icons.
  - Restyled `LimitsCallout.tsx`: High-contrast warning tokens with honest scope presentation.
  - Restyled `Landing.tsx`: Replaced bottom gradient with clean token surface card; removed translateY hover jitter.
- **History Page (History.tsx):**
  - Mapped all 5 statuses in `getStatusBadge` to semantic status tokens (`status-verified`, `status-likely`, `status-review`, `status-high-risk`, `status-confirmed-scam`) with mandatory vector icon + text label pairings.
  - Filter dropdowns, pagination buttons, and delete actions upgraded to min 44×44px hit targets.
- **Link & Domain Inspector (LinkCheck.tsx):**
  - Token input and submit button with min 44px touch height.
  - Clear error states using status-high-risk tokens.
- **Resources & Guides (Resources.tsx):**
  - Verification policy section updated to map 5 status tokens with icon + text label pairings.
  - Replaced gradient banner with high-contrast calm card preserving 1930 and cybercrime.gov.in helpline guidance.
  - Domain playbook tabs and official portal cards upgraded with token borders, surfaces, and min 44px links.
- **About & Privacy (About.tsx, Privacy.tsx):**
  - Clean readable typography using token variables (`surface`, `border`, `foreground`, `muted-foreground`).
  - Scope callouts and limitations styled with calm warning tokens.
  - Zero hardcoded colors.
- **Authentication & Settings (Login.tsx, Signup.tsx, Settings.tsx):**
  - Converted third-party Google SVG brand colors to CSS variables in `tokens.css` (`--color-brand-google-blue`, etc.), achieving 0 hardcoded `#hex` colors in all components.
  - Restyled tabs, form inputs, toggle buttons, and modal dialogs with design tokens.
  - Added min 44×44px hit areas on show/hide password buttons, submit actions, and navigation links.
- **NotFound (NotFound.tsx):**
  - Restyled 404 illustration container and return home button with tokens and min 44px height.
- **Verification:**
  - Automated scan confirmed 0 hardcoded `#hex` colors in all `client/src` components.
  - Client vitest suite passed (33 tests).
  - Workspace typecheck passed.
  - Production client build passed (Vite + TypeScript).
  - Screenshots captured across 1440px and 375px into `/docs/ui-shots/after/batch-6/`.

---

## Batch 7: System States & Accessible Dialogs
- **Loading Skeleton (PageSkeleton.tsx):**
  - Upgraded pulsing skeleton to use token variables (`bg-surface-raised border border-border rounded-md`).
  - Added accessibility attributes (`role="status"`, `aria-busy="true"`, screen-reader-only announcement).
- **ErrorBoundary (ErrorBoundary.tsx):**
  - Restyled fallback card using `status-high-risk` border/icon tokens and `surface` card styling.
  - Added min 44px reload button with visible focus ring.
- **Confirmation Dialog (ConfirmDialog.tsx):**
  - Esc key close handler with body scroll lock management.
  - Focus trapping and accessible dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
  - Min 44px touch targets for Cancel and Confirm buttons.
- **Export Report Dialog (ExportReportDialog.tsx):**
  - Restyled using design tokens, Esc key handler, and backdrop blur.
  - Download and fallback Print buttons upgraded with min 44px hit heights.
  - Token-styled status announcements with `aria-live="polite"`.
- **Scam Report Dialog (ReportEntityDialog.tsx):**
  - Added Esc key close listener with clean scroll lock teardown.
  - Form selects, text inputs, and submit button upgraded to min 44px touch targets.
- **Feedback Widget (FeedbackWidget.tsx):**
  - Restyled with `surface`, `border-border`, and `status-verified` tokens on submission.
  - Min 44px touch targets for Yes/No feedback thumbs.
- **Student Safety Rules (StudentSafetyRules.tsx):**
  - Restyled container and principle rows using `surface-raised` and `border-border` tokens.
  - Min 44px hit area for cybercrime.gov.in official link.
- **Verification:**
  - All 33 client vitest tests passed.
  - Full workspace typecheck passed.
  - Production client build passed (Vite + TypeScript).
  - Screenshots captured across 1440px and 375px into `/docs/ui-shots/after/batch-7/`.

---

## Batch 8: Cleanup & Automated Token Enforcement
- **Automated Color Enforcement Script:**
  - Implemented `scripts/check-no-hardcoded-colors.mjs` which validates all `client/src/**/*.tsx` and `client/src/**/*.ts` files.
  - Forbids literal `#hex` colors, `rgb()`, `rgba()`, and arbitrary Tailwind color utilities (e.g. `bg-[#...]`).
  - Added `"check:no-hardcoded-colors"` to `package.json` scripts and integrated it directly into `npm run lint`.
- **Stylesheet Token Unification:**
  - Replaced legacy print CSS hex codes in `client/src/styles/index.css` with semantic CSS variables (`var(--color-foreground)`, `var(--color-border)`, `var(--color-muted-foreground)`).
  - Production CSS bundle size reduced from 67.67 kB to 58.80 kB (gzip 10.65 kB), removing unused arbitrary color utilities.
---

## Round 2 — Batch 2: Landing Page Restructure
- **Hero & Fluid Balanced Typography:**
  - Removed problem statement eyebrow pill from Hero and relocated to About page.
  - Fluid H1 with `[text-wrap:balance]` and fluid clamp scaling (`clamp(1.875rem,4vw,3.25rem)`).
  - Ensured no orphan words on narrow viewports by grouping the last words (`Private&nbsp;Data`).
- **HeroAnalyzer Component:**
  - Interactive inline analyzer card in left column with labelled textarea, offer type segmented control (`OfferTypeSelect`), min 20 character validation, and quiet alternative routes.
  - Seamless navigation to `/analyze` with input prefilled via `sessionStorage` and router state (never in URL), auto-cleared on read.
  - Accurate privacy claim under the analyzer card.
- **SampleReportPreview Component:**
  - Compact static preview card in right column labelled *"Example — fictional offer"*.
  - Strict adherence to `AnalysisResult` schema in `client/src/content/sampleReport.ts`.
  - Non-interactive (`aria-label="Example report preview"`), unfocusable, never displaying numeric risk %.
  - Shows compact High Risk status banner, payment alert warning, 2 evidence rows with quotes, 2 next steps, and "2 of 8 checks" progress meter.
- **Section Progression & Accessibility:**
  - `HowItWorks`: 4-step horizontal (desktop) / vertical (mobile) workflow.
  - `BenefitsGrid`: 4 plain-language student trust cards with unified `IconTile` component.
  - `LimitsStrip`: "What Jaanch can't do" honest scope callout.
  - `ClosingCta`: Clear call to action with primary & secondary buttons.
  - Single `h1`, proper heading hierarchy (h1 -> h2 -> h3).
- **Verification:**
  - `npm run lint` PASSED.
  - `npm run test -w client` PASSED.
  - 50 screenshots captured in `/docs/ui-shots/r2-after/batch-2/`.


---

# ROUND 2: STRUCTURAL UI/UX REDESIGN

## Pre-Flight & Baseline Verification
- Verified on branch `ui-redesign` with clean working tree.
- Ran full test baseline: `npm run lint` PASSED, `npm run test` PASSED (329 tests), `npm run eval -w shared` PASSED (25/25 corpus test cases).
- Verified data flow and created [`docs/privacy-copy-check.md`](./privacy-copy-check.md) proving browser-only OCR/PDF parsing and zero guest DB storage.
- Created [`docs/ui-plan-r2.md`](./ui-plan-r2.md) with layout audits across 375×667, 390×844, 768×1024, 1280×800, 1440×900.
- Captured 50 baseline before screenshots in `/docs/ui-shots/r2-before/`.

---

## Round 2 — Batch 1: Carry-Over Fixes & Global Shell
- **Unified IconTile Component:**
  - Created `client/src/components/common/IconTile.tsx` supporting standard variants (`primary`, `warning`, `verified`, `neutral`, `high-risk`) and sizes (`sm`, `md`, `lg`) using design tokens.
- **Top Navigation Bar:**
  - Replaced backdrop blur with solid background and bottom border (`bg-surface border-b border-border`).
  - Added active route visual indicators (`aria-current="page"` and `border-b-2 border-primary`).
  - Standardized nav link labels: *Check an offer · Link checker · Resources · About*.
  - Kept Devanagari mark "जाँच".
- **Accessible Mobile Navigation Drawer:**
  - Implemented `client/src/components/layout/MobileNavDrawer.tsx` with dialog semantics (`role="dialog"`, `aria-modal="true"`).
  - Focus trap inside drawer cycling focusable elements.
  - Esc key closes drawer and returns focus to menu button (`triggerRef`).
  - Body scroll lock during drawer presentation.
  - Links and actions all enforce `min-h-[44px]`.
- **Global Footer & Landmarks:**
  - Semantic landmark structure confirmed (`header`, `nav`, `main#main-content`, `footer`).
  - Skip link tested as first focusable element.
  - Standardized footer links: Resources, About, Privacy, Link checker.
  - Verbatim standing disclaimer and cybercrime helpline (1930 / cybercrime.gov.in) displayed cleanly.
- **Verification:**
  - `npm run lint` PASSED (0 hardcoded color violations).
  - `npm run test -w client` PASSED (33/33 tests).
  - Production client build passed (Vite + TypeScript).
  - 50 screenshots captured in `/docs/ui-shots/r2-after/batch-1/`.

---

## Round 2 — Batch 2: Landing Page Restructure
- **Hero & Fluid Balanced Typography:**
  - Removed problem statement eyebrow pill from Hero and relocated to About page.
  - Fluid H1 with `[text-wrap:balance]` and fluid clamp scaling (`clamp(1.875rem,4vw,3.25rem)`).
  - Ensured no orphan words on narrow viewports by grouping the last words (`Private&nbsp;Data`).
- **HeroAnalyzer Component:**
  - Interactive inline analyzer card in left column with labelled textarea, offer type segmented control (`OfferTypeSelect`), min 20 character validation, and quiet alternative routes.
  - Seamless navigation to `/analyze` with input prefilled via `sessionStorage` and router state (never in URL), auto-cleared on read.
  - Accurate privacy claim under the analyzer card.
- **SampleReportPreview Component:**
  - Compact static preview card in right column labelled *"Example — fictional offer"*.
  - Strict adherence to `AnalysisResult` schema in `client/src/content/sampleReport.ts`.
  - Non-interactive (`aria-label="Example report preview"`), unfocusable, never displaying numeric risk %.
  - Shows compact High Risk status banner, payment alert warning, 2 evidence rows with quotes, 2 next steps, and "2 of 8 checks" progress meter.
- **Section Progression & Accessibility:**
  - `HowItWorks`: 4-step horizontal (desktop) / vertical (mobile) workflow.
  - `BenefitsGrid`: 4 plain-language student trust cards with unified `IconTile` component.
  - `LimitsStrip`: "What Jaanch can't do" honest scope callout.
  - `ClosingCta`: Clear call to action with primary & secondary buttons.
  - Single `h1`, proper heading hierarchy (h1 -> h2 -> h3).
- **Verification:**
  - `npm run lint` PASSED.
  - `npm run test -w client` PASSED.
  - 50 screenshots captured in `/docs/ui-shots/r2-after/batch-2/`.









