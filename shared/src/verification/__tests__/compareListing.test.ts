import { describe, it, expect } from "vitest";
import { compareListing, normalizeDurationWeeks, normalizeCompensationInr } from "../compareListing.js";
import { ExtractedFields } from "../../schemas/index.js";

function makeFields(partial: Partial<ExtractedFields>): ExtractedFields {
  return {
    organization: null,
    roleOrProgram: null,
    eligibility: null,
    locationOrMode: null,
    duration: null,
    compensation: null,
    selectionProcess: null,
    deadline: null,
    contactChannel: null,
    officialLink: null,
    ...partial,
  };
}

describe("Listing Comparison Service", () => {
  describe("Normalization Helpers", () => {
    it("normalizes '2 months' and '8 weeks' to approximately equal week counts", () => {
      const dur1 = normalizeDurationWeeks("2 months");
      const dur2 = normalizeDurationWeeks("8 weeks");
      expect(dur1).not.toBeNull();
      expect(dur2).not.toBeNull();
      expect(Math.abs(dur1! - dur2!)).toBeLessThanOrEqual(1.5);
    });

    it("normalizes '₹10,000' and '10k' to identical numeric INR amount 10000", () => {
      const comp1 = normalizeCompensationInr("₹10,000");
      const comp2 = normalizeCompensationInr("10k per month");
      expect(comp1).toBe(10000);
      expect(comp2).toBe(10000);
    });

    it("normalizes '1.5 lakh' to 150000", () => {
      const comp = normalizeCompensationInr("1.5 lakh");
      expect(comp).toBe(150000);
    });
  });

  describe("Field by Field Comparison", () => {
    it("matches identical role, org, duration ('2 months' vs '8 weeks'), and compensation", () => {
      const offer = makeFields({
        organization: { value: "Example Technologies Pvt. Ltd.", evidenceQuote: "Example Technologies", source: "rule" },
        roleOrProgram: { value: "Software Engineering Intern", evidenceQuote: "Software Engineering Intern", source: "rule" },
        duration: { value: "2 months", evidenceQuote: "2 months", source: "rule" },
        compensation: {
          value: { kind: "stipend", amountInr: 10000, period: "month", raw: "₹10,000/month" },
          evidenceQuote: "₹10,000/month",
          source: "rule",
        },
      });

      const listing = makeFields({
        organization: { value: "Example Technologies Pvt Ltd", evidenceQuote: "Example Technologies", source: "rule" },
        roleOrProgram: { value: "Software Engineering Intern", evidenceQuote: "Software Engineering Intern", source: "rule" },
        duration: { value: "8 weeks", evidenceQuote: "8 weeks", source: "rule" },
        compensation: {
          value: { kind: "stipend", amountInr: 10000, period: "month", raw: "10k per month" },
          evidenceQuote: "10k per month",
          source: "rule",
        },
      });

      const res = compareListing(offer, listing, { sourceType: "platform_fetch" });
      expect(res.organizationMatched).toBe(true);
      expect(res.roleMatched).toBe(true);
      expect(res.hasMismatches).toBe(false);
      expect(res.status).toBe("match");

      const durComp = res.comparedFields.find((f) => f.field === "duration");
      expect(durComp?.outcome).toBe("match");

      const compComp = res.comparedFields.find((f) => f.field === "compensation");
      expect(compComp?.outcome).toBe("match");
    });

    it("flags compensation mismatch when offer states ₹10,000 but official listing states ₹12,000", () => {
      const offer = makeFields({
        organization: { value: "Acme Corp", evidenceQuote: "Acme Corp", source: "rule" },
        roleOrProgram: { value: "Web Developer", evidenceQuote: "Web Developer", source: "rule" },
        compensation: {
          value: { kind: "stipend", amountInr: 10000, period: "month", raw: "₹10,000" },
          evidenceQuote: "₹10,000",
          source: "rule",
        },
      });

      const listing = makeFields({
        organization: { value: "Acme Corp", evidenceQuote: "Acme Corp", source: "rule" },
        roleOrProgram: { value: "Web Developer", evidenceQuote: "Web Developer", source: "rule" },
        compensation: {
          value: { kind: "stipend", amountInr: 12000, period: "month", raw: "₹12,000" },
          evidenceQuote: "₹12,000",
          source: "rule",
        },
      });

      const res = compareListing(offer, listing, { sourceType: "platform_fetch" });
      expect(res.hasMismatches).toBe(true);
      expect(res.status).toBe("mismatch");

      const compComp = res.comparedFields.find((f) => f.field === "compensation");
      expect(compComp?.outcome).toBe("mismatch");
    });

    it("evaluates missing fields on either side as 'unknown', never 'match'", () => {
      const offer = makeFields({
        organization: { value: "Acme Corp", evidenceQuote: "Acme Corp", source: "rule" },
        roleOrProgram: { value: "Designer", evidenceQuote: "Designer", source: "rule" },
        deadline: { value: "2026-12-31", evidenceQuote: "31 Dec 2026", source: "rule" },
      });

      const listing = makeFields({
        organization: { value: "Acme Corp", evidenceQuote: "Acme Corp", source: "rule" },
        roleOrProgram: { value: "Designer", evidenceQuote: "Designer", source: "rule" },
        deadline: null, // missing on listing side
      });

      const res = compareListing(offer, listing);
      const ddlComp = res.comparedFields.find((f) => f.field === "deadline");
      expect(ddlComp?.outcome).toBe("unknown");
    });
  });
});
