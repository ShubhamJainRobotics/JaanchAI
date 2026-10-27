import { describe, it, expect } from "vitest";
import { RISK_COPY } from "../riskCopy.js";
import { ADVISORY } from "../advisory.js";
import { STATUS_COPY } from "../status.js";

describe("Strict Non-Verdict Policy Verification", () => {
  // Phrases that falsely claim an offer is definitely safe/genuine or definitely proven fraud
  const affirmativeVerdictTokens = [
    /\b(is|confirmed)\s+safe\b/i,
    /(?<!not\s+confirmation\s+that\s+the\s+)offer\s+is\s+genuine\b/i,
    /\b(is|confirmed)\s+legit\b/i,
    /\boffer\s+is\s+verified\b/i,
    /\bscam\s+confirmed\b/i,
    /\bfraud\s+confirmed\b/i,
    /\bconfirmed\s+fraud\b/i,
  ];

  it("ensures riskCopy labels and summaries never declare a definitive verdict", () => {
    for (const [, copy] of Object.entries(RISK_COPY)) {
      expect(copy.label).not.toMatch(/safe|genuine|scam|fraud|legit/i);
      const summary = copy.formatSummary(2);
      for (const banned of affirmativeVerdictTokens) {
        expect(summary).not.toMatch(banned);
      }
    }
  });

  it("ensures NO_MAJOR_WARNING_SIGNS explicitly carries the non-confirmation notice", () => {
    const summary = RISK_COPY.NO_MAJOR_WARNING_SIGNS.formatSummary(0);
    expect(summary).toContain("This is not confirmation that the offer is genuine.");
  });

  it("ensures global advisory maintains honest limitations", () => {
    expect(ADVISORY.footer).toContain(
      "Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent."
    );
    expect(ADVISORY.plannedNotice).toContain(
      "No measured results are claimed yet. These are planned metrics."
    );
  });

  it("ensures STATUS_COPY labels adhere to strict reconciliation policy", () => {
    // Exactly and only VERIFIED_OFFICIAL and CONFIRMED_SCAM hold these specific status banner labels
    expect(STATUS_COPY.VERIFIED_OFFICIAL.label).toBe("Verified / Official");
    expect(STATUS_COPY.CONFIRMED_SCAM.label).toBe("Confirmed Scam");
    expect(STATUS_COPY.LIKELY_GENUINE.label).toBe("Likely Genuine");
    expect(STATUS_COPY.NEEDS_REVIEW.label).toBe("Needs Review");
    expect(STATUS_COPY.HIGH_RISK.label).toBe("High Risk");

    // Likely Genuine must always carry the qualifier line
    expect(STATUS_COPY.LIKELY_GENUINE.meaning).toBe(
      "No scam indicators were found, but this offer has not been matched to an official listing."
    );
    expect(STATUS_COPY.LIKELY_GENUINE.qualifier).toBe(
      "No scam indicators were found, but this offer has not been matched to an official listing."
    );
  });
});
