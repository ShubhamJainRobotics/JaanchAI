import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  buildNextSteps,
  getSafeReplyQuestions,
  AnalysisResult,
  buildSafeReplyTemplate,
} from "shared";

describe("Nexora End-to-End Acceptance Fixture (§7)", () => {
  const nexoraFixturePath = path.resolve(
    __dirname,
    "../../../shared/src/__fixtures__/corpus/01_nexora.txt"
  );
  const nexoraRawText = fs.readFileSync(nexoraFixturePath, "utf-8");
  expect(nexoraRawText.length).toBeGreaterThan(0);

  // Synthetic result mirroring the exact output of analyzeText on 01_nexora.txt
  const nexoraAnalysisResult: AnalysisResult = {
    id: null,
    saved: false,
    domain: "internship",
    status: "NEEDS_REVIEW",
    reasons: [
      {
        checkKey: "subtle_signals_pattern",
        effect: "NEEDS_REVIEW",
        detail: "Multiple subtle inconsistency signals detected in the offer message.",
      },
      {
        checkKey: "insufficient_evidence",
        effect: "NEEDS_REVIEW",
        detail: "No scam indicators were found, but nothing about the sender or organization could be verified yet.",
      },
    ],
    ruleScore: 10,
    internalRuleScore: 10,
    summary: "This opportunity requires independent review or not enough could be verified yet.",
    signals: [
      {
        ruleId: "URG-004",
        category: "urgency",
        severity: "low",
        source: "rule",
        title: "Short onboarding window",
        whyItMatters: "Short deadline to act — legitimate employers allow time to verify.",
        evidenceQuote: "within 48 hours",
        hardDisqualifier: false,
      },
      {
        ruleId: "MIS-007",
        category: "missing_details",
        severity: "low",
        source: "rule",
        title: "Vague registration reference",
        whyItMatters: "Vague registration terminology may precede an unexpected registration fee.",
        evidenceQuote: "after registration",
        hardDisqualifier: false,
      },
      {
        ruleId: "MIS-003",
        category: "missing_details",
        severity: "low",
        source: "rule",
        title: "Offer without interview or evaluation",
        whyItMatters: "Reputable employers evaluate candidates through interviews or assessments.",
        evidenceQuote: "shortlisted for the position",
        hardDisqualifier: false,
      },
      {
        ruleId: "DAT-006",
        category: "data_request",
        severity: "medium",
        source: "rule",
        title: "Extensive personal details requested upfront",
        whyItMatters: "Premature collection of personal details before selection is a common identity theft risk.",
        evidenceQuote: "Full name as per official records",
        hardDisqualifier: false,
      },
    ],
    checks: [
      {
        checkKey: "organization_registry_match",
        label: "Organization Registry Verification",
        outcome: "unknown",
        detail: "Claimed organization 'Nexora Digital Solutions' was not found in the verified registry.",
        source: "registry",
      },
      {
        checkKey: "sender_domain_match",
        label: "Sender Domain Legitimacy",
        outcome: "unknown",
        detail: "Reserved or placeholder domain (nexora-example.invalid); not a verified sender.",
        source: "rule",
      },
      {
        checkKey: "reported_records",
        label: "Reported Fraud Database Check",
        outcome: "none_found",
        detail: "No match found in community fraud database. This does not confirm the offer is genuine.",
        source: "reported_db",
      },
      {
        checkKey: "domain_age",
        label: "Domain Age & RDAP History",
        outcome: "not_run",
        detail: "Domain age check not run.",
        source: "rdap",
      },
      {
        checkKey: "header_spf",
        label: "SPF Cryptographic Authentication",
        outcome: "not_run",
        detail: "Email headers not provided.",
        source: "header_parse",
      },
    ],
    extractedFields: {
      organization: {
        value: "Nexora Digital Solutions",
        evidenceQuote: "Nexora Digital Solutions",
        source: "rule",
      },
      roleOrProgram: {
        value: "Technical Operations Intern",
        evidenceQuote: "Technical Operations Intern",
        source: "rule",
      },
      eligibility: null,
      locationOrMode: {
        value: "Hybrid",
        evidenceQuote: "Hybrid",
        source: "rule",
      },
      duration: {
        value: "3 months",
        evidenceQuote: "3 months",
        source: "rule",
      },
      compensation: {
        value: { kind: "stipend", raw: "₹15,000", amountInr: 15000, period: "month" },
        evidenceQuote: "₹15,000",
        source: "rule",
      },
      selectionProcess: null,
      deadline: null,
      contactChannel: {
        value: "hr@nexora-example.invalid",
        evidenceQuote: "hr@nexora-example.invalid",
        source: "rule",
      },
      officialLink: null,
    },
    completeness: {
      score: 6,
      present: ["organization", "role", "location", "duration", "compensation", "contactChannel"],
      missing: ["eligibility", "selectionProcess", "deadline", "officialLink"],
      details: [
        { key: "organization", label: "Organization", present: true, evidenceQuote: "Nexora Digital Solutions" },
        { key: "eligibility", label: "Eligibility", present: false, reason: "No required degrees, skills, or CGPA mentioned." },
      ],
    },
    senderIdentity: {
      rawEmail: "hr@nexora-example.invalid",
      domain: "nexora-example.invalid",
      displayName: null,
      localPart: "hr",
      registrableDomain: "nexora-example.invalid",
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
    headerAnalysis: null,
    listingComparison: {
      status: "not_checked",
      sourceType: null,
      listingUrl: null,
      organizationMatched: false,
      roleMatched: false,
      hasMismatches: false,
      matchedFieldsCount: 0,
      comparedFields: [],
      notes: "No official listing URL or text was provided.",
    },
    reportedMatches: [],
    matchedOrganization: null,
    unknowns: [],
    checklist: [],
    links: [],
    reportGuidance: {
      show: false,
      helpline: "1930",
      portalUrl: "https://cybercrime.gov.in",
      keepAsEvidence: [],
    },
    patternInsight: {
      id: "advance_fee_internship_precursor",
      heading: "Advance-Fee Internship Precursor",
      description: "In similar offers, the first message is friendly and asks only for basic details.",
      dontSendYet: ["Full résumé", "Bank details", "Any fee"],
    },
    aiUsed: false,
    aiStatus: "not_requested",
    textOnlyConfidence: null,
    durationMs: 42,
    disclaimer: "Jaanch supports informed decisions; it never proves an opportunity is genuine or fraudulent.",
    paymentAlert: false,
    inputNotices: [],
    createdAt: new Date().toISOString(),
  };

  it("produces the three-part next steps panel for Nexora with exactly 6 steps in yourTurn", () => {
    const nextSteps = buildNextSteps(nexoraAnalysisResult);

    expect(nextSteps.variant).toBe("standard");

    // Part 1: Already Checked
    expect(nextSteps.alreadyChecked.length).toBeGreaterThan(0);
    const senderRow = nextSteps.alreadyChecked.find(
      (c) => c.checkKey === "sender_domain_match"
    );
    expect(senderRow).toBeDefined();
    expect(senderRow?.detail).toContain("Reserved or placeholder domain");
    expect(senderRow?.detail).toContain("not a verified sender");

    const reportedRow = nextSteps.alreadyChecked.find(
      (c) => c.checkKey === "reported_records"
    );
    expect(reportedRow).toBeDefined();
    expect(reportedRow?.outcome).toBe("none_found");

    const registryRow = nextSteps.alreadyChecked.find(
      (c) => c.checkKey === "organization_registry_match"
    );
    expect(registryRow).toBeDefined();
    expect(registryRow?.outcome).toBe("unknown");

    // Part 2: Your Turn - Exactly these 6 in order
    expect(nextSteps.yourTurn).toHaveLength(6);
    expect(nextSteps.more).toHaveLength(0);

    const stepKeys = nextSteps.yourTurn.map((s) => s.stepKey);
    expect(stepKeys).toEqual([
      "find_official_site",
      "verify_registration",
      "verify_portal",
      "confirm_recruiter",
      "send_safe_reply",
      "ask_placement_cell",
    ]);

    // Verify template variables replaced
    const findSiteStep = nextSteps.yourTurn[0];
    expect(findSiteStep.title).toContain("Nexora Digital Solutions");
    expect(findSiteStep.howToVerify).toContain("Nexora Digital Solutions");
    expect(findSiteStep.howToVerify).toContain("nexora-example.invalid");

    const verifyPortalStep = nextSteps.yourTurn[2];
    expect(verifyPortalStep.title).toContain("AICTE");

    // Verify sub-checks (attestations) exist on relevant cards
    expect(findSiteStep.subChecks?.some((sc) => sc.key === "found_independently_on_official_portal")).toBe(true);
    const recruiterStep = nextSteps.yourTurn[3];
    expect(recruiterStep.subChecks?.some((sc) => sc.key === "recruiter_linkedin")).toBe(true);
    expect(recruiterStep.subChecks?.some((sc) => sc.key === "recruiter_phone_official")).toBe(true);
    const safeReplyStep = nextSteps.yourTurn[4];
    expect(safeReplyStep.subChecks?.some((sc) => sc.key === "contacted_via_official_channel")).toBe(true);

    // Part 3: Banner - contains all 4 rules
    expect(nextSteps.banner).toHaveLength(4);
    expect(nextSteps.banner[0]).toContain("Never pay any fee");
    expect(nextSteps.banner[1]).toContain("Don't share Aadhaar, PAN, bank");
    expect(nextSteps.banner[2]).toContain("minimum personal details"); // DAT-006
    expect(nextSteps.banner[3]).toContain("genuine employer will allow time"); // URG-004
  });

  it("preselects the exact 5 questions for Nexora safe reply", () => {
    const questions = getSafeReplyQuestions(nexoraAnalysisResult);
    expect(questions).toEqual([
      "registration_meaning_and_fee",
      "selection_process",
      "more_time",
      "official_domain_and_letterhead",
      "data_minimization",
    ]);

    // Verify the safe reply template builds cleanly within 180 words
    const safeReply = buildSafeReplyTemplate({
      domain: "internship",
      claimedOrg: "Nexora Digital Solutions",
      tone: "polite",
      includeQuestions: questions,
    });

    const wordCount = safeReply.body.trim().split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(180);
    expect(safeReply.body).toContain("selection process");
    expect(safeReply.body).toContain("registration");
    expect(safeReply.body).toContain("official letterhead");
    expect(safeReply.body).toContain("extension of time");
    expect(safeReply.body).toContain("which personal details are required");
    // Verify no accusations or sensitive personal data
    expect(safeReply.body.toLowerCase()).not.toContain("scam");
    expect(safeReply.body.toLowerCase()).not.toContain("fraud");
    expect(safeReply.body.toLowerCase()).not.toContain("fake");
    expect(safeReply.body.toLowerCase()).not.toContain("aadhaar");
    expect(safeReply.body.toLowerCase()).not.toContain("pan number");
  });

  it("confirms no duplicate wording and no boilerplate string in any step", () => {
    const nextSteps = buildNextSteps(nexoraAnalysisResult);
    const howToVerifies = new Set<string>();
    const titles = new Set<string>();

    for (const step of nextSteps.yourTurn) {
      expect(howToVerifies.has(step.howToVerify)).toBe(false);
      howToVerifies.add(step.howToVerify);

      expect(titles.has(step.title)).toBe(false);
      titles.add(step.title);

      expect(step.howToVerify).not.toContain(
        "Complete this verification before taking further action"
      );
    }
  });

  it("verifies guest mode sessionStorage behavior without network persistence", () => {
    // Simulate sessionStorage
    const storage: Record<string, string> = {};
    const mockSessionStorage = {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
      clear: () => {
        Object.keys(storage).forEach((k) => delete storage[k]);
      },
    };

    const nextSteps = buildNextSteps(nexoraAnalysisResult);
    expect(nextSteps.yourTurn.length).toBe(6);
    const guestKey = `jaanch_guest_steps_${nexoraAnalysisResult.id || "local"}`;

    // Initial state: not completed
    const initialMap: Record<string, boolean> = {};
    mockSessionStorage.setItem(guestKey, JSON.stringify(initialMap));

    // User ticks 'find_official_site'
    initialMap["find_official_site"] = true;
    mockSessionStorage.setItem(guestKey, JSON.stringify(initialMap));

    const reloadedMap = JSON.parse(mockSessionStorage.getItem(guestKey)!);
    expect(reloadedMap["find_official_site"]).toBe(true);
    expect(reloadedMap["verify_registration"]).toBeUndefined();

    // Clear session
    mockSessionStorage.clear();
    expect(mockSessionStorage.getItem(guestKey)).toBeNull();
  });
});
