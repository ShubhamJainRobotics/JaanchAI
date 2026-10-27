import { KNOWN_ORGS } from "../config/knownOrgs.js";
import { levenshteinDistance } from "./levenshtein.js";

export const LOOKALIKE_EXTRA_TOKENS = new Set([
  "jobs",
  "careers",
  "hiring",
  "india",
  "apply",
  "register",
  "portal",
  "pay",
  "recruit",
  "official",
]);

export const UNUSUAL_TLDS = new Set([
  "xyz",
  "top",
  "click",
  "work",
  "buzz",
  "rest",
  "icu",
  "online",
  "site",
  "tk",
  "cf",
  "ga",
]);

export interface BrandTarget {
  name: string;
  tokens: readonly string[] | string[];
  officialDomains: readonly string[] | string[];
}

/**
 * Homoglyph and digit normalization:
 * 0→o, 1/i/|→l, 3→e, 5→s, 4/@→a, rn→m, vv→w
 */
export function normalizeHomoglyphsAdvanced(str: string): string {
  let s = str.toLowerCase();
  // Decode punycode if starting with xn--
  if (s.startsWith("xn--")) {
    try {
      // Basic punycode marker removal or preserve
      s = s.slice(4);
    } catch {
      // ignore
    }
  }
  return s
    .replace(/rn/g, "m")
    .replace(/vv/g, "w")
    .replace(/[0]/g, "o")
    .replace(/[1i|]/g, "l")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[8]/g, "b");
}

export interface LookalikeCheckResult {
  isLookalike: boolean;
  brandName: string | null;
  reason: string | null;
  isUnusualTld?: boolean;
}

export function checkLookalikeDomain(
  domainOrHost: string,
  extraOrgs?: BrandTarget[]
): LookalikeCheckResult {
  if (!domainOrHost) {
    return { isLookalike: false, brandName: null, reason: null };
  }

  let host = domainOrHost.trim().toLowerCase();
  // Strip protocol and path if passed
  host = host.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
  if (host.startsWith("www.")) {
    host = host.slice(4);
  }

  // Combine known brands from config and extra registry orgs
  const allTargets: BrandTarget[] = [...KNOWN_ORGS];
  if (extraOrgs) {
    for (const org of extraOrgs) {
      allTargets.push(org);
    }
  }

  // 1. If this exact host is official for ANY organization, it is genuine, NEVER flag it
  for (const org of allTargets) {
    const isOfficial = org.officialDomains.some((d) => {
      const cleanOfficial = d.toLowerCase().replace(/^www\./, "");
      return host === cleanOfficial || host.endsWith("." + cleanOfficial);
    });
    if (isOfficial) {
      return { isLookalike: false, brandName: null, reason: null };
    }
  }

  // Split domain parts
  const domainParts = host.split(".");
  const tld = domainParts[domainParts.length - 1];
  const isUnusualTld = UNUSUAL_TLDS.has(tld);

  // Registrable base label (e.g., 'micros0ft-careers' from 'micros0ft-careers.com')
  const baseLabel =
    domainParts.length >= 2 ? domainParts[domainParts.length - 2] : host;

  // Split base label on hyphens and underscores
  const tokens = baseLabel.split(/[-_]/).filter(Boolean);

  for (const org of allTargets) {
    // Collect brand names and keywords
    const brandTokens = [
      ...org.tokens,
      org.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
    ].filter((t) => t.length >= 3);

    for (const bToken of brandTokens) {
      const normBrand = normalizeHomoglyphsAdvanced(bToken);

      // Check 1: Token containment with extra keywords (e.g. google-india-jobs.net, amazonhiring-india.org)
      // Check if base label contains normalized brand and at least one extra token or affix
      const normBaseLabel = normalizeHomoglyphsAdvanced(baseLabel);

      const containsBrand =
        normBaseLabel.includes(normBrand) ||
        tokens.some((tok) => normalizeHomoglyphsAdvanced(tok) === normBrand);

      if (containsBrand) {
        // If it contains the brand, check if it's on an unofficial domain
        // Check for extra tokens or affixed brand (e.g. amazonhiring, google-jobs)
        const hasExtraToken =
          Array.from(LOOKALIKE_EXTRA_TOKENS).some(
            (extra) =>
              normBaseLabel.includes(extra) ||
              tokens.some((tok) => tok.includes(extra))
          ) || tokens.length > 1;

        if (hasExtraToken || normBaseLabel !== normBrand) {
          return {
            isLookalike: true,
            brandName: org.name,
            reason: `Domain '${host}' mimics ${org.name} using unauthorized brand tokens on an unofficial host.`,
            isUnusualTld,
          };
        }
      }

      // Check 2: Levenshtein distance on individual tokens (e.g., micros0ft -> microsoft)
      for (const tok of tokens) {
        const normTok = normalizeHomoglyphsAdvanced(tok);
        // Direct match after homoglyph normalization (e.g. micros0ft -> microsoft)
        if (normTok === normBrand && tok !== bToken) {
          return {
            isLookalike: true,
            brandName: org.name,
            reason: `Domain label '${tok}' is a character-swap lookalike of ${org.name} ('${bToken}').`,
            isUnusualTld,
          };
        }

        // Levenshtein edit distance <= 2 for tokens of sufficient length
        if (normBrand.length >= 4 && normTok.length >= 4) {
          const dist = levenshteinDistance(normTok, normBrand);
          if (dist > 0 && dist <= (normBrand.length >= 6 ? 2 : 1)) {
            return {
              isLookalike: true,
              brandName: org.name,
              reason: `Domain label '${tok}' is an edit-distance lookalike of ${org.name} ('${bToken}').`,
              isUnusualTld,
            };
          }
        }
      }

      // Check 3: Levenshtein on entire base label
      if (normBrand.length >= 5 && normBaseLabel.length >= 5) {
        const dist = levenshteinDistance(normBaseLabel, normBrand);
        if (dist > 0 && dist <= 2) {
          return {
            isLookalike: true,
            brandName: org.name,
            reason: `Domain base '${baseLabel}' is a typo-squat of ${org.name} ('${bToken}').`,
            isUnusualTld,
          };
        }
      }
    }
  }

  return { isLookalike: false, brandName: null, reason: null, isUnusualTld };
}
