# JAANCH — Patch v5 Implementation Plan
### Rebuilding the PDF Export: Purpose-Built, Compact, Client-Side Deterministic Document

---

## 1. Executive Summary & Defect Root Causes

The current PDF export in Jaanch relies entirely on `window.print()` rendering the on-screen React web page. This results in severe layout defects:
- **Excessive page count (10–11 pages for ~3 pages of content)**: Containers configured with `break-inside: avoid` (including `div`, `section`, `article` in `index.css`) force page breaks prematurely whenever a large block cannot fit in the remaining page space, leaving 50–70% of pages blank.
- **Orphaned headings & empty collapsed frames**: Section headings appear as the last line of a page with their cards on the next. Interactive drawers (Safe Reply Draft, Safety Rules, Not-run detail drawers) are collapsed by default on screen and print as empty outlines or headers.
- **Uncontrolled browser headers/footers**: Date stamps, URLs (`localhost:5173/results/local`), and page numbering printed by browser print engines cannot be styled or suppressed reliably via CSS.
- **Content duplication & scrambled evidence**: Part 1 "Jaanch already checked" duplicates checks from the Evidence Report; checks appear in arbitrary order; quotes are clipped mid-word; internal machine tokens (e.g. `AI-PAY`, `AI-TOO`, `AI-SEN`, `org_unregistered_no_evidence`) leak into user-facing output.

**Decision & Strategy**:
1. Implement a **dedicated client-side PDF document generator** using `@react-pdf/renderer` with pinned stable compatibility for React 18 and Vite.
2. Structure the document around a single source of truth: a pure shared view-model function `buildReportViewModel(result, opts)` in `/shared/src/report/buildReportViewModel.ts`.
3. Bundle clean, local **Noto Sans** and **Noto Sans Devanagari** fonts under `/client/public/fonts/` to render currency symbols (`₹`) and Hindi/Hinglish text reliably without CDN calls.
4. Keep `window.print()` as a secondary export option with a fully overhauled print stylesheet (`@page { size: A4; margin: 14mm; }`, no container-level break avoidance, forced accordion expansion).
5. Ensure generation is 100% client-side with zero data uploads, supporting both guest mode and saved analyses identically.

---

## 2. Current Export Code Path vs. Proposed Target Path

### 2.1 Current Export Flow
```
User clicks "Print / PDF" in ExportReportButtons
  -> calls window.print()
  -> Browser renders DOM using @media print in client/src/styles/index.css
  -> Container-level break-inside: avoid splits sections across 10-11 pages
  -> Collapsed UI states render empty boxes; browser injects header/footer
```

### 2.2 Proposed Target Architecture
```
User clicks "Download PDF" (Primary)
  -> Opens ExportReportDialog (modal)
       - Checkbox: "Include next steps" [Default: ON]
       - Checkbox: "Include message text (may contain personal details)" [Default: OFF]
       - Privacy Note: "The PDF is created in your browser; nothing is uploaded."
  -> User confirms "Download PDF"
       -> Lazy-loads client/src/pdf/generatePdf.ts dynamically (dynamic import())
       -> Builds pure ReportViewModel via shared/src/report/buildReportViewModel.ts
       -> Passes view-model into ReportDocument.tsx (@react-pdf/renderer)
       -> Generates client-side Blob (pdf(ReportDocument).toBlob())
       -> Triggers browser download with filename: jaanch-report_<status-kebab>_<YYYY-MM-DD>.pdf
       -> Disables button during generation, provides loading spinner, announces completion via aria-live

User clicks "Print" (Secondary)
  -> Calls window.print() using updated @media print with strict card-level break rules,
     expanded drawers, hidden buttons, and no blank pages.

User clicks "Export JSON"
  -> Exports sanitized evidence and view-model data as JSON.
```

---

## 3. Dependencies & Asset Requirements

### 3.1 Dependencies
- **`@react-pdf/renderer` (v4.x)**: Installed in `client` package. Provides deterministic canvas/PDF rendering, native pagination (`Page X of Y`), `wrap={false}` control, and `minPresenceAhead`.
- **`pdfjs-dist` (already installed)**: Used in node-based unit tests to parse rendered PDF buffers, assert text presence, test page counts, and verify geometry / fill rates.

### 3.2 Font Assets (`/client/public/fonts/`)
Downloaded and bundled locally under SIL Open Font License (OFL):
- `NotoSans-Regular.ttf`
- `NotoSans-Medium.ttf`
- `NotoSans-Bold.ttf`
- `NotoSans-Italic.ttf`
- `NotoSansDevanagari-Regular.ttf` (fallback for Devanagari script / Hindi text)
- `NotoSansDevanagari-Bold.ttf`

Fonts will be registered using `Font.register` with `'Noto Sans'` and fallback support for `₹` and Hindi text.

