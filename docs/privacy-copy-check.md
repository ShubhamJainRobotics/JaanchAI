# JAANCH Privacy Copy & Data Flow Verification Checklist

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

## 2. Approved Privacy Copy Statements

1. **Under Hero Analyzer Card:**
   > *"Screenshots and PDFs are read in your browser and never uploaded. Guest checks are not saved to any database."*
   - **Proof:** `client/src/lib/ocr.ts` (browser Tesseract worker) and `server/src/services/analyzeService.ts` line 860 (`user && supabase` check).

2. **Benefit Card ("Screenshots stay on your device"):**
   > *"Text is read from screenshots and PDFs in your browser; the files are never uploaded."*
   - **Proof:** `client/src/components/analyze/ImageUploadPanel.tsx` handles files in memory with `createObjectURL` and `tesseract.js`.

3. **Analyze Page Privacy Disclosure Summary:**
   > *"AI context: {on/off} · Third-party checks: {on/off} · Saved to history: {on/off}"*
   - **Proof:** `client/src/components/analyze/ConsentToggles.tsx` binds directly to `saveToHistory`, `enableAi`, `storeRawText`.

4. **Logged-in vs Guest Storage:**
   > *"Guest checks are held only in your browser session. If you log in, reports are saved to your private history without storing your raw text unless you choose to."*
   - **Proof:** `server/src/services/analyzeService.ts` line 862 (`const inputTextToStore = request.storeRawText ? rawText : null;`).
