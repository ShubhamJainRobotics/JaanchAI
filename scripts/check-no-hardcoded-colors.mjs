import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientSrcDir = path.join(rootDir, "client", "src");

// Files explicitly exempt from UI-token rules:
// - tokens.css: single source of truth for token color values
// - ReportDocument.tsx: PDF layout strictly excluded from UI restyle patch (§1)
// - tokensContrast.test.ts: unit tests evaluating token contrast thresholds
const EXEMPT_FILES = [
  "tokens.css",
  "ReportDocument.tsx",
  "tokensContrast.test.ts",
];

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts") || fullPath.endsWith(".css")) {
      files.push(fullPath);
    }
  }
  return files;
}

const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_REGEX = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+/gi;
const ARBITRARY_TW_REGEX = /\[#(?:[0-9a-fA-F]{3,8})\]|\[rgba?\(/gi;

const files = walk(clientSrcDir);
const violations = [];

for (const file of files) {
  const basename = path.basename(file);
  if (EXEMPT_FILES.includes(basename)) continue;

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    // Ignore pure comments or import lines
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

    const hexMatches = line.match(HEX_REGEX);
    if (hexMatches) {
      violations.push({
        file: path.relative(rootDir, file),
        line: index + 1,
        type: "hex literal",
        matches: hexMatches,
        snippet: trimmed,
      });
    }

    const rgbMatches = line.match(RGB_REGEX);
    if (rgbMatches) {
      violations.push({
        file: path.relative(rootDir, file),
        line: index + 1,
        type: "rgb literal",
        matches: rgbMatches,
        snippet: trimmed,
      });
    }

    const arbMatches = line.match(ARBITRARY_TW_REGEX);
    if (arbMatches) {
      violations.push({
        file: path.relative(rootDir, file),
        line: index + 1,
        type: "arbitrary Tailwind color",
        matches: arbMatches,
        snippet: trimmed,
      });
    }
  });
}

if (violations.length > 0) {
  console.error("\x1b[31m[FAIL] Hard-coded color literals detected outside tokens.css:\x1b[0m\n");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.type}] -> ${v.matches.join(", ")}`);
    console.error(`    snippet: ${v.snippet}\n`);
  }
  process.exit(1);
} else {
  console.log("\x1b[32m[PASS] Zero hard-coded color literals (#hex, rgb(), arbitrary Tailwind) in client/src components!\x1b[0m");
  process.exit(0);
}
