export interface SentenceSpan {
  text: string;
  start: number;
  end: number;
}

const KNOWN_ABBREVIATIONS = [
  "pvt. ltd.",
  "pvt.ltd.",
  "pvt. ltd",
  "pvt.",
  "ltd.",
  "inc.",
  "co.",
  "corp.",
  "b.e.",
  "b.tech",
  "b.tech.",
  "m.tech",
  "m.tech.",
  "b.sc.",
  "m.sc.",
  "dr.",
  "mr.",
  "mrs.",
  "ms.",
  "prof.",
  "sr.",
  "jr.",
  "no.",
  "rs.",
  "vs.",
  "e.g.",
  "i.e.",
  "a.m.",
  "p.m.",
  "approx.",
  "dept.",
];

/**
 * Checks if a period at index `dotIndex` is part of a protected abbreviation,
 * decimal, domain/URL, or numbered list marker.
 */
function isProtectedPeriod(text: string, dotIndex: number): boolean {
  // 1. Decimal number (e.g. 7.0, 3.14)
  if (
    dotIndex > 0 &&
    dotIndex < text.length - 1 &&
    /\d/.test(text[dotIndex - 1]) &&
    /\d/.test(text[dotIndex + 1])
  ) {
    return true;
  }

  // 2. Domain, URL, or email (e.g. www.site.in, user@example.co.in)
  // Character before and after is alphanumeric or slash without space
  if (
    dotIndex > 0 &&
    dotIndex < text.length - 1 &&
    /[a-zA-Z0-9\-_]/.test(text[dotIndex - 1]) &&
    /[a-zA-Z0-9\-_/]/.test(text[dotIndex + 1])
  ) {
    return true;
  }

  // 3. Numbered list item at start of text or following newline (e.g. "1. Step")
  const lineStart = Math.max(0, text.lastIndexOf("\n", dotIndex) + 1);
  const prefix = text.slice(lineStart, dotIndex).trim();
  if (/^\d+$/.test(prefix)) {
    // Numbered list item like "1." — protect so it doesn't form an empty sentence
    return true;
  }

  // 4. Known abbreviations
  const lowerText = text.toLowerCase();
  for (const abbr of KNOWN_ABBREVIATIONS) {
    // Check if abbr ends at dotIndex
    if (dotIndex + 1 >= abbr.length) {
      const sub = lowerText.slice(dotIndex + 1 - abbr.length, dotIndex + 1);
      if (sub === abbr) {
        // Also check if preceded by word boundary
        const beforeIdx = dotIndex + 1 - abbr.length - 1;
        if (beforeIdx < 0 || /[\s,;(\[/"'-]/.test(text[beforeIdx])) {
          return true;
        }
      }
    }
    // Also check if dotIndex is inside abbr (for multi-dot abbreviations like b.e. or pvt. ltd.)
    const checkWindowStart = Math.max(0, dotIndex - abbr.length);
    const checkWindowEnd = Math.min(text.length, dotIndex + abbr.length);
    const windowText = lowerText.slice(checkWindowStart, checkWindowEnd);
    const foundIdx = windowText.indexOf(abbr);
    if (foundIdx !== -1) {
      const absStart = checkWindowStart + foundIdx;
      const absEnd = absStart + abbr.length;
      if (dotIndex >= absStart && dotIndex < absEnd) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Segments input text into sentences while strictly preserving abbreviations,
 * decimals, amounts with commas, domains/URLs, times, and numbered lists.
 */
export function segmentSentences(text: string): SentenceSpan[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const spans: SentenceSpan[] = [];
  let currentStart = 0;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const char = text[i];

    // Split on newlines and bullet points
    if (char === "\n") {
      const rawSentence = text.slice(currentStart, i);
      if (rawSentence.trim().length > 0) {
        // Trim leading and trailing whitespace while tracking offsets
        const leadWs = rawSentence.match(/^\s*/)?.[0].length || 0;
        const trailWs = rawSentence.match(/\s*$/)?.[0].length || 0;
        spans.push({
          text: rawSentence.trim(),
          start: currentStart + leadWs,
          end: i - trailWs,
        });
      }
      currentStart = i + 1;
      continue;
    }

    // Split on sentence-ending punctuation: '.', '!', '?'
    if (char === "!" || char === "?") {
      // Must be followed by whitespace, quote, or end of string
      const nextChar = i + 1 < len ? text[i + 1] : "";
      if (nextChar === "" || /\s/.test(nextChar) || nextChar === '"' || nextChar === "'") {
        const rawSentence = text.slice(currentStart, i + 1);
        if (rawSentence.trim().length > 0) {
          const leadWs = rawSentence.match(/^\s*/)?.[0].length || 0;
          const trailWs = rawSentence.match(/\s*$/)?.[0].length || 0;
          spans.push({
            text: rawSentence.trim(),
            start: currentStart + leadWs,
            end: i + 1 - trailWs,
          });
        }
        currentStart = i + 1;
      }
      continue;
    }

    if (char === ".") {
      if (isProtectedPeriod(text, i)) {
        continue;
      }

      // Check if followed by whitespace or end of string
      const nextChar = i + 1 < len ? text[i + 1] : "";
      if (nextChar === "" || /\s/.test(nextChar) || nextChar === '"' || nextChar === "'") {
        const rawSentence = text.slice(currentStart, i + 1);
        if (rawSentence.trim().length > 0) {
          const leadWs = rawSentence.match(/^\s*/)?.[0].length || 0;
          const trailWs = rawSentence.match(/\s*$/)?.[0].length || 0;
          spans.push({
            text: rawSentence.trim(),
            start: currentStart + leadWs,
            end: i + 1 - trailWs,
          });
        }
        currentStart = i + 1;
      }
    }
  }

  // Trailing sentence if any
  if (currentStart < len) {
    const rawSentence = text.slice(currentStart);
    if (rawSentence.trim().length > 0) {
      const leadWs = rawSentence.match(/^\s*/)?.[0].length || 0;
      const trailWs = rawSentence.match(/\s*$/)?.[0].length || 0;
      spans.push({
        text: rawSentence.trim(),
        start: currentStart + leadWs,
        end: len - trailWs,
      });
    }
  }

  return spans;
}
