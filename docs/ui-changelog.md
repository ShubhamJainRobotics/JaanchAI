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

## Round 2 — Batch 3: Analyze Page Streamlining
- **Single-Column Focused Layout:**
  - Standardized container to `max-w-2xl` without distracting sidebars or duplicate text.
  - Clear header: *"Check an offer"* + one concise sentence of helper text.
- **Progressive Disclosure Flow:**
  - Step 1: Input method tabs (*Paste text · Screenshot · PDF*) with full `tablist` semantics and live character limits.
  - Step 2: Category & channel selection using unified `OfferTypeSelect` segmented chips.
  - Step 3: Collapsible disclosure *"Add details for stronger checks (optional)"* with live count badge (`n added`) and helper hint.
  - Step 4: Collapsible disclosure *"Privacy options"* with live closed summary line (*"AI context: off · Third-party checks: off · Saved to history: on"*).
- **Determinate Progress Feedback:**
  - Implemented `client/src/components/analyze/AnalysisProgress.tsx` with animated determinate progression list (*Reading message… Running rule checks… Looking up domain age… Building report*) and skeleton feedback with `aria-live="polite"`.
- **Keyboard-Safe Mobile Bottom Bar:**
  - Desktop submit button placed at the end of the form.
  - Mobile sticky bottom action bar (`fixed bottom-0`) with safe-area spacing and `pb-28 sm:pb-12` container offset ensuring inputs are never covered.
- **Verification:**
---

## Round 2 — Batch 4: Results Page Hierarchy & Layout
- **Mobile Above-The-Fold Contract (375×667 Viewport):**
  - Guaranteed visual order: Status banner -> Payment alert (if present) -> Independent-checks meter -> "Why this status" (first 2-3 bullets) -> Primary action button *"See what to do next"* (anchored to `#next-steps-section`) and *"More"* export buttons.
  - Tested to fit within the initial 667px vertical viewport with zero scrolling required to see the primary status and next step CTA.
- **Two-Column Desktop Architecture (≥ 1024px):**
  - Left column (8 cols): Why this status -> Pattern insight -> Next steps (`#next-steps-section`) -> Signals (`#signals-section`) -> Evidence report (`#evidence-section`) -> Details (`#details-section`).
  - Right column (4 cols): Sticky sidebar (`ResultsSidebar`) featuring compact status chip, coverage meter, export actions, and "On this page" scroll-spy jump list.
- **Mobile Sticky Section Chips:**
  - Implemented `SectionJumpNav.tsx` providing horizontally scrollable sticky navigation chips (*Next steps · Signals · Evidence · Details*) directly below the nav on mobile.
- **High-Risk Variant & Safety Controls:**
  - Integrated `StopAndProtectBlock.tsx` prominently at the top of High Risk / Confirmed Scam results.
  - Safe Reply panel automatically hidden for high-risk offers; 1930 and cybercrime.gov.in links given primary prominence.
- **Simplified Evidence & Signals Blocks:**
  - Flattened `SignalCard` into divider-separated rows with collapsible *"Why it matters"* drill-downs, avoiding boxes-inside-boxes.
  - Added responsive collapse on `EvidenceReport` with live summary line (*"8 checks · 2 failed · 2 passed · 4 not run"*).
  - Eliminated all residual hard-coded colors in `Results.tsx`.
- **Verification:**
  - `npm run lint` PASSED (0 hardcoded color violations).
  - `npm run test -w client` PASSED.
  - 50 screenshots captured in `/docs/ui-shots/r2-after/batch-4/`.

---

## Round 2 — Batch 5: Secondary Pages & Microcopy Pass
- **History Page (`client/src/pages/History.tsx`):**
  - Implemented responsive table layout on desktop/tablet (≥ 768px) with columns: Status, Category/Org, Summary, Date, and Actions.
  - Maintained touch-friendly card layout on mobile (< 768px).
  - Replaced `<select>` dropdowns with interactive filter chips for Status and Category with active state indicators (`bg-primary text-primary-foreground` vs `bg-surface-raised border-border`).
  - Integrated `ConfirmDialog` with focus trap, Tab cycling, and Esc key support for individual item deletions and "Clear All History".
  - Clean empty state with CTA button linking directly to `/analyze`.
- **Link & Domain Inspector (`client/src/pages/LinkCheck.tsx`):**
  - Streamlined into a single clean input card with educational domain age, lookalike protection, and zero-visit privacy callouts.
  - Updated `LinkInspectorCard.tsx` with plain-language labels (*"Official Domain Registry (RDAP)"*) and defensive `riskLevel` fallback.
