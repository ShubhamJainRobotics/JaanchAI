import { lookupReasonCopy } from "../config/reasonCopy.js";

// Common valid short English words that are legitimate at the start of a quote
const VALID_LEADING_SHORT_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "by", "as",
  "is", "it", "if", "or", "we", "be", "no", "so", "up", "do", "my",
  "he", "us", "am", "all", "any", "and", "but", "not", "you", "our",
  "who", "how", "why", "per", "via", "rs", "inr"
]);

// Known multi-part or dotted abbreviations that must never be severed
const PROTECTED_ABBREVIATIONS = [
  "B.E./B.Tech",
  "B.E.",
  "B.Tech",
  "M.Tech",
  "M.E.",
  "M.S.",
  "Ph.D.",
  "Pvt. Ltd.",
  "Pvt.",
  "Ltd.",
  "Govt.",
  "Rs.",
  "e.g.",
  "i.e.",
  "etc.",
  "No.",
  "Dr.",
  "Prof.",
  "Mr.",
  "Ms."
];

/**
 * Clean and format an evidence quote for display and PDF export.
 * - Collapses whitespace and line breaks
 * - Detects and cleans mid-word cuts at start or end with ellipsis
 * - Never splits inside protected abbreviations (e.g. B.E./B.Tech, Pvt. Ltd., Rs.)
 * - Truncates at a clean word boundary without exceeding maxLen
 * - Preserves Hindi, Devanagari script, and ₹ currency symbol intact
 */
export function formatQuote(quote?: string | null, maxLen = 140): string {
  if (!quote || typeof quote !== "string") {
    return "";
  }

  // 1. Collapse multiple whitespace & trim
  let text = quote.replace(/\s+/g, " ").trim();
  if (text.length === 0) {
    return "";
  }

  // 2. Remove leading/trailing stray quotation marks if wrapped
  text = text.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
  if (text.length === 0) {
    return "";
  }

  // 3. Detect and trim mid-word fragment at start
  // e.g. "re Intern role at Microsoft" -> "…Intern role at Microsoft"
  // e.g. "es of ₹2,350 at www…" -> "…of ₹2,350 at www…"
  const leadingMatch = text.match(/^([a-z]{1,4})\s+(.+)$/);
  if (leadingMatch) {
    const firstWord = leadingMatch[1].toLowerCase();
    if (!VALID_LEADING_SHORT_WORDS.has(firstWord)) {
      text = "…" + leadingMatch[2].trim();
    }
  }

  // 4. Detect and clean mid-word fragment at end
  // e.g. "Eligibility: Final-year B" where "B" is an incomplete word cut off
  const trailingDanglingLetterMatch = text.match(/^(.*[\s\-])([A-Za-z])$/);
  if (trailingDanglingLetterMatch) {
    const letter = trailingDanglingLetterMatch[2];
    // "a" or "I" might be single-word English articles/pronouns, others are cut words
    if (letter !== "a" && letter !== "I" && letter !== "A") {
      text = trailingDanglingLetterMatch[1].trim() + "…";
    }
  }

  // 5. Length enforcement with word-boundary and abbreviation protection
  if (text.length <= maxLen) {
    return text;
  }

  const targetLimit = maxLen - 1; // reserve 1 char for ellipsis "…"

  // Find protected abbreviation positions that span across the cut point
  let cutIndex = targetLimit;

  // Check if targetLimit lands inside a protected abbreviation
  for (const abbr of PROTECTED_ABBREVIATIONS) {
    let searchPos = 0;
    while (searchPos < text.length) {
      const idx = text.indexOf(abbr, searchPos);
      if (idx === -1) break;
      const endIdx = idx + abbr.length;
      if (idx < targetLimit && targetLimit < endIdx) {
        // Cut point splits this abbreviation; back up to before the abbreviation
        cutIndex = idx;
        break;
      }
      searchPos = endIdx;
    }
  }

  // From cutIndex, find the nearest preceding word boundary (space)
  const lastSpace = text.lastIndexOf(" ", cutIndex);
  if (lastSpace > 10) {
    cutIndex = lastSpace;
  }

  let truncated = text.substring(0, cutIndex).trim();

  // Clean trailing punctuation before adding ellipsis
  truncated = truncated.replace(/[,;:\-\s]+$/, "");

  // Prevent double ellipsis
  if (!truncated.endsWith("…")) {
    truncated += "…";
  }

  return truncated;
}

/**
 * Return friendly display label for signal source.
 * Converts rule hits to "Rule" and AI-observed signals to "AI-observed".
 * Never emits internal codes like AI-PAY, AI-TOO, etc.
 */
export function signalSourceLabel(signal?: { source?: string; ruleId?: string } | null): string {
  if (!signal) return "Rule";
  if (signal.source === "ai" || (signal.ruleId && signal.ruleId.startsWith("AI-"))) {
    return "AI-observed";
  }
  return "Rule";
}

/**
 * Humanize a verification reason into a student-accessible sentence.
 * Strictly avoids internal score numbers ("rule score reached N") and pseudo codes.
 */
export function humanizeReason(
  reason?: { checkKey?: string; detail?: string; effect?: string } | string | null
): string {
  if (!reason) {
    return "Additional independent verification is recommended for this check.";
  }

  if (typeof reason === "string") {
    return lookupReasonCopy(reason);
  }

  return lookupReasonCopy(reason.checkKey || "", reason.detail);
}

/**
 * Safe text fallback returning "—" for empty/null/undefined/raw object representations.
 */
export function safeText(v: unknown, fallback = "—"): string {
  if (v === null || v === undefined) {
    return fallback;
  }
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined" || trimmed === "[object Object]") {
      return fallback;
    }
    return trimmed;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return String(v);
  }
  return fallback;
}
