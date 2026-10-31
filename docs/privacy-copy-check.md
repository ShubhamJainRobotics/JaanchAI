# JAANCH Privacy Copy & Data Flow Verification Checklist (§4)

This document verifies every privacy claim made across the Jaanch application against the exact implementation in the codebase.

---

## 1. Verified Data Flow Architecture

| Data Type | Where it is Processed | What is Sent to Server | What is Stored (Guest) | What is Stored (Logged In) | Code Evidence |
|:---|:---|:---|:---|:---|:---|
| **Screenshots (Images)** | 100% in Browser | Nothing. Image files are **never uploaded**. | Not stored. | Not stored. | `client/src/components/analyze/ImageUploadPanel.tsx` uses `client/src/lib/ocr.ts` (`tesseract.js`). No file upload API call exists. |
| **PDF Documents** | 100% in Browser | Nothing. PDF files are **never uploaded**. | Not stored. | Not stored. | `client/src/components/analyze/PdfUploadPanel.tsx` uses `client/src/lib/pdf.ts` (`pdfjs-dist` + local canvas OCR). No file upload API call exists. |
| **Pasted / Extracted Text** | Server-side memory | Text string sent via HTTPS POST `/api/analyze` | **Zero database storage**. Result returned in HTTP response and held in browser memory. | Stored in Supabase `analyses` table **only if** `saveToHistory` is enabled. Raw text is stored **only if** `storeRawText` is toggled on; otherwise `input_text` is `null` (only cryptographic `input_hash`, length, and computed report are saved). | `server/src/services/analyzeService.ts` L860–875: `if (user && supabase && request.saveToHistory) { const inputTextToStore = request.storeRawText ? rawText : null; ... }` |
| **AI Context Analysis** | Google Gemini API (Server) | Redacted text snippet sent **only if** user explicitly opts in via consent toggle. | Not stored on server if guest. | Stored if logged in and history enabled. | `client/src/components/analyze/ConsentToggles.tsx` defaults AI context to OFF. `server/src/services/analyzeService.ts` checks user consent before calling `GeminiService.analyzeOpportunity`. |
| **Official Checks** | Server-side safe HTTP client | Domain/entity queries to public registries (MCA, AICTE, NSP, RDAP). | Cached in memory / DB. | Linked to analysis if logged in. | `server/src/services/safeFetch.ts` with strict SSRF protection. |

---

## 2. Claims Audit & Resolution

| Location | Original Claim / Text | Code Path Audit | Audit Finding | Final Accurate Wording |
|---|---|---|---|---|
| `Hero.tsx` | `"Instant, browser-side checks for security deposits..."` | Analysis runs via POST `/api/analyze` on server. Not browser-side. | **REMOVED** (Inaccurate) | Replaced with exact original subhead: *"Students encounter hundreds of internship offers, scholarships, and freelance messages online. Jaanch helps you understand why something may be risky and what you should independently verify before taking action."* |
| `Hero.tsx` | `"100% Free & Open Source"` | Absolute `100%` is unnecessary marketing puffery. | **REMOVED** | Removed with removal of redesigned inline analyzer truth row. |
| `Hero.tsx` | `"Private · Zero tracking for guests"` | "Zero tracking" is overly absolute. | **REMOVED** | Removed with removal of redesigned inline analyzer truth row. |
| `HeroAnalyzer.tsx` | `"Analysis runs in your browser. Pasted text is never stored for guests."` | Text is sent to `/api/analyze` on server for rule evaluation; only storage is skipped for guests. | **REMOVED** | Component deleted entirely per §3. |
| `Hero.tsx` (Cards) | `title: "Screenshots stay on your device"`, `description: "Text is read from screenshots and PDFs in your browser; the files are never uploaded."` | `client/src/lib/ocr.ts` uses Tesseract.js (WASM) locally in worker. `client/src/lib/pdf.ts` uses pdfjs-dist locally in worker. No multipart or file uploads exist. | **VERIFIED & KEPT** | *"Text is read from screenshots and PDFs in your browser; the files are never uploaded."* |
| `Hero.tsx` (Cards) | `title: "Never says 'safe'"` | `shared/src/config/bannedPhrases.ts` and `shared/src/verification/computeStatus.ts` strictly prohibit "safe" or "guaranteed genuine" statuses. | **VERIFIED & KEPT** | *"We show what we observed and what is still unverified — not a guarantee."* |
| `Hero.tsx` (Cards) | `title: "Checks official sources"` | `client/src/pages/Resources.tsx` and `ListingService` provide direct links to AICTE, NSP, MCA21 registries. | **VERIFIED & KEPT** | *"Links to AICTE, the National Scholarship Portal and MCA company records."* |
| `Hero.tsx` (Cards) | `title: "Explains why"` | `AnalyzeService` maps rule hits to `evidenceQuote` and `whyItMatters` in `signals`. | **VERIFIED & KEPT** | *"Every warning sign comes with the exact words from the message and why it matters."* |
| `HowItWorks.tsx` | `description: "Paste offer text or drop a screenshot. Files stay in your browser."` | Screenshots & PDFs are processed locally via WASM OCR/canvas. | **VERIFIED & REFINED** | *"Paste offer text or drop a screenshot. Screenshots and PDFs are read in your browser."* |
| `ExportReportDialog.tsx` | `"The PDF is created in your browser; nothing is uploaded."` | `client/src/pdf/generatePdf.ts` invokes `@react-pdf/renderer` in browser thread to produce Blob. Zero server upload. | **VERIFIED & KEPT** | *"The PDF is created in your browser; nothing is uploaded."* |
| `ImageUploadPanel.tsx` | `"Optical Character Recognition runs 100% in your browser."` | Tesseract.js WASM worker runs in browser thread. Absolute `100%` removed for cleaner tone. | **REFINED** | *"Optical Character Recognition runs in your browser without uploading your image."* |
| `SenderDetailsSection.tsx` | `"Headers are parsed locally and evaluated for SPF/DKIM/DMARC pass/fail results. Raw headers are never stored without explicit opt-in."` | Parsed with `parseEmailHeaders` (`shared`); server only stores raw headers if `user && storeRawText`. | **VERIFIED & KEPT** | Kept as is. |
| `Privacy.tsx` | `"...run 100% inside your browser using WebAssembly. The actual image or document is never uploaded to our backend server..."` | Tesseract and PDF.js run via WASM client-side. Binary files are never sent in HTTP requests. Absolute `100%` removed. | **REFINED** | *"Optical Character Recognition (OCR) and PDF page rendering run inside your browser using WebAssembly. The actual image or document is never uploaded to our backend server..."* |
