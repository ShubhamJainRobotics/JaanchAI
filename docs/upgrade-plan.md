# Jaanch Verification Rules Upgrade — Architecture & Implementation Plan

## 1. Executive Summary & Context
This upgrade transitions Jaanch from a 3-level risk indicator (`HIGH_CONCERN`, `NEEDS_VERIFICATION`, `NO_MAJOR_WARNING_SIGNS`) to a 5-level evidence-gated **Verification Status Model** (`VERIFIED_OFFICIAL`, `LIKELY_GENUINE`, `NEEDS_REVIEW`, `HIGH_RISK`, `CONFIRMED_SCAM`), grounded in student offer verification policies and deterministic evidence.

### Core Non-Negotiables:
- **Evidence-Gated Statuses:** `VERIFIED_OFFICIAL` and `CONFIRMED_SCAM` can never be produced from unstructured message text alone.
- **Link Check Separation:** Link checks retain the 3-level `RiskLevel` model (as they assess URLs, not offers). Offer analysis moves to `VerificationStatus`.
- **SSRF & Security Isolation:** The server never contacts suspect hosts. Only registry-allowlisted domains (for official listing comparisons) and designated third-party APIs (RDAP, crt.sh CT logs, Google Safe Browsing) are contacted via pinned-IP/strict `safeFetch`.
- **Zero Raw PII in Reported DB:** Identifiers are hashed using a salted pepper (`REPORT_HASH_PEPPER`). No raw identifiers or reporter credentials leave the database.
- **Deterministic Rule Engine First:** Works without any AI API key or third-party keys. Gemini remains optional, server-side, consent-gated, and cannot override or elevate statuses.

---

## 2. Inventory of Changes: Files to Create and Modify

### 2.1 Shared Workspace (`/shared`)
#### New Files:
1. `shared/src/config/status.ts`:
   - `VerificationStatus` enum and `STATUS_COPY` definitions with tone, label, and copy.
2. `shared/src/config/policy.ts`:
   - Reconciliation decisions and typed policy constants.
3. `shared/src/config/freeMail.ts`:
   - Curated list of free personal email domains.
4. `shared/src/config/plausibility.ts`:
   - Unrealistic compensation / stipend threshold configurations for students.
5. `shared/src/config/safetyRules.ts`:
   - 8-point Student Safety Rules from §9.
6. `shared/src/extraction/fields.ts`:
   - Deterministic extraction of offer details (`extractOfferFields`) and completeness verification (`checkCompleteness`).
7. `shared/src/sender/email.ts`:
   - Email parsing, free-mail checks, registry domain matching, consistency (`SND-001`), and impersonation (`SND-004`).
8. `shared/src/sender/headers.ts`:
   - `parseEmailHeaders`, authentication results (`spf`, `dkim`, `dmarc`), alignment, and helper text.
9. `shared/src/verification/computeStatus.ts`:
   - Pure function computing the 5 verification statuses with stepwise precedence and reasons.
10. `shared/src/verification/compareListing.ts`:
    - Field-by-field listing comparison logic (roles, durations, stipends, dates).

#### Modified Files:
1. `shared/src/schemas/index.ts`:
   - Add `VerificationStatusSchema`, `CheckOutcomeSchema`, `EntityTypeSchema`, `ExtractedFieldsSchema`, `CheckRowSchema`, `StatusReasonSchema`, `HeaderAnalysisSchema`, `SenderIdentitySchema`, `ListingComparisonSchema`, `ReportedMatchSchema`, `OrganizationSchema`, `ReportRequestSchema`, `ReportLookupRequestSchema`, `AttestationRequestSchema`, `OfficialListingRequestSchema`, `ExtractionOutputSchema`, `EvidenceReportSchema`.
   - Update `AnalysisResultSchema` (replace `riskLevel` with `status`, add reasons, checks, extracted fields, sender identity, listing comparison, etc.).
   - Update `AnalyzeRequestSchema` with optional sender, emailHeaders, organizationId, officialListing, runThirdPartyChecks.
   - Update `HistoryQuerySchema` (`status` replaces `risk`).
2. `shared/src/rules/types.ts`:
   - Extend `RuleHit` with optional `hardDisqualifier: boolean`.