- **Resources Page (`client/src/pages/Resources.tsx`):**
  - Converted category verification guides into an interactive accordion by offer type (*Internship, Scholarship, Job, Freelance, Competition, Website*).
  - Added direct official-portal buttons linking directly to verified authorities (AICTE, MCA21, NSP, Cybercrime portal).
  - Rendered full eight student safety rules via `<StudentSafetyRules />`.
- **About Page (`client/src/pages/About.tsx`):**
  - Problem statement pill (*"Built for the 'Fake or Real' (Digital Trust & Safety) problem statement"*).
  - Dedicated section on how Jaanch decides (5 statuses and required evidence using `STATUS_COPY`).
  - Honest limitations and planned evaluation metrics disclaimer: *"No measured results are claimed yet. These are planned metrics."*
  - Team QuadCore mention.
- **Auth & Settings Pages (`Login.tsx`, `Signup.tsx`, `Settings.tsx`):**
  - Centered cards, password visibility toggles, clear labels, error summaries, Google buttons using CSS variable tokens (`var(--color-brand-google-*)`), and privacy policy links.
- **Accessibility & Focus Trapping (`ConfirmDialog.tsx`):**
  - Enhanced dialog with full keyboard focus trapping, initial button focus, Tab cycling, Esc key close, and focus restoration to the triggering element.
- **Microcopy Pass (§8):**
  - Plain language (grade 8 readability), active voice, no unexplained technical jargon, zero alarmist fear words.
- **Verification:**
  - `npm run lint` PASSED.
  - 50 screenshots captured in `/docs/ui-shots/r2-after/batch-5/`.

---

## Round 3 — UI Restyle: Hero Recomposition & Electric Indigo Palette

### Overview
Round 3 delivered an airy, centered, high-contrast hero composition, migrated brand accents to a vivid **Electric Indigo** palette (`#5B3DF5`), eradicated monospace font leakage from UI labels, and brought the primary "Analyze offer" action completely above the fold on all standard viewports.

---

### Batch 1: Palette Tokens & Contrast Tests (§4 & §7)
- **Token Redefinition (`client/src/styles/tokens.css`):**
  - Light theme:
    - `--color-primary`: `#5B3DF5` (hover `#4B2FE0`, pressed `#3F26C4`, foreground `#FFFFFF`, tint `#F1EEFF`, tint-border `#D9D2FF`)
    - `--color-background`: `#FAFAFF`, `--color-surface`: `#FFFFFF`, `--color-surface-raised`: `#FFFFFF`
    - `--color-foreground`: `#12102B`, `--color-muted-foreground`: `#5B5878`, `--color-border`: `#E3DFF7`
    - `--color-ring`: `#8F7BFF`, `--color-highlight`: `#FFD43B`
    - `--color-gradient-accent-from`: `#5B3DF5`, `--color-gradient-accent-to`: `#8B5CF6`
  - Dark theme:
    - `--color-background`: `#0F0D24`, `--color-surface`: `#17143A`, `--color-surface-raised`: `#201C4D`
    - `--color-foreground`: `#F3F1FF`, `--color-muted-foreground`: `#B9B4DE`, `--color-border`: `#2D2960`
    - `--color-primary`: `#8F7BFF` (hover `#A594FF`, pressed `#7C66FF`, foreground `#0F0D24`, tint `#2A2570`, tint-border `#3D368A`)
    - `--color-ring`: `#B7A8FF`, `--color-highlight`: `#FFD43B`
  - Status, outcome, and severity tokens remained strictly isolated and intact.
- **Tailwind Mapping (`client/tailwind.config.ts`):**
  - Extended theme with `highlight`, `primary.tint`, `primary['tint-border']`, `primary.pressed`, `gradient-accent-from`, `gradient-accent-to`.
- **Contrast & Hue Separation Unit Tests (`client/src/__tests__/tokensContrast.test.ts`):**
  - Light mode body contrast `#12102B` on `#FAFAFF` = 17.0:1 (WCAG AA ≥ 4.5:1 passed).
  - Light mode primary button `#FFFFFF` on `#5B3DF5` = 6.10:1 (WCAG AA ≥ 4.5:1 passed).
  - Dark mode body contrast `#F3F1FF` on `#0F0D24` = 15.9:1 (WCAG AA ≥ 4.5:1 passed).
  - Focus ring contrast ≥ 3:1 in both themes.
  - Added Hue Decoupling Test: Brand primary (`#5B3DF5`, hue ≈ 250°) maintains minimum 30° hue distance from all five status colors (verified emerald: 87°, likely genuine teal: 61°, needs review amber: 136°, high risk red: 110°, confirmed scam rose: 93°).
  - Highlight `#FFD43B` contrast against dark text = 11.77:1 (≥ 4.5:1 passed).
