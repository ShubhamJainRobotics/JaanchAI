# Jaanch ("जाँच") — Student Offer Verification & Trust Safety Platform

> **Digital Trust & Safety Hackathon Project**  
> **Problem Statement:** "Fake or Real" (Digital Trust & Safety for Students)  
> **Developed by:** Team QuadCore  

---

## 1. Executive Summary & Core Mission Directive

Students constantly encounter internship offers, scholarships, job opportunities, freelance work, competitions, websites, and messages online. While many are genuine, others are fraudulent, misleading, or designed to extort money or collect personal credentials.

**The core architectural principle of Jaanch (non-negotiable):**
> **Jaanch supports informed decisions through deterministic evidence. Status levels are evidence-gated.**

- **5-Level Verification Status Model**:
  - `VERIFIED_OFFICIAL`: Passed all hard-disqualifier checks and independently confirmed through an official source (evidence-gated; never reachable from message text alone).
  - `LIKELY_GENUINE`: No scam indicators were found, but this offer has not been matched to an official listing.
  - `NEEDS_REVIEW`: Plausible offer but has missing details, an unofficial contact channel, or incomplete source verification.
  - `HIGH_RISK`: Hard disqualifiers present (e.g. upfront fee, credentials request, urgency, personal UPI, lookalike domain).
  - `CONFIRMED_SCAM`: The sender, domain, or account matches a record confirmed as fraudulent by a moderator.
- **Link Check Separation**: Link checks retain the 3-level `RiskLevel` model (`HIGH_CONCERN`, `NEEDS_VERIFICATION`, `NO_MAJOR_WARNING_SIGNS`) as they assess a hyperlink, not an offer.
- **Deterministic Rule Engine Bedrock**: Operates 100% offline without any AI key. AI is strictly optional, server-side, consent-gated, PII-redacted, schema-validated, and cannot override or elevate statuses.
- **Honest Limitations**: Third-party check unavailability (RDAP, CT logs, Safe Browsing) is reported as *unknown*, never as *pass*. No invented accuracy metrics are claimed.

---

## 2. Verification Policy & Reconciliation Decisions

The system implements the team's *Offer Verification Rules for Students* according to the following typed policy decisions (`/shared/src/config/policy.ts`):

| Topic | Rules Document Reference | Implemented Decision |
|---|---|---|
| **Status Labels** | Verified / Official, Likely Genuine, Needs Review, High Risk, Confirmed Scam | Adopt all five labels. **Verified / Official** and **Confirmed Scam** are strictly *evidence-gated*: they can **never** be produced from message text alone. |
| **Hard Disqualifier Outcome** | "Confirmed Scam or High Risk" | A hard disqualifier found in text or sender data results in **High Risk**. It becomes **Confirmed Scam** only when a sender identifier matches a reported-entities record with `status = 'confirmed'`. |
| **Grammar / Spelling Errors** | "Reduces trust score" | Implemented as rule `CNT-001`, severity **low** (3 points), capped at **one hit**, and **can never change the status by itself**. Genuine senders make mistakes; this alone proves nothing and is never cited as scam proof. |
| **Domain SSL & Reputation** | Check SSL status & domain reputation | The backend **never connects to suspect hosts** (no HTTP, no TLS handshake). It utilizes RDAP, **Certificate Transparency log queries** via hostname (`crt.sh`), and optional Google Safe Browsing v4 (only if `SAFE_BROWSING_API_KEY` is provided with user consent). Failures yield *unknown*, never *pass*. |
| **Cybercrime Suspect Repository** | Check sender against repositories | As there is no public national API, Jaanch maintains an **internal reported-entities database** (salted SHA-256 peppered hashes). Jaanch never claims access to classified government databases. |
| **Fetching Official Listings** | Compare with official listing | Server fetches listings **strictly** from allowlisted hosts in the **organization registry** (or `.gov.in` / `.nic.in` for government schemes) with full SSRF controls (pinned IP, private/loopback/CGNAT rejection, hop re-validation). Suspect URLs from messages are never visited. |
| **Recruiter Verification** | Verify recruiter presence | Implemented as **user-attested checks** (`user_attested` outcome), explicitly labeled "confirmed by you, not by Jaanch". They support verification but cannot satisfy Verified gates alone. |
| **Non-Verdict Copy Policy** | Never say "verified/genuine/scam" | Relaxed strictly for `StatusBanner` and `STATUS_COPY` when displaying computed `VERIFIED_OFFICIAL` or `CONFIRMED_SCAM`. All other copy (rules, AI prompts, summaries) remains forbidden from asserting verdicts. "Likely Genuine" always carries its qualifier. |

