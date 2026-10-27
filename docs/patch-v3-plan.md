# JAANCH — Patch v3 Implementation Plan

This plan documents the targeted architecture modifications to resolve the defects exposed by the **Nexora** fixture run, enforce rigorous positive-evidence gating for `LIKELY_GENUINE`, and declutter the Results experience.

---

## 1. Defect Analysis & Root Causes (Nexora Fixture)

1. **Premature `LIKELY_GENUINE` Status:**
   - *Cause:* `computeStatus.ts` defaulted to `LIKELY_GENUINE` in Step 5 whenever no high/critical rules fired or no hard disqualifiers were found. Absence of negative signals was treated as positive evidence of legitimacy.
   - *Fix:* Gated `LIKELY_GENUINE` strictly behind at least one verified positive evidence item (registry domain match, authenticated headers, official listing match, or official-portal attestation). Otherwise default to `NEEDS_REVIEW` with reason `insufficient_evidence`.
   - *Combined Low Signals:* Two or more subtle indicators (`URG-004`, `MIS-007`, `MIS-003`, `DAT-006`) together trigger `NEEDS_REVIEW`.

2. **Entity & Identity Disconnect:**
   - *Cause:* Sender identity and claimed organization checks only read explicit user input fields (`request.sender.email`, `request.claimedOrg`). If the user pasted an offer text without filling sender fields, `senderIdentity` was `null` and organization was "Not stated in offer", even though the body explicitly contained `Nexora Digital Solutions` and `hr@nexora-example.invalid`.
   - *Fix:* Create `extractEntities(text)` to extract emails, phones, URLs/domains, UPI IDs, social handles, and organization candidates. Wire top candidates into sender and org checks with source flagged as `extracted_from_text`.

3. **Inconsistent Completeness & False Ticks:**
   - *Cause:* Vague phrasing such as "initial review of your profile" ticked "Selection and evaluation process", and candidate descriptions ticked "Eligibility criteria".
   - *Fix:* Strict evidence-based extraction where eligibility and selection process require explicit criteria, formal evaluation steps (test/interview), and distinct quotes. Relative onboarding windows do not satisfy the application deadline.

4. **Misleading Outcome Chips & Badges:**
   - *Cause:* Rule absence was displayed with a green "Pass" chip, implying verification of legitimacy. "Rule Engine Score: N/100" looked like a probability score. "Offer Domain / Type" was shown as a verification check.
   - *Fix:*
     - Introduce `none_found` outcome with neutral styling and explanatory copy ("No match found in text. This does not confirm the offer is genuine.").
     - Replace rule score badge with "Verification coverage: X of Y checks completed".
     - Remove "Offer Domain / Type" row.
     - Show "AI Unavailable" badge only when AI was explicitly requested.

5. **UI Clutter & Redundancy:**
   - *Cause:* Three overlapping action lists ("What is Still Unverified", "User-Attested Confirmations", "Verify Next") and separate standalone cards for Completeness, Reported Records, and Sender Identity.
   - *Fix:* Merge into one unified "Do these next" action list with message-specific steps. Fold duplicate cards into expandable drawers within the Evidence Report. Group all `not_run` checks into a single interactive block. Move 8 student safety rules to `/resources` with a 3-line contextual summary on the results page.

---

## 2. Inventory of Files to Create or Modify

### A. Shared Package (`shared/`)
| File | Action | Description |
|---|---|---|
| `shared/src/__fixtures__/nexora.txt` | **Create** | Verbatim input text for Nexora fixture |
| `shared/src/extraction/entities.ts` | **Create** | `extractEntities(text)` returning emails, phones, urls, upiIds, socialHandles, organizationCandidates |
| `shared/src/extraction/__tests__/entities.test.ts` | **Create** | Tests for entity extraction and consistency guarantees |
| `shared/src/extraction/fields.ts` | **Modify** | Rewrite `checkCompleteness` for strict evidence matching, returning 6/10 for Nexora |
| `shared/src/schemas/index.ts` | **Modify** | Add `none_found` to `CheckOutcome`, add entity types, add `safe_reply` challenge schemas |
| `shared/src/rules/catalog.ts` | **Modify** | Add `URG-004`, `MIS-007`, `DAT-006`, `SND-006`; extend `MIS-003` |
| `shared/src/rules/score.ts` | **Modify** | Ensure score calibration for new low-severity rules |
| `shared/src/config/status.ts` | **Modify** | Update `STATUS_COPY.NEEDS_REVIEW.meaning` with "...or not enough could be verified yet." |
| `shared/src/verification/computeStatus.ts` | **Modify** | Enforce positive evidence requirement for `LIKELY_GENUINE`, add multi-signal trigger to Step 4 |
| `shared/src/verification/__tests__/computeStatus.test.ts` | **Modify** | Truth table tests (>= 35 cases) covering Nexora, positive evidence cases, combinations |
| `shared/src/insights/patterns.ts` | **Create** | "What usually happens next" pattern insight catalogue |
| `shared/src/insights/__tests__/patterns.test.ts` | **Create** | Pattern matching unit tests & banned phrase guards |
| `shared/src/challenge/template.ts` | **Modify** | Add `buildSafeReplyTemplate` function |
| `shared/src/index.ts` | **Modify** | Export `entities.ts`, `patterns.ts`, and updated challenge templates |
| `shared/src/__fixtures__/corpus/*` (>= 20 files) | **Create** | Corpus of labelled regression test fixtures |
| `shared/scripts/eval.ts` | **Create** | Offline evaluation script generating confusion matrix and metrics |
| `shared/package.json` | **Modify** | Add `eval` script |