- **Design System Overrides:** Documented Round 3 palette overrides in `design-system/jaanch/MASTER.md`.
- **Screenshots:** 24 screenshots saved in `/docs/ui-shots/r3-after/batch-1/`.

---

### Batch 2: Global Polish & Monospace Cleanup (§5.6 & §6)
- **Monospace Leakage Containment:**
  - Audited all occurrences of `font-mono` across `client/src`.
  - Removed `font-mono` from UI labels, character counter helper text ("WhatsApp / Telegram / Email"), section headers, timestamps, badges, and fictional example labels across `ClaimedOrgInput`, `ConsentToggles`, `DetectedLinksList`, `ExtractedTextEditor`, `ImageUploadPanel`, `OrganizationAutocomplete`, `PdfUploadPanel`, `ExampleWalkthrough`, `FiveStepFlow`, `HeroAnalyzer`, `HowItWorks`, `SampleReportPreview`, `ChallengeEmailPanel`, `CheckRow`, `CompletenessCard`, `EvidenceReport`, `ExportReportDialog`, `LinkInspectorCard`, `ReportedRecordsCard`, `ResultsSidebar`, `RiskBanner`, `StatusBanner`, `StudentSafetyRules`, `Analyze`, `History`, `Login`, `Resources`, `Results`, `Settings`, `Signup`.
  - Retained `font-mono` exclusively in quoted scam message text, raw OCR text inputs, code tokens, rule IDs (`PAY-001`), and URLs.
  - Added automated test in `tokensContrast.test.ts` prohibiting `font-mono` on headings, buttons, and UI labels.
- **Button & UI Polish:**
  - Standardized solid primary button states with `hover:bg-primary-hover active:bg-primary-pressed shadow-xs`.
  - Updated logo tile with Hindi "जाँच" badge in `bg-primary-tint text-primary border-primary-tint-border`.
  - Updated selected chip states in `DomainSelect` to `bg-primary-tint text-primary border-primary font-bold`.
- **Screenshots:** 24 screenshots saved in `/docs/ui-shots/r3-after/batch-2/`.

---

### Batch 3: Landing Page Recomposition (§5)
- **Single-Column Centered Hero (`client/src/components/landing/Hero.tsx`):**
  - Recomposed layout into a single-column, centered architecture (`max-w-3xl` content, `max-w-6xl` section).
  - Fluid H1: First clause `foreground`, second clause gradient accent (`from-gradient-accent-from to-gradient-accent-to`), with warm highlight underline marker behind *"Before You Pay"* using `bg-highlight` (`#FFD43B`). Balanced with `[text-wrap:balance]`.
  - Sub-copy shortened to ≤ 2 lines at desktop.
  - Static CSS-only ambient backdrop decoration: two soft radial tints of `primary-tint` (≤ 12% opacity) + faint token-driven dot grid, hidden under `forced-colors` and print.
- **Centered Inline Analyzer Card (`client/src/components/landing/HeroAnalyzer.tsx`):**
  - Placed directly centered under sub-copy in `max-w-2xl mx-auto`.
  - Labelled textarea (3 rows), character counter in standard sans `tabular-nums`.
  - Single-row offer-type selector (`OfferTypeSelect.tsx`): 7 chips in a single horizontal row at ≥ 640px without awkward wrapping; smooth horizontal scroll-snap on mobile. Selected state: `bg-primary-tint text-primary border-primary font-bold` with `Check` icon.
  - Prominent "Analyze offer →" button in `bg-primary hover:bg-primary-hover active:bg-primary-pressed text-primary-foreground`.
  - Quiet secondary links: *Upload a screenshot or PDF*, *Inspect a link*.
  - Truthful privacy guarantee: *"Analysis runs in your browser. Pasted text is never stored for guests."*
