import { describe, it, expect } from "vitest";
import { detectPatternInsight, PATTERN_CATALOGUE } from "../patterns.js";
import { Signal } from "../../schemas/index.js";

describe("Pattern Insights Catalogue", () => {
  const bannedVerdictRegex =
    /\b(is|confirmed)\s+safe\b|offer\s+is\s+genuine\b|\b(is|confirmed)\s+legit\b|\boffer\s+is\s+verified\b|\bscam\s+confirmed\b|\bfraud\s+confirmed\b|\bconfirmed\s+fraud\b/i;

  it("ensures all pattern texts adhere to hedged language and contain NO banned verdicts", () => {
    for (const pattern of PATTERN_CATALOGUE) {
      expect(pattern.heading).not.toMatch(bannedVerdictRegex);
      expect(pattern.description).not.toMatch(bannedVerdictRegex);
      for (const item of pattern.dontSendYet) {
        expect(item).not.toMatch(bannedVerdictRegex);
      }
      // Ensure hedged wording is used
      expect(pattern.description).toMatch(/in similar|can|often|frequently/i);
    }
  });

  it("detects advance_fee_internship_precursor on Nexora-like signals", () => {
    const signals: Signal[] = [
      {
        ruleId: "MIS-007",
        category: "missing_details",
        severity: "low",
        source: "rule",
        title: "Undefined registration",
        whyItMatters: "Registration",
        evidenceQuote: "after registration",
      },
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
        ruleId: "DAT-006",
        category: "data_request",
        severity: "low",
        source: "rule",
        title: "Data bundle",
        whyItMatters: "Data",
        evidenceQuote: "Full name",
      },
    ];

    const insight = detectPatternInsight({
      signals,
      senderVerified: false,
      text: "Please reply to this email with your updated resume to proceed with onboarding.",
      hasOnboardingOrDataRequest: true,
    });

    expect(insight).not.toBeNull();
    expect(insight?.id).toBe("advance_fee_internship_precursor");
    expect(insight?.heading).toBe("Advance-Fee Internship Precursor Pattern");
    expect(insight?.dontSendYet).toContain("Any upfront registration or security deposit");
  });

  it("detects data_harvesting_precursor when only DAT-006 fires on unverified sender", () => {
    const signals: Signal[] = [
      {
        ruleId: "DAT-006",
        category: "data_request",
        severity: "low",
        source: "rule",
        title: "Data bundle",
        whyItMatters: "Data",
        evidenceQuote: "Full name, phone, address",
      },
    ];

    const insight = detectPatternInsight({
      signals,
      senderVerified: false,
    });

    expect(insight?.id).toBe("data_harvesting_precursor");
  });

  it("detects fake_cheque_or_advance_payment on PAY-009 or PAY-005", () => {
    const signals: Signal[] = [
      {
        ruleId: "PAY-009",
        category: "payment",
        severity: "critical",
        hardDisqualifier: true,
        source: "rule",
        title: "Cheque advance",
        whyItMatters: "Bounced cheque",
        evidenceQuote: "Deposit this cheque",
      },
    ];

    const insight = detectPatternInsight({
      signals,
      senderVerified: false,
    });

    expect(insight?.id).toBe("fake_cheque_or_advance_payment");
  });

  it("detects brand_impersonation on SND-002", () => {
    const signals: Signal[] = [
      {
        ruleId: "SND-002",
        category: "sender_identity",
        severity: "critical",
        hardDisqualifier: true,
        source: "rule",
        title: "Lookalike domain",
        whyItMatters: "Lookalike",
        evidenceQuote: "micro-soft.com",
      },
    ];

    const insight = detectPatternInsight({
      signals,
      senderVerified: false,
    });

    expect(insight?.id).toBe("brand_impersonation");
  });

  it("detects government_scheme_lure on GOV-001", () => {
    const signals: Signal[] = [
      {
        ruleId: "GOV-001",
        category: "source_authenticity",
        severity: "critical",
        hardDisqualifier: true,
        source: "rule",
        title: "Gov scheme claim",
        whyItMatters: "Unofficial domain",
        evidenceQuote: "pm-yojana.com",
      },
    ];

    const insight = detectPatternInsight({
      signals,
      senderVerified: false,
    });

    expect(insight?.id).toBe("government_scheme_lure");
  });
});
