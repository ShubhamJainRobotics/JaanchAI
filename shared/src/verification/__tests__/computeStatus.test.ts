import { describe, it, expect } from "vitest";
import { computeStatus, ComputeStatusInput } from "../computeStatus.js";
import { Organization, SenderIdentity, HeaderAnalysis, ListingComparison, CheckRow } from "../../schemas/index.js";

const demoOrg: Organization = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Example Technologies Pvt. Ltd.",
  aliases: ["Example Tech"],
  kind: "company",
  officialDomains: ["example.com"],
  careersUrl: "https://example.com/careers",
  scholarshipsUrl: null,
  isGovernment: false,
  isDemo: true,
  needsTeamReview: true,
};

const reviewedOrg: Organization = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Tata Consultancy Services",
  aliases: ["TCS"],
  kind: "company",
  officialDomains: ["tcs.com"],
  careersUrl: "https://tcs.com/careers",
  scholarshipsUrl: null,
  isGovernment: false,
  isDemo: false,
  needsTeamReview: false,
};

const validSenderIdentity: SenderIdentity = {
  rawEmail: "careers@example.com",
  displayName: "Example Careers",
  localPart: "careers",
  domain: "example.com",
  registrableDomain: "example.com",
  isFreeMail: false,
  matchesRegistryOrg: true,
  isLookalike: false,
  lookalikeDetails: null,
  phone: null,
  upiId: null,
  socialHandle: null,
  websiteUrl: null,
  recruiterName: null,
  consistencyIssue: null,
};

const validHeaderAnalysis: HeaderAnalysis = {
  from: "careers@example.com",
  replyTo: "careers@example.com",
  returnPath: "bounce@example.com",
  receivedChainCount: 2,
  firstHost: "mail.example.com",
  lastHost: "mail.example.com",
  authResults: {
    spf: "pass",
    dkim: "pass",
    dmarc: "pass",
  },
  dkimDomain: "example.com",
  alignment: {
    spf: true,
    dkim: true,
  },
  mismatches: [],
};

const validListingComparison: ListingComparison = {
  status: "match",
  sourceType: "platform_fetch",
  listingUrl: "https://example.com/careers/internship",
  organizationMatched: true,
  roleMatched: true,
  hasMismatches: false,
  matchedFieldsCount: 3,
  comparedFields: [
    { field: "organization", offerValue: "Example Technologies", listingValue: "Example Technologies", outcome: "match", detail: "Matched" },
    { field: "roleOrProgram", offerValue: "Software Intern", listingValue: "Software Intern", outcome: "match", detail: "Matched" },
    { field: "compensation", offerValue: "₹20,000", listingValue: "₹20,000", outcome: "match", detail: "Matched" },
  ],
  notes: "Core details matched",
};

const validChecks: CheckRow[] = [
  { checkKey: "sender_domain_match", label: "Sender Domain Check", outcome: "pass", detail: "Matches official corporate domain example.com", source: "registry" },
  { checkKey: "header_auth", label: "Email Authentication", outcome: "pass", detail: "SPF pass, DKIM pass, DMARC pass", source: "header_parse" },
  { checkKey: "official_listing", label: "Official Listing Match", outcome: "pass", detail: "Listing verified on official portal", source: "listing_compare" },
  { checkKey: "no_disqualifiers", label: "Hard Disqualifiers Check", outcome: "pass", detail: "Zero scam signals detected", source: "rule" },
];

