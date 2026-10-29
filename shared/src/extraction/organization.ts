import { OrganizationCandidate } from "../schemas/index.js";
import { findSpan } from "../text/spans.js";
import { KNOWN_ORGS } from "../config/knownOrgs.js";

export interface ExtractedOrgDecision {
  organization: string | null;
  confidence: "high" | "medium" | "low";
  organizationStatus: "verified" | "unverified" | "uncertain" | "none";
  kind: "company" | "university" | "government" | "unknown";
  evidenceQuote: string;
  alternates: OrganizationCandidate[];
  allCandidates: OrganizationCandidate[];
}

const COMMON_NON_ORGS = new Set([
  "to",
  "from",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "the",
  "this",
  "that",
  "you",
  "your",
  "we",
  "our",
  "he",
  "she",
  "it",
  "they",
  "if",
  "when",
  "as",
  "so",
  "please",
  "do",
  "be",
  "have",
  "subject",
  "hello",
  "hi",
  "dear",
  "candidate",
  "student",
  "applicant",
  "congratulations",
  "regards",
  "team",
  "hr",
  "pay",
  "payment",
  "apply",
  "offer",
  "internship",
  "scholarship",
  "government",
  "ministry",
]);

const LEADING_ROLE_WORDS = [
  "intern",
  "internship",
  "position",
  "role",
  "job",
  "opportunity",
  "program",
  "programme",
  "scheme",
  "trainee",
  "analyst",
  "developer",
  "engineer",
  "associate",
  "executive",
  "software",
  "data",
];

const TRAILING_DEPT_WORDS = [
  "hr",
  "team",
  "recruitment",
  "recruiting",
  "talent",
  "acquisition",
  "desk",
  "department",
  "dept",
  "support",
  "helpdesk",
  "careers",
];

const LEGAL_SUFFIXES = [
  "pvt. ltd.",
  "pvt. ltd",
  "pvt ltd",
  "private limited",
  "limited",
  "ltd.",
  "ltd",
  "llp",
  "inc.",
  "inc",
  "corp.",
  "corp",
  "technologies",
  "solutions",
  "labs",
  "systems",
  "analytics",
  "services",
  "global",
  "media",
  "foundation",
  "institute",
  "university",
  "college",
  "trust",
];

/**
 * Strips leading role words when preceding an organization name.
 */
function stripLeadingRoleWords(phrase: string): string {
  let tokens = phrase.split(/\s+/);
  while (tokens.length > 1) {
    const firstLower = tokens[0].toLowerCase().replace(/[^a-z]/g, "");
    if (LEADING_ROLE_WORDS.includes(firstLower)) {
      tokens = tokens.slice(1);
    } else {
      break;
    }
  }
  return tokens.join(" ").trim();
}

/**
 * Strips trailing department words (e.g. "Sunrise Media HR" -> "Sunrise Media").
 */
function stripTrailingDeptWords(phrase: string): string {
  let tokens = phrase.split(/\s+/);
  while (tokens.length > 1) {
    const lastLower = tokens[tokens.length - 1].toLowerCase().replace(/[^a-z]/g, "");
    if (TRAILING_DEPT_WORDS.includes(lastLower)) {
      tokens = tokens.slice(0, tokens.length - 1);
    } else {
      break;
    }
  }
  return tokens.join(" ").trim();
}

/**
 * Checks if a candidate is on the hard stoplist.
 */
function isHardStopped(phrase: string): boolean {
  const clean = phrase.trim();
  const lower = clean.toLowerCase();

  // Limited-time compounds
  if (
    lower.startsWith("limited-time") ||
    lower.startsWith("limited time") ||
    /limited-(?:time|offer|seats|slots|period|vacancy)/i.test(lower)
  ) {
    return true;
  }

  // Standalone word on stoplist
  if (COMMON_NON_ORGS.has(lower)) {
    return true;
  }

  // Check 1-2 token phrases that are purely on stoplist
  const tokens = lower.split(/[\s-]+/).filter(Boolean);
  if (tokens.every((t) => COMMON_NON_ORGS.has(t))) {
    return true;
  }

  // Rejects containing @, http, or digits only
  if (phrase.includes("@") || phrase.includes("http://") || phrase.includes("https://")) {
    return true;
  }

  if (/^\d+$/.test(clean.replace(/\s+/g, ""))) {
    return true;
  }

  // Max 6 tokens
  if (tokens.length > 6) {
    return true;
  }

  return false;
}

