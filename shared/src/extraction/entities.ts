import {
  ExtractedEntities,
  ExtractedEntityItem,
} from "../schemas/index.js";
import { findSpan } from "../text/spans.js";
import { extractOrganizationCandidates } from "./organization.js";

/**
 * Extracts and deduplicates emails, phones, URLs/domains, UPI IDs, social handles,
 * and ranked organization candidates with exact whole-word evidenceQuotes.
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
      const span = findSpan(text, match.index, match[0].length);
      emails.push({
        value: val,
        evidenceQuote: span.quote,
      });
    }
  }

  // 2. UPI IDs (name@handle where handle has NO dot e.g. brightpath.hr@okbank, x@ybl, x@okhdfcbank)
  const upiIds: ExtractedEntityItem[] = [];
  const seenUpi = new Set<string>();
  // Match token name@handle where handle has NO dot
  const upiRegex = /\b([a-zA-Z0-9.\-_]{2,64}@([a-zA-Z0-9_-]{2,32}))\b/gi;

  while ((match = upiRegex.exec(text)) !== null) {
    const fullVal = match[1].toLowerCase().trim();
    const handle = match[2].toLowerCase().trim();

    // Ensure handle has no dot and is not an email domain prefix or reserved word
    const isEmail = emails.some((e) => e.value.startsWith(fullVal));
    if (!isEmail && !handle.includes(".") && !["example", "invalid", "test", "localhost"].includes(handle)) {
      if (!seenUpi.has(fullVal)) {
        seenUpi.add(fullVal);
        const span = findSpan(text, match.index, match[0].length);
        upiIds.push({
          value: fullVal,
          evidenceQuote: span.quote,
        });
      }
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
      const span = findSpan(text, match.index, match[0].length);
      urls.push({
        value: rawUrl,
        evidenceQuote: span.quote,
      });
    }
  }

  // Bare domains (including .invalid, .test, .example, shortened links)
  const bareDomainRegex =
    /(?:^|[\s(])([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z0-9-]+\.)*(?:com|org|net|in|co\.in|edu|gov|io|invalid|test|example|localhost|tech|ai|dev|app|me|link|ly|xyz|top|live|online|site|club|vip|shop))\b(?:\/[^\s<>"'{}|\\^`[\]]*)?/gi;

  while ((match = bareDomainRegex.exec(text)) !== null) {
    const rawVal = match[1].replace(/[.,;:)]+$/, "");
    const lower = rawVal.toLowerCase();
    const isEmailPart = emails.some((e) => e.value.endsWith(lower));
    if (
      !isEmailPart &&
      !seenUrls.has(lower) &&
      !seenUrls.has(`https://${lower}`) &&
      !seenUrls.has(`http://${lower}`)
    ) {
      seenUrls.add(lower);
      const span = findSpan(text, match.index, match[0].length);
      urls.push({
        value: rawVal,
        evidenceQuote: span.quote,
      });
    }
  }

  // 4. Phones (Indian formats)
  const phones: ExtractedEntityItem[] = [];
  const seenPhones = new Set<string>();
  const phoneRegex =
    /(?:(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b)|(?:\b[6-9]\d{9}\b)|(?:\b0[1-9]\d{8,10}\b)/g;

  while ((match = phoneRegex.exec(text)) !== null) {
    const rawVal = match[0].trim();
    const digitsOnly = rawVal.replace(/\D/g, "");
    if (digitsOnly.length >= 10 && !seenPhones.has(digitsOnly)) {
      seenPhones.add(digitsOnly);
      const span = findSpan(text, match.index, match[0].length);
      phones.push({
        value: rawVal,
        evidenceQuote: span.quote,
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
      const span = findSpan(text, match.index, match[0].length);
      socialHandles.push({
        value: handle,
        evidenceQuote: span.quote,
      });
    }
  }

  // 6. Organization Candidates (using rewritten scored algorithm)
  const organizationCandidates = extractOrganizationCandidates(text);

  return {
    emails,
    phones,
    urls,
    upiIds,
    socialHandles,
    organizationCandidates,
  };
}
