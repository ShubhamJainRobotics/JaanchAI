import { describe, it, expect, beforeAll } from "vitest";
import React from "react";
import path from "node:path";
import fs from "node:fs";
import { renderToBuffer } from "@react-pdf/renderer";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import {
  AnalysisResult,
  buildReportViewModel,
  normalizeText,
  runRules,
  scoreHits,
  extractOfferFields,
  checkCompleteness,
  extractEntities,
  computeStatus,
  analyzeSenderEmail,
  Signal,
  Severity,
} from "shared";
import { ReportDocument } from "../pdf/ReportDocument";
import { registerReportFonts } from "../pdf/fonts";

// Register local fonts with absolute filesystem path for Node
beforeAll(() => {
  const fontDir = path.resolve(__dirname, "../../public/fonts");
  registerReportFonts(fontDir);
});

function createSyntheticResult(signalCount: number, overrides?: Partial<AnalysisResult>): AnalysisResult {
  const signals: Signal[] = [];
  const severities: Severity[] = ["critical", "high", "medium", "low", "info"];

  for (let i = 0; i < signalCount; i++) {
    const sev = severities[i % severities.length];
    signals.push({
      ruleId: `RULE-${100 + i}`,
      category: i % 2 === 0 ? "payment" : "urgency",
      severity: sev,
      source: i % 3 === 0 ? "ai" : "rule",
      title: `Synthetic warning indicator #${i + 1} requiring candidate review`,
      whyItMatters: `Detailed explanation of why indicator #${i + 1} matters for candidate safety and due diligence.`,
      evidenceQuote:
        i % 4 === 0
          ? `Pay ₹${1500 + i * 250} deposit to account within 24 hours`
          : `Selected for internship role without interview at Acme Tech Pvt. Ltd.`,
      hardDisqualifier: i === 0 && signalCount >= 10,
    });
  }

  return {
    id: `synthetic-${signalCount}-signals`,
    saved: true,
    domain: "internship",
    status: signalCount >= 9 ? "HIGH_RISK" : "NEEDS_REVIEW",
    reasons: [
      {
        checkKey: "subtle_signals_pattern",
        effect: "NEEDS_REVIEW",
        detail: "Multiple subtle inconsistency signals detected across message text.",
      },
    ],
    ruleScore: signalCount * 5,
    summary: "Synthetic verification assessment for document pagination testing.",
    signals,
    checks: [
      {
        checkKey: "sender_domain_match",
        label: "Sender Domain Legitimacy",
        outcome: "unknown",
        detail: "Domain does not match verified records.",
        source: "rule",
      },
      {
        checkKey: "organization_registry_match",
        label: "Organization Registry Verification",
        outcome: "unknown",
        detail: "Organization not found in corporate registry.",
        source: "registry",
      },
      {
        checkKey: "payment_request",
        label: "Payment Request Check",
        outcome: signalCount > 0 ? "fail" : "none_found",
        detail: signalCount > 0 ? "Deposit fee of ₹2,500 requested." : "No payment requests found.",
        source: "rule",
      },
      {
        checkKey: "header_authentication",
        label: "Header Authentication",
        outcome: "not_run",
        detail: "Headers not supplied",
        source: "header_parse",
      },
      {
        checkKey: "official_listing",
        label: "Official Listing Comparison",
        outcome: "not_run",
        detail: "Listing not supplied",
        source: "listing_compare",
      },
    ],
    extractedFields: {
      organization: { value: "Synthetic Corp Pvt. Ltd.", evidenceQuote: "Synthetic Corp", source: "rule" },
      roleOrProgram: { value: "Research Intern", evidenceQuote: "Research Intern", source: "rule" },
      eligibility: { value: "Final year B.E./B.Tech", evidenceQuote: "Final year B.E./B.Tech", source: "rule" },
      locationOrMode: { value: "Remote", evidenceQuote: "Remote", source: "rule" },
      duration: { value: "3 months", evidenceQuote: "3 months", source: "rule" },
      compensation: {
        value: { kind: "stipend", raw: "₹20,000 / month", amountInr: 20000, period: "month" },
        evidenceQuote: "stipend of ₹20,000",
        source: "rule",
      },
      selectionProcess: null,
      deadline: null,
      contactChannel: { value: "hr@synthetic-corp.invalid", evidenceQuote: "hr@synthetic-corp.invalid", source: "rule" },
      officialLink: null,
    },
    completeness: {
      score: 7,
      present: ["organization", "role", "eligibility", "location", "duration", "compensation", "contactChannel"],
      missing: ["selectionProcess", "deadline", "officialLink"],
      details: [
        { key: "selectionProcess", label: "Selection Process", present: false, reason: "No interview described." },
        { key: "deadline", label: "Deadline", present: false, reason: "No deadline specified." },
        { key: "officialLink", label: "Official Link", present: false, reason: "No portal link provided." },
      ],
    },
    senderIdentity: {
      rawEmail: "hr@synthetic-corp.invalid",
      domain: "synthetic-corp.invalid",
      displayName: "HR",
      localPart: "hr",
      registrableDomain: "synthetic-corp.invalid",
      isFreeMail: false,
      isLookalike: false,
      matchesRegistryOrg: false,
      recruiterName: null,
      phone: null,
      upiId: null,
      socialHandle: null,
      websiteUrl: null,
      lookalikeDetails: null,
      consistencyIssue: null,
    },
    unknowns: [{ item: "Sender identity", howToVerify: "Check official website." }],
    checklist: [{ position: 0, label: "Check website", portalKey: null, completed: false }],
    links: [],
    reportGuidance: { show: false, helpline: "1930", portalUrl: "https://cybercrime.gov.in", keepAsEvidence: [] },
    aiUsed: false,
    aiStatus: "not_requested",
    textOnlyConfidence: null,
    durationMs: 35,
    reportedMatches: [],
    disclaimer: "Jaanch supports informed decisions.",
    createdAt: "2026-10-28T10:00:00.000Z",
    paymentAlert: signals.some((s) => s.category === "payment" || (s.ruleId && s.ruleId.startsWith("PAY-"))),
    inputNotices: [],
    ...overrides,
  };
}

