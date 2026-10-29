import { describe, it, expect } from "vitest";
import { formatQuote, signalSourceLabel, humanizeReason, safeText } from "../format.js";
import { lookupReasonCopy, REASON_COPY } from "../../config/reasonCopy.js";
import { buildReportViewModel } from "../buildReportViewModel.js";
import { AnalysisResult } from "../../schemas/index.js";

function createMockResult(overrides?: Partial<AnalysisResult>): AnalysisResult {
  return {
    id: "test-analysis-1234",
    saved: true,
    domain: "internship",
    status: "NEEDS_REVIEW",
    reasons: [
      {
        checkKey: "org_unregistered_no_evidence",
        effect: "NEEDS_REVIEW",
        detail: "Organization name is mentioned but not in registry.",
      },
      {
        checkKey: "rule_score_moderate",
        effect: "NEEDS_REVIEW",
        detail: "Scam indicator score reached 25 (threshold is >= 15).",
      },
    ],
    ruleScore: 25,
    summary: "Needs review based on independent evidence gaps.",
    signals: [
      {
        ruleId: "MIS-004",
        category: "missing_details",
        severity: "low",
        source: "rule",
        title: "Missing selection criteria",
        whyItMatters: "Legitimate programs define selection criteria.",
        evidenceQuote: "initial review",
      },
      {
        ruleId: "AI-PAY-01",
        category: "payment",
        severity: "high",
        source: "ai",
        title: "Requested training deposit",
        whyItMatters: "Genuine internships do not ask candidates to pay for training.",
        evidenceQuote: "re Intern role at Microsoft India. To begin onboarding, please purchas",
      },
    ],
    checks: [
      {
        checkKey: "organization_registry_match",
        label: "Organization Registry Verification",
        outcome: "unknown",
        detail: "Claimed organization not found in registry.",
        source: "registry",
      },
      {
        checkKey: "sender_domain_match",
        label: "Sender Domain Legitimacy",
        outcome: "unknown",
        detail: "Domain does not match verified records.",
        source: "rule",
      },
      {
        checkKey: "payment_request",
        label: "Payment Request Check",
        outcome: "fail",
        detail: "Deposit of ₹2,500 requested.",
        source: "rule",
      },
      {
        checkKey: "header_authentication",
        label: "Email Header Authentication",
        outcome: "not_run",
        detail: "Headers not supplied",
        source: "header_parse",
      },
      {
        checkKey: "official_listing",
        label: "Official Listing Comparison",
        outcome: "not_run",
        detail: "Listing not provided",
        source: "listing_compare",
      },
    ],
    extractedFields: {
      organization: {
        value: "Acme Tech Solutions Pvt. Ltd.",
        evidenceQuote: "Acme Tech Solutions Pvt. Ltd.",
        source: "rule",
      },
      roleOrProgram: {
        value: "Full-Stack Developer Intern",
        evidenceQuote: "Full-Stack Developer Intern",
        source: "rule",
      },
      eligibility: {
        value: "Eligibility: Final-year B.E./B.Tech students",
        evidenceQuote: "Eligibility: Final-year B.E./B.Tech",
        source: "rule",
      },
      locationOrMode: { value: "Remote / Bengaluru", evidenceQuote: "Remote / Bengaluru", source: "rule" },
      duration: { value: "6 months", evidenceQuote: "6 months", source: "rule" },
      compensation: {
        value: { kind: "stipend", raw: "₹25,000 per month", amountInr: 25000, period: "month" },
        evidenceQuote: "stipend of ₹25,000 per month",
        source: "rule",
      },
      selectionProcess: null,
      deadline: null,
      contactChannel: { value: "hr@acme-example.com", evidenceQuote: "hr@acme-example.com", source: "rule" },
      officialLink: null,
    },
    completeness: {
      score: 7,
      present: ["organization", "role", "eligibility", "location", "duration", "compensation", "contactChannel"],
      missing: ["selectionProcess", "deadline", "officialLink"],
      details: [
        { key: "selectionProcess", label: "Selection Process", present: false, reason: "No interview or screening rounds described." },
        { key: "deadline", label: "Deadline", present: false, reason: "No application deadline provided." },
        { key: "officialLink", label: "Official Link", present: false, reason: "No official portal link provided." },
      ],
    },
    senderIdentity: {
      rawEmail: "hr@acme-example.com",
      domain: "acme-example.com",
      displayName: "Acme Careers",
      localPart: "hr",
      registrableDomain: "acme-example.com",
      isFreeMail: false,
      isLookalike: false,
      matchesRegistryOrg: false,
      recruiterName: null,
      phone: null,
      upiId: null,
      socialHandle: null,
      websiteUrl: null,
      lookalikeDetails: null,
      consistencyIssue: null,
    },
    unknowns: [
      { item: "Sender email domain", howToVerify: "Check official website." },
    ],
    checklist: [
      { position: 0, label: "Search organization website", portalKey: null, completed: false },
    ],
    links: [],
    reportGuidance: { show: false, helpline: "1930", portalUrl: "https://cybercrime.gov.in", keepAsEvidence: [] },
    aiUsed: true,
    aiStatus: "ok",
    textOnlyConfidence: null,
    durationMs: 45,
    reportedMatches: [],
    disclaimer: "Jaanch supports informed decisions.",
    createdAt: "2026-10-28T10:00:00.000Z",
    paymentAlert: false,
    inputNotices: [],
    ...overrides,
  };
}