### 3.3 CSP & Security Verification
- In `server/src/app.ts`: Helmet CSP already includes `workerSrc: ["'self'", "blob:"]` and `imgSrc: ["'self'", "data:", "blob:"]`.
- Verify `fontSrc: ["'self'", "data:"]` and ensure `blob:` URLs for PDF downloads function cleanly without CSP violations. All font files are local; no CDN requests are initiated.

---

## 4. Shared Report View Model (`/shared/src/report/`)

### 4.1 Pure Transformation: `buildReportViewModel(result: AnalysisResult, opts?: ReportOptions)`
Located in `/shared/src/report/buildReportViewModel.ts`:
- **De-duplication**: Merges Part 1 "already checked" rows and Evidence Report rows into a single ordered list keyed by `checkKey`.
  - Canonical Ordering:
    1. Sender identity (`sender_domain_match`, etc.)
    2. Domain / Headers / Age (`header_authentication`, `domain_age`, etc.)
    3. Organization registry / listing (`organization_registry_match`, `official_website_registry`, `official_listing`)
    4. Reported records (`reported_records`)
    5. Text rules (`payment_request`, `sensitive_data_request`, `urgency_language`, `guarantee_unrealistic`)
    6. Completeness (`completeness`)
- **Not-Run Collapsing**: Collapses all checks with outcome `not_run` into a single summary line:
  `"Not run (add details to run these): sender email, email headers, official listing, organization registry"`.
- **Reason Humanization**: Converts machine keys (e.g. `org_unregistered_no_evidence`) into clear, respectful sentences via a lookup dictionary `/shared/src/config/reasonCopy.ts`. Omits internal score numbers like `"rule score reached 15"`.
- **Quote Sanitization**: Employs `formatQuote(quote, maxLen = 140)`:
  - Collapses all whitespace and line breaks.
  - Trims partial words at the beginning or end, prepending/appending `…` at word boundaries.
  - Preserves abbreviations without splitting (e.g. `B.E./B.Tech`, `Pvt. Ltd.`, `Rs.`).
  - Caps at 140 characters cleanly.
- **Rule Code Eradication**: Converts pseudo codes (`AI-PAY`, `AI-TOO`, `AI-SEN`) and rule IDs to `"Rule"` or `"AI-observed"` using `signalSourceLabel(signal)`.
- **Safe Fallbacks**: Uses `safeText(val)` ensuring no `undefined`, `null`, `[object Object]`, or raw JSON appears in output.
- **Next Steps & Contradiction Resolution**:
  - For standard results (`VERIFIED_OFFICIAL`, `LIKELY_GENUINE`, `NEEDS_REVIEW`): Outputs actionable "Your turn" steps with how-to explanations and standing rules.
  - For high-risk results (`HIGH_RISK`, `CONFIRMED_SCAM`): Outputs "Protect yourself" steps. Eliminates redundant "How to verify:" labels that duplicate step titles.
  - Suppresses draft reply section entirely for `HIGH_RISK` and `CONFIRMED_SCAM`.

---

## 5. PDF Layout Specification (`/client/src/pdf/ReportDocument.tsx`)

- **Format**: A4 portrait (`595.28 x 841.89 pt`), margins 36 pt top/bottom, 40 pt left/right.
- **Typography & Theme**:
  - Font: Noto Sans (9.5 pt base, line height 1.4).
  - Print-safe palette: Crisp white background, neutral slate text (contrast >= 7:1), subtle borders (`#E2E8F0`), tone-specific badges.
- **Fixed Header (Every Page)**:
  - Left: `"Jaanch · Offer Verification Report"`
  - Right: Report Date (`"28 Oct 2026"`)
  - Thin 0.75 pt divider rule.
- **Fixed Footer (Every Page)**:
  - Left: `"Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent."`
  - Center: Report ID (`#ID-xxxx` or uuid)
  - Right: `"Page X of Y"`
- **Continuous Flowing Sections (No forced page breaks)**:
  1. **Summary Block**: Status badge + one-line meaning, offer type, claimed organization, AI context indicator, generated timestamp.
  2. **Why This Status**: Up to 3 plain-language bullet points from humanized reasons.
  3. **Alert Box**: Bordered callout for `HIGH_RISK`/`CONFIRMED_SCAM` or any `payment` signal ("Do not pay anything or share Aadhaar/PAN/bank details/OTPs... Call 1930 / cybercrime.gov.in"). Otherwise displays standing student rules.
  4. **What We Observed**: Compact table (`Severity | Signal | Evidence (quote) | Why it matters`). Header repeats on page splits (`fixed`); individual rows wrapped with `wrap={false}` so rows never break in half.
  5. **Evidence Checks**: Compact table (`Check | Outcome | Detail`) showing bold outcomes (Pass, Fail, Unknown, None found, Confirmed by you), followed by single collapsed "Not run" line.
  6. **Offer Details Found**: 2-column grid of 10 offer completeness attributes with Found/Missing badges and shortened quotes.
  7. **Next Steps**: Checklist format with `[ ]` glyph. "Your turn" steps or "Protect yourself" steps.
  8. **Draft Reply**: Rendered conditionally (only if user generated a draft AND status is not high risk). Never renders an empty container.
  9. **Message Analysed (Appendix)**: Included only if user selected the checkbox in the export dialog. Redacted via `redactPII()`, max 1,500 chars with ellipsis.
  10. **Closing Disclaimer & Helpline**: Short disclaimer, plus 1930 helpline badge for high-risk offers.
