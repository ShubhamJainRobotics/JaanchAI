import {
  ExtractedEntities,
  ExtractedEntityItem,
  OrganizationCandidate,
} from "../schemas/index.js";

function extractQuote(text: string, start: number, end: number, padding = 15): string {
  const qStart = Math.max(0, start - padding);
  const qEnd = Math.min(text.length, end + padding);
  return text.slice(qStart, qEnd).trim();
}

/**
 * Extracts and deduplicates emails, phones, URLs/domains, UPI IDs, social handles,
 * and ranked organization candidates with exact evidenceQuotes.
 */
export function extractEntities(text: string): ExtractedEntities {
  if (!text) {
    return {
      emails: [],
      phones: [],
      urls: [],
      upiIds: [],
      socialHandles: [],
      organizationCandidates: [],
    };
  }

  // 1. Emails
  const emails: ExtractedEntityItem[] = [];
  const seenEmails = new Set<string>();
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/gi;
  let match: RegExpExecArray | null;

  while ((match = emailRegex.exec(text)) !== null) {
    const val = match[1].toLowerCase().trim();
    if (!seenEmails.has(val)) {
      seenEmails.add(val);
      emails.push({
        value: val,
        evidenceQuote: extractQuote(text, match.index, match.index + match[0].length),
      });
    }
  }

  // 2. UPI IDs
  const upiIds: ExtractedEntityItem[] = [];
  const seenUpi = new Set<string>();
  const upiBankRegex =
    /\b([a-zA-Z0-9.\-_]{2,64}@(okhdfcbank|okaxis|oksbi|paytm|ybl|ibl|upi|axl|apl|barodampay|idfcbank|icici|kotak|postbank|airtel|sbi|hdfcbank))\b/gi;

  while ((match = upiBankRegex.exec(text)) !== null) {
    const val = match[1].toLowerCase().trim();
    if (!seenUpi.has(val)) {
      seenUpi.add(val);
      upiIds.push({
        value: val,
        evidenceQuote: extractQuote(text, match.index, match.index + match[0].length),
      });
    }
  }

  // 3. URLs & bare domains
  const urls: ExtractedEntityItem[] = [];
  const seenUrls = new Set<string>();

  // Full URLs
  const httpUrlRegex = /https?:\/\/[^\s<>"'{}|\\^`[\]]+/gi;
  while ((match = httpUrlRegex.exec(text)) !== null) {
    let rawUrl = match[0].replace(/[.,;:)]+$/, "");
    const lower = rawUrl.toLowerCase();
    if (!seenUrls.has(lower)) {
      seenUrls.add(lower);
      urls.push({
        value: rawUrl,
        evidenceQuote: rawUrl,
      });
    }
  }

  // Bare domains (including .invalid, .test, .example, shortened links)
  const bareDomainRegex =
    /(?:^|[\s(])([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z0-9-]+\.)*(?:com|org|net|in|co\.in|edu|gov|io|invalid|test|example|localhost|tech|ai|dev|app|me|link|ly|xyz|top|live|online|site|club|vip|shop))\b(?:\/[^\s<>"'{}|\\^`[\]]*)?/gi;

  while ((match = bareDomainRegex.exec(text)) !== null) {
    const rawVal = match[1].replace(/[.,;:)]+$/, "");
    const lower = rawVal.toLowerCase();
    // Exclude if it's already an email domain or part of an extracted email
    const isEmailPart = emails.some((e) => e.value.endsWith(lower));
    if (!isEmailPart && !seenUrls.has(lower) && !seenUrls.has(`https://${lower}`) && !seenUrls.has(`http://${lower}`)) {
      seenUrls.add(lower);
      urls.push({
        value: rawVal,
        evidenceQuote: extractQuote(text, match.index, match.index + match[0].length),
      });
    }
  }

  // 4. Phones (Indian formats)
  const phones: ExtractedEntityItem[] = [];
  const seenPhones = new Set<string>();
  const phoneRegex = /(?:(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b)|(?:\b[6-9]\d{9}\b)|(?:\b0[1-9]\d{8,10}\b)/g;

  while ((match = phoneRegex.exec(text)) !== null) {
    const rawVal = match[0].trim();
    const digitsOnly = rawVal.replace(/\D/g, "");
    if (digitsOnly.length >= 10 && !seenPhones.has(digitsOnly)) {
      seenPhones.add(digitsOnly);
      phones.push({
        value: rawVal,
        evidenceQuote: extractQuote(text, match.index, match.index + match[0].length),
      });
    }
  }

  // 5. Social handles
  const socialHandles: ExtractedEntityItem[] = [];
  const seenHandles = new Set<string>();
  const socialRegex =
    /(?:(?:instagram\.com\/|t\.me\/|telegram\.me\/|wa\.me\/|twitter\.com\/|x\.com\/|linkedin\.com\/in\/)([a-zA-Z0-9_.\-]+))|(?:(?:telegram|instagram|insta|twitter)\s*[:\-]?\s*@([a-zA-Z0-9_]{3,30}))/gi;

  while ((match = socialRegex.exec(text)) !== null) {
    const handle = (match[1] || match[2]).toLowerCase().trim();
    if (!seenHandles.has(handle)) {
      seenHandles.add(handle);
      socialHandles.push({
        value: handle,
        evidenceQuote: extractQuote(text, match.index, match.index + match[0].length),
      });
    }
  }

  // 6. Organization Candidates
  const orgMap = new Map<
    string,
    {
      name: string;
      counts: number;
      hasSuffix: boolean;
      inSignature: boolean;
      inPreposition: boolean;
      evidenceQuote: string;
    }
  >();

  const registerCandidate = (
    rawCandidate: string,
    inSignature: boolean,
    inPreposition: boolean,
    quote: string
  ) => {
    let clean = rawCandidate
      .replace(/[\r\n\t]+/g, " ")
      .replace(/[.,;:\-—]+$/, "")
      .trim();

    // Strip common leading prepositions if captured
    clean = clean.replace(/^(?:at|with|from|on behalf of|for)\s+/i, "").trim();

    if (!clean || clean.length < 3 || clean.length > 60) return;

    // Filter out common non-org false positives
    const lower = clean.toLowerCase();
    if (
      lower.startsWith("our recruitment") ||
      lower.startsWith("our team") ||
      lower.startsWith("the candidate") ||
      lower.startsWith("shortlisted candidate") ||
      lower.startsWith("dear candidate") ||
      lower.startsWith("technical operations intern") ||
      lower.startsWith("internship program") ||
      lower === "recruitment & talent acquisition team" ||
      lower === "talent acquisition team" ||
      lower === "human resources"
    ) {
      return;
    }

    const hasSuffix =
      /\b(?:Pvt\.?\s*Ltd\.?|Private\s+Limited|Limited|LLP|Inc\.?|Technologies|Solutions|Labs|Systems|Corporation|Foundation|University|Infotech|Enterprises)\b/i.test(
        clean
      );

    const normKey = lower;
    const existing = orgMap.get(normKey);
    if (existing) {
      existing.counts += 1;
      if (inSignature) existing.inSignature = true;
      if (inPreposition) existing.inPreposition = true;
      if (hasSuffix) existing.hasSuffix = true;
    } else {
      orgMap.set(normKey, {
        name: clean,
        counts: 1,
        hasSuffix,
        inSignature,
        inPreposition,
        evidenceQuote: quote,
      });
    }
  };

  // Pattern A: "at <Org>", "with <Org>", "from <Org>", "on behalf of <Org>"
  const prepRegex =
    /(?:(?:position|internship|role|job|opportunity|work|career)\s+(?:of|at|with|in)\s+[^,\n.]{2,40}\s+)?\b(?:at|with|from|on behalf of)\s+([A-Z][a-zA-Z0-9&. \t]{2,40}(?:Pvt\.?\s*Ltd\.?|Private\s+Limited|Limited|LLP|Inc\.?|Technologies|Solutions|Labs|Systems|Corporation|Foundation|University|Infotech|Enterprises)?)(?:[.,;\r\n]|$|[\s]{2,})/g;

  while ((match = prepRegex.exec(text)) !== null) {
    if (match[1]) {
      const quote = extractQuote(text, match.index, match.index + match[0].length);
      registerCandidate(match[1], false, true, quote);
    }
  }

  // Pattern B: Signature block: Regards,\n...\n<Org>
  const sigRegex =
    /(?:Regards|Sincerely|Best regards|Warm regards|Thanks & regards|Yours sincerely)[, \t]*\r?\n(?:[^\r\n]+\r?\n)?([A-Z][a-zA-Z0-9&. \t]{2,50})/gi;

  while ((match = sigRegex.exec(text)) !== null) {
    if (match[1]) {
      const quote = extractQuote(text, match.index, match.index + match[0].length);
      registerCandidate(match[1], true, false, quote);
    }
  }

  // Pattern C: Explicit corporate suffixes anywhere
  const suffixRegex =
    /\b([A-Z][a-zA-Z0-9&. \t]{1,40}\s+(?:Pvt\.?\s*Ltd\.?|Private\s+Limited|Limited|LLP|Inc\.?|Technologies|Solutions|Labs|Systems|Corporation|Foundation|University|Infotech|Enterprises))\b/g;


  while ((match = suffixRegex.exec(text)) !== null) {
    if (match[1]) {
      const quote = extractQuote(text, match.index, match.index + match[0].length);
      registerCandidate(match[1], false, false, quote);
    }
  }

  // Rank organization candidates
  const organizationCandidates: OrganizationCandidate[] = [];
  for (const item of orgMap.values()) {
    let confidence: "high" | "medium" | "low" = "low";
    if ((item.counts >= 2 && item.hasSuffix) || (item.inSignature && item.inPreposition) || (item.inSignature && item.hasSuffix)) {
      confidence = "high";
    } else if (item.hasSuffix || item.inSignature || (item.inPreposition && item.counts >= 2)) {
      confidence = "medium";
    }

    organizationCandidates.push({
      name: item.name,
      confidence,
      evidenceQuote: item.evidenceQuote,
      count: item.counts,
    });
  }

  // Sort by confidence ('high' > 'medium' > 'low'), then counts descending, then length descending
  const confScore = { high: 3, medium: 2, low: 1 };
  organizationCandidates.sort((a, b) => {
    if (confScore[b.confidence] !== confScore[a.confidence]) {
      return confScore[b.confidence] - confScore[a.confidence];
    }
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.name.length - a.name.length;
  });

  return {
    emails,
    phones,
    urls,
    upiIds,
    socialHandles,
    organizationCandidates,
  };
}