function analyzeCorpusFixture(fixturePath: string): AnalysisResult {
  const content = fs.readFileSync(fixturePath, "utf-8");
  const lines = content.split("\n");
  const bodyLines: string[] = [];

  for (const line of lines) {
    if (!line.startsWith("#")) {
      bodyLines.push(line);
    }
  }

  const rawText = bodyLines.join("\n").trim();
  const normalizedText = normalizeText(rawText);

  const entities = extractEntities(rawText);
  const topOrg = entities.organizationCandidates[0]?.name;
  const extractedFields = extractOfferFields(rawText, topOrg);
  const { completeness } = checkCompleteness(extractedFields);

  const senderEmail = entities.emails[0]?.value;
  const senderIdentity = analyzeSenderEmail(senderEmail, { claimedOrg: topOrg });

  const ruleHits = runRules({
    rawText,
    normalizedText,
    domain: "internship",
    channel: "email",
    claimedOrg: topOrg,
    senderEmail,
    senderDomain: senderIdentity.domain || undefined,
  });

  const { score: ruleScore, dedupedHits } = scoreHits(ruleHits, rawText.length);
  const mappedSignals: Signal[] = dedupedHits.map((h) => ({
    ...h,
    source: "rule" as const,
  }));

  const checks = [
    {
      checkKey: "sender_domain_match",
      label: "Sender Domain Legitimacy",
      outcome: senderIdentity.isFreeMail ? "fail" : "unknown",
      detail: senderIdentity.domain ? `Domain: ${senderIdentity.domain}` : "No email provided.",
      source: "rule" as const,
    },
    {
      checkKey: "organization_registry_match",
      label: "Organization Registry Verification",
      outcome: "unknown",
      detail: topOrg ? `Claimed: ${topOrg}` : "No organization detected.",
      source: "registry" as const,
    },
    {
      checkKey: "payment_request",
      label: "Payment Request Check",
      outcome: dedupedHits.some((h) => h.category === "payment") ? "fail" : "none_found",
      detail: dedupedHits.some((h) => h.category === "payment")
        ? "Payment indicator detected."
        : "No payment requests found.",
      source: "rule" as const,
    },
  ];

  const statusRes = computeStatus({
    signals: mappedSignals,
    ruleScore,
    textLength: rawText.length,
    matchedOrganization: null,
    senderIdentity,
    completeness,
    checks: checks as any,
  });

  return {
    id: path.basename(fixturePath, ".txt"),
    saved: true,
    domain: "internship",
    status: statusRes.status,
    reasons: statusRes.reasons,
    ruleScore,
    summary: "Corpus fixture analysis",
    signals: mappedSignals,
    checks: checks as any,
    extractedFields,
    completeness,
    senderIdentity,
    unknowns: [{ item: "Identity", howToVerify: "Check website" }],
    checklist: [{ position: 0, label: "Verify company", portalKey: null, completed: false }],
    links: [],
    reportGuidance: { show: false, helpline: "1930", portalUrl: "https://cybercrime.gov.in", keepAsEvidence: [] },
    aiUsed: false,
    aiStatus: "not_requested",
    textOnlyConfidence: null,
    durationMs: 40,
    reportedMatches: [],
    disclaimer: "Jaanch supports informed decisions.",
    createdAt: "2026-10-28T10:00:00.000Z",
    paymentAlert: mappedSignals.some((s) => s.category === "payment" || (s.ruleId && s.ruleId.startsWith("PAY-"))),
    inputNotices: [],
  };
}