/**
 * Validates whether "Limited" / "Ltd" counts as a legal suffix.
 */
function hasValidLegalSuffix(phrase: string): boolean {
  const lower = phrase.toLowerCase();
  for (const suffix of LEGAL_SUFFIXES) {
    if (suffix === "limited" || suffix === "ltd" || suffix === "ltd.") {
      const match = lower.match(/\b(?:pvt\.?\s*)?(limited|ltd\.?)\b/i);
      if (match && match.index !== undefined) {
        // Must be preceded by >= 1 proper noun token
        const prefix = phrase.slice(0, match.index).trim();
        const prefixTokens = prefix.split(/\s+/).filter(Boolean);
        if (prefixTokens.length === 0) return false;

        // Must NOT be followed by hyphenated adjective or compound
        const suffixTail = lower.slice(match.index + match[0].length);
        if (/^-(?:time|period|offer|seats|slots|vacancy)/i.test(suffixTail)) {
          return false;
        }
        return true;
      }
    } else {
      if (new RegExp(`\\b${suffix.replace(".", "\\.")}\\b`, "i").test(lower)) {
        return true;
      }
    }
  }
  return false;
}

const ABBR_WITH_DOT = new Set(["pvt.", "ltd.", "inc.", "co.", "corp."]);

/**
 * Extracts a proper noun phrase starting at `startIndex`.
 */