3. `shared/src/rules/catalog.ts`:
   - Add/extend rules: `PAY-001` (extend), `PAY-002` (extend), `PAY-006`, `PAY-007`, `PAY-008`, `PAY-009`, `DAT-001` (extend), `DAT-002` (extend), `DAT-005`, `DAT-004`, `TGB-004`, `REC-001`, `GOV-001`, `URG-001` (extend), `URG-003`, `CNT-001`, `MIS-005`, `MIS-006`, `CHN-001` (extend), `CHN-004`, `SND-001`, `SND-002`, `SND-003`, `SND-004`, `SND-005`, `REP-001`.
4. `shared/src/links/lookalike.ts`:
   - Extend lookalike detection with base label tokenization, Levenshtein, digit/homoglyph swaps, and token containment.
5. `shared/src/index.ts`:
   - Re-export new modules and schemas.

---

### 2.2 Server Workspace (`/server`)
#### New Files:
1. `server/src/lib/safeFetch.ts`:
   - SSRF protection helper (DNS resolve, IP pin, private/loopback/CGNAT/IPv6 rejection, redirect hop validation, size and timeout limits).
2. `server/src/lib/domainIntel.ts`:
   - RDAP, CT log lookup (`crt.sh`), and Google Safe Browsing v4 integration with 6-hour LRU cache.
3. `server/src/services/listingService.ts`:
   - Organization registry fetch & allowlist enforcement; safe fetch and conversion to text.
4. `server/src/services/reportedService.ts`:
   - Identifier normalization, SHA-256 peppered hashing, RPC lookups, and report submission.
5. `server/src/routes/organizations.ts`:
   - Registry search/autocomplete.
6. `server/src/routes/headers.ts`:
   - Standalone header analysis endpoint.
7. `server/src/routes/reports.ts`:
   - Reported entities lookup and scam submission endpoints.
8. `server/src/routes/attestations.ts`:
   - User attestations handler (`recruiter_linkedin`, `recruiter_phone_official`, etc.).
9. `server/src/routes/evidenceReport.ts`:
   - Evidence report retrieval endpoint.
10. `server/scripts/hashEntity.ts`:
    - CLI tool for moderators to generate peppered entity hashes.
11. `server/scripts/importReported.ts`:
    - Script for importing confirmed records from CSV.

#### Modified Files:
1. `server/src/config/env.ts`:
   - Add new environment variables (`REPORT_HASH_PEPPER`, `DEMO_MODE`, `SAFE_BROWSING_API_KEY`, CT log configs, DNS/Listing timeouts, rate limits).
2. `server/.env.example` & `server/.env`:
   - Add template keys.
3. `server/src/app.ts`:
   - Register new routers and rate limiters.
4. `server/src/services/analyzeService.ts`:
   - Full orchestration pipeline update: field extraction, sender identity, header parsing, registry check, domain intel, reported db lookup, listing fetch/compare, Gemini fill-ins, `computeStatus`, checks generation, and Supabase persistence.
5. `server/src/services/historyService.ts`:
   - Update queries to use `verification_status`.
6. `server/src/ai/geminiService.ts`:
   - Add system prompt rules, `buildExtractionPrompt`, `ExtractionOutputSchema` parsing, listing discrepancy explainer, and invariant checks.

---

### 2.3 Supabase Database (`/supabase`)
#### New Files:
1. `supabase/migrations/0003_enums.sql`:
   - New signal categories (`sender_identity`, `source_authenticity`, `reported_record`, `content_quality`).
   - New enums: `verification_status`, `check_outcome`, `entity_type`, `entity_status`, `org_kind`.
2. `supabase/migrations/0004_verification.sql`:
   - Create `organizations` table + RLS.
   - Create `reported_entities` and `scam_reports` tables + RLS + `check_reported_entities` & `submit_scam_report` RPCs.
   - Alter `analyses`: add `verification_status` column, backfill from `risk_level`, drop `risk_level`, add registry & headers fields.
   - Create `analysis_checks` table + RLS.
3. `supabase/seed/organizations.sql`:
   - ~40 organizations across Tech, IT, EdTech, Conglomerates, Government, and Demo org.

---

### 2.4 Client Workspace (`/client`)
#### New Files:
1. `client/src/components/results/StatusBanner.tsx`:
   - 5-level status banner with distinct tones and accessible icons.
2. `client/src/components/results/EvidenceReport.tsx`:
   - Primary evidence report view with outcome chips and traceable lines.
3. `client/src/components/results/CheckRow.tsx`:
   - Render individual check outcomes (`pass`, `fail`, `unknown`, `not_run`, `user_attested`).
4. `client/src/components/results/SenderIdentityPanel.tsx`:
   - Email domain, consistency, and header auth summary.
