import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { AnalysisResult } from "shared";

describe("Print / PDF Export Verification (Change E8)", () => {
  const cssPath = path.resolve(__dirname, "../styles/index.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  it("includes @media print rules in index.css", () => {
    expect(cssContent).toContain("@media print");
  });

  it("hides interactive controls and buttons in print stylesheet", () => {
    expect(cssContent).toMatch(/button/);
    expect(cssContent).toMatch(/input/);
    expect(cssContent).toMatch(/print\\:hidden/);
    expect(cssContent).toContain("display: none !important");
  });

  it("forces accordions and drawers to expand in print stylesheet", () => {
    expect(cssContent).toMatch(/\.hidden\.print\\:block/);
    expect(cssContent).toContain("display: block !important");
  });

  it("avoids page breaks inside content blocks and cards", () => {
    expect(cssContent).toContain("break-inside: avoid");
    expect(cssContent).toContain("page-break-inside: avoid");
  });

  it("ensures no visible report section prints empty for the Nexora test fixture", () => {
    // Mock result based on Nexora fixture analysis
    const nexoraResult: AnalysisResult = {
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
      ruleScore: 5,
      internalRuleScore: 5,
      summary: "This opportunity requires independent review or not enough could be verified yet.",
      signals: [
        {
          ruleId: "MIS-004",
          category: "missing_details",
          severity: "low",
          source: "rule",
          title: "Missing selection criteria",
          whyItMatters: "Legitimate programs define selection criteria.",
          evidenceQuote: "initial review",
          hardDisqualifier: false,
        },
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
          detail: "Sender domain (nexora-example.invalid) does not match registry.",
          source: "rule",
        },
        {
          checkKey: "payment_request",
          label: "Payment Request Check",
          outcome: "none_found",
          detail: "No match found in the message text. This does not confirm the offer is genuine.",
          source: "rule",
        },
        {
          checkKey: "sensitive_data_request",
          label: "Sensitive Data Request Check",
          outcome: "none_found",
          detail: "No match found in the message text. This does not confirm the offer is genuine.",
          source: "rule",
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
      checklist: [
        {
          position: 0,
          label: "Ask for more time — a genuine employer will allow you to verify first.",
          portalKey: null,
          completed: false,
        },
      ],
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
      createdAt: new Date().toISOString(),
    };

    // Verify key sections are present and non-empty
    expect(nexoraResult.status).toBe("NEEDS_REVIEW");
    expect(nexoraResult.reasons.length).toBeGreaterThan(0);
    expect(nexoraResult.reasons.every((r) => r.detail.trim().length > 0)).toBe(true);
    expect(nexoraResult.checks.length).toBeGreaterThan(0);
    expect(nexoraResult.checks.every((c) => c.label.length > 0 && c.detail.length > 0)).toBe(true);
    expect(nexoraResult.completeness!.present.length).toBe(6);
    expect(nexoraResult.completeness!.missing.length).toBe(4);
    expect(nexoraResult.patternInsight?.heading).toBe("Advance-Fee Internship Precursor");
    expect(nexoraResult.patternInsight?.dontSendYet.length).toBeGreaterThan(0);
    expect(nexoraResult.disclaimer.length).toBeGreaterThan(10);
  });
});