describe("formatQuote", () => {
  it("1. handles null, undefined, and empty string safely", () => {
    expect(formatQuote(null)).toBe("");
    expect(formatQuote(undefined)).toBe("");
    expect(formatQuote("   ")).toBe("");
  });

  it("2. collapses multi-line whitespace and tabs into a single space", () => {
    const raw = "Offer for   software   engineer\n\ninternship\tat Bengaluru.";
    expect(formatQuote(raw)).toBe("Offer for software engineer internship at Bengaluru.");
  });

  it("3. trims mid-word fragment at start with ellipsis prefix", () => {
    const cut = "re Intern role at Microsoft India. To begin onboarding";
    const formatted = formatQuote(cut);
    expect(formatted.startsWith("…Intern role")).toBe(true);
    expect(formatted).not.toMatch(/^re\b/);
  });

  it("4. trims mid-word fragment 'es of ₹2,350' at start cleanly", () => {
    const cut = "es of ₹2,350 at www.example.com";
    const formatted = formatQuote(cut);
    expect(formatted.startsWith("…of ₹2,350")).toBe(true);
  });

  it("5. preserves valid short English prepositions at start without adding ellipsis", () => {
    expect(formatQuote("in Bengaluru for 3 months")).toBe("in Bengaluru for 3 months");
    expect(formatQuote("at Microsoft India")).toBe("at Microsoft India");
    expect(formatQuote("to apply send resume")).toBe("to apply send resume");
    expect(formatQuote("for final year students")).toBe("for final year students");
  });

  it("6. cleans trailing dangling single letter cut mid-word", () => {
    const cut = "Eligibility: Final-year B";
    const formatted = formatQuote(cut);
    expect(formatted).toBe("Eligibility: Final-year…");
  });

  it("7. never splits inside protected abbreviation B.E./B.Tech", () => {
    // Construct a quote where maxLen would land right in the middle of B.E./B.Tech
    const prefix = "Candidates must hold an accredited degree such as ";
    const quote = prefix + "B.E./B.Tech in Computer Science or Information Technology.";
    const formatted = formatQuote(quote, prefix.length + 5); // cut lands inside B.E./B.Tech
    // Must back up to before B.E./B.Tech
    expect(formatted).not.toContain("B.E./");
    expect(formatted).not.toContain("B.E");
    expect(formatted.endsWith("…")).toBe(true);
    expect(formatted.length).toBeLessThanOrEqual(prefix.length + 5);
  });

  it("8. never splits inside protected abbreviation Pvt. Ltd.", () => {
    const prefix = "Contract agreement executed with Acme Global Services ";
    const quote = prefix + "Pvt. Ltd. registered in Bengaluru Karnataka.";
    const formatted = formatQuote(quote, prefix.length + 6);
    expect(formatted).not.toContain("Pvt.");
    expect(formatted.endsWith("…")).toBe(true);
    expect(formatted.length).toBeLessThanOrEqual(prefix.length + 6);
  });

  it("9. preserves ₹ currency symbol and Hindi / Devanagari script intact", () => {
    const quote = "कुल वजीफा ₹15,000 प्रति माह दिया जाएगा।";
    const formatted = formatQuote(quote, 100);
    expect(formatted).toContain("₹15,000");
    expect(formatted).toContain("कुल वजीफा");
  });

  it("10. cuts long text strictly at word boundary without exceeding maxLen", () => {
    const longQuote =
      "This is a very long verification quote explaining in extreme detail why a certain candidate was selected for an outstanding opportunity without any upfront fees.";
    const formatted = formatQuote(longQuote, 60);
    expect(formatted.length).toBeLessThanOrEqual(60);
    expect(formatted.endsWith("…")).toBe(true);
    expect(formatted).not.toMatch(/\s…$/); // no stray space before ellipsis
  });
});