### B. Server Package (`server/`)
| File | Action | Description |
|---|---|---|
| `supabase/migrations/0005_check_outcome.sql` | **Create** | Postgres migration adding `'none_found'` to `check_outcome` enum |
| `server/src/config/env.ts` | **Modify** | Add `ENABLE_THIRD_PARTY_CHECKS` boolean flag (default `false`) |
| `server/.env.example` | **Modify** | Document `ENABLE_THIRD_PARTY_CHECKS` |
| `server/src/services/analyzeService.ts` | **Modify** | Wire extracted entities to sender/org checks, emit `SND-006`, evaluate patterns, build message-specific checklist, apply third-party check flag |
| `server/src/services/challengeService.ts` | **Modify** | Support `kind: "challenge" \| "safe_reply"` with deterministic template fallback |
| `server/src/ai/geminiService.ts` | **Modify** | Add AI generation support for `safe_reply` |
| `server/src/routes/challenge.ts` | **Modify** | Accept `kind` in challenge route |
| `server/src/__tests__/api.test.ts` | **Modify** | Add regression tests for Nexora and safe reply |

### C. Client Package (`client/`)
| File | Action | Description |
|---|---|---|
| `client/src/components/results/StatusBanner.tsx` | **Modify** | Replace rule score with verification coverage meter; show AI unavailable only when requested |
| `client/src/components/results/CheckRow.tsx` | **Modify** | Render `none_found` outcome with neutral styling |
| `client/src/components/results/PatternInsightCard.tsx` | **Create** | Card rendering "What usually happens next" and "Don't send yet" items |
| `client/src/components/results/DoTheseNextList.tsx` | **Create** | Merged "Do these next" action list combining unknowns, attestations, and checklist |
| `client/src/components/results/EvidenceReport.tsx` | **Modify** | Remove Offer Domain row, convert absence checks to `none_found`, group `not_run` checks with inline inputs, embed drill-downs |
| `client/src/components/results/ChallengeEmailPanel.tsx` | **Modify** | Add tab switcher for "Challenge email" vs "Safe reply" |
| `client/src/components/results/StudentSafetyRules.tsx` | **Modify** | Render 3-line contextual summary and link to `/resources` |
| `client/src/pages/Results.tsx` | **Modify** | Reorder sections per §7 E7; fold duplicate cards; collapse crisis strip for low risk |
| `client/src/styles/index.css` | **Modify** | Add `@media print` rules: expand all accordions, hide inputs/actions, no empty panels |
| `client/src/__tests__/print.test.ts` | **Create** | Automated test verifying print layout integrity |

### D. Root & Configuration
| File | Action | Description |
|---|---|---|
| `package.json` | **Modify** | Add root `eval` script |
| `README.md` | **Modify** | Document `ENABLE_THIRD_PARTY_CHECKS` and design assumptions |

---

## 3. Step-by-Step Implementation Sequence

1. **Shared Workspace Implementation:**
   - Create verbatim fixture `/shared/src/__fixtures__/nexora.txt`.
   - Implement `/shared/src/extraction/entities.ts` with comprehensive Indian phone, email, URL, UPI, and org candidate extraction.
   - Implement strict `/shared/src/extraction/fields.ts` completeness logic.
   - Implement `/shared/src/rules/catalog.ts` rules (`URG-004`, `MIS-007`, `MIS-003` extension, `DAT-006`, `SND-006`).
   - Update `/shared/src/schemas/index.ts` with `none_found`, extracted entities, and safe reply.
   - Implement `/shared/src/verification/computeStatus.ts` positive-evidence gating and combined low-signal handling.
   - Implement `/shared/src/insights/patterns.ts`.
   - Implement `/shared/src/__fixtures__/corpus/` (20+ labelled fixtures) and `/shared/scripts/eval.ts`.
   - Verify `npm test -w shared` and `npm run eval` pass cleanly.

2. **Server Workspace Implementation:**
   - Create migration `supabase/migrations/0005_check_outcome.sql`.
   - Update `server/src/config/env.ts` with `ENABLE_THIRD_PARTY_CHECKS`.
   - Wire entity extraction and pattern generation into `server/src/services/analyzeService.ts`.
   - Update `challengeService.ts` and routes for `safe_reply`.
   - Verify `npm test -w server` passes.

3. **Client Workspace Implementation:**
   - Implement Coverage Meter and remove Rule Score in `StatusBanner.tsx`.
   - Style `none_found` in `CheckRow.tsx`.
   - Implement `PatternInsightCard.tsx` and `DoTheseNextList.tsx`.
   - Overhaul `EvidenceReport.tsx` (group not-run checks, embed completeness/sender/reported drill-downs).
   - Add Safe Reply tab to `ChallengeEmailPanel.tsx`.
   - Update `StudentSafetyRules.tsx` to 3-line summary.
   - Reorder `Results.tsx` to match prompt specification.
   - Add `@media print` styling and print test.

4. **Final Acceptance Validation:**
   - Run Nexora fixture through the entire pipeline and verify all criteria in §12.
   - Run `npm test`, `npm run typecheck`, `npm run eval`, and check banned phrases.