describe("PDF Deterministic Rendering & Geometry Tests (§9)", () => {
  const KNOWN_SECTION_HEADINGS = [
    "Why This Status: Key Evidence",
    "What We Observed",
    "Offer Verification Evidence Checks",
    "Offer Details Found & Completeness",
    "Immediate Protective Steps",
    "Your Turn: Verification Steps",
    "Safe Reply Draft",
    "Appendix: Message Analysed (PII Redacted)",
  ];

  async function renderAndAnalyzePdf(result: AnalysisResult) {
    const startTime = performance.now();
    const vm = buildReportViewModel(result, { includeNextSteps: true });
    const docElement = React.createElement(ReportDocument, { viewModel: vm });
    const buffer = await renderToBuffer(docElement as any);
    const durationMs = performance.now() - startTime;

    const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const numPages = pdfDoc.numPages;

    const pagesData: Array<{
      pageNum: number;
      text: string;
      items: Array<{ str: string; y: number }>;
      lowestBodyY: number;
      fillPercentage: number;
    }> = [];

    // A4 printable height: 841.89 pt total, margins 36 pt top, 44 pt bottom
    // Top printable bound ~ 805.89 pt. Printable span = 841.89 - 36 - 44 = 761.89 pt.
    const TOP_BOUND = 805;
    const PRINTABLE_HEIGHT = 760;

    for (let p = 1; p <= numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const content = await page.getTextContent();

      const items = content.items
        .map((it: any) => ({
          str: it.str.trim(),
          y: it.transform[5],
        }))
        .filter((it: any) => it.str.length > 0);

      const fullPageText = items.map((it: any) => it.str).join(" ");

      // Exclude fixed footer items at bottom (y <= 30)
      const bodyItems = items.filter((it: any) => it.y > 30);
      const lowestBodyY =
        bodyItems.length > 0
          ? Math.min(...bodyItems.map((it: any) => it.y))
          : TOP_BOUND;

      // Fill percentage: how far text reaches from top bound down to bottom
      const fillSpan = Math.max(0, TOP_BOUND - lowestBodyY);
      const fillPercentage = Math.min(100, (fillSpan / PRINTABLE_HEIGHT) * 100);

      pagesData.push({
        pageNum: p,
        text: fullPageText,
        items,
        lowestBodyY,
        fillPercentage,
      });
    }

    return {
      buffer,
      byteLength: buffer.length,
      durationMs,
      numPages,
      pagesData,
      viewModel: vm,
    };
  }

  // -------------------------------------------------------------
  // Synthetic Tests: 0, 1, 9, 15 signals
  // -------------------------------------------------------------
  const syntheticSignalCounts = [0, 1, 9, 15];

  for (const count of syntheticSignalCounts) {
    it(`renders synthetic result with ${count} signals (page count <= 4, fill >= 75%, no orphan headings)`, async () => {
      const result = createSyntheticResult(count);
      const { numPages, byteLength, durationMs, pagesData, viewModel } =
        await renderAndAnalyzePdf(result);

      // Criteria 3: Page count <= 4 (<= 3 for typical <= 9 signals)
      if (count <= 9) {
        expect(numPages).toBeLessThanOrEqual(3);
      } else {
        expect(numPages).toBeLessThanOrEqual(4);
      }

      // Criteria 8: Size < 600 KB and generation < 3000 ms
      expect(byteLength).toBeLessThan(600 * 1024);
      expect(durationMs).toBeLessThan(3000);

      // Criteria 4: Fill check on every page except the last (>= 75% printable height)
      for (let i = 0; i < pagesData.length - 1; i++) {
        const page = pagesData[i];
        expect(
          page.fillPercentage,
          `Page ${page.pageNum} fill is ${page.fillPercentage.toFixed(1)}% (< 75%)`
        ).toBeGreaterThanOrEqual(75);
      }

      // Criteria 5: No orphan headings (no page's final text line is a section heading)
      for (const page of pagesData) {
        // Look at body items sorted top-to-bottom (y descending)
        const bodyItems = page.items.filter((it) => it.y > 30);
        if (bodyItems.length > 0) {
          const lastItem = bodyItems[bodyItems.length - 1];
          for (const heading of KNOWN_SECTION_HEADINGS) {
            expect(
              lastItem.str.toLowerCase(),
              `Page ${page.pageNum} has orphaned heading: "${lastItem.str}"`
            ).not.toBe(heading.toLowerCase());
          }
        }
      }

      // Criteria 7: Header, footer, disclaimer, Page X of Y on all pages
      for (const page of pagesData) {
        expect(page.text).toContain("Jaanch · Offer Verification Report");
        expect(page.text).toContain("Jaanch supports informed decisions");
        expect(page.text).toContain(viewModel.reportId);
        expect(page.text).toMatch(/Page \d+ of \d+/);
      }

      // Criteria 7 & ₹ preservation: Contains ₹ when input has ₹
      const firstPage = pagesData[0];
      expect(firstPage.text).toContain("₹");

      // Criteria 9: No browser chrome strings
      for (const page of pagesData) {
        expect(page.text).not.toContain("localhost");
        expect(page.text).not.toContain("127.0.0.1");
        expect(page.text).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:AM|PM)/i);
      }
    });
  }

  // -------------------------------------------------------------
  // Real Corpus Fixtures Tests
  // -------------------------------------------------------------
  const corpusDir = path.resolve(__dirname, "../../../shared/src/__fixtures__/corpus");

  if (fs.existsSync(corpusDir)) {
    const fixtureFiles = fs
      .readdirSync(corpusDir)
      .filter((f) => f.endsWith(".txt"))
      .sort();

    it(`renders all ${fixtureFiles.length} corpus fixtures with page count <= 4 and size < 600KB`, async () => {
      for (const file of fixtureFiles) {
        const fixturePath = path.join(corpusDir, file);
        const analysis = analyzeCorpusFixture(fixturePath);
        const { numPages, byteLength, durationMs, pagesData } =
          await renderAndAnalyzePdf(analysis);

        // Typical report <= 3 pages, absolute maximum <= 4 pages
        expect(
          numPages,
          `Corpus fixture ${file} produced ${numPages} pages (> 4)`
        ).toBeLessThanOrEqual(4);

        // Size < 600 KB
        expect(
          byteLength,
          `Corpus fixture ${file} size ${byteLength} bytes (>= 600KB)`
        ).toBeLessThan(600 * 1024);

        // Generation < 3s
        expect(
          durationMs,
          `Corpus fixture ${file} took ${durationMs}ms (>= 3000ms)`
        ).toBeLessThan(3000);

        // Fill check on multi-page reports (spec: >= 70% on all except last)
        for (let i = 0; i < pagesData.length - 1; i++) {
          const page = pagesData[i];
          expect(
            page.fillPercentage,
            `Fixture ${file} Page ${page.pageNum} fill is ${page.fillPercentage.toFixed(1)}%`
          ).toBeGreaterThanOrEqual(70);
        }
      }
    });
  }
});
