# JAANCH Patch v6 Plan — Detection, Extraction & Evidence Fixes

## 1. Audit & Current Code Locations

| Component | Current Location | Key Responsibilities |
|---|---|---|
| **Rule Catalog** | `shared/src/rules/catalog.ts` | 46KB rule catalog matching regexes against normalized text. Lacks `PAY-007`, `PAY-008`, `TGB-004`, full UPI pattern in `PAY-002`, `PAY-005` pay-to-receive expansions, negation guards. |
| **Entity Extraction** | `shared/src/extraction/entities.ts` | Extracts emails, phones, URLs, UPIs, org candidates. Currently quotes with mid-word slices; UPI regex is restricted to banking handles only; organization candidate generator is naive regex. |
| **Field Extraction & Completeness** | `shared/src/extraction/fields.ts` | `extractOfferFields`, `checkCompleteness`. Missing robust role detection (`Software Intern`, typos like `content writting`), selection process (`a interview`, rounds), and contact channel fallback. |
| **Status Engine** | `shared/src/verification/computeStatus.ts` | 5-level status engine. AI cannot raise status past `NEEDS_REVIEW`; hard disqualifiers gate `HIGH_RISK`. |
| **Coverage Meter** | `client/src/components/results/StatusBanner.tsx` | Currently calculates percentage across all `checks`, including text-rule and completeness checks. |
| **Reported-Entities Lookup** | `server/src/services/analyzeService.ts`, `server/src/services/reportedService.ts` | Hashes identifiers and queries DB/RPC. Blanket statement in evidence row even when 0 identifiers checked. |
| **Next-Steps Builder** | `shared/src/nextSteps/build.ts` & `buildNextSteps.ts` | Builds alreadyChecked, yourTurn, more, banner, protect cards. |
| **Pattern Insights** | `shared/src/insights/patterns.ts` | Precursor pattern detection. Lacks `payment_first_onboarding`. |
| **Reason Copy** | `shared/src/config/reasonCopy.ts` | Human-readable dictionary mapping keys to accessible sentences without score numbers or pseudo-codes. |

---

## 2. Defects Addressed from Five Test Runs

1. **Brightpath scam:** Missed UPI ID (`brightpath.hr@okbank`), "refundable", and "100% guaranteed". Claimed sender email/phone/domain/links checked though none existed.
2. **Scholarship GST lure:** Extracted org as `"pay. Limited"`. Failed to flag "pay GST ... to release ₹50,000". Evidence quote cut mid-word (`"es of ₹2,350 at www…"`).
3. **Microsoft impersonation:** Sender email typed in claimed organization field silently disabled lookalike check and caused false conflict. Rules missed "mandatory software kit for ₹3,000" and "laptop dispatched after payment". Org ran past sentence end (`Microsoft India. To begin onboarding`). Role missed.
4. **Polished unverified offer (Willowbrook):** Org extracted with role words (`Intern position at Willowbrook...`). Eligibility quote cut at `B.E.` period. Coverage showed 70% with zero independent verification.
5. **Poorly written but benign (Sunrise Media):** Org "Sunrise Media" not found, causing false `MIS-001`. Selection process marked missing despite "we will call for a interview next week".

---

## 3. Implementation Modules & Changes

### Fix A: Input Routing & Form Validation (`/shared/src/input/routeFields.ts`)
- `routeFields(request)` runs on client for immediate feedback and on server as authority.
- Detects if `claimedOrg` contains email, URL, phone, or UPI ID pattern.
- If so, moves it to the appropriate `sender.*` field (if empty) or keeps both (if filled), clears `claimedOrg`, and emits a clear notice.
- Trims, NFKC-normalizes, and strips zero-width characters.
- Surfaces notices in `Results.tsx` under status banner ("Input adjusted") and inline in form.

### Fix B: Sentence Segmentation & Clean Evidence Spans (`/shared/src/text/segment.ts`, `spans.ts`)
- `segmentSentences(text)`: protects abbreviations (`Pvt. Ltd.`, `Ltd.`, `B.E.`, `B.Tech`, `Dr.`, `Mr.`, `Rs.`, etc.), decimals, amounts with commas (`₹25,000`), times (`10:00`), URLs/emails, numbered lists (`1.`).
- `findSpan(text, matchIndex, matchLength, opts)`:
  - Expands to whole-word boundaries (never starts/ends mid-word).
  - Keeps up to 8 words context on each side within the same sentence (≤ 160 characters, with `…`).
  - Returns real substring of original text.
- Applies to all rule hits, entity extraction quotes, and AI grounded quotes (resnapped).

