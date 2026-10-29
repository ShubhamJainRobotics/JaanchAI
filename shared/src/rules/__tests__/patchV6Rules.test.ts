import { describe, it, expect } from "vitest";
import { runRules } from "../engine.js";
import { RuleContext } from "../types.js";

function makeContext(rawText: string, opts?: Partial<RuleContext>): RuleContext {
  return {
    rawText,
    normalizedText: rawText,
    domain: "internship",
    channel: "email",
    ...opts,
  };
}

describe("Patch v6 Rules & Negation Window Tests (§7)", () => {
  describe("PAY-008: Mandatory software kit, equipment, tools", () => {
    const positives = [
      "Please purchase the mandatory software kit for ₹3,000 to begin your setup.",
      "You must buy the laptop and software license from our vendor.",
      "Pay ₹1,200 as welcome kit fee before joining.",
      "A uniform fee and ID card charges of ₹850 must be paid upfront.",
    ];

    positives.forEach((text, i) => {
      it(`fires PAY-008 on positive #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-008");
        expect(hit).toBeDefined();
        expect(hit?.hardDisqualifier).toBe(true);
      });
    });

    const negatives = [
      "No fee is charged for software; all software is provided free of cost by the company.",
      "We never ask you to pay for any software or tools.",
      "Please do not share any payment for equipment with anyone claiming to represent us.",
      "All laptops and development tools will be shipped directly by our IT department at zero cost.",
    ];

    negatives.forEach((text, i) => {
      it(`does NOT fire PAY-008 on negative #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-008");
        expect(hit).toBeUndefined();
      });
    });
  });

  describe("PAY-007: Laptop dispatched after payment / Pay-first onboarding", () => {
    const positives = [
      "Your laptop will be dispatched after payment of the initial security deposit.",
      "Once payment is received, your onboarding kit and appointment letter will be issued.",
      "Please reply with the payment receipt and UTR number to proceed.",
      "Pay first, receive laptop and onboarding credentials later.",
    ];

    positives.forEach((text, i) => {
      it(`fires PAY-007 on positive #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-007");
        expect(hit).toBeDefined();
        expect(hit?.hardDisqualifier).toBe(true);
      });
    });

    const negatives = [
      "Your laptop will be dispatched after completing the HR document verification process.",
      "Once verification is confirmed, your welcome email will be sent.",
      "Please reply with your signed offer letter within 5 working days.",
      "We never require payment before or after joining.",
    ];

    negatives.forEach((text, i) => {
      it(`does NOT fire PAY-007 on negative #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-007");
        expect(hit).toBeUndefined();
      });
    });
  });

  describe("PAY-002: UPI ID payments without dot in handle", () => {
    const positives = [
      "Pay refundable fee to UPI ID brightpath.hr@okbank within 2 hours.",
      "Transfer the onboarding amount via UPI to intern.desk@ybl immediately.",
      "Send ₹1,500 to recruiter@okicici on Google Pay.",
      "Scan the QR code to pay your seat reservation fee.",
    ];

    positives.forEach((text, i) => {
      it(`fires PAY-002 on positive #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-002");
        expect(hit).toBeDefined();
        expect(hit?.hardDisqualifier).toBe(true);
      });
    });

    const negatives = [
      "Queries should be emailed to careers@brightpath-global.com.",
      "Send your resume to talent.acquisition@infosys.co.in.",
      "Contact support at hr@willowbrook-analytics.invalid.",
      "Never pay any individual UPI ID or personal phone number.",
    ];

    negatives.forEach((text, i) => {
      it(`does NOT fire PAY-002 on negative #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-002");
        expect(hit).toBeUndefined();
      });
    });
  });

  describe("PAY-003: Refundable deposit promise", () => {
    const positives = [
      "Pay a refundable registration fee of ₹1,499 to confirm your seat.",
      "The training cost is 100% refundable with your first stipend.",
      "The fee will be refunded upon successful completion of the internship.",
      "A security amount will be returned after completion of your 30-day training.",
    ];

    positives.forEach((text, i) => {
      it(`fires PAY-003 on positive #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-003");
        expect(hit).toBeDefined();
      });
    });

    const negatives = [
      "No fee is charged to any student for this internship.",
      "This is an entirely free training program funded by our CSR department.",
      "Do not pay any refundable or non-refundable deposit to anyone.",
      "Stipend is paid at ₹20,000 per month without any deductions.",
    ];

    negatives.forEach((text, i) => {
      it(`does NOT fire PAY-003 on negative #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "PAY-003");
        expect(hit).toBeUndefined();
      });
    });
  });

  describe("PAY-005: Pay GST / unlock funds", () => {
    const positives = [
      "To release the amount, pay GST and processing charges of ₹2,350 at our portal.",
      "Pay ₹1,000 processing fee to release your approved ₹50,000 scholarship.",
      "The scholarship amount will be released after payment of customs and handling charges.",
      "Deposit ₹500 before disbursement of your grant funds.",
    ];

    positives.forEach((text, i) => {
      it(`fires PAY-005 on positive #${i + 1}`, () => {
        const hits = runRules(makeContext(text, { domain: "scholarship" }));
        const hit = hits.find((h) => h.ruleId === "PAY-005");
        expect(hit).toBeDefined();
        expect(hit?.hardDisqualifier).toBe(true);
      });
    });

    const negatives = [
      "Government scholarship of ₹50,000 will be credited directly to your bank account with no fee.",
      "National Scholarship Portal never charges GST or processing fees to applicants.",
      "No payment required to release your scholarship grant.",
      "The fellowship amount of ₹25,000 is disbursed automatically every month.",
    ];

    negatives.forEach((text, i) => {
      it(`does NOT fire PAY-005 on negative #${i + 1}`, () => {
        const hits = runRules(makeContext(text, { domain: "scholarship" }));
        const hit = hits.find((h) => h.ruleId === "PAY-005");
        expect(hit).toBeUndefined();
      });
    });
  });

  describe("TGB-004: 100% guaranteed selection without interview", () => {
    const positives = [
      "No interview required, selection is 100% guaranteed.",
      "Assured selection for all students who register today.",
      "Guaranteed placement with ₹50,000 monthly stipend with no test or exam.",
      "This sure-shot selection program guarantees an immediate offer.",
    ];

    positives.forEach((text, i) => {
      it(`fires TGB-004 on positive #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "TGB-004");
        expect(hit).toBeDefined();
        expect(hit?.hardDisqualifier).toBe(true);
      });
    });

    const negatives = [
      "Selection is subject to passing the technical interview and coding assessment.",
      "An interview round is mandatory before any offer can be extended.",
      "Final selection depends on performance in the group discussion.",
      "We will call for an interview next week to evaluate your profile.",
    ];

    negatives.forEach((text, i) => {
      it(`does NOT fire TGB-004 on negative #${i + 1}`, () => {
        const hits = runRules(makeContext(text));
        const hit = hits.find((h) => h.ruleId === "TGB-004");
        expect(hit).toBeUndefined();
      });
    });
  });

  describe("Negation Window Cross-Clause Invariant (§7)", () => {
    it("fires PAY-001 when a real demand follows a negation in a preceding sentence", () => {
      const text = "No interview required. Pay ₹999 registration fee now.";
      const hits = runRules(makeContext(text));
      const payHit = hits.find((h) => h.ruleId === "PAY-001");
      expect(payHit).toBeDefined();
    });

    it("does NOT fire PAY-001 when negation is inside the same clause", () => {
      const text = "Please note that no registration fee or deposit is required for this role.";
      const hits = runRules(makeContext(text));
      const payHit = hits.find((h) => h.ruleId === "PAY-001");
      expect(payHit).toBeUndefined();
    });

    it("does NOT fire PAY-001 on 'Please do not share any payment'", () => {
      const text = "Please do not share any payment or sensitive documents with anyone claiming to represent us.";
      const hits = runRules(makeContext(text));
      const payHit = hits.find((h) => h.ruleId === "PAY-001");
      expect(payHit).toBeUndefined();
    });

    it("does NOT fire on 'this is not a paid internship'", () => {
      const text = "Please understand that this is not a paid internship; it is a volunteer learning opportunity.";
      const hits = runRules(makeContext(text));
      const payHit = hits.find((h) => h.ruleId === "PAY-001");
      expect(payHit).toBeUndefined();
    });
  });
});
