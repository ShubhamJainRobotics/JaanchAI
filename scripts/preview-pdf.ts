import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import React from "react";
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
} from "../shared/src/index.js";
import { ReportDocument } from "../client/src/pdf/ReportDocument.js";
import { registerReportFonts } from "../client/src/pdf/fonts.js";

// Register bundled local fonts
const fontDir = path.resolve(process.cwd(), "client/public/fonts");
registerReportFonts(fontDir);

// Determine preview output dir
const outDir = process.platform === "win32"
  ? path.resolve(process.env.TEMP || "C:\\tmp", "jaanch-pdf-preview")
  : "/tmp/jaanch-pdf-preview";

fs.mkdirSync(outDir, { recursive: true });
console.log(`[pdf:preview] Rendering PDFs into: ${outDir}`);

// Check if pdftoppm is installed
let hasPdftoppm = false;
try {
  execSync("pdftoppm -v", { stdio: "ignore" });
  hasPdftoppm = true;
} catch {
  hasPdftoppm = false;
}

const corpusDir = path.resolve(process.cwd(), "shared/src/__fixtures__/corpus");
const fixtureFiles = fs
  .readdirSync(corpusDir)
  .filter((f) => f.endsWith(".txt"))
  .sort();

function analyzeFixture(fixturePath: string): AnalysisResult {
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
    signals: dedupedHits,
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
    signals: dedupedHits,
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
    disclaimer: "Jaanch supports informed decisions.",
    createdAt: "2026-10-28T10:00:00.000Z",
  };
}

async function run() {
  let totalRenderTime = 0;

  for (const file of fixtureFiles) {
    const fixturePath = path.join(corpusDir, file);
    const fixtureId = path.basename(file, ".txt");
    const analysis = analyzeFixture(fixturePath);

    const t0 = performance.now();
    const vm = buildReportViewModel(analysis, { includeNextSteps: true });
    const docElement = React.createElement(ReportDocument, { viewModel: vm });
    const buffer = await renderToBuffer(docElement);
    const duration = performance.now() - t0;
    totalRenderTime += duration;

    const pdfPath = path.join(outDir, `${fixtureId}.pdf`);
    fs.writeFileSync(pdfPath, buffer);

    const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const numPages = pdfDoc.numPages;
    const kb = (buffer.length / 1024).toFixed(1);

    console.log(
      `✓ [${fixtureId}] ${numPages} page(s), ${kb} KB in ${duration.toFixed(0)}ms -> ${pdfPath}`
    );

    if (hasPdftoppm) {
      try {
        const prefix = path.join(outDir, `${fixtureId}_page`);
        execSync(`pdftoppm -png -r 150 "${pdfPath}" "${prefix}"`, { stdio: "ignore" });
      } catch (err) {
        console.warn(`  Warning: Failed to convert ${fixtureId} to PNG`, err);
      }
    }
  }

  console.log(`\n[pdf:preview] Complete: rendered ${fixtureFiles.length} fixtures in ${(totalRenderTime / 1000).toFixed(2)}s`);
  if (!hasPdftoppm) {
    console.log("[pdf:preview] Note: pdftoppm not installed on host, skipped PNG conversion.");
  }
}

run().catch((err) => {
  console.error("[pdf:preview] Fatal error:", err);
  process.exit(1);
});