- **Trust Row:** 3 verified truth pills under card (*100% Free & Open Source*, *Private · Zero tracking for guests*, *Deterministic 8-point rule engine*).
- **"See what a report looks like" & "How it works" (`HowItWorks.tsx`):**
  - Moved below hero into a dedicated section with 2 columns on desktop (≥ 1024px), stacked on mobile.
  - Left column: 4-step verification flow with `IconTile`.
  - Right column: Simplified `SampleReportPreview`:
    - Neutral card borders (`border-border`)
    - 1 red status banner ("High Risk" on Apex Systems Labs)
    - 1 neutral "Do not pay" line (neutral background, eliminating competing stacked red boxes)
    - 1 evidence row with monospace quote
    - 1 next step
    - "2 of 8 independent checks completed" meter
    - Fictional example label, fully inert (0 focusable buttons)
- **Benefits Grid & Closing CTA:**
  - Added subtle motion-safe hover lift to benefits cards.
  - Recomposed closing CTA into a full-width high-contrast `bg-primary text-primary-foreground` band with high-contrast white button.
- **Screenshots:** 24 screenshots saved in `/docs/ui-shots/r3-after/batch-3/`.

---

### Batch 4: Verification, Quality Gates & Acceptance (§8 & §9)
- **Quality Gates Verification:**
  - `npm run lint` PASSED (0 hardcoded color literals, 0 banned phrases, 0 secret leaks, typecheck passed).
  - `npm run test` PASSED (342/342 tests passed across shared: 267, server: 38, client: 37).
  - `npm run eval -w shared` PASSED (25/25 corpus test cases passed: 100% precision & recall).
  - Automated Acceptance Suite (`scripts/test-acceptance.mjs`) PASSED all 10 criteria via Chrome CDP against preview server:
    - Landing structure: PASS
    - Landing Above-The-Fold (1440×900: 682px <= 900px, 1366×768: 682px <= 768px): PASS
    - Offer-type chips single-row layout (`tops: [561, 561, 561, 561, 561, 561, 561]`): PASS
    - H1 balanced text wrap without orphans: PASS
    - Mobile nav drawer: PASS
    - Analyze progressive disclosures: PASS
    - Results 375×667 above-the-fold contract: PASS
    - Desktop 1280×800 sticky sidebar: PASS
    - High-risk safety controls: PASS
    - Zero horizontal scroll across all viewports (320-1440px): PASS
- **Final Screenshots:** 24 screenshots captured in `/docs/ui-shots/r3-after/final/`.






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

---

## Round 2 — Batch 3: Analyze Page Streamlining
- **Single-Column Focused Layout:**
  - Standardized container to `max-w-2xl` without distracting sidebars or duplicate text.
  - Clear header: *"Check an offer"* + one concise sentence of helper text.
- **Progressive Disclosure Flow:**
  - Step 1: Input method tabs (*Paste text · Screenshot · PDF*) with full `tablist` semantics and live character limits.
  - Step 2: Category & channel selection using unified `OfferTypeSelect` segmented chips.
  - Step 3: Collapsible disclosure *"Add details for stronger checks (optional)"* with live count badge (`n added`) and helper hint.
  - Step 4: Collapsible disclosure *"Privacy options"* with live closed summary line (*"AI context: off · Third-party checks: off · Saved to history: on"*).
- **Determinate Progress Feedback:**
  - Implemented `client/src/components/analyze/AnalysisProgress.tsx` with animated determinate progression list (*Reading message… Running rule checks… Looking up domain age… Building report*) and skeleton feedback with `aria-live="polite"`.
- **Keyboard-Safe Mobile Bottom Bar:**
  - Desktop submit button placed at the end of the form.
  - Mobile sticky bottom action bar (`fixed bottom-0`) with safe-area spacing and `pb-28 sm:pb-12` container offset ensuring inputs are never covered.
- **Verification:**
---

## Round 2 — Batch 4: Results Page Hierarchy & Layout
- **Mobile Above-The-Fold Contract (375×667 Viewport):**
  - Guaranteed visual order: Status banner -> Payment alert (if present) -> Independent-checks meter -> "Why this status" (first 2-3 bullets) -> Primary action button *"See what to do next"* (anchored to `#next-steps-section`) and *"More"* export buttons.
  - Tested to fit within the initial 667px vertical viewport with zero scrolling required to see the primary status and next step CTA.
- **Two-Column Desktop Architecture (≥ 1024px):**
  - Left column (8 cols): Why this status -> Pattern insight -> Next steps (`#next-steps-section`) -> Signals (`#signals-section`) -> Evidence report (`#evidence-section`) -> Details (`#details-section`).
  - Right column (4 cols): Sticky sidebar (`ResultsSidebar`) featuring compact status chip, coverage meter, export actions, and "On this page" scroll-spy jump list.
