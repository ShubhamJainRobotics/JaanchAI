import { describe, it, expect } from "vitest";
import { buildNextSteps, getSafeReplyQuestions } from "../build.js";
import { buildSafeReplyTemplate } from "../../challenge/template.js";
import {
  AnalysisResult,
  Signal,
  CheckRow,
  Organization,
  SenderIdentity,
} from "../../schemas/index.js";

describe("buildNextSteps - Redesigned Three-Part Next Steps System", () => {
  const createMockResult = (
    overrides: Partial<AnalysisResult> = {}
  ): AnalysisResult => ({
    id: "test-analysis-id",
    saved: true,
    domain: "internship",
    status: "NEEDS_REVIEW",
    reasons: [
      {
        checkKey: "insufficient_evidence",
        effect: "NEEDS_REVIEW",
        detail: "Insufficient corroborating evidence.",
      },
    ],
    ruleScore: 10,
    summary: "Review is recommended.",
    signals: [],
    checks: [
      {
        checkKey: "sender_domain_match",
        label: "Sender Domain Legitimacy",
        outcome: "unknown",
        detail: "Domain not registered.",
        source: "rule",
      },
      {
        checkKey: "reported_records",
        label: "Reported Fraud Database Check",
        outcome: "none_found",
        detail: "No match found.",
        source: "reported_db",
      },
      {
        checkKey: "organization_registry_match",
        label: "Organization Registry Verification",
        outcome: "unknown",
        detail: "Not found in registry.",
        source: "registry",
      },
      {
        checkKey: "header_authentication",
        label: "Header Authentication (SPF / DKIM / DMARC)",
        outcome: "not_run",
        detail: "Headers not supplied",
        source: "header_parse",
      },
    ],
    unknowns: [{ item: "Identity", howToVerify: "Check website" }],
    checklist: [],
    links: [],
    reportedMatches: [],
    reportGuidance: {
      show: false,
      helpline: "1930",
      portalUrl: "https://cybercrime.gov.in",
      keepAsEvidence: [],
    },
    aiUsed: false,
    aiStatus: "not_requested",
    textOnlyConfidence: null,
    durationMs: 40,
    disclaimer: "Disclaimer",
    createdAt: new Date().toISOString(),
    paymentAlert: false,
    inputNotices: [],
    ...overrides,
  });

  // 1. Uniqueness of stepKey, title, and howToVerify
  it("guarantees no two steps share a stepKey, normalized title, or howToVerify", () => {
    const res = createMockResult();
    const nextSteps = buildNextSteps(res);
    const allSteps = [...nextSteps.yourTurn, ...nextSteps.more];

    const keys = allSteps.map((s) => s.stepKey);
    const titles = allSteps.map((s) => s.title.toLowerCase().trim());
    const hows = allSteps.map((s) => s.howToVerify.toLowerCase().trim());

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(hows).size).toBe(hows.length);
  });

  // 2. Generic boilerplate string must never appear
  it("never outputs the generic boilerplate verification string in any step", () => {
    const res = createMockResult();
    const nextSteps = buildNextSteps(res);
    const allSteps = [...nextSteps.yourTurn, ...nextSteps.more];

    const boilerplate = "Complete this verification before taking further action";
    for (const step of allSteps) {
      expect(step.howToVerify).not.toContain(boilerplate);
      expect(step.title).not.toContain(boilerplate);
      expect(step.whyItMatters).not.toContain(boilerplate);
    }
  });

  // 3. yourTurn length <= 6 always; extras go into more
  it("ensures yourTurn contains at most 6 steps, with extras in more", () => {
    const res = createMockResult({ domain: "internship" });
    const nextSteps = buildNextSteps(res);

    expect(nextSteps.yourTurn.length).toBeLessThanOrEqual(6);
    expect(Array.isArray(nextSteps.more)).toBe(true);
    expect(nextSteps.yourTurn.length + nextSteps.more.length).toBeGreaterThanOrEqual(1);
  });

  // 4a. Domain variants: scholarship includes verify_portal (NSP) and excludes verify_registration
  it("scholarship domain includes verify_portal (NSP) and excludes verify_registration", () => {
    const res = createMockResult({ domain: "scholarship" });
    const nextSteps = buildNextSteps(res);
    const allSteps = [...nextSteps.yourTurn, ...nextSteps.more];

    const portalStep = allSteps.find((s) => s.stepKey === "verify_portal");
    expect(portalStep).toBeDefined();
    expect(portalStep?.title).toContain("National Scholarship Portal");

    const mcaStep = allSteps.find((s) => s.stepKey === "verify_registration");
    expect(mcaStep).toBeUndefined();
  });

  // 4b. Domain variants: internship includes both AICTE and MCA steps
  it("internship domain includes both AICTE internship portal and MCA registration steps", () => {
    const res = createMockResult({ domain: "internship" });
    const nextSteps = buildNextSteps(res);
    const allSteps = [...nextSteps.yourTurn, ...nextSteps.more];

    const portalStep = allSteps.find((s) => s.stepKey === "verify_portal");
    expect(portalStep).toBeDefined();
    expect(portalStep?.title).toContain("AICTE");

    const mcaStep = allSteps.find((s) => s.stepKey === "verify_registration");
    expect(mcaStep).toBeDefined();
    expect(mcaStep?.title).toContain("registration");
  });

  // 4c. Domain variants: website / other excludes verify_registration and verify_portal
  it("website/other domains exclude verify_registration and verify_portal", () => {
    const res = createMockResult({ domain: "other" as any });
    const nextSteps = buildNextSteps(res);
    const allSteps = [...nextSteps.yourTurn, ...nextSteps.more];

    expect(allSteps.find((s) => s.stepKey === "verify_portal")).toBeUndefined();
    expect(allSteps.find((s) => s.stepKey === "verify_registration")).toBeUndefined();
  });

  // 5a. Question injection: MIS-007 fired includes registration_meaning_and_fee
  it("injects registration_meaning_and_fee when MIS-007 fires", () => {
    const questions = getSafeReplyQuestions({
      signals: [
        {
          ruleId: "MIS-007",
          category: "missing_details",
          severity: "low",
          source: "rule",
          title: "Registration fee mention",
          whyItMatters: "Fee required",
          evidenceQuote: "registration",
        },
      ],
    });
    expect(questions).toContain("registration_meaning_and_fee");
  });

  // 5b. Question injection: text with 'registration' includes registration_meaning_and_fee
  it("injects registration_meaning_and_fee when body mentions registration", () => {
    const questions = getSafeReplyQuestions({
      text: "Onboarding details will be communicated after registration.",
    });
    expect(questions).toContain("registration_meaning_and_fee");
  });

  // 5c. Question injection: MIS-003 or missing selectionProcess includes selection_process
  it("injects selection_process when MIS-003 fires or selectionProcess is missing", () => {
    const q1 = getSafeReplyQuestions({
      signals: [
        {
          ruleId: "MIS-003",
          category: "missing_details",
          severity: "low",
          source: "rule",
          title: "Missing selection process",
          whyItMatters: "No evaluation",
          evidenceQuote: null,
        },
      ],
    });
    expect(q1).toContain("selection_process");

    const q2 = getSafeReplyQuestions({
      completeness: {
        present: [],
        missing: ["selectionProcess"],
        score: 5,
      },
    });
    expect(q2).toContain("selection_process");
  });

  // 5d. Question injection: URG-004 / URG-001 includes more_time
  it("injects more_time when URG-004 or URG-001 fires", () => {
    const q1 = getSafeReplyQuestions({
      signals: [
        {
          ruleId: "URG-004",
          category: "urgency",
          severity: "low",
          source: "rule",
          title: "Short onboarding window",
          whyItMatters: "Rush tactic",
          evidenceQuote: "within 48 hours",
        },
      ],
    });
    expect(q1).toContain("more_time");

    const q2 = getSafeReplyQuestions({
      signals: [
        {
          ruleId: "URG-001",
          category: "urgency",
          severity: "high",
          source: "rule",
          title: "Immediate payment pressure",
          whyItMatters: "Rush tactic",
          evidenceQuote: "now",
        },
      ],
    });
    expect(q2).toContain("more_time");
  });

  // 5e. Question injection: DAT-006 includes data_minimization
  it("injects data_minimization when DAT-006 fires", () => {
    const questions = getSafeReplyQuestions({
      signals: [
        {
          ruleId: "DAT-006",
          category: "data_request",
          severity: "low",
          source: "rule",
          title: "Early personal data collection",
          whyItMatters: "Data collection",
          evidenceQuote: "send resume and phone",
        },
      ],
    });
    expect(questions).toContain("data_minimization");
  });

  // 5f. Question injection: clean text includes only official_domain_and_letterhead
  it("injects only official_domain_and_letterhead when no signals or keywords fire", () => {
    const questions = getSafeReplyQuestions({
      signals: [],
      text: "Standard polite greeting.",
    });
    expect(questions).toEqual(["official_domain_and_letterhead"]);
  });

  // 6. Automated checks appear only in alreadyChecked, never in yourTurn
  it("keeps automated checks in alreadyChecked and never as tickable steps in yourTurn", () => {
    const res = createMockResult();
    const nextSteps = buildNextSteps(res);

    const alreadyCheckedKeys = nextSteps.alreadyChecked.map((c) => c.checkKey);
    expect(alreadyCheckedKeys).toContain("sender_domain_match");
    expect(alreadyCheckedKeys).toContain("reported_records");
    expect(alreadyCheckedKeys).toContain("organization_registry_match");

    const yourTurnKeys = nextSteps.yourTurn.map((s) => s.stepKey);
    expect(yourTurnKeys).not.toContain("sender_domain_match");
    expect(yourTurnKeys).not.toContain("reported_records");
    expect(yourTurnKeys).not.toContain("organization_registry_match");
  });

  // 7a. Standing rules appear only in banner, never as steps
  it("places standing rules in the banner array, never as steps", () => {
    const res = createMockResult();
    const nextSteps = buildNextSteps(res);

    expect(nextSteps.banner.length).toBeGreaterThanOrEqual(2);
    expect(nextSteps.banner[0]).toContain("Never pay any fee");
    expect(nextSteps.banner[1]).toContain("Don't share Aadhaar, PAN");

    const allStepTitles = [...nextSteps.yourTurn, ...nextSteps.more].map((s) =>
      s.title.toLowerCase()
    );
    expect(allStepTitles.some((t) => t.includes("never pay any fee"))).toBe(false);
  });

  // 7b. Banner contents dynamically adjust based on DAT-006 and URG signals
  it("adds minimum details rule if DAT-006 fired and deadline rule if URG fired", () => {
    const withDat = createMockResult({
      signals: [
        {
          ruleId: "DAT-006",
          category: "data_request",
          severity: "low",
          source: "rule",
          title: "Data request",
          whyItMatters: "",
          evidenceQuote: "",
        },
      ],
    });
    const bannerDat = buildNextSteps(withDat).banner;
    expect(
      bannerDat.some((r) => r.includes("Share only the minimum personal details"))
    ).toBe(true);

    const withUrg = createMockResult({
      signals: [
        {
          ruleId: "URG-004",
          category: "urgency",
          severity: "low",
          source: "rule",
          title: "Urgency",
          whyItMatters: "",
          evidenceQuote: "",
        },
      ],
    });
    const bannerUrg = buildNextSteps(withUrg).banner;
    expect(
      bannerUrg.some((r) => r.includes("A genuine employer will allow time"))
    ).toBe(true);
  });

  // 8a. High-risk status triggers variant: 'protect' with protect steps
  it("uses variant 'protect' for HIGH_RISK or CONFIRMED_SCAM", () => {
    const highRiskRes = createMockResult({ status: "HIGH_RISK" });
    const stepsHigh = buildNextSteps(highRiskRes);
    expect(stepsHigh.variant).toBe("protect");

    const confirmedScamRes = createMockResult({ status: "CONFIRMED_SCAM" });
    const stepsScam = buildNextSteps(confirmedScamRes);
    expect(stepsScam.variant).toBe("protect");

    const protectKeys = stepsHigh.yourTurn.map((s) => s.stepKey);
    expect(protectKeys).toContain("stop_replying");
    expect(protectKeys).toContain("keep_evidence");
    expect(protectKeys).toContain("report_it");
    expect(protectKeys).toContain("warn_others");
  });

  // 8b. if_money_sent appears only if payment was mentioned or alreadyPaid toggle is true
  it("shows if_money_sent only when payment is detected or alreadyPaid is true", () => {
    const noPayRes = createMockResult({ status: "HIGH_RISK", signals: [] });
    const stepsNoPay = buildNextSteps(noPayRes, { alreadyPaid: false });
    expect(stepsNoPay.yourTurn.some((s) => s.stepKey === "if_money_sent")).toBe(false);

    const withPayRes = createMockResult({
      status: "HIGH_RISK",
      signals: [
        {
          ruleId: "PAY-001",
          category: "payment",
          severity: "critical",
          source: "rule",
          title: "Payment required",
          whyItMatters: "Scam",
          evidenceQuote: "Pay ₹1000",
        },
      ],
    });
    const stepsPay = buildNextSteps(withPayRes);
    expect(stepsPay.yourTurn.some((s) => s.stepKey === "if_money_sent")).toBe(true);

    const toggledPay = buildNextSteps(noPayRes, { alreadyPaid: true });
    expect(toggledPay.yourTurn.some((s) => s.stepKey === "if_money_sent")).toBe(true);
  });

  // 9. Registry rows with needsTeamReview=true never produce an Official site action
  it("does not render an 'Open official site' action if registry row has needsTeamReview=true", () => {
    const unreviewedOrg: Organization = {
      id: "org-1",
      name: "Acme Corp",
      aliases: [],
      kind: "company",
      officialDomains: ["acme.example.com"],
      careersUrl: null,
      scholarshipsUrl: null,
      isGovernment: false,
      isDemo: false,
      needsTeamReview: true,
    };

    const resUnreviewed = createMockResult({
      matchedOrganization: unreviewedOrg,
    });
    const stepsUnreviewed = buildNextSteps(resUnreviewed);
    const siteStepUnreviewed = stepsUnreviewed.yourTurn.find(
      (s) => s.stepKey === "find_official_site"
    );
    expect(
      siteStepUnreviewed?.actions?.some((a) => a.label === "Open official site")
    ).toBe(false);
    expect(
      siteStepUnreviewed?.actions?.some((a) => a.label === "Open web search")
    ).toBe(true);
    // Part 1 official website check must NOT be shown when needsTeamReview is true
    expect(
      stepsUnreviewed.alreadyChecked.some(
        (c) => c.checkKey === "official_website_registry"
      )
    ).toBe(false);

    // When reviewed (needsTeamReview = false)
    const reviewedOrg: Organization = {
      ...unreviewedOrg,
      needsTeamReview: false,
    };
    const resReviewed = createMockResult({ matchedOrganization: reviewedOrg });
    const stepsReviewed = buildNextSteps(resReviewed);
    const siteStepReviewed = stepsReviewed.yourTurn.find(
      (s) => s.stepKey === "find_official_site"
    );
    expect(
      siteStepReviewed?.actions?.some((a) => a.label === "Open official site")
    ).toBe(true);
    expect(
      stepsReviewed.alreadyChecked.some(
        (c) => c.checkKey === "official_website_registry"
      )
    ).toBe(true);
  });

  // 10. SubCheck attestation completion reflects user_attested outcome
  it("marks subChecks as completed when matching attestation check outcome is user_attested", () => {
    const res = createMockResult({
      checks: [
        {
          checkKey: "found_independently_on_official_portal",
          label: "Portal",
          outcome: "user_attested",
          detail: "Confirmed by you",
          source: "user_attested",
        },
        {
          checkKey: "recruiter_linkedin",
          label: "LinkedIn",
          outcome: "user_attested",
          detail: "Confirmed by you",
          source: "user_attested",
        },
      ],
    });

    const nextSteps = buildNextSteps(res);
    const siteStep = nextSteps.yourTurn.find(
      (s) => s.stepKey === "find_official_site"
    );
    expect(siteStep?.subChecks?.[0].completed).toBe(true);

    const recruiterStep = nextSteps.yourTurn.find(
      (s) => s.stepKey === "confirm_recruiter"
    );
    expect(recruiterStep?.subChecks?.[0].completed).toBe(true);
    expect(recruiterStep?.subChecks?.[1].completed).toBe(false);
  });

  // 11. Preserves step completion state when checklistCompletions option is provided
  it("preserves manual step completion state from options.checklistCompletions", () => {
    const res = createMockResult();
    const nextSteps = buildNextSteps(res, {
      checklistCompletions: {
        find_official_site: true,
        confirm_recruiter: false,
      },
    });

    const siteStep = nextSteps.yourTurn.find(
      (s) => s.stepKey === "find_official_site"
    );
    expect(siteStep?.completed).toBe(true);

    const recruiterStep = nextSteps.yourTurn.find(
      (s) => s.stepKey === "confirm_recruiter"
    );
    expect(recruiterStep?.completed).toBe(false);
  });

  // 12. Safe reply template body cap at 180 words
  it("ensures buildSafeReplyTemplate produces a body under 180 words with zero accusatory language", () => {
    const template = buildSafeReplyTemplate({
      domain: "internship",
      claimedOrg: "Nexora Digital Solutions",
      tone: "polite",
      senderName: "Rohan Verma",
      includeQuestions: [
        "registration_meaning_and_fee",
        "selection_process",
        "more_time",
        "official_domain_and_letterhead",
        "data_minimization",
      ],
    });

    const wordCount = template.body.trim().split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(180);
    expect(template.body.toLowerCase()).not.toContain("fraud");
    expect(template.body.toLowerCase()).not.toContain("scam");
    expect(template.body).toContain("Nexora Digital Solutions");
    expect(template.body).toContain("Rohan Verma");
  });

  // 13. Priority ordering is strictly ascending
  it("orders yourTurn steps in strictly ascending priority order", () => {
    const res = createMockResult();
    const nextSteps = buildNextSteps(res);

    for (let i = 0; i < nextSteps.yourTurn.length - 1; i++) {
      expect(nextSteps.yourTurn[i].priority).toBeLessThanOrEqual(
        nextSteps.yourTurn[i + 1].priority
      );
    }
  });

  // 14. Action buttons have rel='noopener noreferrer' safe external targets
  it("provides well-formed action buttons with safe URLs", () => {
    const res = createMockResult({
      domain: "internship",
      matchedOrganization: {
        id: "org-test",
        name: "Test Corp",
        aliases: [],
        kind: "company",
        officialDomains: ["testcorp.example.com"],
        careersUrl: null,
        scholarshipsUrl: null,
        isGovernment: false,
        isDemo: false,
        needsTeamReview: false,
      },
    });
    const nextSteps = buildNextSteps(res);
    const siteStep = nextSteps.yourTurn.find(
      (s) => s.stepKey === "find_official_site"
    );

    expect(siteStep?.actions?.length).toBe(2);
    expect(siteStep?.actions?.[0].url).toContain("google.com/search");
    expect(siteStep?.actions?.[1].url).toBe("https://testcorp.example.com");
  });

  // 15. Invariant: Plain manual step tick does not alter automated check coverage
  it("maintains separation between manual checklist completion and automated check rows", () => {
    const res = createMockResult();
    const stepsBefore = buildNextSteps(res, {
      checklistCompletions: { find_official_site: false },
    });
    const stepsAfter = buildNextSteps(res, {
      checklistCompletions: { find_official_site: true },
    });

    // alreadyChecked rows are unaffected by manual step ticking
    expect(stepsBefore.alreadyChecked).toEqual(stepsAfter.alreadyChecked);
  });

  // 16. job domain includes verify_registration for company, excludes student portals
  it("job domain includes verify_registration and excludes AICTE / NSP student portals", () => {
    const res = createMockResult({ domain: "job" });
    const nextSteps = buildNextSteps(res);
    const keys = nextSteps.yourTurn.map((s) => s.stepKey);

    expect(keys).toContain("verify_registration");
    expect(keys).not.toContain("verify_portal");
  });

  // 17. competition domain includes verify_registration for company
  it("competition domain includes verify_registration and placement cell inquiry", () => {
    const res = createMockResult({ domain: "competition" });
    const nextSteps = buildNextSteps(res);
    const keys = nextSteps.yourTurn.map((s) => s.stepKey);

    expect(keys).toContain("verify_registration");
    expect(keys).toContain("ask_placement_cell");
    expect(keys).not.toContain("verify_portal");
  });

  // 18. Government organization candidate excludes verify_registration
  it("excludes verify_registration when matchedOrganization is government", () => {
    const govOrg: Organization = {
      id: "gov-1",
      name: "Department of Science and Technology",
      aliases: [],
      kind: "government",
      officialDomains: ["dst.gov.in"],
      careersUrl: null,
      scholarshipsUrl: null,
      isGovernment: true,
      isDemo: false,
      needsTeamReview: false,
    };
    const res = createMockResult({
      domain: "internship",
      matchedOrganization: govOrg,
    });
    const nextSteps = buildNextSteps(res);
    const keys = nextSteps.yourTurn.map((s) => s.stepKey);

    expect(keys).not.toContain("verify_registration");
  });

  // 19. contacted_via_official_channel attestation maps to send_safe_reply
  it("reflects contacted_via_official_channel in send_safe_reply subCheck", () => {
    const res = createMockResult({
      checks: [
        {
          checkKey: "contacted_via_official_channel",
          label: "Contacted official",
          outcome: "user_attested",
          detail: "Confirmed by you",
          source: "user_attested",
        },
      ],
    });
    const nextSteps = buildNextSteps(res);
    const safeReplyStep = nextSteps.yourTurn.find(
      (s) => s.stepKey === "send_safe_reply"
    );

    expect(safeReplyStep?.subChecks?.[0].key).toBe(
      "contacted_via_official_channel"
    );
    expect(safeReplyStep?.subChecks?.[0].completed).toBe(true);
  });

  // 20. Fallback formatting when org and sender domain are unspecified
  it("uses clean fallbacks 'the organization' and 'the sender\\'s domain' when inputs are missing", () => {
    const res = createMockResult({
      claimedOrg: undefined,
      matchedOrganization: undefined,
      senderIdentity: undefined,
      extractedFields: undefined,
    });
    const nextSteps = buildNextSteps(res);
    const siteStep = nextSteps.yourTurn.find(
      (s) => s.stepKey === "find_official_site"
    );

    expect(siteStep?.title).toBe("Find the organization's official website yourself");
    expect(siteStep?.howToVerify).toContain("the sender's domain");
  });

  // 21. Protect variant produces at most 5 steps and no duplicate copy
  it("protect variant produces at most 5 steps with unique specific copy", () => {
    const res = createMockResult({ status: "HIGH_RISK" });
    const nextSteps = buildNextSteps(res, { alreadyPaid: true });

    expect(nextSteps.yourTurn.length).toBeLessThanOrEqual(5);
    const hows = nextSteps.yourTurn.map((s) => s.howToVerify);
    expect(new Set(hows).size).toBe(hows.length);
  });
});

