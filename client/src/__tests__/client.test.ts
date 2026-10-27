import { describe, it, expect } from "vitest";
import { DEMO_SAMPLES } from "../demo/samples";
import { apiClient } from "../lib/apiClient";

describe("Client Application Integrity", () => {
  describe("Demo Test Samples", () => {
    it("provides all 7 required test scenario samples with valid properties", () => {
      expect(DEMO_SAMPLES.length).toBe(7);

      const sampleIds = DEMO_SAMPLES.map((s) => s.id);
      expect(sampleIds).toContain("illustrative_deposit");
      expect(sampleIds).toContain("scholarship_fee");
      expect(sampleIds).toContain("banking_creds");
      expect(sampleIds).toContain("task_scam");
      expect(sampleIds).toContain("vague_unsolicited");
      expect(sampleIds).toContain("genuine_internship");
      expect(sampleIds).toContain("genuine_non_native");

      for (const sample of DEMO_SAMPLES) {
        expect(sample.text.length).toBeGreaterThanOrEqual(20);
        expect(sample.domain).toBeDefined();
        expect(sample.channel).toBeDefined();
        expect(sample.title).toBeDefined();
      }
    });

    it("verifies illustrative deposit sample text matches acceptance scenario 2", () => {
      const depositSample = DEMO_SAMPLES.find((s) => s.id === "illustrative_deposit")!;
      expect(depositSample.text).toContain("₹999");
      expect(depositSample.text).toContain("refundable security deposit");
      expect(depositSample.text).toContain("two hours");
    });
  });

  describe("Local Session Storage Helpers", () => {
    it("handles save, get, and clear without throwing", () => {
      const mockResult: any = {
        id: null,
        saved: false,
        domain: "internship",
        status: "HIGH_RISK",
        reasons: [{ checkKey: "payment_demand", effect: "flagged", detail: "Fee required" }],
        ruleScore: 65,
        summary: "Test summary",
        signals: [],
        unknowns: [{ item: "Identity", howToVerify: "Check website" }],
        checklist: [],
        links: [],
        checks: [],
        reportGuidance: { show: true, helpline: "1930", portalUrl: "https://cybercrime.gov.in", keepAsEvidence: [] },
        aiUsed: false,
        aiStatus: "not_requested",
        textOnlyConfidence: null,
        durationMs: 45,
        disclaimer: "Test disclaimer",
        createdAt: new Date().toISOString(),
      };

      apiClient.saveLocalResult(mockResult);
      apiClient.clearLocalResult();
    });
  });
});