- **Mobile Sticky Section Chips:**
  - Implemented `SectionJumpNav.tsx` providing horizontally scrollable sticky navigation chips (*Next steps · Signals · Evidence · Details*) directly below the nav on mobile.
- **High-Risk Variant & Safety Controls:**
  - Integrated `StopAndProtectBlock.tsx` prominently at the top of High Risk / Confirmed Scam results.
  - Safe Reply panel automatically hidden for high-risk offers; 1930 and cybercrime.gov.in links given primary prominence.
- **Simplified Evidence & Signals Blocks:**
  - Flattened `SignalCard` into divider-separated rows with collapsible *"Why it matters"* drill-downs, avoiding boxes-inside-boxes.
  - Added responsive collapse on `EvidenceReport` with live summary line (*"8 checks · 2 failed · 2 passed · 4 not run"*).
  - Eliminated all residual hard-coded colors in `Results.tsx`.
- **Verification:**
  - `npm run lint` PASSED (0 hardcoded color violations).
  - `npm run test -w client` PASSED.
  - 50 screenshots captured in `/docs/ui-shots/r2-after/batch-4/`.

---

## Round 2 — Batch 5: Secondary Pages & Microcopy Pass
- **History Page (`client/src/pages/History.tsx`):**
  - Implemented responsive table layout on desktop/tablet (≥ 768px) with columns: Status, Category/Org, Summary, Date, and Actions.
  - Maintained touch-friendly card layout on mobile (< 768px).
  - Replaced `<select>` dropdowns with interactive filter chips for Status and Category with active state indicators (`bg-primary text-primary-foreground` vs `bg-surface-raised border-border`).
  - Integrated `ConfirmDialog` with focus trap, Tab cycling, and Esc key support for individual item deletions and "Clear All History".
  - Clean empty state with CTA button linking directly to `/analyze`.
- **Link & Domain Inspector (`client/src/pages/LinkCheck.tsx`):**
  - Streamlined into a single clean input card with educational domain age, lookalike protection, and zero-visit privacy callouts.
  - Updated `LinkInspectorCard.tsx` with plain-language labels (*"Official Domain Registry (RDAP)"*) and defensive `riskLevel` fallback.
- **Resources Page (`client/src/pages/Resources.tsx`):**
  - Converted category verification guides into an interactive accordion by offer type (*Internship, Scholarship, Job, Freelance, Competition, Website*).
  - Added direct official-portal buttons linking directly to verified authorities (AICTE, MCA21, NSP, Cybercrime portal).
  - Rendered full eight student safety rules via `<StudentSafetyRules />`.
- **About Page (`client/src/pages/About.tsx`):**
  - Problem statement pill (*"Built for the 'Fake or Real' (Digital Trust & Safety) problem statement"*).
  - Dedicated section on how Jaanch decides (5 statuses and required evidence using `STATUS_COPY`).
  - Honest limitations and planned evaluation metrics disclaimer: *"No measured results are claimed yet. These are planned metrics."*
  - Team QuadCore mention.
- **Auth & Settings Pages (`Login.tsx`, `Signup.tsx`, `Settings.tsx`):**
  - Centered cards, password visibility toggles, clear labels, error summaries, Google buttons using CSS variable tokens (`var(--color-brand-google-*)`), and privacy policy links.
- **Accessibility & Focus Trapping (`ConfirmDialog.tsx`):**
  - Enhanced dialog with full keyboard focus trapping, initial button focus, Tab cycling, Esc key close, and focus restoration to the triggering element.
- **Microcopy Pass (§8):**
  - Plain language (grade 8 readability), active voice, no unexplained technical jargon, zero alarmist fear words.
- **Verification:**
  - `npm run lint` PASSED.
  - 50 screenshots captured in `/docs/ui-shots/r2-after/batch-5/`.

---

## Round 3 — UI Restyle: Hero Recomposition & Electric Indigo Palette

### Overview
Round 3 delivered an airy, centered, high-contrast hero composition, migrated brand accents to a vivid **Electric Indigo** palette (`#5B3DF5`), eradicated monospace font leakage from UI labels, and brought the primary "Analyze offer" action completely above the fold on all standard viewports.

---