describe("signalSourceLabel", () => {
  it("11. returns 'Rule' for standard rule signals", () => {
    expect(signalSourceLabel({ source: "rule", ruleId: "PAY-001" })).toBe("Rule");
    expect(signalSourceLabel({ source: "header_parse", ruleId: "HDR-001" })).toBe("Rule");
  });

  it("12. returns 'AI-observed' for source='ai' or ruleId starting with AI-", () => {
    expect(signalSourceLabel({ source: "ai", ruleId: "AI-PAY-01" })).toBe("AI-observed");
    expect(signalSourceLabel({ source: "rule", ruleId: "AI-TOO-02" })).toBe("AI-observed");
    expect(signalSourceLabel({ source: "ai" })).toBe("AI-observed");
  });
});

describe("humanizeReason and lookupReasonCopy", () => {
  it("13. translates known reason keys to polite sentences", () => {
    expect(humanizeReason("org_unregistered_no_evidence")).toBe(
      REASON_COPY.org_unregistered_no_evidence
    );
    expect(humanizeReason("sender_free_email")).toBe(REASON_COPY.sender_free_email);
    expect(humanizeReason("reported_entity_confirmed")).toBe(
      REASON_COPY.reported_entity_confirmed
    );
  });

  it("14. strips internal numeric rule scores from details", () => {
    const high = humanizeReason({
      checkKey: "rule_score_high",
      detail: "Cumulative scam indicator score reached 55 (threshold is >= 50).",
    });
    expect(high).not.toContain("score reached 55");
    expect(high).not.toContain("threshold");

    const mod = humanizeReason({
      checkKey: "rule_score_moderate",
      detail: "Scam indicator score reached 20 (threshold is >= 15).",
    });
    expect(mod).not.toContain("score reached 20");
  });

  it("15. falls back to student-accessible sentence for unknown check keys, never the raw key", () => {
    const unknown = humanizeReason("some_completely_unseen_custom_key");
    expect(unknown).not.toContain("some_completely_unseen_custom_key");
    expect(unknown).not.toContain("_");
    expect(unknown.length).toBeGreaterThan(15);
  });
});

describe("safeText", () => {
  it("16. returns fallback for null, undefined, empty, or string literals of null/undefined", () => {
    expect(safeText(null)).toBe("—");
    expect(safeText(undefined)).toBe("—");
    expect(safeText("")).toBe("—");
    expect(safeText("null")).toBe("—");
    expect(safeText("undefined")).toBe("—");
    expect(safeText("[object Object]")).toBe("—");
    expect(safeText({})).toBe("—");
  });

  it("17. returns string value for valid text and numbers", () => {
    expect(safeText("Microsoft India")).toBe("Microsoft India");
    expect(safeText(42)).toBe("42");
    expect(safeText(true)).toBe("true");
  });
});

