# JAANCH UI/UX Restyle Audit & Migration Plan

## 1. Pre-Flight Baseline Results

- **Git Branch:** `ui-redesign` (clean working tree, verified not on `main`)
- **UI Pro Max Skill:** Verified installed at `.agents/skills/ui-ux-pro-max/`
- **Lint Check:** PASSED (`npm run check:no-secrets`, `npm run check:banned-phrases`, `npm run typecheck`)
- **Typecheck:** PASSED (all workspaces: `shared`, `server`, `client`)
- **Unit & Integration Tests:** PASSED
  - Shared: 17 test files, 267 tests passed
  - Server: 5 test files, 38 tests passed
  - Client: 5 test files, 24 tests passed
  - **Total:** 329 tests passed
- **Offline Eval Harness:** PASSED (25/25 corpus fixtures classified correctly: 100% precision & recall)
- **Baseline "Before" Screenshots:** Captured across 1440px and 375px viewports into `/docs/ui-shots/before/`:
  - `landing-1440.png` & `landing-375.png`
  - `analyze-empty-1440.png` & `analyze-empty-375.png`
  - `analyze-filled-1440.png` & `analyze-filled-375.png`
  - `results-high-risk-1440.png` & `results-high-risk-375.png`
  - `results-needs-review-1440.png` & `results-needs-review-375.png`
  - `results-likely-genuine-1440.png` & `results-likely-genuine-375.png`
  - `history-1440.png` & `history-375.png`
  - `resources-1440.png` & `resources-375.png`
  - `about-1440.png` & `about-375.png`
  - `login-1440.png` & `login-375.png`

---

## 2. UI Audit

### 2.1 Tailwind Version & Configuration
- **Tailwind Version:** `^3.4.13`
- **Existing Config (`client/tailwind.config.ts`):**
  - Defines arbitrary brand palette `brand-50` through `brand-950`
  - Defines ad-hoc `risk.high`, `risk.needs`, `risk.none` hex objects
  - Lacks unified semantic CSS variable bindings
  - Lacks standardized dark mode token mapping

### 2.2 Existing Tokens & CSS Variables
- Only print `@page` and `@media print` rules exist in `client/src/styles/index.css`.
- No systematic CSS variables exist in `index.css`.
- Google Fonts stylesheet referenced via external CDN in `index.html` (violates offline CSP).

### 2.3 Page & Shared Component Inventory
- **Pages (10):**
  - `Landing.tsx`
  - `Analyze.tsx`
  - `Results.tsx`
  - `History.tsx`
  - `LinkCheck.tsx`
  - `Resources.tsx`
  - `About.tsx`
  - `Privacy.tsx`
  - `Login.tsx`
  - `Signup.tsx`
  - `Settings.tsx`
  - `NotFound.tsx`
- **Layout Components:**
  - `AppShell.tsx`, `Navbar.tsx`, `Footer.tsx`, `RequireAuth.tsx`
- **Shared / Results Components:**
  - `StatusBanner.tsx`, `VerificationChecklist.tsx`, `PatternInsightCard.tsx`, `SignalList.tsx`, `SignalCard.tsx`, `CheckRow.tsx`, `EvidenceReport.tsx`, `AlreadyCheckedRow.tsx`, `NextStepsPanel.tsx`, `NextStepCard.tsx`, `YourTurnList.tsx`, `LinkInspectorCard.tsx`, `ChallengeEmailPanel.tsx`, `CompactSafetySummary.tsx`, `FeedbackWidget.tsx`, `ExportReportButtons.tsx`, `ExportReportDialog.tsx`, `ListingMatchPanel.tsx`, `SenderIdentityPanel.tsx`, `HeaderAnalysisCard.tsx`, `ReportEntityDialog.tsx`
- **Analyze Components:**
  - `InputTabs.tsx`, `ExtractedTextEditor.tsx`, `DetectedLinksList.tsx`, `DomainSelect.tsx`, `ChannelSelect.tsx`, `ClaimedOrgInput.tsx`, `SenderDetailsSection.tsx`, `ConsentToggles.tsx`, `ImageUploadPanel.tsx`, `PdfUploadPanel.tsx`, `HeadersHelpDialog.tsx`, `OrganizationAutocomplete.tsx`