### Batch 1: Palette Tokens & Contrast Tests (§4 & §7)
- **Token Redefinition (`client/src/styles/tokens.css`):**
  - Light theme:
    - `--color-primary`: `#5B3DF5` (hover `#4B2FE0`, pressed `#3F26C4`, foreground `#FFFFFF`, tint `#F1EEFF`, tint-border `#D9D2FF`)
    - `--color-background`: `#FAFAFF`, `--color-surface`: `#FFFFFF`, `--color-surface-raised`: `#FFFFFF`
    - `--color-foreground`: `#12102B`, `--color-muted-foreground`: `#5B5878`, `--color-border`: `#E3DFF7`
    - `--color-ring`: `#8F7BFF`, `--color-highlight`: `#FFD43B`
    - `--color-gradient-accent-from`: `#5B3DF5`, `--color-gradient-accent-to`: `#8B5CF6`
  - Dark theme:
    - `--color-background`: `#0F0D24`, `--color-surface`: `#17143A`, `--color-surface-raised`: `#201C4D`
    - `--color-foreground`: `#F3F1FF`, `--color-muted-foreground`: `#B9B4DE`, `--color-border`: `#2D2960`
    - `--color-primary`: `#8F7BFF` (hover `#A594FF`, pressed `#7C66FF`, foreground `#0F0D24`, tint `#2A2570`, tint-border `#3D368A`)
    - `--color-ring`: `#B7A8FF`, `--color-highlight`: `#FFD43B`
  - Status, outcome, and severity tokens remained strictly isolated and intact.
- **Tailwind Mapping (`client/tailwind.config.ts`):**
  - Extended theme with `highlight`, `primary.tint`, `primary['tint-border']`, `primary.pressed`, `gradient-accent-from`, `gradient-accent-to`.
- **Contrast & Hue Separation Unit Tests (`client/src/__tests__/tokensContrast.test.ts`):**
  - Light mode body contrast `#12102B` on `#FAFAFF` = 17.0:1 (WCAG AA ≥ 4.5:1 passed).
  - Light mode primary button `#FFFFFF` on `#5B3DF5` = 6.10:1 (WCAG AA ≥ 4.5:1 passed).
  - Dark mode body contrast `#F3F1FF` on `#0F0D24` = 15.9:1 (WCAG AA ≥ 4.5:1 passed).
  - Focus ring contrast ≥ 3:1 in both themes.
  - Added Hue Decoupling Test: Brand primary (`#5B3DF5`, hue ≈ 250°) maintains minimum 30° hue distance from all five status colors (verified emerald: 87°, likely genuine teal: 61°, needs review amber: 136°, high risk red: 110°, confirmed scam rose: 93°).
  - Highlight `#FFD43B` contrast against dark text = 11.77:1 (≥ 4.5:1 passed).
- **Design System Overrides:** Documented Round 3 palette overrides in `design-system/jaanch/MASTER.md`.
- **Screenshots:** 24 screenshots saved in `/docs/ui-shots/r3-after/batch-1/`.

---

### Batch 2: Global Polish & Monospace Cleanup (§5.6 & §6)
- **Monospace Leakage Containment:**
  - Audited all occurrences of `font-mono` across `client/src`.
  - Removed `font-mono` from UI labels, character counter helper text ("WhatsApp / Telegram / Email"), section headers, timestamps, badges, and fictional example labels across `ClaimedOrgInput`, `ConsentToggles`, `DetectedLinksList`, `ExtractedTextEditor`, `ImageUploadPanel`, `OrganizationAutocomplete`, `PdfUploadPanel`, `ExampleWalkthrough`, `FiveStepFlow`, `HeroAnalyzer`, `HowItWorks`, `SampleReportPreview`, `ChallengeEmailPanel`, `CheckRow`, `CompletenessCard`, `EvidenceReport`, `ExportReportDialog`, `LinkInspectorCard`, `ReportedRecordsCard`, `ResultsSidebar`, `RiskBanner`, `StatusBanner`, `StudentSafetyRules`, `Analyze`, `History`, `Login`, `Resources`, `Results`, `Settings`, `Signup`.
  - Retained `font-mono` exclusively in quoted scam message text, raw OCR text inputs, code tokens, rule IDs (`PAY-001`), and URLs.
  - Added automated test in `tokensContrast.test.ts` prohibiting `font-mono` on headings, buttons, and UI labels.
- **Button & UI Polish:**
  - Standardized solid primary button states with `hover:bg-primary-hover active:bg-primary-pressed shadow-xs`.
  - Updated logo tile with Hindi "जाँच" badge in `bg-primary-tint text-primary border-primary-tint-border`.
  - Updated selected chip states in `DomainSelect` to `bg-primary-tint text-primary border-primary font-bold`.
