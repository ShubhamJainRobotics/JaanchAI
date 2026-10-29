import { segmentSentences, SentenceSpan } from "./segment.js";

export interface SpanOptions {
  maxLen?: number;
  maxContextWords?: number;
  wholeSentence?: boolean;
}

export interface SpanResult {
  start: number;
  end: number;
  quote: string;
}

const WORD_BOUNDARY_CHARS = /[\s,;:!?"'()\[\]{}]/;

/**
 * Expands start index leftwards to the beginning of the word.
 */
function expandWordStart(text: string, index: number, sentenceStart: number): number {
  let pos = Math.max(sentenceStart, Math.min(text.length, index));
  while (pos > sentenceStart && !WORD_BOUNDARY_CHARS.test(text[pos - 1])) {
    pos--;
  }
  return pos;
}

/**
 * Expands end index rightwards to the end of the word.
 */
function expandWordEnd(text: string, index: number, sentenceEnd: number): number {
  let pos = Math.max(0, Math.min(sentenceEnd, index));
  while (pos < sentenceEnd && !WORD_BOUNDARY_CHARS.test(text[pos])) {
    pos++;
  }
  return pos;
}

/**
 * Finds a clean evidence span around a match within its enclosing sentence:
 * - Expands to whole-word boundaries (never starts or ends mid-word).
 * - Bounded by the enclosing sentence (never crosses sentence boundaries).
 * - Adds up to 8 words of context on each side (or full sentence if wholeSentence: true), total length <= 160 chars.
 * - Symmetrically shrinks and appends '…' if longer than 160 chars.
 */
export function findSpan(
  text: string,
  matchIndex: number,
  matchLength: number,
  opts?: SpanOptions
): SpanResult {
  if (!text || text.length === 0 || matchIndex < 0) {
    return { start: 0, end: 0, quote: "" };
  }

  const maxLen = opts?.maxLen ?? 160;
  const maxContextWords = opts?.wholeSentence ? Infinity : (opts?.maxContextWords ?? 8);

  const sentences = segmentSentences(text);

  // Find the sentence containing matchIndex
  let sentence: SentenceSpan | undefined = sentences.find(
    (s) => matchIndex >= s.start && matchIndex <= s.end
  );

  if (!sentence) {
    // Fallback: entire text if single sentence or unsegmented
    sentence = {
      text,
      start: 0,
      end: text.length,
    };
  }

  const sStart = sentence.start;
  const sEnd = sentence.end;

  // 1. Expand match to whole-word boundaries within the sentence
  const rawMatchEnd = Math.min(sEnd, matchIndex + matchLength);
  const wordMatchStart = expandWordStart(text, matchIndex, sStart);
  const wordMatchEnd = expandWordEnd(text, rawMatchEnd, sEnd);

  // 2. Identify words before and after within the same sentence
  const textBefore = text.slice(sStart, wordMatchStart);
  const textAfter = text.slice(wordMatchEnd, sEnd);

  // Split into words while keeping token start/end positions
  const beforeTokens: Array<{ word: string; start: number; end: number }> = [];
  const beforeRegex = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = beforeRegex.exec(textBefore)) !== null) {
    beforeTokens.push({
      word: m[0],
      start: sStart + m.index,
      end: sStart + m.index + m[0].length,
    });
  }

  const afterTokens: Array<{ word: string; start: number; end: number }> = [];
  const afterRegex = /\S+/g;
  while ((m = afterRegex.exec(textAfter)) !== null) {
    afterTokens.push({
      word: m[0],
      start: wordMatchEnd + m.index,
      end: wordMatchEnd + m.index + m[0].length,
    });
  }

  // Take up to maxContextWords words on each side
  let beforeCount = Math.min(maxContextWords, beforeTokens.length);
  let afterCount = Math.min(maxContextWords, afterTokens.length);

  // Helper to compute current quote length and build string
  const buildCurrentQuote = (bCount: number, aCount: number) => {
    const startPos =
      bCount > 0 ? beforeTokens[beforeTokens.length - bCount].start : wordMatchStart;
    const endPos = aCount > 0 ? afterTokens[aCount - 1].end : wordMatchEnd;

    const hasLeftEllipsis = bCount < beforeTokens.length && beforeTokens.length > 0;
    const hasRightEllipsis = aCount < afterTokens.length && afterTokens.length > 0;

    let q = text.slice(startPos, endPos).trim();
    if (hasLeftEllipsis) {
      q = `… ${q}`;
    }
    if (hasRightEllipsis) {
      q = `${q} …`;
    }

    return { start: startPos, end: endPos, quote: q };
  };

  let current = buildCurrentQuote(beforeCount, afterCount);

  // 3. If longer than maxLen, shrink context symmetrically
  while (current.quote.length > maxLen && (beforeCount > 0 || afterCount > 0)) {
    if (beforeCount >= afterCount && beforeCount > 0) {
      beforeCount--;
    } else if (afterCount > 0) {
      afterCount--;
    } else {
      break;
    }
    current = buildCurrentQuote(beforeCount, afterCount);
  }

  // 4. If the match itself exceeds maxLen, truncate match to word boundaries
  if (current.quote.length > maxLen) {
    let truncated = current.quote.slice(0, maxLen - 1).trim();
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 10) {
      truncated = truncated.slice(0, lastSpace).trim();
    }
    truncated = truncated.replace(/[,;:\-\s]+$/, "");
    if (!truncated.endsWith("…")) {
      truncated += "…";
    }
    current.quote = truncated;
  }

  return current;
}
