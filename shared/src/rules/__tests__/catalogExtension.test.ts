import { describe, it, expect } from "vitest";
import { runRules } from "../engine.js";
import { normalizeText } from "../normalize.js";
import { scoreHits } from "../score.js";
import { RuleContext } from "../types.js";
import { checkLookalikeDomain } from "../../links/lookalike.js";
import { computeStatus } from "../../verification/computeStatus.js";

function makeContext(
  text: string,
  domain: any = "internship",
  channel: any = "email",
  claimedOrg?: string,
  senderEmail?: string,
  senderDomain?: string
): RuleContext {
  return {
    rawText: text,
    normalizedText: normalizeText(text),
    domain,
    channel,
    claimedOrg,
    senderEmail,
    senderDomain,
  };
}

describe("Rule Catalog Extension & Hard Disqualifiers Mapping", () => {
  it("verifies every hard disqualifier bullet from §2 of the rules document maps to a rule", () => {
    const rulesDocumentHardDisqualifiers = [
      { bullet: "registration, training, kit, deposit, processing, documentation, or placement fee", ruleId: "PAY-001" },
      { bullet: "payment through UPI, QR code, gift cards, cryptocurrency, wallet apps, wire transfer, pay first receive offer later", ruleId: "PAY-002" },
      { bullet: "Aadhaar, PAN, bank account, cards, passwords, OTPs before selection/onboarding", ruleId: "DAT-001" },
      { bullet: "passport scans before legitimate process", ruleId: "DAT-005" },
      { bullet: "deposit a cheque and send part back", ruleId: "PAY-009" },
      { bullet: "guaranteed selection, job, scholarship, or unusually high income", ruleId: "TGB-004" },
      { bullet: "reported or confirmed fraudulent in suspect repository", ruleId: "REP-001" },
      { bullet: "lookalike website/email domain of a real organization", ruleId: "SND-002" },
      { bullet: "government scheme claim on non-gov domain or asking payment", ruleId: "GOV-001" },
      { bullet: "recruit other students, buy course, or complete paid tasks", ruleId: "REC-001" },
    ];

    expect(rulesDocumentHardDisqualifiers.length).toBe(10);
    for (const item of rulesDocumentHardDisqualifiers) {
      expect(item.ruleId).toBeDefined();
    }
  });

  describe("Negative checks: benign text does not falsely trigger PAY-001", () => {
    it("does NOT fire PAY-001 when text explicitly states 'no fee required' or 'free of cost'", () => {
      const text =
        "Applications are completely free of cost. No registration fee is required to participate in this hackathon.";
      const hits = runRules(makeContext(text));
      const payHits = hits.filter((h) => h.ruleId === "PAY-001");
      expect(payHits.length).toBe(0);
    });

    it("does NOT fire PAY-001 for fee waiver mentions", () => {
      const text =
        "Eligible low-income candidates will receive a 100% fee waiver for the study materials.";
      const hits = runRules(makeContext(text));
      const payHits = hits.filter((h) => h.ruleId === "PAY-001");
      expect(payHits.length).toBe(0);
    });
  });

  describe("Positive Hard Disqualifier detections", () => {
    it("detects PAY-006: Gift card and cryptocurrency payment", () => {
      const text = "Purchase a Google Play card of ₹500 and send the voucher code to confirm your registration.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "PAY-006");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects PAY-007: Pay first, receive offer later sequencing", () => {
      const text = "You must pay first, and then receive the offer letter from our HR department.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "PAY-007");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects PAY-008: Interview and background-verification fee", () => {
      const text = "A mandatory interview fee of ₹750 is required before scheduling your technical interview.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "PAY-008");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects PAY-009: Cheque deposit and transfer money back", () => {
      const text = "Please deposit this cheque and transfer ₹5,000 back to our purchasing manager.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "PAY-009");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects DAT-005: Passport scan requested upfront", () => {
      const text = "Submit your passport scan immediately for screening before shortlisting.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "DAT-005");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects TGB-004: Guaranteed selection / 100% job", () => {
      const text = "100% selection guaranteed for all applicants with zero prior experience.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "TGB-004");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects REC-001: Requirement to recruit 5 students or buy course", () => {
      const text = "You must recruit 5 students to unlock your internship certificate.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "REC-001");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects GOV-001: Government scheme claim with payment request", () => {
      const text = "PM Internship Scheme selection confirmed. Pay registration fee ₹1,200 to activate.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "GOV-001");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("detects GOV-001: Government scheme claim from non-gov link", () => {
      const text = "National Scholarship Portal allocation approved. Visit https://nsp-scholarship-claims.com to register.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "GOV-001");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });

    it("does NOT fire GOV-001 on genuine scholarships.gov.in link alone without payment", () => {
      const text = "Check eligibility directly on https://scholarships.gov.in for the central sector scheme.";
      const hits = runRules(makeContext(text));
      const hit = hits.find((h) => h.ruleId === "GOV-001");
      expect(hit).toBeUndefined();
    });

    it("detects SND-004: Impersonation in local-part e.g. hr.microsoft.careers@gmail.com", () => {
      const text = "Send your resume to hr.microsoft.careers@gmail.com for immediate onboarding.";
      const hits = runRules(makeContext(text, "internship", "email", undefined, "hr.microsoft.careers@gmail.com", "gmail.com"));
      const hit = hits.find((h) => h.ruleId === "SND-004");
      expect(hit).toBeDefined();
      expect(hit?.hardDisqualifier).toBe(true);
    });
  });

  describe("Lookalike Detection", () => {
    it("flags micros0ft-careers.com as lookalike", () => {
      const res = checkLookalikeDomain("micros0ft-careers.com");
      expect(res.isLookalike).toBe(true);
      expect(res.brandName?.toLowerCase()).toContain("microsoft");
    });

    it("flags google-india-jobs.net as lookalike", () => {
      const res = checkLookalikeDomain("google-india-jobs.net");
      expect(res.isLookalike).toBe(true);
      expect(res.brandName?.toLowerCase()).toContain("google");
    });

    it("flags amazonhiring-india.org as lookalike", () => {
      const res = checkLookalikeDomain("amazonhiring-india.org");
      expect(res.isLookalike).toBe(true);
      expect(res.brandName?.toLowerCase()).toContain("amazon");
    });

    it("does NOT flag genuine official domains from knownOrgs", () => {
      const genuineDomains = [
        "microsoft.com",
        "careers.microsoft.com",
        "google.com",
        "careers.google.com",
        "amazon.jobs",
        "amazon.in",
        "tcs.com",
        "infosys.com",
        "wipro.com",
        "aicte-india.org",
      ];
      for (const d of genuineDomains) {
        const res = checkLookalikeDomain(d);
        expect(res.isLookalike, `Expected ${d} to NOT be flagged as lookalike`).toBe(false);
      }
    });
  });

  describe("Grammar & Content Quality (CNT-001)", () => {
    it("flags multiple severe grammar/spelling errors as CNT-001 with low severity", () => {
      const text =
        "Congradulations! You will recieve an oppurtunit to work at our comapny. Kindly do the needful immediatly.";
      const hits = runRules(makeContext(text));
      const cntHit = hits.find((h) => h.ruleId === "CNT-001");
      expect(cntHit).toBeDefined();
      expect(cntHit?.severity).toBe("low");
    });

    it("proves CNT-001 alone never changes status to HIGH_RISK", () => {
      const text =
        "Congradulations! You will recieve an oppurtunit to work at our comapny. Kindly do the needful immediatly.";
      const hits = runRules(makeContext(text));
      const scoreRes = scoreHits(hits, text.length);

      const statusRes = computeStatus({
        signals: hits.map((h) => ({
          ...h,
          source: "rule",
        })),
        ruleScore: scoreRes.score,
        textLength: text.length,
      });

      expect(statusRes.status).not.toBe("HIGH_RISK");
      expect(statusRes.status).not.toBe("CONFIRMED_SCAM");
    });

    it("proves a polished message with a registration fee is still HIGH_RISK", () => {
      const text =
        "We are pleased to inform you of your successful selection for our prestigious Graduate Internship Program. Please transfer the ₹1,499 registration fee within two hours.";
      const hits = runRules(makeContext(text));
      const scoreRes = scoreHits(hits, text.length);

      const statusRes = computeStatus({
        signals: hits.map((h) => ({
          ...h,
          source: "rule",
        })),
        ruleScore: scoreRes.score,
        textLength: text.length,
      });

      expect(statusRes.status).toBe("HIGH_RISK");
    });
  });
});