- **Screenshots:** 24 screenshots saved in `/docs/ui-shots/r3-after/batch-2/`.

---

### Batch 3: Landing Page Recomposition (§5)
- **Single-Column Centered Hero (`client/src/components/landing/Hero.tsx`):**
  - Recomposed layout into a single-column, centered architecture (`max-w-3xl` content, `max-w-6xl` section).
  - Fluid H1: First clause `foreground`, second clause gradient accent (`from-gradient-accent-from to-gradient-accent-to`), with warm highlight underline marker behind *"Before You Pay"* using `bg-highlight` (`#FFD43B`). Balanced with `[text-wrap:balance]`.
  - Sub-copy shortened to ≤ 2 lines at desktop.
  - Static CSS-only ambient backdrop decoration: two soft radial tints of `primary-tint` (≤ 12% opacity) + faint token-driven dot grid, hidden under `forced-colors` and print.
- **Centered Inline Analyzer Card (`client/src/components/landing/HeroAnalyzer.tsx`):**
  - Placed directly centered under sub-copy in `max-w-2xl mx-auto`.
  - Labelled textarea (3 rows), character counter in standard sans `tabular-nums`.
  - Single-row offer-type selector (`OfferTypeSelect.tsx`): 7 chips in a single horizontal row at ≥ 640px without awkward wrapping; smooth horizontal scroll-snap on mobile. Selected state: `bg-primary-tint text-primary border-primary font-bold` with `Check` icon.
  - Prominent "Analyze offer →" button in `bg-primary hover:bg-primary-hover active:bg-primary-pressed text-primary-foreground`.
  - Quiet secondary links: *Upload a screenshot or PDF*, *Inspect a link*.
  - Truthful privacy guarantee: *"Analysis runs in your browser. Pasted text is never stored for guests."*
- **Trust Row:** 3 verified truth pills under card (*100% Free & Open Source*, *Private · Zero tracking for guests*, *Deterministic 8-point rule engine*).
- **"See what a report looks like" & "How it works" (`HowItWorks.tsx`):**
  - Moved below hero into a dedicated section with 2 columns on desktop (≥ 1024px), stacked on mobile.
  - Left column: 4-step verification flow with `IconTile`.
  - Right column: Simplified `SampleReportPreview`:
    - Neutral card borders (`border-border`)
    - 1 red status banner ("High Risk" on Apex Systems Labs)
    - 1 neutral "Do not pay" line (neutral background, eliminating competing stacked red boxes)
    - 1 evidence row with monospace quote
    - 1 next step
    - "2 of 8 independent checks completed" meter
    - Fictional example label, fully inert (0 focusable buttons)
- **Benefits Grid & Closing CTA:**
  - Added subtle motion-safe hover lift to benefits cards.
  - Recomposed closing CTA into a full-width high-contrast `bg-primary text-primary-foreground` band with high-contrast white button.
- **Screenshots:** 24 screenshots saved in `/docs/ui-shots/r3-after/batch-3/`.

---

### Batch 4: Verification, Quality Gates & Acceptance (§8 & §9)
- **Quality Gates Verification:**
  - `npm run lint` PASSED (0 hardcoded color literals, 0 banned phrases, 0 secret leaks, typecheck passed).
  - `npm run test` PASSED (342/342 tests passed across shared: 267, server: 38, client: 37).
  - `npm run eval -w shared` PASSED (25/25 corpus test cases passed: 100% precision & recall).
  - Automated Acceptance Suite (`scripts/test-acceptance.mjs`) PASSED all 10 criteria via Chrome CDP against preview server:
    - Landing structure: PASS
    - Landing Above-The-Fold (1440×900: 682px <= 900px, 1366×768: 682px <= 768px): PASS
    - Offer-type chips single-row layout (`tops: [561, 561, 561, 561, 561, 561, 561]`): PASS
    - H1 balanced text wrap without orphans: PASS
    - Mobile nav drawer: PASS
    - Analyze progressive disclosures: PASS
    - Results 375×667 above-the-fold contract: PASS
    - Desktop 1280×800 sticky sidebar: PASS
    - High-risk safety controls: PASS
    - Zero horizontal scroll across all viewports (320-1440px): PASS
- **Final Screenshots:** 24 screenshots captured in `/docs/ui-shots/r3-after/final/`.















---

## Landing Hero Restoration — Two-Button Centered Composition

