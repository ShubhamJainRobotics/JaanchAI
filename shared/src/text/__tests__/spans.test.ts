import { describe, it, expect } from "vitest";
import { segmentSentences } from "../segment.js";
import { findSpan } from "../spans.js";

describe("segmentSentences (§4)", () => {
  it("does not split on abbreviations like Pvt. Ltd., B.E., B.Tech, 7.0, ₹25,000", () => {
    const text =
      "Thank you for applying for Data Analyst Intern at Willowbrook Analytics Pvt. Ltd., Bengaluru.\n" +
      "Eligibility: Final-year B.E./B.Tech students in CSE/IT with a minimum 7.0 CGPA; basic SQL and Python required.\n" +
      "Stipend: ₹25,000 per month at 10:00 a.m. Visit www.merit-scholarship-india.invalid/pay for details.";

    const sentences = segmentSentences(text);
    expect(sentences.length).toBe(3);

    expect(sentences[0].text).toBe(
      "Thank you for applying for Data Analyst Intern at Willowbrook Analytics Pvt. Ltd., Bengaluru."
    );
    expect(sentences[1].text).toBe(
      "Eligibility: Final-year B.E./B.Tech students in CSE/IT with a minimum 7.0 CGPA; basic SQL and Python required."
    );
    expect(sentences[2].text).toBe(
      "Stipend: ₹25,000 per month at 10:00 a.m. Visit www.merit-scholarship-india.invalid/pay for details."
    );
  });

  it("splits accurately on sentence boundary after Microsoft India", () => {
    const text =
      "Software Intern role at Microsoft India. To begin onboarding, please purchase the mandatory software kit for ₹3,000.";
    const sentences = segmentSentences(text);
    expect(sentences.length).toBe(2);
    expect(sentences[0].text).toBe("Software Intern role at Microsoft India.");
    expect(sentences[1].text).toBe(
      "To begin onboarding, please purchase the mandatory software kit for ₹3,000."
    );
  });

  it("preserves numbered lists without creating spurious empty sentences", () => {
    const text = "1. First step to apply.\n2. Second step is interview.";
    const sentences = segmentSentences(text);
    expect(sentences.length).toBe(2);
    expect(sentences[0].text).toBe("1. First step to apply.");
    expect(sentences[1].text).toBe("2. Second step is interview.");
  });
});

describe("findSpan (§4)", () => {
  it("expands to whole-word boundaries and never cuts mid-word", () => {
    const text =
      "Your name has been approved for a Government of India Merit Scholarship worth ₹50,000. To release the amount, pay GST and processing charges of ₹2,350 at www.merit-scholarship-india.invalid/pay.";
    const matchStr = "₹2,350";
    const matchIdx = text.indexOf(matchStr);
    const span = findSpan(text, matchIdx, matchStr.length);

    const cleanQuote = span.quote.replace(/^…\s*/, "").replace(/\s*…$/, "");
    expect(cleanQuote).not.toMatch(/^[^a-zA-Z0-9₹]/);
    // Never starts mid-word (no partial "es of ₹2,350")
    expect(span.quote).toContain("charges of ₹2,350 at www.merit-scholarship-india.invalid/pay");
    expect(span.quote.length).toBeLessThanOrEqual(160);
  });

  it("stops at sentence boundary and does not bleed into the next sentence", () => {
    const text =
      "Software Intern role at Microsoft India. To begin onboarding, please purchase the mandatory software kit for ₹3,000 and reply with the payment receipt. Your laptop will be dispatched after payment.";
    const matchStr = "Microsoft India";
    const matchIdx = text.indexOf(matchStr);
    const span = findSpan(text, matchIdx, matchStr.length);

    expect(span.quote).toContain("Software Intern role at Microsoft India");
    expect(span.quote).not.toContain("To begin onboarding");
    expect(span.quote.length).toBeLessThanOrEqual(160);
  });

  it("regression: full eligibility requirement sentence preserved with wholeSentence option", () => {
    const text =
      "Eligibility: Final-year B.E./B.Tech students in CSE/IT with a minimum 7.0 CGPA; basic SQL and Python required.";
    const matchStr = "Final-year B.E./B.Tech";
    const matchIdx = text.indexOf(matchStr);
    const span = findSpan(text, matchIdx, matchStr.length, { wholeSentence: true });

    expect(span.quote).toBe(
      "Eligibility: Final-year B.E./B.Tech students in CSE/IT with a minimum 7.0 CGPA; basic SQL and Python required."
    );
  });

  it("property test: random matches never start/end mid-word and length <= 160", () => {
    const corpus = [
      "We are pleased to offer you a Software Intern role at Microsoft India. To begin onboarding, please purchase the mandatory software kit for ₹3,000 and reply with the payment receipt.",
      "Congratulations! You are SELECTED for a Work From Home Internship at Brightpath Global Solutions. Stipend: ₹25,000 per month. No interview required, selection is 100% guaranteed.",
      "Dear Ananya, Thank you for applying through our careers page for the Data Analyst Intern position at Willowbrook Analytics Pvt. Ltd., Bengaluru. Eligibility: Final-year B.E./B.Tech students in CSE/IT with a minimum 7.0 CGPA; basic SQL and Python required.",
    ];

    for (const text of corpus) {
      // Test 20 pseudo-random slices
      for (let i = 0; i < 20; i++) {
        const start = Math.floor(Math.random() * (text.length - 10));
        const len = Math.floor(Math.random() * 20) + 1;
        const span = findSpan(text, start, len);

        expect(span.quote.length).toBeLessThanOrEqual(160);

        // Verify quote without ellipses is clean substring of original text
        const rawQuote = span.quote.replace(/^…\s*/, "").replace(/\s*…$/, "");
        expect(text).toContain(rawQuote);

        // Verify start and end are not mid-word in the quote
        expect(rawQuote).toMatch(/^[a-zA-Z0-9₹+@'"]/);
        expect(rawQuote).toMatch(/[a-zA-Z0-9.!?%/:;\-),…'"]$/);
      }
    }
  });

  it("shrinks context symmetrically when context exceeds maxLen", () => {
    const text = "One two three four five middle six seven eight nine ten.";
    const start = text.indexOf("middle");
    const span = findSpan(text, start, 6, { maxLen: 30 });
    expect(span.quote.length).toBeLessThanOrEqual(30);
    expect(span.quote).toContain("middle");
    expect(span.quote).toMatch(/^…|…$/);
  });

  it("truncates match to word boundary with ellipsis when match itself exceeds maxLen", () => {
    const text = "Supercalifragilisticexpialidocious extra long single statement that never stops expanding endlessly.";
    const span = findSpan(text, 0, text.length - 1, { maxLen: 40 });
    expect(span.quote.length).toBeLessThanOrEqual(40);
    expect(span.quote.endsWith("…")).toBe(true);
    // Must not end mid-word
    const withoutEllipsis = span.quote.replace(/\s*…$/, "");
    expect(withoutEllipsis).toMatch(/[a-zA-Z0-9]$/);
  });
});