### Fix C: Organization Extraction Rewrite (`/shared/src/extraction/organization.ts`)
- Scored, conservative algorithm: proper-noun phrase rules (capitalized, ALL-CAPS, `&`, `of`), stops at punctuation, comma, newline, or hyphen-lowercase compound.
- Strips leading role words (`Intern position at Willowbrook...` → `Willowbrook...`) and trailing department words (`Sunrise Media HR` → `Sunrise Media`).
- Hard stoplist: `Dear`, `Candidate`, `Student`, `Limited-time`, `pay. Limited`, `Scholarship`, `Government` (standalone).
- `Limited`/`Ltd` counted as legal suffix only if preceded by proper noun and not followed by `-time|-offer|...`.
- Scored confidence: `high` | `medium` | `low`. If below medium threshold, returns `null` with `organizationStatus: "uncertain"`.
- `MIS-001` fires only when NO candidate exists at all.

### Fix D: Role, Selection Process & Contact-Channel Detection
- Role: `<Words> Intern|Trainee|Analyst|Developer|Engineer|Writer|Associate...`, `intern for content writting` (typos preserved), scholarship/program names.
- Selection process: `interview`, `a interview`, `intervew`, `assessment`, `test`, `round`, `group discussion`, etc.
- Contact channel: email, phone, portal present in text OR supplied in sender fields.
- Full requirement sentence captured for eligibility via `findSpan`.

### Fix E: Close Rule Gaps with Negation Guards
- Add/extend `PAY-008` (mandatory software kit, tools, uniform fee, deposit), `PAY-007` (laptop dispatched after payment, pay first), `PAY-002` (UPI `name@handle` where handle has no dot), `PAY-003` (refundable deposit promise), `PAY-005` (pay GST/tax to release ₹X), `TGB-004` (100% guaranteed, no interview required), `URG-001` (`Complete payment today`), `GOV-001`.
- Negation lookback window (~5 tokens within same clause) preventing false positives like `No fees is charged`, `free of cost`, `Please do not share any payment`.
- Dev-only rule-gap diagnostics behind `DEV_RULE_GAP_REPORT=true` (never logs message text).

### Fix F: Entity Extraction & Honest Reported-Record Checks
- Extracts emails, UPI IDs (no-dot handle format), phones, URLs.
- Reported-record check counts exact identifiers checked: `Checked 2 identifiers: UPI ID, domain`. If zero identifiers, outcome is `not_run` with `No sender email, phone, UPI ID, domain or link was available to look up.`
- Adds "Payment destination" check row when UPI ID / payment account is present.
- Sender-field email vs body email conflict emits `SND-001`.
- Lookalike checks run on all evaluated emails/domains.

### Fix G: Status & Safety Messaging
- `paymentAlert: boolean`: true if any payment signal exists from any source. Non-dismissable warning shown under status banner.
- Clean "Why this status" sentences via `lookupReasonCopy`, dropping internal scores and raw machine keys.
- Add `payment_first_onboarding` pattern insight; ensure `brand_impersonation` covers `SND-002`/`SND-004`.
- Standing-rules banner includes urgency rule whenever ANY `URG-*` fires.

### Fix H: Independent Verification Coverage Meter
- Fixed set of 8 independent checks: `sender_domain`, `email_headers`, `domain_age`, `registry_match`, `official_listing`, `reported_entities`, `attest_found_on_official_site`, `attest_recruiter`.
- Completed only if outcome in `["pass", "fail", "user_attested"]` or (`reported_entities` with `none_found` and ≥ 1 identifier looked up).
- Display: `Independent checks completed: {k} of 8` without percentage.

### Fix I: UI / Copy Corrections
- "Checked by Jaanch" tag shown only when outcome !== `not_run`.
- Completeness chip: neutral `Incomplete` display label whenever < 10 details present.
- AI signals show `"AI-observed"` badge + category name, NO pseudo codes (`AI-PAY`, etc.).
- High-risk "Protect yourself" cards: omit repeating "How to verify:" label.
- "I already paid" toggle defaults to OFF.
- Hide Safe Reply Draft for `HIGH_RISK` / `CONFIRMED_SCAM`.
- Unclear organization displays as "the organization".

---

## 4. Testing & Acceptance Matrix

- 5 new fixtures in `shared/src/__fixtures__/corpus/`:
  - `t1_brightpath.txt` -> `HIGH_RISK`
  - `t2_scholarship_gst.txt` -> `HIGH_RISK`
  - `t3_microsoft_impersonation.txt` -> `HIGH_RISK`
  - `t4_willowbrook_polished.txt` -> `NEEDS_REVIEW` (10/10 completeness, 1 of 8 independent checks)
  - `t5_sunrise_benign.txt` -> `NEEDS_REVIEW` (no `MIS-001`, selection process found, 6/10 completeness)
- Total fixtures evaluated by `npm run eval`: 25 fixtures (all 25 must PASS).
- Unit and property tests for:
  - `routeFields`
  - `segmentSentences` & `findSpan` (whole-word boundary invariant, <= 160 chars)
  - Organization extractor must-pass table
  - Rule catalog additions & negation guards (>= 4 positives & negatives each)
  - Independent coverage meter calculation (fixed 8)
- Complete workspace verification:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test` across shared, server, client
