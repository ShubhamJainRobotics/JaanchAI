# JAANCH — Patch v4 Implementation Plan
### Redesign of "Do These Next" Verification System

This plan documents the targeted architecture modifications to overhaul the 19-item "Do these next" checklist into a concise, non-repetitive, three-part panel that automates verifiable lookups, preserves human judgment for manual verification, and surfaces standing student safety warnings.

---

## 1. Defect Analysis & Root Causes (from Nexora Test Result)

1. **Unmanageable List Length (19 items):**
   - *Cause:* Merging all potential checklist rules, generic baseline unknowns, and separate attestation rows generated a massive, unprioritized chore list.
   - *Fix:* Restructure into three clean parts: (1) read-only automated checks already completed by Jaanch, (2) at most 6 prioritized manual steps in "Your turn", and (3) fixed standing safety rules in a non-dismissable banner.

2. **Repetition and Duplication:**
   - *Cause:* Independent rules and dynamic steps each inserted overlapping instructions ("Find the organization's official website yourself", "Search for the company independently", "Contact the recruiter via official channel", "Contact HR using official website").
   - *Fix:* Enforce strict de-duplication by stable `stepKey`, normalized title, and unique `howToVerify` copy in a pure shared generator `buildNextSteps`.

3. **Boilerplate Instructions:**
   - *Cause:* Unmatched unknowns fell back to the generic copy: *"How to verify: Complete this verification before taking further action or sharing sensitive data."*
   - *Fix:* Completely eradicate this boilerplate string repo-wide. Every catalog step defines specific, actionable verification steps.

4. **Automatable Items Presented as User Chores:**
   - *Cause:* "Check if the sender email address matches the official company domain name" was presented as a manual task even though Jaanch's engine evaluates this automatically.
   - *Fix:* Automated telemetry and rule outcomes live exclusively in Part 1 ("Jaanch already checked") and never appear as manual tasks.

5. **Standing Safety Rules Presented as Tickable Tasks:**
   - *Cause:* "Do not transfer money or share personal identification documents" was rendered as a checkbox.
   - *Fix:* Move standing student protection rules into a dedicated Part 3 `ProtectionBanner` (`role="note"`), non-tickable and non-dismissable.

6. **Fragmented Safe Reply Queries:**
   - *Cause:* Separate tasks asked the user to query registration terms, selection process, request more time, and send challenge emails.
   - *Fix:* Consolidate into a single step: `send_safe_reply`, which preselects contextual questions into a single polite safe reply draft (capped at 180 words, no accusations, no personal data).

7. **Buried Action Items:**
   - *Cause:* Standalone attestations pushed actionable tasks down.
   - *Fix:* Subsume attestations as nested sub-checks within their parent manual steps (e.g. `found_independently_on_official_portal` inside `find_official_site`).

---

## 2. Target Architecture & Three-Part Model

```
+-----------------------------------------------------------------------+
| NEXT STEPS PANEL                                                      |
|                                                                       |
|  Part 1: Jaanch already checked (Read-Only)                           |
|  - Sender domain legitimacy          [Unknown]   Checked by Jaanch    |
|  - Reported fraud database check     [None found] Checked by Jaanch   |
|  - Organization registry match       [Unknown]   Checked by Jaanch    |
|  - Email header authentication       [Not run]   -> [Add headers]     |
|                                                                       |
|  Part 2: Your turn · 0 of 6 done [=====>                  ]           |
|  [ ] 1. Find {org}'s official website yourself                        |
|         Search independently; check careers page & email domain.      |
|         [Open web search]  [Open official site (if verified)]         |
|         |_ [ ] Confirmed by you: I found this exact opportunity.      |
|  [ ] 2. Check the company's registration                              |
|         Search MCA master data for active status. [Open MCA]          |
|  [ ] 3. Look for the listing on AICTE Internship Portal               |
|         Search portal for scheme name. [Open AICTE]                   |
|  [ ] 4. Confirm the recruiter's identity                              |
|         Check LinkedIn and compare phone with official site.          |
|         |_ [ ] Confirmed by you: Profile found and linked to {org}    |
|         |_ [ ] Confirmed by you: Phone matches official website       |
|  [ ] 5. Send one safe reply with your questions                       |
|         Ask registration terms, selection process, more time.         |
|         [Open safe reply]                                             |
|         |_ [ ] Confirmed by you: Contacted via official channel       |
|  [ ] 6. Ask your placement cell or a trusted senior                   |
|                                                                       |
|  (High-Risk Variant: "Protect yourself" replaces Your Turn)           |
|  - Stop replying · Preserve evidence · Report (1930) · Warn others    |
|  - "I already paid" toggle activates immediate bank/1930 alert        |
|                                                                       |
|  Part 3: Stay safe (Fixed Guidance Banner)                            |
|  * Never pay any fee to receive an opportunity.                       |
|  * Don't share Aadhaar, PAN, bank details, passwords, or OTPs.        |
|  * Share only minimum details after sender verification (if DAT-006). |
|  * Genuine employers allow time to verify; don't be rushed (if URG).  |
+-----------------------------------------------------------------------+
```

---

## 3. Inventory of Files to Create or Modify