- **Pagination Safety**:
  - Section headers have `minPresenceAhead={60}` to prevent orphaned headings.
  - Page count target: Typical report <= 3 pages; maximum corpus fixture <= 4 pages.

---

## 6. Print Stylesheet Overhaul (`client/src/styles/index.css`)

Refactor `@media print`:
- Set `@page { size: A4; margin: 14mm; }`.
- Remove `break-inside: avoid` from large layout containers (`div`, `section`, `article`, `.rounded-2xl`).
- Restrict `break-inside: avoid` strictly to small cards and rows: `tr, .signal-card, .step-card, li`.
- Add `h2, h3 { break-after: avoid; }`.
- Remove `min-height`, `h-screen`, and drop shadows. Force backgrounds to pure white.
- Expand all interactive accordions and detail drawers in print mode.
- Hide all interactive controls, buttons, toggles, inline forms, and empty draft reply containers.
- Include a subtle `"Printed from Jaanch"` attribution footnote.

---

## 7. Files to Create and Modify

| Path | Action | Purpose |
|------|--------|---------|
| `/docs/patch-v5-plan.md` | Create | Architecture and execution plan document |
| `/shared/src/config/reasonCopy.ts` | Create | Human-readable reason copy dictionary |
| `/shared/src/report/format.ts` | Create | Text helpers (`formatQuote`, `signalSourceLabel`, `humanizeReason`, `safeText`) |
| `/shared/src/report/buildReportViewModel.ts` | Create | Pure function converting `AnalysisResult` into `ReportViewModel` |
| `/shared/src/report/__tests__/reportViewModel.test.ts` | Create | Unit test suite (>= 20 cases) covering edge cases, formatting, de-duping |
| `/shared/src/index.ts` | Modify | Export new report helpers, types, and configs |
| `/client/public/fonts/*` | Create | Bundled local Noto Sans and Noto Sans Devanagari TTF files |
| `/client/src/pdf/fonts.ts` | Create | Font registration logic for `@react-pdf/renderer` |
| `/client/src/pdf/ReportDocument.tsx` | Create | `@react-pdf/renderer` JSX document matching §5 specification |
| `/client/src/pdf/generatePdf.ts` | Create | Lazy-loaded export function creating Blob and triggering download |
| `/client/src/components/results/ExportReportDialog.tsx` | Create | Accessible export dialog with option checkboxes and privacy note |
| `/client/src/components/results/ExportReportButtons.tsx` | Modify | Primary "Download PDF", secondary "Print", "Export JSON" toolbar |
| `/client/src/pages/Results.tsx` | Modify | Mount export toolbar and apply display formatting |
| `/client/src/components/results/StatusBanner.tsx` | Modify | Apply text helpers for UI consistency |
| `/client/src/components/results/SignalList.tsx` | Modify | Apply `signalSourceLabel` and `formatQuote` |
| `/client/src/components/results/EvidenceReport.tsx` | Modify | Apply display formatting and hide empty containers |
| `/client/src/styles/index.css` | Modify | Correct `@media print` rules, remove container break-avoidance |
| `/client/src/__tests__/print.test.ts` | Modify | Update print stylesheet test assertions |
| `/client/src/__tests__/pdfRender.test.ts` | Create | Node PDF rendering tests (page count <= 4, fill >= 75%, no orphans, ₹ glyph) |
| `/scripts/preview-pdf.ts` | Create | Script rendering fixture PDFs to disk for visual verification |
| `/package.json` | Modify | Add script `"pdf:preview": "tsx scripts/preview-pdf.ts"` |

---

## 8. Quality Gates & Acceptance Verification

1. **Unit Tests**: `npm run test -w shared` validates >= 20 cases for view-model building, deduplication, quote trimming, abbreviations, and reason humanization.
2. **PDF Engine Tests**: `npm run test -w client` validates that all corpus fixtures produce <= 3 pages (largest <= 4), with >= 75% vertical fill on non-final pages, no orphan headings, and presence of `₹`.
3. **Typecheck & Linter**: `npm run lint` and `npm run typecheck` run clean with 0 errors across all three workspaces.
4. **Offline Evaluation**: `npm run eval -w shared` maintains 20/20 PASS across the corpus.
5. **No Regressions**: Zero secrets, zero AI SDK leaks into client, no CDN font calls.
