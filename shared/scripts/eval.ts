import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  normalizeText,
  runRules,
  scoreHits,
  extractOfferFields,
  checkCompleteness,
  extractEntities,
  computeStatus,
  analyzeSenderEmail,
  VerificationStatus,
  Signal,
} from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corpusDir = path.resolve(__dirname, "../src/__fixtures__/corpus");

interface FixtureResult {
  filename: string;
  expected: VerificationStatus;
  predicted: VerificationStatus;
  reasons: string[];
  matched: boolean;
  whyExpected?: string;
}

function runEval() {
  if (!fs.existsSync(corpusDir)) {
    console.error(`Corpus directory not found: ${corpusDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(corpusDir)
    .filter((f) => f.endsWith(".txt"))
    .sort();

  if (files.length === 0) {
    console.error("No fixture files found in corpus directory.");
    process.exit(1);
  }

  const results: FixtureResult[] = [];
  const classes: VerificationStatus[] = [
    "VERIFIED_OFFICIAL",
    "LIKELY_GENUINE",
    "NEEDS_REVIEW",
    "HIGH_RISK",
    "CONFIRMED_SCAM",
  ];

  // Confusion matrix: [actual][predicted]
  const matrix: Record<VerificationStatus, Record<VerificationStatus, number>> =
    {} as any;
  for (const c1 of classes) {
    matrix[c1] = {} as any;
    for (const c2 of classes) {
      matrix[c1][c2] = 0;
    }
  }

  console.log(`\n======================================================`);
  console.log(`  JAANCH OFFLINE REGRESSION EVALUATION HARNESS`);
  console.log(`======================================================\n`);
  console.log(`Evaluating ${files.length} fixtures from ${corpusDir}...\n`);

  for (const file of files) {
    const fullPath = path.join(corpusDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");

    let expected: VerificationStatus = "NEEDS_REVIEW";
    let whyExpected = "";
    let domain: OpportunityDomain = "internship";
    let senderEmailFromHeader: string | undefined = undefined;

    const lines = content.split("\n");
    const bodyLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("# expected:")) {
        expected = line.replace("# expected:", "").trim() as VerificationStatus;
      } else if (line.startsWith("# why:")) {
        whyExpected = line.replace("# why:", "").trim();
      } else if (line.startsWith("# domain:")) {
        domain = line.replace("# domain:", "").trim() as OpportunityDomain;
      } else if (line.startsWith("# sender_email:")) {
        senderEmailFromHeader = line.replace("# sender_email:", "").trim();
      } else {
        bodyLines.push(line);
      }
    }

    const rawText = bodyLines.join("\n").trim();
    const normalizedText = normalizeText(rawText);

    // 1. Extract entities & fields
    const entities = extractEntities(rawText);
    const topOrg = entities.organizationCandidates[0]?.name;
    const extractedFields = extractOfferFields(rawText, topOrg);
    const { completeness } = checkCompleteness(extractedFields);

    // 2. Sender parsing
    const senderEmail = senderEmailFromHeader || entities.emails[0]?.value;
    const senderIdentity = analyzeSenderEmail(senderEmail, {
      claimedOrg: topOrg,
    });

    // 3. Rule evaluation
    const ruleHits = runRules({
      rawText,
      normalizedText,
      domain,
      channel: "email",
      claimedOrg: topOrg,
      senderEmail,
      senderDomain: senderIdentity.domain || undefined,
    });

    const { score: ruleScore, dedupedHits } = scoreHits(
      ruleHits,
      rawText.length
    );

    const signals: Signal[] = dedupedHits.map((h) => ({
      ruleId: h.ruleId,
      category: h.category,
      severity: h.severity,
      source: "rule",
      title: h.title,
      whyItMatters: h.whyItMatters,
      evidenceQuote: h.evidenceQuote,
      hardDisqualifier: h.hardDisqualifier || false,
    }));

    // 4. Compute status
    const statusRes = computeStatus({
      signals,
      ruleScore,
      textLength: rawText.length,
      completeness,
      senderIdentity,
      matchedOrganization: null, // offline eval default without network/db
      isDemoMode: false,
    });

    const predicted = statusRes.status;
    const matched = predicted === expected;

    if (matrix[expected] && matrix[expected][predicted] !== undefined) {
      matrix[expected][predicted]++;
    }

    results.push({
      filename: file,
      expected,
      predicted,
      reasons: statusRes.reasons.map((r) => r.detail),
      matched,
      whyExpected,
    });
  }

  // Print results summary
  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    if (r.matched) {
      passCount++;
      console.log(`  ✓ ${r.filename.padEnd(42)} => ${r.predicted} (PASS)`);
    } else {
      failCount++;
      console.error(
        `  ✗ ${r.filename.padEnd(42)} => Predicted: ${r.predicted}, Expected: ${
          r.expected
        } (FAIL)`
      );
      if (r.whyExpected) {
        console.error(`    Why expected: ${r.whyExpected}`);
      }
      console.error(`    Reasons: ${r.reasons.slice(0, 2).join(" | ")}`);
    }
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`Confusion Matrix (Actual \\ Predicted):`);
  console.log(
    `Actual \\ Pred`.padEnd(20) +
      classes.map((c) => c.slice(0, 10).padStart(12)).join("")
  );
  for (const act of classes) {
    const row = classes.map((p) => String(matrix[act][p]).padStart(12)).join("");
    console.log(act.padEnd(20) + row);
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`Per-Class Metrics:`);
  console.log(
    `Class`.padEnd(20) +
      `Precision`.padStart(12) +
      `Recall`.padStart(12) +
      `Support`.padStart(12)
  );

  for (const cls of classes) {
    let tp = matrix[cls][cls];
    let actualTotal = 0;
    let predTotal = 0;

    for (const c of classes) {
      actualTotal += matrix[cls][c];
      predTotal += matrix[c][cls];
    }

    const precision = predTotal > 0 ? (tp / predTotal) * 100 : 0;
    const recall = actualTotal > 0 ? (tp / actualTotal) * 100 : 0;

    if (actualTotal > 0 || predTotal > 0) {
      console.log(
        cls.padEnd(20) +
          `${precision.toFixed(1)}%`.padStart(12) +
          `${recall.toFixed(1)}%`.padStart(12) +
          String(actualTotal).padStart(12)
      );
    }
  }

  console.log(`------------------------------------------------------`);
  console.log(
    `Total: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`
  );
  console.log(
    `Fictional corpus; results illustrate behaviour on these samples only and are not a measure of real-world accuracy.`
  );
  console.log(`======================================================\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runEval();