---

## 3. Architecture & Monorepo Structure

Jaanch is structured as a typed npm monorepo with three workspaces:
```text
jaanch/
├── shared/            # Shared TypeScript package (schemas, rule engine, scoring, sender parsing, listing comparison)
├── server/            # Node.js 20+ Express backend (safeFetch, domain intel, reported db, registry, optional Gemini)
├── client/            # React 18+ Vite frontend (Evidence Report, sender inputs, in-browser OCR, pdf.js)
├── supabase/          # PostgreSQL migrations (0001-0004), seed data, and RLS policies
└── scripts/           # CI, security validation, and moderator hashing scripts
```

### Technology Stack
- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS v3, `@tanstack/react-query`, `react-hook-form` + `@hookform/resolvers/zod`, `lucide-react`.
- **Client Extraction**: `tesseract.js` (in-browser OCR), `pdfjs-dist` (local text extraction). Files never leave the browser.
- **Backend**: Node.js 20+, Express.js, TypeScript, `helmet`, `cors`, `undici` (pinned-IP safeFetch), `pino` logger, `tldts`.
- **Database & Auth**: Supabase PostgreSQL with RLS, security definer RPCs, and SHA-256 peppered hashing.
- **AI Enhancement**: `@google/genai` (optional, server-side, consent-gated, schema-grounded).

---

## 4. Setup & Environment Configuration

### Server Environment (`server/.env`)
```bash
NODE_ENV=development
PORT=8080
CLIENT_ORIGINS=http://localhost:5173

# Supabase (replace with your project credentials)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Verification Upgrade Config
REPORT_HASH_PEPPER=a-secure-random-secret-at-least-24-characters-long
DEMO_MODE=false
ENABLE_THIRD_PARTY_CHECKS=false # Disables outbound CT logs, Safe Browsing, & URL fetching by default for hackathon scope
SAFE_BROWSING_API_KEY=
CT_LOG_BASE_URL=https://crt.sh
CT_LOG_TIMEOUT_MS=5000
DNS_TIMEOUT_MS=2000
LISTING_FETCH_TIMEOUT_MS=5000
LISTING_MAX_BYTES=1000000

# Rate Limits
RATE_LIMIT_LISTING_PER_HOUR=10
RATE_LIMIT_REPORTS_PER_DAY=20
RATE_LIMIT_LOOKUP_PER_HOUR=60

# Optional Gemini AI
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
LOG_LEVEL=info
```

### Client Environment (`client/.env`)
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Migrations
In the Supabase SQL Editor, execute in sequence:
1. `/supabase/migrations/0001_init.sql`
2. `/supabase/migrations/0002_rls.sql`
3. `/supabase/migrations/0003_enums.sql`
4. `/supabase/migrations/0004_verification.sql`
5. `/supabase/migrations/0005_check_outcome.sql` (Adds `none_found` outcome value)
6. `/supabase/seed/organizations.sql` (Seeds ~40 known organizations with `needs_team_review = true` and demo organization)

---

## 5. Organization Registry & Moderator Workflows

### 5.1 Reviewing and Approving Registry Organizations
All seeded organizations are created with `needs_team_review = true` by default. Before an organization can satisfy Gate 2 of `VERIFIED_OFFICIAL`, a team member must verify its official domains and execute:
```sql
-- Approve a reviewed organization
update public.organizations
set needs_team_review = false
where lower(name) = 'tata consultancy services';
```