### A. Shared Package (`shared/`)
| File | Action | Description |
|---|---|---|
| `shared/src/config/nextSteps.ts` | **Create** | Catalog of typed step definitions, template variables, priority ordering, and applicability predicates. |
| `shared/src/config/safetyBanner.ts` | **Create** | Deterministic selector for standing protection banner rules (`getSafetyBannerRules`). |
| `shared/src/nextSteps/build.ts` | **Create** | Pure shared function `buildNextSteps(result, options)` generating Part 1 (`alreadyChecked`), Part 2 (`yourTurn`, `more`), and Part 3 (`banner`). |
| `shared/src/nextSteps/__tests__/buildNextSteps.test.ts` | **Create** | ≥ 25 unit test cases covering de-duplication, priority capping, domain filtering, question injection, and invariants. |
| `shared/src/schemas/index.ts` | **Modify** | Add `NextStepSchema`, `NextStepsSchema`, `NextStepActionSchema`, `NextStepSubCheckSchema`. Extend `AttestationRequestSchema` enum with `found_independently_on_official_portal`. Add `includeQuestions` to `ChallengeRequestSchema`. |
| `shared/src/challenge/template.ts` | **Modify** | Update `buildSafeReplyTemplate` with `includeQuestions` support, capping reply body at 180 words with zero accusatory language or personal data. |
| `shared/src/verification/computeStatus.ts` | **Modify** | Recognize `found_independently_on_official_portal` in positive evidence computation. |
| `shared/src/index.ts` | **Modify** | Export step catalog, safety banner helpers, and `buildNextSteps`. |

### B. Server Package (`server/`)
| File | Action | Description |
|---|---|---|
| `supabase/migrations/0006_next_steps.sql` | **Create** | Add `step_key text not null` to `checklist_items`, backfill with `'legacy_' || id`, add unique index `(analysis_id, step_key)`. |
| `server/src/services/analyzeService.ts` | **Modify** | Generate `nextSteps` via `buildNextSteps`. Refine `sender_domain_match` detail for reserved/placeholder domains. Persist checklist items with `step_key`. |
| `server/src/services/historyService.ts` | **Modify** | Populate `nextSteps` in `getAnalysisById`. Regenerate steps on updates preserving completion status and dropping obsolete keys. Update attestation handling. |
| `server/src/services/challengeService.ts` | **Modify** | Pass `includeQuestions` into deterministic template and AI prompt. |
| `server/src/ai/geminiService.ts` | **Modify** | Include dynamic questions and 180-word ceiling in safe reply prompt. |
| `server/src/__tests__/migration.test.ts` | **Modify** | Test 0006 backfill and step_key logic. |
| `server/src/__tests__/api.test.ts` | **Modify** | Add tests for `nextSteps` in API responses and safe reply question injection. |

### C. Client Package (`client/`)
| File | Action | Description |
|---|---|---|
| `client/src/components/results/NextStepsPanel.tsx` | **Create** | Main container replacing `DoTheseNextList`. Coordinates Part 1, 2, and 3, handling standard vs protect variants. |
| `client/src/components/results/AlreadyCheckedList.tsx` | **Create** | Renders Part 1 compact read-only checks with outcome chips and inline "Add details" triggers. |
| `client/src/components/results/AlreadyCheckedRow.tsx` | **Create** | Individual check row component with "Checked by Jaanch" badge and registry link if verified. |
| `client/src/components/results/YourTurnList.tsx` | **Create** | Part 2 container rendering max 6 cards with progress bar and "Show N more" accordion. |
| `client/src/components/results/NextStepCard.tsx` | **Create** | Individual step card with accessible checkbox, title, whyItMatters, specific howToVerify, action buttons, and nested sub-checks. |
| `client/src/components/results/ProtectionBanner.tsx` | **Create** | Part 3 non-dismissable banner with standing rules (`role="note"`). |
| `client/src/components/results/ProtectYourselfList.tsx` | **Create** | High-risk variant panel with urgent steps and `AlreadyPaidToggle`. |
| `client/src/components/results/AlreadyPaidToggle.tsx` | **Create** | Toggle for "I already paid" activating immediate 1930/bank recovery step. |
| `client/src/pages/Results.tsx` | **Modify** | Mount `NextStepsPanel`, coordinate inline detail inputs and smooth transition to ChallengeEmailPanel Safe Reply tab. |
| `client/src/components/results/ChallengeEmailPanel.tsx` | **Modify** | Accept preselected questions and focus trigger. |
| `client/src/components/results/DoTheseNextList.tsx` | **Remove** | Remove obsolete merged checklist component. |
| `client/src/components/results/AttestationChecklist.tsx` | **Remove** | Remove obsolete standalone attestation list. |
| `client/src/styles/index.css` | **Modify** | Print styles to expand accordions and hide interactive controls. |
| `client/src/__tests__/nexora.test.ts` | **Create** | Vitest acceptance test for Nexora result verifying 3 parts, 6 cards, no boilerplate, and print styling. |

---

## 4. Implementation Steps & Quality Gates

1. Shared catalog, banner, schemas, and `buildNextSteps` with ≥ 25 unit tests.
2. Migration `0006_next_steps.sql` and server persistence / regeneration logic.
3. Safe-reply endpoint question injection and 180-word limit.
4. Client components and responsive / accessible UI.
5. Verification run against all acceptance criteria (§7), typecheck, lint, test, and offline eval.