### Overview
Restored the clean, centered single-column hero on the landing page (`/`) featuring two distinct action buttons (**"Check an Offer Now →"** linking to `/analyze` and **"Inspect a Link"** linking to `/link-check`), while removing the inline analyzer textarea card. Preserved all design achievements from the previous rounds: Electric Indigo palette tokens (`#5B3DF5`), dark mode, navbar with theme toggle and mobile navigation drawer, unified `IconTile` component, accessibility attributes, and full safety copy integrity.

---

### Key Changes
1. **Landing Configuration Toggle (`client/src/config/landing.ts`):**
   - Created configuration module exporting `SHOW_PROBLEM_STATEMENT_BADGE = true`.
   - Controls the visibility of the hackathon problem statement badge pill at the top of the hero: *"Digital Trust & Safety — Problem Statement: 'Fake or Real'"*.
2. **Hero Recomposition (`client/src/components/landing/Hero.tsx`):**
   - **H1 exact wording restored:** *"Spot Warning Signs"* (`foreground`) + *"Before You Pay or Share Private&nbsp;Data"* (`bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to`).
   - Non-breaking space (`Private&nbsp;Data`) applied to prevent "Data" from being orphaned alone on a last line across 320–1920px viewports.
   - **Subhead exact wording restored:** *"Students encounter hundreds of internship offers, scholarships, and freelance messages online. Jaanch helps you understand **why** something may be risky and **what you should independently verify** before taking action."*
   - **Two buttons restored:**
     - Primary button: *"Check an Offer Now"* (`ShieldCheck` and `ArrowRight` icons) -> `/analyze` (`min-h-[48px]`, `bg-primary hover:bg-primary-hover active:bg-primary-pressed text-primary-foreground`).
     - Secondary button: *"Inspect a Link"* (`Search` icon) -> `/link-check` (`min-h-[48px]`, `bg-surface hover:bg-surface-raised border border-border text-foreground`).
   - **Four feature cards integrated directly under buttons:**
     - Embedded directly inside `Hero` without an intervening section or extra H2: *"Explains why"*, *"Never says 'safe'"*, *"Checks official sources"*, *"Screenshots stay on your device"*.
     - Uses unified `IconTile` (`variant="primary"`).
     - Responsive grid: 4 columns on desktop, 2×2 on tablet, stacked on mobile.
3. **Landing Structure Streamlining (`client/src/pages/Landing.tsx`):**
   - Removed `BenefitsGrid` component and import to prevent duplicate feature cards.
   - Page flow: `<Hero />` -> `<HowItWorks />` -> `<LimitsStrip />` -> `<ClosingCta />`.
4. **Obsolete Components Removed:**
   - Deleted `client/src/components/landing/HeroAnalyzer.tsx` (verified `/analyze` functions completely independently with prefill support).
   - Deleted `client/src/components/landing/BenefitsGrid.tsx`.
5. **Privacy Copy Accuracy (§4 & `/docs/privacy-copy-check.md`):**
   - Refined `ImageUploadPanel.tsx`: removed absolute `"100%"` phrasing.
   - Refined `Privacy.tsx`: changed *"run 100% inside your browser"* to *"run inside your browser using WebAssembly"*.
   - Refined `HowItWorks.tsx`: clarified *"Screenshots and PDFs are read in your browser."*
6. **Automated Testing & Acceptance:**
   - Added `client/src/__tests__/landingHero.test.ts` (4 new tests) validating configuration export, exact H1 & subhead wording, link routes, absence of inline textarea, and privacy copy bounds.
   - Updated `scripts/test-acceptance.mjs` with updated Criterion 1 (exact H1, two action links, badge, no textarea), Criterion 2 (above-the-fold contract at 1440×900, 1366×768, and 390×844), Criterion 3 (H1 orphan word prevention across 320–1920px), Criterion 4 (hero feature cards with peek affordance at 1440×900), and Criterion 10 (zero horizontal scroll across 320–1920px on all routes).
7. **Verification Results:**
   - `npm run lint`: PASSED (0 secrets, 0 banned phrases, 0 hardcoded colors, typecheck clean).
   - `npm run test`: PASSED (346/346 tests passed: 267 shared, 38 server, 41 client).
   - `npm run eval -w shared`: PASSED (25/25 corpus test cases passed: 100% precision & recall).
   - `node scripts/test-acceptance.mjs`: PASSED (10/10 criteria passed).
   - Screenshots: 24 baseline captured in `/docs/ui-shots/hero-restore-before/`, 24 post-restoration captured in `/docs/ui-shots/hero-restore-after/`.
