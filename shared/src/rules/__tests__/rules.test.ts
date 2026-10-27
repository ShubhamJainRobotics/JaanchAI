import { describe, it, expect } from "vitest";
import { runRules } from "../engine.js";
import { normalizeText } from "../normalize.js";
import { scoreHits, getBaselineUnknowns } from "../score.js";
import { buildVerificationChecklist } from "../../checklist/build.js";
import { RuleContext } from "../types.js";

function makeContext(
  text: string,
  domain: any = "internship",
  channel: any = "whatsapp",
  claimedOrg?: string
): RuleContext {
  return {
    rawText: text,
    normalizedText: normalizeText(text),
    domain,
    channel,
    claimedOrg,
  };
}

describe("Rule Engine & Catalog", () => {
  describe("Scenario 2: Illustrative ₹999 Walkthrough Test", () => {
    it("flags ₹999 refundable deposit within 2 hours as HIGH_CONCERN with all required hits", () => {
      const text =
        "Congratulations! You have been selected for an internship. Pay ₹999 as a refundable security deposit within two hours to confirm your position.";
      const ctx = makeContext(text, "internship", "whatsapp");
      const hits = runRules(ctx);
      const ruleIds = hits.map((h) => h.ruleId);

      expect(ruleIds).toContain("PAY-001");
      expect(ruleIds).toContain("PAY-003");
      expect(ruleIds).toContain("URG-001");
      expect(ruleIds).toContain("MIS-003");

      const scoreRes = scoreHits(hits, text.length);
      expect(scoreRes.riskLevel).toBe("HIGH_CONCERN");
      expect(scoreRes.score).toBeGreaterThanOrEqual(50);

      // Verify quotes are exact substrings of original text
      for (const hit of hits) {
        expect(text).toContain(hit.evidenceQuote);
      }

      // Verify baseline unknowns
      const unknowns = getBaselineUnknowns();
      const unknownItems = unknowns.map((u) => u.item);
      expect(unknownItems).toContain("Recruiter / sender identity");
      expect(unknownItems).toContain("Organization registration and official website");

      // Verify checklist
      const checklist = buildVerificationChecklist("internship", scoreRes.riskLevel, hits, false);
      const labels = checklist.map((c) => c.label);
      expect(labels.some((l) => l.includes("official website yourself"))).toBe(true);
      expect(labels.some((l) => l.includes("official channel you found independently"))).toBe(true);
      expect(labels.some((l) => l.includes("Do not pay"))).toBe(true);
    });
  });

  describe("Scenario 3: Genuine-looking Opportunity", () => {
    it("returns NO_MAJOR_WARNING_SIGNS while retaining baseline unknowns and disclaimer", () => {
      const text =
        "Acme Technologies Pvt Ltd invites applications for our 3-month Software Engineering Internship. Key responsibilities include frontend feature development and unit testing. Monthly stipend is 25000 INR. Eligibility: Computer Science undergrads. Shortlisted candidates will be invited for an online coding assessment and technical interview.";
      const ctx = makeContext(text, "internship", "email", "Acme Technologies Pvt Ltd");
      const hits = runRules(ctx);
      const scoreRes = scoreHits(hits, text.length);

      expect(scoreRes.riskLevel).toBe("NO_MAJOR_WARNING_SIGNS");
      expect(scoreRes.score).toBe(0);

      const unknowns = getBaselineUnknowns();
      expect(unknowns.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Scenario 4: Banking Credentials & OTP", () => {
    it("flags OTP / UPI PIN / net-banking request as HIGH_CONCERN via DAT-001", () => {
      const text =
        "To disburse your stipend, please share your OTP and enter your UPI PIN in the verification window.";
      const ctx = makeContext(text, "internship", "whatsapp");
      const hits = runRules(ctx);
      const ruleIds = hits.map((h) => h.ruleId);

      expect(ruleIds).toContain("DAT-001");
      const scoreRes = scoreHits(hits, text.length);
      expect(scoreRes.riskLevel).toBe("HIGH_CONCERN");
    });
  });

  describe("Scenario 5: Scholarship GST / Fee Scam", () => {
    it("flags scholarship asking for fee to release funds as HIGH_CONCERN via PAY-005/PAY-001", () => {
      const text =
        "National Scholarship grant of 50000 INR has been approved. Pay GST and processing fee of 2500 INR to unlock and release your scholarship amount.";
      const ctx = makeContext(text, "scholarship", "sms");
      const hits = runRules(ctx);
      const ruleIds = hits.map((h) => h.ruleId);

      expect(ruleIds.some((id) => id === "PAY-005" || id === "PAY-001")).toBe(true);
      const scoreRes = scoreHits(hits, text.length);
      expect(scoreRes.riskLevel).toBe("HIGH_CONCERN");
    });
  });

  describe("Scenario 6: Missing Org Name and Vague Details", () => {
    it("returns NEEDS_VERIFICATION when no organization and vague role", () => {
      const text =
        "Hello, work from home opportunity available for college students. Good stipend. Contact for details.";
      const ctx = makeContext(text, "internship", "whatsapp");
      const hits = runRules(ctx);
      const ruleIds = hits.map((h) => h.ruleId);

      expect(ruleIds).toContain("MIS-001");
      const scoreRes = scoreHits(hits, text.length);
      expect(scoreRes.riskLevel).toBe("NEEDS_VERIFICATION");
    });
  });

  describe("Scenario 7: Poor English Alone", () => {
    it("does not penalize grammatical errors or non-native English phrasing", () => {
      const text =
        "Hello respected student, Infosys Limited hiring trainee engineers for Chennai location. Work is software code writing and testing bug fix. Duration 6 months, stipend 20000 per month. Selected by written interview test next week on campus.";
      const ctx = makeContext(text, "internship", "email", "Infosys Limited");
      const hits = runRules(ctx);

      // Should not trigger scam rules
      const scamHits = hits.filter(
        (h) => h.category === "payment" || h.category === "data_request" || h.ruleId === "MIS-003"
      );
      expect(scamHits.length).toBe(0);
    });
  });

  describe("Specific Rule Catalog Unit Tests", () => {
    it("detects PAY-002: UPI ID and wallet payments", () => {
      const text = "Send training fee to payment@okaxis or scan QR code on PhonePe.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("PAY-002");
    });

    it("detects PAY-004: Mandatory equipment purchase", () => {
      const text = "Candidates must purchase uniform and study material kit from our vendor.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("PAY-004");
    });

    it("detects URG-002: Threats of cancellation or blacklisting", () => {
      const text = "Confirm today or your offer will be cancelled and seat will be given to another student.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("URG-002");
    });

    it("detects DAT-002: Identity documents requested upfront", () => {
      const text = "Upload both sides of Aadhaar card, PAN card and selfie with ID.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("DAT-002");
    });

    it("detects DAT-003: Remote desktop tools like AnyDesk", () => {
      const text = "Install AnyDesk app to verify your system for remote test.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("DAT-003");
    });

    it("detects CHN-001: Recruiter with free Gmail account", () => {
      const text = "Send your resume to infosys.recruitment.hr@gmail.com for processing.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("CHN-001");
    });

    it("detects CHN-002: Contact exclusively on Telegram", () => {
      const text = "For task instructions, contact only on Telegram @hr_manager_online.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("CHN-002");
    });

    it("detects TGB-001: Unrealistic earnings for typing/data entry", () => {
      const text = "Typing job: earn 5000 per day by working 2 hours from mobile.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("TGB-001");
    });

    it("detects TGB-002: 100% guaranteed placement", () => {
      const text = "Join our course for 100% guaranteed placement in top MNCs.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("TGB-002");
    });

    it("detects TGB-003: Unsolicited prize or lottery winner", () => {
      const text = "Congratulations, you have won a lottery cash prize of 10 Lakhs!";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("TGB-003");
    });

    it("detects LNK-001: Hyperlinks present", () => {
      const text = "Apply at https://careers.example.com/apply for the role.";
      const hits = runRules(makeContext(text));
      expect(hits.map((h) => h.ruleId)).toContain("LNK-001");
    });
  });
});