describe("buildReportViewModel", () => {
  it("18. produces complete view model with expected metadata and no undefined values", () => {
    const mock = createMockResult();
    const vm = buildReportViewModel(mock);

    expect(vm.reportId).toBe("test-analysis-1234");
    expect(vm.status).toBe("NEEDS_REVIEW");
    expect(vm.statusLabel).toBe("Needs Review");
    expect(vm.statusMeaning.length).toBeGreaterThan(10);
    expect(vm.domainLabel).toBe("Internship");
    expect(vm.claimedOrg).toBe("Acme Tech Solutions Pvt. Ltd.");
    expect(vm.aiUsed).toBe(true);
    expect(vm.disclaimer).toContain("Jaanch supports informed decisions");

    // Assert no banned raw tokens exist anywhere in JSON representation
    const json = JSON.stringify(vm);
    expect(json).not.toContain("undefined");
    expect(json).not.toContain("[object Object]");
    expect(json).not.toContain("AI-PAY");
    expect(json).not.toContain("AI-TOO");
    expect(json).not.toContain("org_unregistered_no_evidence");
  });

  it("19. de-duplicates and orders checks into canonical sequence", () => {
    const mock = createMockResult();
    const vm = buildReportViewModel(mock);

    const keys = vm.checks.map((c) => c.checkKey);

    // Verify sender_domain_match appears before organization_registry_match
    const senderIdx = keys.indexOf("sender_domain_match");
    const orgIdx = keys.indexOf("organization_registry_match");
    const payIdx = keys.indexOf("payment_request");

    expect(senderIdx).toBeGreaterThanOrEqual(0);
    expect(orgIdx).toBeGreaterThan(senderIdx);
    expect(payIdx).toBeGreaterThan(orgIdx);

    // No duplicate keys
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("20. collapses 'not_run' checks into notRunInputs and notRunSummary line", () => {
    const mock = createMockResult();
    const vm = buildReportViewModel(mock);

    // header_authentication and official_listing had outcome 'not_run'
    expect(vm.checks.some((c) => c.checkKey === "header_authentication")).toBe(false);
    expect(vm.checks.some((c) => c.checkKey === "official_listing")).toBe(false);

    expect(vm.notRunInputs).toContain("email headers");
    expect(vm.notRunInputs).toContain("official listing");
    expect(vm.notRunSummary).toContain("Not run (add details to run these):");
    expect(vm.notRunSummary).toContain("email headers");
    expect(vm.notRunSummary).toContain("official listing");
  });

  it("21. maps all 10 offer completeness attributes with status and sanitized quotes", () => {
    const mock = createMockResult();
    const vm = buildReportViewModel(mock);

    expect(vm.offerDetails.length).toBe(10);
    const orgDetail = vm.offerDetails.find((d) => d.key === "organization");
    expect(orgDetail?.status).toBe("Found");
    expect(orgDetail?.quoteOrReason).toBe("Acme Tech Solutions Pvt. Ltd.");

    const compDetail = vm.offerDetails.find((d) => d.key === "compensation");
    expect(compDetail?.status).toBe("Found");
    expect(compDetail?.quoteOrReason).toContain("₹25,000");

    const selDetail = vm.offerDetails.find((d) => d.key === "selectionProcess");
    expect(selDetail?.status).toBe("Missing");
    expect(selDetail?.quoteOrReason).toBe("No interview or screening rounds described.");
  });

  it("22. high-risk results trigger critical alert box, helpline strip, and omit draft reply", () => {
    const highRiskMock = createMockResult({
      status: "HIGH_RISK",
      reasons: [
        {
          checkKey: "PAY-001",
          effect: "HIGH_RISK",
          detail: "Triggered hard disqualifier rule [PAY-001]: Upfront fee requested.",
        },
      ],
    });

    const vm = buildReportViewModel(highRiskMock, {
      draftReply: { subject: "Question regarding offer", body: "Please confirm..." },
    });

    expect(vm.status).toBe("HIGH_RISK");
    expect(vm.alert.type).toBe("critical");
    expect(vm.alert.body).toContain("1930");
    expect(vm.alert.body).toContain("cybercrime.gov.in");

    // Draft reply must be omitted for high risk
    expect(vm.draftReply).toBeNull();

    // Helpline strip must be populated
    expect(vm.helplineStrip).not.toBeNull();
    expect(vm.helplineStrip?.helpline).toBe("1930");

    // Protect yourself steps must not duplicate titles in instruction
    for (const step of vm.nextSteps) {
      expect(step.isHighRisk).toBe(true);
      expect(step.instruction).not.toBe(step.title);
    }
  });

  it("23. standard results include draft reply when supplied and standing rules alert", () => {
    const standardMock = createMockResult({
      status: "NEEDS_REVIEW",
      signals: [
        {
          ruleId: "MIS-004",
          category: "missing_details",
          severity: "low",
          source: "rule",
          title: "Missing selection criteria",
          whyItMatters: "Standard program review",
          evidenceQuote: "initial screening",
        },
      ],
    });

    const vm = buildReportViewModel(standardMock, {
      draftReply: { subject: "Inquiry regarding internship", body: "Could you please clarify..." },
    });

    expect(vm.alert.type).toBe("standing");
    expect(vm.draftReply).not.toBeNull();
    expect(vm.draftReply?.subject).toBe("Inquiry regarding internship");
    expect(vm.helplineStrip).toBeNull();
  });

  it("24. message excerpt is included only when explicitly opted in and is PII redacted", () => {
    const textWithPII =
      "Hello, please reach out to me at rahul.verma@example.com or WhatsApp +91 9876543210 regarding the interview.";
    const mock = createMockResult({
      rawText: textWithPII,
    } as any);

    // Default: off
    const vmOff = buildReportViewModel(mock, { includeMessageText: false });
    expect(vmOff.messageExcerpt).toBeNull();

    // Opted in: on with PII redaction
    const vmOn = buildReportViewModel(mock, { includeMessageText: true });
    expect(vmOn.messageExcerpt).not.toBeNull();
    expect(vmOn.messageExcerpt).not.toContain("rahul.verma@example.com");
    expect(vmOn.messageExcerpt).not.toContain("9876543210");
    expect(vmOn.messageExcerpt).toContain("[EMAIL]");
    expect(vmOn.messageExcerpt).toContain("[PHONE]");
  });
});