function extractProperNounPhrase(
  text: string,
  startIndex: number
): { phrase: string; length: number } | null {
  const rest = text.slice(startIndex);
  const words = rest.split(/(\s+)/);

  const phraseTokens: string[] = [];
  let consumedLength = 0;

  for (let i = 0; i < words.length; i++) {
    const part = words[i];
    if (/^\s+$/.test(part)) {
      consumedLength += part.length;
      continue;
    }

    let cleanWord = part;
    let endsWithPunct = false;

    // Check if the word is an abbreviation with a trailing dot, possibly followed by punctuation (e.g. Ltd., or Pvt.)
    const punctAfterAbbrMatch = part.match(/^([a-zA-Z]+\.)([,;:!?\r\n]+)$/);
    if (punctAfterAbbrMatch && ABBR_WITH_DOT.has(punctAfterAbbrMatch[1].toLowerCase())) {
      cleanWord = punctAfterAbbrMatch[1];
      endsWithPunct = true;
    } else if (ABBR_WITH_DOT.has(part.toLowerCase())) {
      cleanWord = part;
    } else {
      const punctMatch = part.match(/[.,;:!?\r\n]+$/);
      if (punctMatch) {
        cleanWord = part.slice(0, punctMatch.index);
        endsWithPunct = true;
      }
    }

    // Check hyphen-lowercase compound e.g. "Limited-time"
    if (/^[A-Za-z]+-[a-z]/.test(cleanWord)) {
      break;
    }

    // Allowed connector tokens inside phrase
    const isConnector = ["of", "and", "&", "for", "the"].includes(cleanWord.toLowerCase());
    const isCapitalized =
      /^[A-Z][a-zA-Z0-9&.'\-]*$/.test(cleanWord) ||
      /^[A-Z0-9&.'\-]+$/.test(cleanWord) ||
      /^(?:3M|L&T|IIT|IIM|NIT|AICTE|UGC)$/i.test(cleanWord);

    if (phraseTokens.length === 0) {
      // Disallow pure common stop words like "to", "dear", "apply", etc. as start of proper noun
      const lowerStart = cleanWord.toLowerCase();
      if (!isCapitalized || COMMON_NON_ORGS.has(lowerStart)) {
        // Exception: allow multi-word phrases starting with Scholarship or Government
        if (lowerStart !== "scholarship" && lowerStart !== "government" && lowerStart !== "ministry") {
          break;
        }
      }
      phraseTokens.push(cleanWord);
      consumedLength += part.length;
    } else {
      if (isCapitalized || (isConnector && phraseTokens.length > 0)) {
        phraseTokens.push(cleanWord);
        consumedLength += part.length;
      } else {
        break;
      }
    }

    if (endsWithPunct || phraseTokens.length >= 6) {
      break;
    }
  }

  if (phraseTokens.length === 0) return null;
  const rawPhrase = phraseTokens.join(" ").trim();
  return { phrase: rawPhrase, length: consumedLength };
}

interface RawCandidate {
  name: string;
  sourcePattern: string;
  patternStrength: number;
  inSignature: boolean;
  inPreposition: boolean;
  matchIndex: number;
}

/**
 * Extracts and scores organization candidates from message text.
 */
export function extractOrganizationCandidates(text: string): OrganizationCandidate[] {
  if (!text || text.trim().length === 0) return [];

  const candidates: RawCandidate[] = [];

  // Candidate generation A: at|with|from|join|joining <X>
  const prepRegex = /\b(?:at|with|from|join|joining)\s+/gi;
  let match: RegExpExecArray | null;
  while ((match = prepRegex.exec(text)) !== null) {
    const startIdx = match.index + match[0].length;
    const extracted = extractProperNounPhrase(text, startIdx);
    if (extracted && extracted.phrase.length >= 2) {
      candidates.push({
        name: extracted.phrase,
        sourcePattern: "preposition",
        patternStrength: 3,
        inSignature: false,
        inPreposition: true,
        matchIndex: startIdx,
      });
    }
  }

  // Candidate generation B: <X> is hiring|is looking for|invites
  const hiringRegex = /\b([A-Z][a-zA-Z0-9&.\s]{1,40})\s+(?:is\s+hiring|is\s+looking\s+for|invites)\b/g;
  while ((match = hiringRegex.exec(text)) !== null) {
    const extracted = extractProperNounPhrase(text, match.index);
    if (extracted && extracted.phrase.length >= 2) {
      candidates.push({
        name: extracted.phrase,
        sourcePattern: "hiring",
        patternStrength: 3,
        inSignature: false,
        inPreposition: false,
        matchIndex: match.index,
      });
    }
  }

  // Candidate generation C: our company|our organization|our firm|company <X>
  const companyRegex = /\b(?:our\s+(?:company|organization|firm)|company)\s+([A-Z][a-zA-Z0-9&.\s]{1,40})/gi;
  while ((match = companyRegex.exec(text)) !== null) {
    const afterCompanyIdx = text.toLowerCase().indexOf("company", match.index) + "company".length;
    const wordAfterMatch = text.slice(afterCompanyIdx).match(/^\s+/);
    const startIdx = afterCompanyIdx + (wordAfterMatch ? wordAfterMatch[0].length : 0);
    const extracted = extractProperNounPhrase(text, startIdx);
    if (extracted && extracted.phrase.length >= 2) {
      candidates.push({
        name: extracted.phrase,
        sourcePattern: "company_phrase",
        patternStrength: 4,
        inSignature: false,
        inPreposition: false,
        matchIndex: startIdx,
      });
    }
  }

  // Candidate generation D: on behalf of <X>
  const behalfRegex = /\bon\s+behalf\s+of\s+/gi;
  while ((match = behalfRegex.exec(text)) !== null) {
    const startIdx = match.index + match[0].length;
    const extracted = extractProperNounPhrase(text, startIdx);
    if (extracted && extracted.phrase.length >= 2) {
      candidates.push({
        name: extracted.phrase,
        sourcePattern: "behalf_of",
        patternStrength: 3,
        inSignature: false,
        inPreposition: true,
        matchIndex: startIdx,
      });
    }
  }

  // Candidate generation E: Corporate suffixes anywhere
  const suffixRegex =
    /\b([A-Z][a-zA-Z0-9&.\s]{1,40}\s+(?:Pvt\.?\s*Ltd\.?|Private\s+Limited|Limited|LLP|Inc\.?|Corp\.?|Technologies|Solutions|Labs|Systems|Analytics|Services|Global|Media|Foundation|Institute|University|College|Trust))\b/gi;
  while ((match = suffixRegex.exec(text)) !== null) {
    const extracted = extractProperNounPhrase(text, match.index);
    if (extracted && extracted.phrase.length >= 2) {
      candidates.push({
        name: extracted.phrase,
        sourcePattern: "suffix",
        patternStrength: 3,
        inSignature: false,
        inPreposition: false,
        matchIndex: match.index,
      });
    }
  }

  // Candidate generation F: Sign-off block
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let signoffIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (
      /^(?:Regards|Sincerely|Thanks|Thank\s*you|Best|Warm\s*regards|Yours\s*sincerely)[,\s]*$/i.test(
        lines[i]
      )
    ) {
      signoffIndex = i;
      break;
    }
  }

  const signoffLines: string[] = [];
  if (signoffIndex !== -1 && signoffIndex < lines.length - 1) {
    signoffLines.push(...lines.slice(signoffIndex + 1));
  } else if (lines.length > 1) {
    // Check last line only if message has multiple lines and last line is not full paragraph
    const lastLine = lines[lines.length - 1];
    if (lastLine.length < 80 && !/[.!?]$/.test(lastLine)) {
      signoffLines.push(lastLine);
    }
  }

  for (const line of signoffLines) {
    if (/^(?:Dear|Candidate|Student|Applicant|Hello|Hi)\b/i.test(line)) continue;
    const extracted = extractProperNounPhrase(line, 0);
    if (extracted && extracted.phrase.length >= 2) {
      const matchIdx = text.lastIndexOf(extracted.phrase);
      candidates.push({
        name: extracted.phrase,
        sourcePattern: "signoff",
        patternStrength: 1, // Signoff alone is weak unless corroborated
        inSignature: true,
        inPreposition: false,
        matchIndex: matchIdx !== -1 ? matchIdx : 0,
      });
    }
  }

  // Candidate generation G: Government of India / Ministries
  const govRegex = /\b(Government\s+of\s+India|Ministry\s+of\s+[A-Za-z\s]+)\b/gi;
  while ((match = govRegex.exec(text)) !== null) {
    candidates.push({
      name: match[1].trim(),
      sourcePattern: "government",
      patternStrength: 4,
      inSignature: false,
      inPreposition: false,
      matchIndex: match.index,
    });
  }

  // Process and score candidates
  interface AggregatedCandidate {
    name: string;
    score: number;
    mentions: number;
    hasLegalSuffix: boolean;
    inSignature: boolean;
    inPreposition: boolean;
    isKnownBrand: boolean;
    isGovernment: boolean;
    evidenceQuote: string;
  }

  const candidateMap = new Map<string, AggregatedCandidate>();

  for (const cand of candidates) {
    let clean = cand.name.trim();

    // Strip leading role words if present
    clean = stripLeadingRoleWords(clean);

    // Strip trailing department words if candidate is not purely a department name
    const withoutDept = stripTrailingDeptWords(clean);
    if (withoutDept.length >= 2 && !COMMON_NON_ORGS.has(withoutDept.toLowerCase())) {
      clean = withoutDept;
    }

    if (isHardStopped(clean)) {
      continue;
    }

    const lowerKey = clean.toLowerCase();
    const hasSuffix = hasValidLegalSuffix(clean);
    const isGov = /^(?:Government\s+of\s+India|Ministry\s+of)/i.test(clean);

    // Check known brand match
    const isKnown = KNOWN_ORGS.some((ko) => {
      const koLower = ko.name.toLowerCase();
      return (
        lowerKey === koLower ||
        lowerKey.startsWith(`${koLower} `) ||
        lowerKey.endsWith(` ${koLower}`)
      );
    });

    const quote = findSpan(text, cand.matchIndex, cand.name.length).quote;

    const existing = candidateMap.get(lowerKey);
    if (existing) {
      existing.mentions += 1;
      existing.score += 2; // Frequency bonus
      if (cand.inSignature) existing.inSignature = true;
      if (cand.inPreposition) existing.inPreposition = true;
    } else {
      let score = cand.patternStrength;
      if (hasSuffix) score += 2;
      if (isKnown) score += 2;
      if (isGov) score += 2;
      if (cand.inSignature && (hasSuffix || isKnown || cand.inPreposition)) {
        score += 1;
      }

      candidateMap.set(lowerKey, {
        name: clean,
        score,
        mentions: 1,
        hasLegalSuffix: hasSuffix,
        inSignature: cand.inSignature,
        inPreposition: cand.inPreposition,
        isKnownBrand: isKnown,
        isGovernment: isGov,
        evidenceQuote: quote,
      });
    }
  }

  // Convert to OrganizationCandidate with high | medium | low confidence
  const result: OrganizationCandidate[] = [];
  for (const agg of candidateMap.values()) {
    let confidence: "high" | "medium" | "low" = "low";
    if (
      agg.score >= 5 ||
      (agg.hasLegalSuffix && (agg.inPreposition || agg.inSignature || agg.mentions >= 2)) ||
      (agg.isKnownBrand && (agg.inPreposition || agg.inSignature))
    ) {
      confidence = "high";
    } else if (agg.score >= 3 || agg.hasLegalSuffix || agg.isKnownBrand || agg.isGovernment) {
      confidence = "medium";
    } else {
      confidence = "low";
    }

    result.push({
      name: agg.name,
      confidence,
      evidenceQuote: agg.evidenceQuote,
      count: agg.mentions,
    });
  }

  // Sort by confidence ('high' > 'medium' > 'low'), then count, then length
  const confRank = { high: 3, medium: 2, low: 1 };
  result.sort((a, b) => {
    if (confRank[b.confidence] !== confRank[a.confidence]) {
      return confRank[b.confidence] - confRank[a.confidence];
    }
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.name.length - a.name.length;
  });

  return result;
}

/**
 * Returns conservative organization extraction decision:
 * If the top candidate's confidence is below medium, returns null with organizationStatus: "uncertain".
 */
export function extractOrganizationDecision(text: string): ExtractedOrgDecision {
  const allCandidates = extractOrganizationCandidates(text);

  if (allCandidates.length === 0) {
    return {
      organization: null,
      confidence: "low",
      organizationStatus: "none",
      kind: "unknown",
      evidenceQuote: "",
      alternates: [],
      allCandidates: [],
    };
  }

  const top = allCandidates[0];
  const alternates = allCandidates.slice(1, 3);

  // Conservative rule: If best candidate is low confidence, organization is null with "uncertain"
  if (top.confidence === "low") {
    let kind: "company" | "university" | "government" | "unknown" = "unknown";
    if (/university|college|institute/i.test(top.name)) kind = "university";
    else if (/government|ministry/i.test(top.name)) kind = "government";

    return {
      organization: null,
      confidence: "low",
      organizationStatus: "uncertain",
      kind,
      evidenceQuote: top.evidenceQuote,
      alternates: [top, ...alternates].slice(0, 2),
      allCandidates,
    };
  }

  let kind: "company" | "university" | "government" | "unknown" = "company";
  if (/government|ministry/i.test(top.name)) {
    kind = "government";
  } else if (/university|college|institute/i.test(top.name)) {
    kind = "university";
  }

  return {
    organization: top.name,
    confidence: top.confidence,
    organizationStatus: "unverified",
    kind,
    evidenceQuote: top.evidenceQuote,
    alternates,
    allCandidates,
  };
}