- **Common Components:**
  - `PageSkeleton.tsx`, `ErrorBoundary.tsx`, `ConfirmDialog.tsx`

### 2.4 Color & Styling Metric Counts
- **Total Hex Literals in client source:** 11 occurrences (in `Login.tsx`, `Signup.tsx`, `index.css`)
- **Total RGB/RGBA Literals:** 0 occurrences
- **Total Arbitrary Tailwind Classes (`bg-[#...]`):** 0 occurrences
- **Total Standard Tailwind Palette Utilities (`bg-slate-50`, `text-slate-900`, `bg-emerald-50`, etc.):** 2,077 occurrences
- **Total Inline Styles:** 6 occurrences (mostly height / dynamic styles)

### 2.5 Inconsistencies & Duplicated Patterns
- **Cards:** Randomly use `bg-white`, `border-slate-200`, `shadow-xs`, `shadow-sm`, `rounded-2xl`, `rounded-3xl` with nested boxes.
- **Chips & Badges:** Different pill implementations across `StatusBanner`, `CheckRow`, `SignalCard`, and `History`.
- **Buttons:** Hand-crafted padding (`px-4 py-2`, `px-8 py-3.5`), varied radius, inconsistent focus rings, missing unified button component or token styles.
- **Dark Mode Support:** Incomplete across components; some components have hardcoded light backgrounds without dark equivalents.

### 2.6 Responsive & Usability Issues (375px / 768px / 1024px / 1440px)
- **375px:**
  - Analysis form submit CTA is buried at the bottom without sticky mobile visibility.
  - Multi-column grids compress inputs and labels.
  - Results page long evidence quotes and URLs can cause horizontal overflow unless wrapped with `overflow-wrap: anywhere`.
  - Chip lists in verification badges risk text wrapping or clipping.
  - Touch targets for clear/copy buttons are below 44×44 px.

---

## 3. Migration Roadmap (Small, Verified Batches)

1. **Batch 1: Foundation**
   - Implement `client/src/styles/tokens.css` with light and dark mode CSS variables.
   - Update `client/tailwind.config.ts` to map semantic tokens.
   - Remove Google Fonts CDN links from `index.html`; configure self-hosted `@font-face` for Inter / Noto Sans and Noto Sans Devanagari.
   - Set up manual theme toggle with `prefers-color-scheme` and `localStorage` fallback in `Navbar`.
   - Implement accessible base button, input, card, and divider primitives.
   - Verify: lint, typecheck, tests, contrast tests.

2. **Batch 2: Status Components**
   - Restyle `StatusBanner`, coverage meter, payment alert notice, pattern insight card, input notices.
   - Verify: icon + text pairing, contrast in light & dark.

3. **Batch 3: Evidence Components**
   - Restyle `CheckRow`, outcome chips, severity badges, `SignalCard`, `SignalList`, `EvidenceReport`.
   - Add progressive disclosure drill-downs, wrapping for long text/URLs.

4. **Batch 4: Next Steps Panel**
   - Restyle `NextStepsPanel`, `AlreadyCheckedRow`, `NextStepCard`, `YourTurnList`, protect-yourself variant.

5. **Batch 5: Analyze Page**
   - Restyle `Analyze.tsx`, `InputTabs`, upload dropzones, OCR progress with `aria-live`, `SenderDetailsSection`, consent toggles.
   - Add mobile sticky CTA bar for "Analyze Opportunity".

6. **Batch 6: Other Pages**
   - Restyle `Landing.tsx`, `History.tsx`, `LinkCheck.tsx`, `Resources.tsx`, `About.tsx`, `Privacy.tsx`, `Login.tsx`, `Signup.tsx`, `Settings.tsx`, `NotFound.tsx`.

7. **Batch 7: System States**
   - Restyle skeletons, empty states, error boundaries, toasts, dialogs (`ExportReportDialog`, `ReportEntityDialog`, `HeadersHelpDialog`, `ConfirmDialog`).
   - Ensure focus trap, Esc to close, focus restoration.

8. **Batch 8: Cleanup & Enforcement**
   - Remove dead CSS and unused hardcoded color utilities.
   - Add CI script/test to forbid hard-coded hex colors and arbitrary color utilities outside `tokens.css`.
   - Verify final Lighthouse, WCAG contrast, and before/after comparisons.