5. `client/src/components/results/HeaderAnalysisCard.tsx`:
   - Header authentication details and Gmail/Outlook/Apple Mail help dialog.
6. `client/src/components/results/ListingMatchPanel.tsx`:
   - Field comparison table and "Attach Official Listing" action.
7. `client/src/components/results/AttestationChecklist.tsx`:
   - Interactive user-attested check confirmations.
8. `client/src/components/results/CompletenessCard.tsx`:
   - 10-point required details completeness tracker.
9. `client/src/components/results/ReportedRecordsCard.tsx`:
   - Reported and confirmed scam database match display.
10. `client/src/components/results/ReportEntityDialog.tsx`:
    - Modal dialog for authenticated users to report entities.
11. `client/src/components/results/StudentSafetyRules.tsx`:
    - Actionable student safety advice panel.
12. `client/src/components/results/ExportReportButtons.tsx`:
    - Print / Save as PDF and JSON export actions.
13. `client/src/components/analyze/SenderDetailsSection.tsx`:
    - Collapsible input section for email, headers, phone, UPI, recruiter, listing URL/text.
14. `client/src/components/analyze/OrganizationAutocomplete.tsx`:
    - Searchable organization picker.

#### Modified Files:
1. `client/src/pages/Analyze.tsx`:
   - Integrate sender details, headers, listing, third-party check consent.
2. `client/src/pages/Results.tsx`:
   - Transition to `EvidenceReport` as primary view, integrate new panels and attestations.
3. `client/src/pages/History.tsx`:
   - Use `VerificationStatus` filters and `StatusBadge`.
4. `client/src/pages/Resources.tsx`:
   - Add Student Safety Rules and "How Jaanch Decides" explainer.
5. `client/src/pages/About.tsx`:
   - Document reconciliation decisions and verification policy.
6. `client/src/lib/apiClient.ts`:
   - Add methods for organizations, headers, attestations, listing attach, and reports.

---

## 3. Existing Tests Update & New Test Suite Plan

### 3.1 Tests Requiring Updates
1. `shared/src/config/__tests__/bannedPhrases.test.ts`:
   - Allow "Verified / Official" and "Confirmed Scam" inside `StatusBanner` and `STATUS_COPY` when exact status matches. Strictly forbid elsewhere.
2. `shared/src/rules/__tests__/rules.test.ts`:
   - Update `scoreRes.riskLevel` to `scoreRes.status` / `scoreHits` outputs where applicable; update expected status of ₹999 deposit scenario to `HIGH_RISK`.
3. `server/src/__tests__/api.test.ts`:
   - Update `res.body.riskLevel` in analyze tests to `res.body.status` (`HIGH_RISK` and `LIKELY_GENUINE`); keep link-check tests asserting `riskLevel`.
4. `client/src/__tests__/client.test.ts`:
   - Update mock analysis result to include `status: "HIGH_RISK"` and required fields.

### 3.2 New Test Files
1. `shared/src/verification/__tests__/computeStatus.test.ts`:
   - Truth table test (≥ 30 test cases) covering each gate of Step 3 failing individually, reported entity status rules, and invariants.
2. `shared/src/rules/__tests__/catalogExtension.test.ts`:
   - Hard-disqualifier coverage matrix test ensuring every §2 rule is mapped.
   - Positive and negative tests for each new rule (`PAY-006` through `PAY-009`, `REC-001`, `GOV-001`, `CNT-001`, `SND-001` through `SND-005`).
3. `shared/src/sender/__tests__/senderAndHeaders.test.ts`:
   - Email parsing, free-mail checks, and ≥ 6 email header fixtures.
4. `shared/src/verification/__tests__/compareListing.test.ts`:
   - Duration normalization, compensation normalization, date matching, tolerance checks.
5. `server/src/__tests__/safeFetch.test.ts`:
   - SSRF protection tests (private IPs, loopback, CGNAT, DNS rebinding, hop revalidation, size caps).
6. `server/src/__tests__/reportedAndRegistry.test.ts`:
   - Hash stability with pepper, RPC lookup, rate limiting, and permission isolation.
7. `server/src/__tests__/invariants.test.ts`:
   - Property tests: random text never achieves `VERIFIED_OFFICIAL`; AI cannot elevate past `NEEDS_REVIEW` or remove rule hits.
8. `server/src/__tests__/migration.test.ts`:
   - Backfill verification from `risk_level` to `verification_status`.
