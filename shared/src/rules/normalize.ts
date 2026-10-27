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
 * Finds an exact substring from the original raw text that caused the match.
 * Ensures the evidence quote is a real contiguous substring of the original user input.
 */
export function extractQuote(
  rawText: string,
  regex: RegExp,
  maxLength = 180
): string {
  const match = regex.exec(rawText);
  if (match) {
    const rawQuote = match[0].trim();
    if (rawQuote.length <= maxLength) {
      return rawQuote;
    }
    return rawQuote.slice(0, maxLength);
  }

  // Fallback: search case-insensitive substring
  const flags = regex.flags.includes("i") ? regex.flags : regex.flags + "i";
  const caseInsensitiveRegex = new RegExp(regex.source, flags);
  const fallbackMatch = caseInsensitiveRegex.exec(rawText);
  if (fallbackMatch) {
    const quote = fallbackMatch[0].trim();
    return quote.length <= maxLength ? quote : quote.slice(0, maxLength);
  }

  // If no match in rawText, return a slice of rawText
  return rawText.slice(0, Math.min(rawText.length, 60));
}