### 5.2 Confirming Reported Entities (Scam Database)
User reports submit entities with `status = 'reported'`. A moderator confirms an entity using the server-side salt pepper:
```bash
# 1. Compute peppered hash using CLI tool in /server
npx tsx scripts/hashEntity.ts email scammer@fake-tcs-jobs.com
# Output: Entity Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

# 2. Update status in Supabase SQL editor using service role
update public.reported_entities
set status = 'confirmed', confirmed_at = now()
where value_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
```

### 5.3 Batch Importing Confirmed Entities from CSV
Run the import script using the service-role key:
```bash
# CSV format: entity_type,value,notes
npx tsx scripts/importReported.ts /path/to/reported_scams.csv
```

---

## 6. Live Demo Walkthroughs

### Scenario A: The High-Risk Student Walkthrough (₹1,499 Registration Fee)
1. Navigate to `/analyze`.
2. Select sample **"Internship: ₹999 Security Deposit"** or paste:
   ```text
   Congratulations! You have been selected for Web Development Internship at Global Tech Solutions.
   Pay within 2 hours to confirm selection. ₹1,499 registration fee required.
   Send your Aadhaar card and bank account details for verification.
   ```
3. Expand **"Add sender details — improves verification"**:
   - Sender Email: `globaltech-hr@gmail.com`
4. Click **"Analyze Opportunity"**:
   - **Result**: `HIGH_RISK`
   - **Evidence Report**:
     - Payment Request: `FAIL` (Detected ₹1,499 registration fee - `PAY-001`)
     - Sensitive Data Request: `FAIL` (Aadhaar & bank details before onboarding - `DAT-002`)
     - Urgency Language: `FAIL` ("Pay within 2 hours" - `URG-001`)
     - Sender Domain: Personal free webmail (`@gmail.com`)
     - Official Listing: `NOT CHECKED`

### Scenario B: Evidence-Gated `VERIFIED_OFFICIAL` Demo (Using `DEMO_MODE=true`)
1. In `server/.env`, ensure `DEMO_MODE=true` is set and restart the server.
2. Navigate to `/analyze`.
3. Expand **"Add sender details — improves verification"**:
   - Organization: Select **"Example Technologies Pvt. Ltd."** (Demo)
   - Sender Email: `careers@example.com`
   - Email Headers: Paste valid headers with `Authentication-Results: dmarc=pass ... from=example.com`
   - Official Listing: Paste matching listing text:
     ```text
     Software Engineering Intern at Example Technologies Pvt. Ltd.
     Stipend: ₹25,000 per month. Duration: 3 months. Location: Remote.
     Eligibility: Final year B.Tech/B.E. Deadline: 30/11/2026.
     ```
4. In Offer Message, paste the matching offer text:
   ```text
   We are pleased to offer you the Software Engineering Intern role at Example Technologies Pvt. Ltd.
   Stipend is ₹25,000 per month for a duration of 3 months starting remotely.
   Application deadline was 30/11/2026. No fees required.
   ```
5. Click **"Analyze Opportunity"**:
   - **Result**: `VERIFIED_OFFICIAL` (Passed all 7 gates: registry approved, official corporate domain, authenticated headers, listing matched with zero discrepancies).
   - **Note**: With `DEMO_MODE=false`, this returns `NEEDS_REVIEW` because pasted listings outside demo mode are `user_attested` and registry rows default to requiring team review.

---

## 7. Testing & Quality Assurance

Run the complete test suite:
```bash
# Run all unit, integration, and security tests across workspaces
npm test

# Run regression corpus evaluation across all 20 labelled test fixtures
npm run eval

# Run strict TypeScript typechecking, secret checks, and banned phrases validation
npm run lint

# Verify zero secrets or AI SDKs in client bundle
npm run check:no-secrets

# Verify strict non-verdict compliance (reconciliation policy compliant)
npm run check:banned-phrases

# Build production distribution
npm run build
```

---

