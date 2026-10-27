import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("Backend API Endpoints", () => {
  describe("GET /api/health", () => {
    it("returns 200 OK with health status and AI status flag", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(typeof res.body.aiAvailable).toBe("boolean");
      expect(typeof res.body.time).toBe("string");
    });
  });

  describe("POST /api/analyze", () => {
    it("returns HIGH_CONCERN for suspicious deposit text in guest mode", async () => {
      const text =
        "Congratulations! You have been selected for an internship. Pay ₹999 as a refundable security deposit within two hours to confirm your position.";
      const res = await request(app)
        .post("/api/analyze")
        .send({
          text,
          domain: "internship",
          channel: "whatsapp",
          saveToHistory: false,
          storeRawText: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("HIGH_RISK");
      expect(res.body.saved).toBe(false);
      expect(res.body.signals.length).toBeGreaterThanOrEqual(3);
      expect(res.body.unknowns.length).toBeGreaterThanOrEqual(1);
      expect(res.body.checklist.length).toBeGreaterThanOrEqual(4);
      expect(res.body.reportGuidance.show).toBe(true);
      expect(res.body.nextSteps).toBeDefined();
      expect(res.body.nextSteps.variant).toBe("protect");
      expect(res.body.nextSteps.alreadyChecked.length).toBeGreaterThanOrEqual(1);
      expect(res.body.nextSteps.yourTurn.length).toBeGreaterThanOrEqual(1);
      expect(res.body.nextSteps.banner.length).toBeGreaterThanOrEqual(2);
      expect(res.body.disclaimer).toContain(
        "Jaanch supports informed decisions"
      );
    });

    it("returns NEEDS_REVIEW with insufficient_evidence for genuine-looking text without positive verification", async () => {
      const text =
        "Acme Technologies Pvt Ltd invites applications for our 3-month Software Engineering Internship in Bangalore. Key responsibilities include frontend feature development and unit testing. Monthly stipend is 25000 INR. Eligibility: Computer Science undergrads. Shortlisted candidates will be invited for an online assessment. Apply by 30/11/2026 at https://acmetech.com/careers or contact hr@acmetech.com.";
      const res = await request(app)
        .post("/api/analyze")
        .send({
          text,
          domain: "internship",
          channel: "email",
          claimedOrg: "Acme Technologies Pvt Ltd",
          saveToHistory: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("NEEDS_REVIEW");
      expect(
        res.body.reasons.some(
          (r: any) =>
            r.checkKey === "org_unregistered_no_evidence" ||
            r.checkKey === "insufficient_evidence"
        )
      ).toBe(true);
      expect(res.body.reportGuidance.show).toBe(false);
    });

    it("rejects input shorter than 20 characters with VALIDATION_ERROR", async () => {
      const res = await request(app)
        .post("/api/analyze")
        .send({
          text: "Too short text",
          domain: "internship",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects unknown body fields due to strict schema", async () => {
      const res = await request(app)
        .post("/api/analyze")
        .send({
          text: "This is a valid length test string for the analyzer.",
          domain: "internship",
          maliciousInjectedField: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/link-check", () => {
    it("flags lookalike domain as HIGH_CONCERN without fetching target URL", async () => {
      const res = await request(app)
        .post("/api/link-check")
        .send({
          url: "http://aicte-internship-apply.xyz",
        });

      expect(res.status).toBe(200);
      expect(res.body.riskLevel).toBe("HIGH_CONCERN");
      expect(res.body.hostname).toBe("aicte-internship-apply.xyz");
      expect(res.body.observations.length).toBeGreaterThan(0);
    });

    it("recognizes official government portal with NO_MAJOR_WARNING_SIGNS", async () => {
      const res = await request(app)
        .post("/api/link-check")
        .send({
          url: "https://scholarships.gov.in/portal",
        });

      expect(res.status).toBe(200);
      expect(res.body.riskLevel).toBe("NO_MAJOR_WARNING_SIGNS");
    });

    it("rejects non-http protocols (e.g. ftp:// or javascript:)", async () => {
      const res = await request(app)
        .post("/api/link-check")
        .send({
          url: "ftp://example.com/file",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/challenge-email", () => {
    it("generates a professional challenge email containing all five required inquiries", async () => {
      const res = await request(app)
        .post("/api/challenge-email")
        .send({
          domain: "internship",
          claimedOrg: "Alpha Corp",
          tone: "polite",
          senderName: "Rohan",
          useAi: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.subject).toContain("internship");
      expect(res.body.body).toContain("Alpha Corp");
      expect(res.body.body).toContain("corporate email address");
      expect(res.body.body).toContain("CIN or LLPIN");
      expect(res.body.body).toContain("Rohan");
      expect(res.body.aiUsed).toBe(false);
    });

    it("generates a safe reply draft with specific questions injected", async () => {
      const res = await request(app)
        .post("/api/challenge-email")
        .send({
          kind: "safe_reply",
          domain: "internship",
          claimedOrg: "Nexora Digital Solutions",
          tone: "polite",
          senderName: "Rohan",
          useAi: false,
          includeQuestions: [
            "registration_meaning_and_fee",
            "selection_process",
            "more_time",
            "official_domain_and_letterhead",
            "data_minimization",
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.subject).toContain("onboarding");
      expect(res.body.body).toContain("registration");
      expect(res.body.body).toContain("selection");
      expect(res.body.body).toContain("letterhead");
      expect(res.body.body).toContain("personal details");
      const wordCount = res.body.body.trim().split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(180);
    });
  });

  describe("GET /api/resources", () => {
    it("returns official portals, 1930 helpline, and domain verification guides", async () => {
      const res = await request(app).get("/api/resources");
      expect(res.status).toBe(200);
      expect(res.body.portals.length).toBeGreaterThanOrEqual(4);
      expect(res.body.helpline.number).toBe("1930");
      expect(res.body.evidenceToKeep.length).toBeGreaterThanOrEqual(4);
      expect(res.body.domainGuides.internship).toBeDefined();
    });
  });

  describe("Auth Route Protection", () => {
    it("returns 401 UNAUTHORIZED on GET /api/analyses without token", async () => {
      const res = await request(app).get("/api/analyses");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 UNAUTHORIZED on DELETE /api/analyses/123 without token", async () => {
      const res = await request(app).delete("/api/analyses/123");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
