import { findSpan } from "../text/spans.js";

/**
 * Normalizes text for consistent analysis while maintaining helper to extract original quotes.
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Finds an exact whole-word bounded substring from original raw text that caused the match,
 * using findSpan. Stops at sentence boundaries and keeps length <= 160 characters.
 */
export function extractQuote(
  rawText: string,
  regex: RegExp,
  maxLength = 160
): string {
  if (!rawText) return "";

  const match = regex.exec(rawText);
  if (match && match.index !== undefined) {
    return findSpan(rawText, match.index, match[0].length, { maxLen: maxLength }).quote;
  }

  // Fallback: search case-insensitive substring
  const flags = regex.flags.includes("i") ? regex.flags : regex.flags + "i";
  const caseInsensitiveRegex = new RegExp(regex.source, flags);
  const fallbackMatch = caseInsensitiveRegex.exec(rawText);
  if (fallbackMatch && fallbackMatch.index !== undefined) {
    return findSpan(rawText, fallbackMatch.index, fallbackMatch[0].length, { maxLen: maxLength }).quote;
  }

  // If no match in rawText, return a clean whole-word slice of rawText
  return findSpan(rawText, 0, Math.min(rawText.length, 60), { maxLen: maxLength }).quote;
}