## 8. Assumptions & Operational Rules (Patch v3 & Patch v4)
- **Absence of Evidence is Not Evidence of Legitimacy**: A clean text with no scam signals cannot produce `LIKELY_GENUINE`. `LIKELY_GENUINE` strictly requires at least one positive corroborating evidence item (registry + sender domain match, authenticated headers matching registry, official listing match, or user portal attestation). Without positive evidence, status safely resolves to `NEEDS_REVIEW` with reason `insufficient_evidence`.
- **Conservative Decision Rule**: When an implementation detail is unspecified, Jaanch selects the more conservative option:
  - Text-absence checks for payment, data requests, urgency, or guarantees evaluate to `none_found` (neutral grey), never `pass` (green), with the explanatory note: *"No match found in the message text. This does not confirm the offer is genuine."*
  - Combined low-severity signals (such as `URG-004`, `MIS-007`, `MIS-003`, `DAT-006`) trigger `NEEDS_REVIEW` under `subtle_signals_pattern`.
  - When an organization is named but absent from the verified registry and no positive evidence is available, status defaults to `NEEDS_REVIEW`.
  - Prefer `unknown` / `not_run` over `pass`.
  - Prefer fewer, clearer manual steps (max 6) over long chore lists.
- **Three-Part Verification Panel Architecture (Patch v4)**:
  - **Part 1 ("Jaanch already checked")**: Compact read-only rows for automated lookups (`sender_domain_match` with reserved/placeholder detection, `reported_records`, `domain_age`, `header_authentication`, `organization_registry_match`, and registry-reviewed official site). Blocked `not_run` checks link directly to inline inputs.
  - **Part 2 ("Your turn" / "Protect yourself")**: Maximum 6 prioritized manual steps with specific verification steps, direct action buttons, and nested attestation sub-checks labeled *"Confirmed by you, not by Jaanch"*. Extras collapse into a print-expandable accordion. In `HIGH_RISK` and `CONFIRMED_SCAM`, switches to a 5-step emergency protection list with an "I already paid" toggle.
  - **Part 3 ("Stay safe" banner)**: Fixed non-dismissable standing rules banner (`role="note"`) deterministically populated based on triggered signals (`DAT-006`, `URG-*`).
- **Coverage Meter Decoupling**: Ticking manual steps in Part 2 updates checklist completion but does *not* alter verification coverage. Only automated outcomes and user attestations count toward the coverage meter. Attestations alone never satisfy `VERIFIED_OFFICIAL` gates.
- **Safe Reply Draft Injection**: The safe reply draft automatically selects contextual questions (`registration_meaning_and_fee`, `selection_process`, `more_time`, `official_domain_and_letterhead`, `data_minimization`), stays strictly under 180 words, contains no accusations or personal data disclosures, and provides deterministic fallback when AI is disabled.
- **Unreviewed Registry Protection**: Official website links are never presented from registry rows flagged with `needs_team_review = true`; only neutral web search queries are provided.
- **Zero Boilerplate Invariant**: The generic boilerplate phrase *"Complete this verification before taking further action or sharing sensitive data."* has been completely removed across the entire repository.
- **Hackathon Scope Control (`ENABLE_THIRD_PARTY_CHECKS=false`)**: Third-party outbound lookups (Certificate Transparency logs via `crt.sh`, Google Safe Browsing v4, and outbound listing URL fetching) are gated behind `ENABLE_THIRD_PARTY_CHECKS` (default `false`). When disabled, the platform operates completely offline without external network dependencies, while RDAP domain age lookups and manual listing comparisons (`user_attested`) continue to function seamlessly.
- **Unknown is Not Pass**: Any third-party service timeout or error (RDAP, CT logs, Safe Browsing, DNS) yields outcome `unknown` or `not_run`, never `pass`.
- **SSRF Immunity**: The backend strictly rejects private RFC 1918 addresses, loopbacks, link-local, and CGNAT subnets via pinned IP lookups in `safeFetch`. Outbound listing fetching is permitted *only* for registry-allowlisted domains.
- **Hashed Identifier Privacy**: The `reported_entities` table never contains cleartext phone numbers, emails, or UPI IDs. Identifiers are salted and peppered with `REPORT_HASH_PEPPER`.

---

© 2026 Team QuadCore. Digital Trust & Safety Problem Statement.
