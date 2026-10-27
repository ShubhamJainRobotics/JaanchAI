import { describe, it, expect } from "vitest";
import { computeStatus, runRules, scoreHits, Signal, checkCompleteness, extractOfferFields } from "shared";
import { safeFetch } from "../lib/safeFetch.js";

function hitsToSignals(hits: any[]): Signal[] {
  return hits.map((h) => ({
    ruleId: h.ruleId,
    category: h.category,
    severity: h.severity,
    source: "rule",
    title: h.title,
    whyItMatters: h.whyItMatters,
    evidenceQuote: h.evidenceQuote,
    hardDisqualifier: h.hardDisqualifier || false,
  }));
}

describe("System and Security Invariants", () => {
  it("Invariant 1: VERIFIED_OFFICIAL is unreachable from message text alone (random texts property test)", () => {
    const vocabulary = [
      "Congratulations!", "Internship", "TCS", "Google", "Infosys", "Microsoft",
      "Stipend", "50000", "Free", "Training", "Online", "Apply", "Offer",
      "Official", "HR", "Verified", "Guaranteed", "Selection", "Immediately",
      "Welcome to our team", "Please submit your documents", "Deadline tomorrow",
      "Best regards", "Recruitment Lead", "Bangalore", "Work from home"
    ];

    for (let i = 0; i < 50; i++) {
      // Generate pseudo-random text from vocabulary
      const wordCount = 15 + Math.floor(Math.random() * 30);
      const words: string[] = [];
      for (let w = 0; w < wordCount; w++) {
        words.push(vocabulary[Math.floor(Math.random() * vocabulary.length)]);
      }
      const randomText = words.join(" ");

      const ruleHits = runRules({
        rawText: randomText,
        normalizedText: randomText.toLowerCase(),
        domain: "internship",
        channel: "email",
      });
      const { score, dedupedHits } = scoreHits(ruleHits, randomText.length);
      const fields = extractOfferFields(randomText);
      const { completeness } = checkCompleteness(fields);

      const { status } = computeStatus({
        signals: hitsToSignals(dedupedHits),
        ruleScore: score,
        textLength: randomText.length,
        completeness,
        // No verified headers, no registry org match, no platform fetched listing
      });

      // Status CANNOT be VERIFIED_OFFICIAL
      expect(status).not.toBe("VERIFIED_OFFICIAL");
    }
  });

  it("Invariant 2: CONFIRMED_SCAM is reachable ONLY via a confirmed reported record", () => {
    // Highly malicious text with multiple hard disqualifiers
    const scamText = "Pay ₹5,000 via UPI now to get this job! Guaranteed selection!";
    const ruleHits = runRules({
      rawText: scamText,
      normalizedText: scamText.toLowerCase(),
      domain: "internship",
      channel: "whatsapp",
    });
    const { score, dedupedHits } = scoreHits(ruleHits, scamText.length);

    // Without confirmed reported record -> MUST be HIGH_RISK, never CONFIRMED_SCAM
    const resultNoRecord = computeStatus({
      signals: hitsToSignals(dedupedHits),
      ruleScore: score,
      textLength: scamText.length,
      reportedMatches: [],
    });
    expect(resultNoRecord.status).toBe("HIGH_RISK");

    // With reported (not yet confirmed) record -> still HIGH_RISK
    const resultReported = computeStatus({
      signals: hitsToSignals(dedupedHits),
      ruleScore: score,
      textLength: scamText.length,
      reportedMatches: [
        {
          entityType: "upi",
          valueHash: "hash123",
          status: "reported",
          reportCount: 3,
        },
      ],
    });
    expect(resultReported.status).toBe("HIGH_RISK");

    // ONLY with confirmed record -> CONFIRMED_SCAM
    const resultConfirmed = computeStatus({
      signals: hitsToSignals(dedupedHits),
      ruleScore: score,
      textLength: scamText.length,
      reportedMatches: [
        {
          entityType: "upi",
          valueHash: "hash123",
          status: "confirmed",
          reportCount: 1,
        },
      ],
    });
    expect(resultConfirmed.status).toBe("CONFIRMED_SCAM");
  });

  it("Invariant 4 & 5: Hard disqualifiers always force HIGH_RISK; CNT-001 alone never does", () => {
    // Message with CNT-001 (grammar/spelling issues only)
    const grammarOnlyText = "Dearest sir, kindly do the needful and revert back as per your convenient time.";
    const hits1 = runRules({
      rawText: grammarOnlyText,
      normalizedText: grammarOnlyText.toLowerCase(),
      domain: "internship",
      channel: "email",
    });
    const { score: score1, dedupedHits: deduped1 } = scoreHits(hits1, grammarOnlyText.length);
    const resGrammar = computeStatus({
      signals: hitsToSignals(deduped1),
      ruleScore: score1,
      textLength: grammarOnlyText.length,
    });
    expect(resGrammar.status).not.toBe("HIGH_RISK");
    expect(resGrammar.status).not.toBe("CONFIRMED_SCAM");

    // Perfectly written message with a hard disqualifier
    const polishedScam = "We are pleased to offer you the Software Developer position. Prior to onboarding, please transfer the mandatory ₹1,500 background verification fee.";
    const hits2 = runRules({
      rawText: polishedScam,
      normalizedText: polishedScam.toLowerCase(),
      domain: "internship",
      channel: "email",
    });
    const { score: score2, dedupedHits: deduped2 } = scoreHits(hits2, polishedScam.length);
    const resPolishedScam = computeStatus({
      signals: hitsToSignals(deduped2),
      ruleScore: score2,
      textLength: polishedScam.length,
    });
    expect(resPolishedScam.status).toBe("HIGH_RISK");
  });

  it("Invariant 7: Server never contacts non-allowlisted / suspect hosts", async () => {
    const suspectUrl = "https://student-job-fake-verification.xyz/apply";
    await expect(
      safeFetch(suspectUrl, {
        allowedHosts: ["tcs.com", "infosys.com", "wipro.com"],
      })
    ).rejects.toThrow(/not in the approved registry allowlist/);
  });
});