describe("Status Engine: computeStatus Truth Table Tests (>= 30 cases)", () => {
  // Step 1: CONFIRMED_SCAM Tests
  describe("Step 1: CONFIRMED_SCAM", () => {
    it("Case 1: matches confirmed reported entity => CONFIRMED_SCAM immediately", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 100,
        reportedMatches: [
          { entityType: "email", valueHash: "hash1", status: "confirmed", reportCount: 5 },
        ],
      });
      expect(res.status).toBe("CONFIRMED_SCAM");
      expect(res.reasons.some((r) => r.checkKey === "reported_entity_confirmed")).toBe(true);
    });

    it("Case 2: confirmed UPI match overrides otherwise genuine-looking listing", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 200,
        reportedMatches: [
          { entityType: "upi", valueHash: "hash2", status: "confirmed", reportCount: 3 },
        ],
        matchedOrganization: reviewedOrg,
        listingComparison: validListingComparison,
      });
      expect(res.status).toBe("CONFIRMED_SCAM");
    });
  });

  // Step 2: HIGH_RISK Tests
  describe("Step 2: HIGH_RISK", () => {
    it("Case 3: hard disqualifier PAY-001 => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "PAY-001", category: "payment", severity: "critical", source: "rule", title: "Registration fee", whyItMatters: "Scam", evidenceQuote: "fee ₹999", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
      expect(res.reasons.some((r) => r.checkKey === "PAY-001")).toBe(true);
    });

    it("Case 4: hard disqualifier PAY-002 (UPI payment) => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "PAY-002", category: "payment", severity: "critical", source: "rule", title: "UPI pay", whyItMatters: "Scam", evidenceQuote: "pay via upi", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
    });

    it("Case 5: hard disqualifier PAY-006 (Crypto/Gift card) => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "PAY-006", category: "payment", severity: "critical", source: "rule", title: "Gift card", whyItMatters: "Scam", evidenceQuote: "pay with google play card", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
    });

    it("Case 6: hard disqualifier DAT-001 (OTP/UPI PIN) => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "DAT-001", category: "data_request", severity: "critical", source: "rule", title: "OTP request", whyItMatters: "Scam", evidenceQuote: "share otp", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
    });

    it("Case 7: hard disqualifier TGB-004 (Guaranteed selection) => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "TGB-004", category: "too_good_to_be_true", severity: "critical", source: "rule", title: "Guaranteed selection", whyItMatters: "Scam", evidenceQuote: "100% selection guaranteed", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
    });

    it("Case 8: hard disqualifier REC-001 (Recruit 5 friends) => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "REC-001", category: "payment", severity: "critical", source: "rule", title: "Recruit peers", whyItMatters: "Scam", evidenceQuote: "recruit 5 students", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
    });

    it("Case 9: hard disqualifier GOV-001 => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "GOV-001", category: "source_authenticity", severity: "critical", source: "rule", title: "Gov claim with fee", whyItMatters: "Scam", evidenceQuote: "PM scheme pay fee", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
    });

    it("Case 10: hard disqualifier SND-002 (lookalike domain) => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [{ ruleId: "SND-002", category: "sender_identity", severity: "critical", source: "rule", title: "Lookalike domain", whyItMatters: "Scam", evidenceQuote: "micros0ft-careers.com", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
    });

    it("Case 11: reported entity with status = 'reported' (count >= 1) => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 100,
        reportedMatches: [
          { entityType: "email", valueHash: "hash-rep", status: "reported", reportCount: 2 },
        ],
      });
      expect(res.status).toBe("HIGH_RISK");
      expect(res.reasons.some((r) => r.checkKey === "reported_entity_reported")).toBe(true);
    });

    it("Case 12: senderIdentity marked as lookalike => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 100,
        senderIdentity: {
          ...validSenderIdentity,
          isLookalike: true,
          lookalikeDetails: "Domain mimics Amazon",
        },
      });
      expect(res.status).toBe("HIGH_RISK");
      expect(res.reasons.some((r) => r.checkKey === "sender_domain_lookalike")).toBe(true);
    });

    it("Case 13: cumulative rule score >= 50 => HIGH_RISK", () => {
      const res = computeStatus({
        signals: [
          { ruleId: "URG-001", category: "urgency", severity: "high", source: "rule", title: "Urgent", whyItMatters: "Time pressure", evidenceQuote: "2 hours" },
          { ruleId: "MIS-003", category: "missing_details", severity: "high", source: "rule", title: "No interview", whyItMatters: "Suspicious", evidenceQuote: "Direct selection" },
        ],
        ruleScore: 50,
        textLength: 100,
      });
      expect(res.status).toBe("HIGH_RISK");
      expect(res.reasons.some((r) => r.checkKey === "rule_score_high")).toBe(true);
    });
  });

  // Step 3: VERIFIED_OFFICIAL Tests
  describe("Step 3: VERIFIED_OFFICIAL and Gate Failure Tests", () => {
    it("Case 14: All 7 gates satisfied in DEMO_MODE for demo org => VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: demoOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: {
          ...validListingComparison,
          sourceType: "pasted_text", // allowed in demo mode for demo org
        },
        checks: validChecks,
        isDemoMode: true,
      });
      expect(res.status).toBe("VERIFIED_OFFICIAL");
      expect(res.reasons.some((r) => r.checkKey === "verified_all_gates_passed")).toBe(true);
    });

    it("Case 15: All 7 gates satisfied for team-reviewed org with platform_fetch => VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: {
          ...validSenderIdentity,
          rawEmail: "careers@tcs.com",
          domain: "tcs.com",
          registrableDomain: "tcs.com",
        },
        headerAnalysis: {
          ...validHeaderAnalysis,
          from: "careers@tcs.com",
          dkimDomain: "tcs.com",
        },
        listingComparison: validListingComparison,
        checks: validChecks,
        isDemoMode: false,
      });
      expect(res.status).toBe("VERIFIED_OFFICIAL");
    });

    // Gate 1 failure: hard disqualifier present
    it("Case 16 (Gate 1 fail): hard disqualifier present prevents VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [{ ruleId: "PAY-001", category: "payment", severity: "critical", source: "rule", title: "Fee", whyItMatters: "Bad", evidenceQuote: "fee", hardDisqualifier: true }],
        ruleScore: 40,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: validListingComparison,
        checks: validChecks,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
      expect(res.status).toBe("HIGH_RISK");
    });

    // Gate 2 failure: organization needs_team_review = true outside demo mode
    it("Case 17 (Gate 2 fail): unreviewed registry row outside demo mode prevents VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: demoOrg, // needsTeamReview: true
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: validListingComparison,
        checks: validChecks,
        isDemoMode: false, // NOT demo mode
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
      expect(res.status).toBe("NEEDS_REVIEW");
    });

    // Gate 3 failure: sender domain does not match organization official_domains
    it("Case 18 (Gate 3 fail): sender domain mismatch with registry org official domains", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: reviewedOrg, // tcs.com
        senderIdentity: {
          ...validSenderIdentity,
          domain: "tcs-hiring.com", // mismatch
        },
        headerAnalysis: validHeaderAnalysis,
        listingComparison: validListingComparison,
        checks: validChecks,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
      expect(res.status).toBe("NEEDS_REVIEW");
    });

    // Gate 4 failure: email headers not supplied
    it("Case 19 (Gate 4 fail): headers not supplied prevents VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: null, // no headers
        listingComparison: validListingComparison,
        checks: validChecks,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
    });

    // Gate 4 failure: header authentication failed
    it("Case 20 (Gate 4 fail): dmarc=fail and spf=fail prevents VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: {
          ...validHeaderAnalysis,
          authResults: { spf: "fail", dkim: "fail", dmarc: "fail" },
        },
        listingComparison: validListingComparison,
        checks: validChecks,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
      expect(res.status).toBe("NEEDS_REVIEW");
    });

    // Gate 5 failure: listing not platform-fetched outside demo mode
    it("Case 21 (Gate 5 fail): pasted listing outside demo mode cannot satisfy Gate 5", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: {
          ...validListingComparison,
          sourceType: "pasted_text", // pasted, not platform_fetch
        },
        checks: validChecks,
        isDemoMode: false,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
      expect(res.status).toBe("NEEDS_REVIEW");
    });

    // Gate 5 failure: listing has field mismatches
    it("Case 22 (Gate 5 fail): listing comparison with mismatches fails Gate 5", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: {
          ...validListingComparison,
          hasMismatches: true,
          status: "mismatch",
        },
        checks: validChecks,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
      expect(res.status).toBe("NEEDS_REVIEW");
    });

    // Gate 6 failure: presence of medium severity signal
    it("Case 23 (Gate 6 fail): medium severity signal (e.g. MIS-002) prevents VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [{ ruleId: "MIS-002", category: "missing_details", severity: "medium", source: "rule", title: "Vague role", whyItMatters: "Details missing", evidenceQuote: "intern" }],
        ruleScore: 12,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: validListingComparison,
        checks: validChecks,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
      expect(res.status).toBe("NEEDS_REVIEW");
    });

    // Gate 6 failure: presence of low payment signal
    it("Case 24 (Gate 6 fail): presence of low severity payment signal prevents VERIFIED_OFFICIAL", () => {
      const res = computeStatus({
        signals: [{ ruleId: "PAY-LOW", category: "payment", severity: "low", source: "rule", title: "Payment question", whyItMatters: "Payment category", evidenceQuote: "pay note" }],
        ruleScore: 5,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: validListingComparison,
        checks: validChecks,
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
    });

    // Gate 7 failure: missing persisted check rows
    it("Case 25 (Gate 7 fail): checks array empty fails Gate 7", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 150,
        matchedOrganization: reviewedOrg,
        senderIdentity: validSenderIdentity,
        headerAnalysis: validHeaderAnalysis,
        listingComparison: validListingComparison,
        checks: [], // no checks
      });
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
    });
  });

  // Step 4: NEEDS_REVIEW Tests
  describe("Step 4: NEEDS_REVIEW", () => {
    it("Case 26: sender uses personal free mail provider => NEEDS_REVIEW", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 100,
        senderIdentity: {
          ...validSenderIdentity,
          isFreeMail: true,
          domain: "gmail.com",
        },
      });
      expect(res.status).toBe("NEEDS_REVIEW");
      expect(res.reasons.some((r) => r.checkKey === "sender_free_email")).toBe(true);
    });

    it("Case 27: completeness has 3 or more missing required details => NEEDS_REVIEW", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 100,
        completeness: {
          present: ["Organization name", "Role title"],
          missing: ["Eligibility criteria", "Compensation", "Deadline", "Duration"],
          score: 2,
        },
      });
      expect(res.status).toBe("NEEDS_REVIEW");
      expect(res.reasons.some((r) => r.checkKey === "completeness_deficient")).toBe(true);
    });

    it("Case 28: message shorter than 40 characters => NEEDS_REVIEW", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 25,
      });
      expect(res.status).toBe("NEEDS_REVIEW");
      expect(res.reasons.some((r) => r.checkKey === "text_too_short")).toBe(true);
    });

    it("Case 29: rule score between 15 and 49 => NEEDS_REVIEW", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 24,
        textLength: 80,
      });
      expect(res.status).toBe("NEEDS_REVIEW");
      expect(res.reasons.some((r) => r.checkKey === "rule_score_moderate")).toBe(true);
    });
  });

  // Step 5: LIKELY_GENUINE & Insufficient Evidence Tests
  describe("Step 5: LIKELY_GENUINE & Insufficient Evidence", () => {
    it("Case 30: clean text, no scam indicators, NO positive evidence => NEEDS_REVIEW with insufficient_evidence", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 120,
      });
      expect(res.status).toBe("NEEDS_REVIEW");
      expect(res.reasons.some((r) => r.checkKey === "insufficient_evidence")).toBe(true);
      expect(res.reasons[0].detail).toContain(
        "No scam indicators were found, but nothing about the sender or organization could be verified yet."
      );
    });

    it("Case 31: Positive Evidence Type 1 (registry + sender domain match) => LIKELY_GENUINE", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 120,
        matchedOrganization: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Infosys Limited",
          aliases: [],
          kind: "company",
          officialDomains: ["infosys.com"],
          careersUrl: "https://career.infosys.com",
          scholarshipsUrl: null,
          isGovernment: false,
          isDemo: false,
          needsTeamReview: false,
        },
        senderIdentity: {
          rawEmail: "careers@infosys.com",
          domain: "infosys.com",
          displayName: "Infosys Recruitment",
          localPart: "careers",
          registrableDomain: "infosys.com",
          isFreeMail: false,
          isLookalike: false,
          lookalikeDetails: null,
          matchesRegistryOrg: true,
          phone: null,
          upiId: null,
          socialHandle: null,
          websiteUrl: null,
          recruiterName: null,
          consistencyIssue: null,
        },
      });
      expect(res.status).toBe("LIKELY_GENUINE");
      expect(res.reasons.some((r) => r.checkKey === "positive_evidence_verified")).toBe(true);
    });

    it("Case 32: Positive Evidence Type 2 (authenticated headers) => LIKELY_GENUINE", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 120,
        matchedOrganization: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Tata Consultancy Services",
          aliases: [],
          kind: "company",
          officialDomains: ["tcs.com"],
          careersUrl: null,
          scholarshipsUrl: null,
          isGovernment: false,
          isDemo: false,
          needsTeamReview: false,
        },
        headerAnalysis: {
          from: "hr@tcs.com",
          replyTo: null,
          returnPath: "hr@tcs.com",
          receivedChainCount: 3,
          firstHost: "mail.tcs.com",
          lastHost: "inbound.mx.com",
          authResults: {
            spf: "pass",
            dkim: "pass",
            dmarc: "pass",
          },
          dkimDomain: "tcs.com",
          alignment: {
            spf: true,
            dkim: true,
          },
          mismatches: [],
          dnsPolicy: undefined,
        },
      });
      expect(res.status).toBe("LIKELY_GENUINE");
    });

    it("Case 33: Positive Evidence Type 3 (official listing match) => LIKELY_GENUINE", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 120,
        listingComparison: {
          status: "match",
          sourceType: "platform_fetch",
          listingUrl: "https://careers.google.com/jobs/123",
          organizationMatched: true,
          roleMatched: true,
          hasMismatches: false,
          matchedFieldsCount: 2,
          comparedFields: [
            { field: "organization", offerValue: "Google", listingValue: "Google", outcome: "match", detail: "matches" },
            { field: "role", offerValue: "SWE Intern", listingValue: "SWE Intern", outcome: "match", detail: "matches" },
          ],
          notes: null,
        },
      });
      expect(res.status).toBe("LIKELY_GENUINE");
    });

    it("Case 34: Positive Evidence Type 4 (user attested found on official portal) => LIKELY_GENUINE (never Verified)", () => {
      const res = computeStatus({
        signals: [],
        ruleScore: 0,
        textLength: 120,
        checks: [
          {
            checkKey: "found_on_official_site",
            label: "Found on official site",
            outcome: "user_attested",
            detail: "Confirmed by you",
            source: "user_attested",
          },
        ],
      });
      expect(res.status).toBe("LIKELY_GENUINE");
      expect(res.status).not.toBe("VERIFIED_OFFICIAL");
    });

    it("Case 35: Combined subtle low signals (2+ of URG-004, MIS-007, MIS-003, DAT-006) => NEEDS_REVIEW", () => {
      const res = computeStatus({
        signals: [
          {
            ruleId: "URG-004",
            category: "urgency",
            severity: "low",
            source: "rule",
            title: "Short deadline",
            whyItMatters: "Urgency",
            evidenceQuote: "within 48 hours",
          },
          {
            ruleId: "MIS-007",
            category: "missing_details",
            severity: "low",
            source: "rule",
            title: "Undefined registration",
            whyItMatters: "Registration",
            evidenceQuote: "after registration",
          },
        ],
        ruleScore: 10,
        textLength: 120,
      });
      expect(res.status).toBe("NEEDS_REVIEW");
      expect(res.reasons.some((r) => r.checkKey === "subtle_signals_pattern")).toBe(true);
    });

    it("Case 36: Nexora test scenario produces strictly NEEDS_REVIEW", () => {
      const res = computeStatus({
        signals: [
          {
            ruleId: "MIS-004",
            category: "missing_details",
            severity: "low",
            source: "rule",
            title: "Generic greeting",
            whyItMatters: "Impersonal greeting",
            evidenceQuote: "Dear Candidate",
          },
          {
            ruleId: "URG-004",
            category: "urgency",
            severity: "low",
            source: "rule",
            title: "Short deadline",
            whyItMatters: "Legitimate employers allow time to verify",
            evidenceQuote: "within 48 hours",
          },
          {
            ruleId: "MIS-003",
            category: "missing_details",
            severity: "low",
            source: "rule",
            title: "Shortlisted without evaluation",
            whyItMatters: "No formal evaluation described",
            evidenceQuote: "Congratulations",
          },
          {
            ruleId: "MIS-007",
            category: "missing_details",
            severity: "low",
            source: "rule",
            title: "Undefined registration",
            whyItMatters: "Ask what it involves",
            evidenceQuote: "after registration",
          },
          {
            ruleId: "DAT-006",
            category: "data_request",
            severity: "low",
            source: "rule",
            title: "Personal data bundle",
            whyItMatters: "Personal details before verification",
            evidenceQuote: "Full name as per official records",
          },
          {
            ruleId: "SND-006",
            category: "sender_identity",
            severity: "info",
            source: "rule",
            title: "Reserved domain",
            whyItMatters: "Domain is reserved",
            evidenceQuote: "nexora-example.invalid",
          },
        ],
        ruleScore: 25,
        textLength: 1200,
        completeness: {
          present: [
            "Organization name",
            "Role or program title",
            "Location or work mode",
            "Duration or event date",
            "Stipend, salary, or prize details",
            "Official contact channel",
          ],
          missing: [
            "Eligibility criteria",
            "Selection and evaluation process",
            "Application deadline",
            "Official website or application link",
          ],
          score: 6,
        },
      });

      expect(res.status).toBe("NEEDS_REVIEW");
      expect(res.reasons.some((r) => r.checkKey === "subtle_signals_pattern")).toBe(true);
      expect(res.reasons.some((r) => r.checkKey === "org_unregistered_no_evidence")).toBe(true);
    });
  });

  // Invariant Tests
  describe("Invariant Property Tests", () => {
    it("Case 37 (Invariant): Message text alone can NEVER produce VERIFIED_OFFICIAL or LIKELY_GENUINE", () => {
      const randomTexts = [
        "We are pleased to offer you a summer internship at Google India. Stipend is ₹50,000 per month.",
        "Official confirmation from TCS recruitment team. Reporting date is July 1st.",
        "National Scholarship grant award notification for meritorious students.",
      ];

      for (const text of randomTexts) {
        const res = computeStatus({
          signals: [],
          ruleScore: 0,
          textLength: text.length,
          // No registry match, no headers, no official listing, no user attestation
        });
        expect(res.status).not.toBe("VERIFIED_OFFICIAL");
        expect(res.status).not.toBe("LIKELY_GENUINE");
        expect(res.status).toBe("NEEDS_REVIEW");
      }
    });
  });
});

