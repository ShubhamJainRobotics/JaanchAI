import { describe, it, expect } from "vitest";
import {
  extractOrganizationCandidates,
  extractOrganizationDecision,
} from "../organization.js";

describe("Organization Extractor Must-Pass Table (§5)", () => {
  it("extracts Nexora Digital Solutions with high confidence", () => {
    const text =
      "We are pleased to offer you the position of Technical Operations Intern at Nexora Digital Solutions.\n\n" +
      "Regards,\nRecruitment & Talent Acquisition Team\nNexora Digital Solutions";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBe("Nexora Digital Solutions");
    expect(decision.confidence).toBe("high");
  });

  it("extracts Willowbrook Analytics Pvt. Ltd. without leading role words or trailing location", () => {
    const text =
      "Dear Ananya, Thank you for applying through our careers page for the Data Analyst Intern position at Willowbrook Analytics Pvt. Ltd., Bengaluru.";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBe("Willowbrook Analytics Pvt. Ltd.");
    expect(decision.confidence).toBe("high");
  });

  it("extracts Sunrise Media stripping trailing HR and finding our company mention", () => {
    const text =
      "We are hiring intern for content writting in our company Sunrise Media, Pune. Work is remote.\n\n" +
      "Sunrise Media HR";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBe("Sunrise Media");
    expect(decision.confidence).toBe("high");
  });

  it("extracts Microsoft India and stops at the period", () => {
    const text =
      "Software Intern role at Microsoft India. To begin onboarding, please purchase the mandatory software kit for ₹3,000.\n\nMicrosoft Recruitment Desk";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBe("Microsoft India");
    expect(decision.confidence).toBe("high");
  });

  it("extracts Brightpath Global Solutions", () => {
    const text =
      "Congratulations! You are SELECTED for a Work From Home Internship at Brightpath Global Solutions. Stipend: ₹25,000 per month.";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBe("Brightpath Global Solutions");
    expect(decision.confidence).toBe("high");
  });

  it("rejects 'pay. Limited-time government benefit' resulting in null", () => {
    const text =
      "To release the amount, pay. Limited-time government benefit. Complete payment today.";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBeNull();
  });

  it("treats 'Scholarship Disbursement Cell' as low confidence (uncertain, returns null)", () => {
    const text =
      "Subject: Central Merit Scholarship 2026 – ₹50,000 Approved\n\n" +
      "Dear Applicant, Your name has been approved.\n\n" +
      "Scholarship Disbursement Cell";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBeNull();
    expect(decision.organizationStatus).toBe("uncertain");
    expect(decision.confidence).toBe("low");
    expect(decision.alternates[0]?.name).toBe("Scholarship Disbursement Cell");
  });

  it("rejects 'Dear Candidate, Congratulations!' completely", () => {
    const text = "Dear Candidate, Congratulations! You have received an opportunity.";

    const decision = extractOrganizationDecision(text);
    expect(decision.organization).toBeNull();
    expect(decision.allCandidates.length).toBe(0);
  });
});
