import {
  OFFICIAL_DOMAIN_ALLOWLIST,
  KNOWN_ORGS,
} from "../config/index.js";
import { RiskLevel } from "../schemas/index.js";
import { levenshteinDistance, normalizeHomoglyphs } from "./levenshtein.js";

const SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "cutt.ly",
  "t.co",
  "is.gd",
  "rebrand.ly",
  "rb.gy",
  "shorturl.at",
  "buff.ly",
  "ow.ly",
]);

const HIGH_ABUSE_TLDS = new Set([
  "xyz",
  "top",
  "click",
  "work",
  "buzz",
  "rest",
  "icu",
  "loan",
  "fit",
  "tk",
  "cf",
  "ga",
]);

const SUSPICIOUS_AFFIXES = [
  "apply",
  "register",
  "portal",
  "pay",
  "career",
  "job",
  "internship",
  "offer",
  "verify",
  "login",
  "secure",
  "support",
];

const PAYMENT_KEYWORDS = [
  "pay",
  "payment",
  "fee",
  "deposit",
  "upi",
  "checkout",
  "qr",
  "wallet",
];

export interface LinkEvaluationInput {
  url: string;
  hostname: string;
  registrableDomain?: string | null;
  domainRegisteredAt?: string | null;
  rdapStatus?: "not_run" | "ok" | "unavailable" | "not_found" | "timeout";
}

export interface LinkEvaluationResult {
  riskLevel: RiskLevel;
  observations: string[];
  unverified: string[];
  disclaimer: string;
}

export function isOfficialDomain(hostname: string): boolean {
  const host = hostname.toLowerCase();
  for (const official of OFFICIAL_DOMAIN_ALLOWLIST) {
    if (host === official || host.endsWith("." + official)) {
      return true;
    }
  }
  return false;
}

export function evaluateLink(input: LinkEvaluationInput): LinkEvaluationResult {
  const host = input.hostname.toLowerCase();
  const domainParts = host.split(".");
  const observations: string[] = [];
  const unverified: string[] = [];

  let isHighConcern = false;
  let isNeedsVerification = false;

  // 1. Check if official government or verified portal
  if (isOfficialDomain(host)) {
    observations.push(
      `Domain matches verified official portal allowlist (${host}).`
    );
    unverified.push(
      "Whether the specific opportunity listing or user message is officially published."
    );
    return {
      riskLevel: "NO_MAJOR_WARNING_SIGNS",
      observations,
      unverified,
      disclaimer: "Still not confirmation that the offer is genuine.",
    };
  }

  // 2. Punycode detection
  if (host.startsWith("xn--") || host.includes(".xn--")) {
    isHighConcern = true;
    observations.push(
      "Internationalized/punycode hostname ('xn--') detected. Often used for visual spoofing."
    );
  }

  // 3. Raw IP host
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  if (isIp) {
    isHighConcern = true;
    observations.push(
      "Destination uses a raw numeric IP address instead of a registered domain name."
    );
  }

  // 4. Shorteners
  if (SHORTENERS.has(host) || host.includes("bit.ly")) {
    isNeedsVerification = true;
    observations.push(
      `Shortened URL service (${host}) conceals the true landing domain.`
    );
    unverified.push("Final target destination URL after redirects.");
  }

  // 5. Lookalike check against known organizations (skip known shorteners)
  if (!SHORTENERS.has(host)) {
    const mainLabel = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : host;
    const mainSubTokens = mainLabel.split(/[-_]/);

    for (const org of KNOWN_ORGS) {
      // Check if official for this org
      const isOfficialForThisOrg = org.officialDomains.some(
        (od) => host === od || host.endsWith("." + od)
      );
      if (isOfficialForThisOrg) continue;

      for (const token of org.tokens) {
        const normalizedToken = normalizeHomoglyphs(token);

        // Check main label or any hyphen-separated sub-token
        const tokensToCheck = Array.from(new Set([mainLabel, ...mainSubTokens]));
        for (const t of tokensToCheck) {
          const normT = normalizeHomoglyphs(t);
          const minLen = Math.min(normT.length, normalizedToken.length);
          const maxAllowedDist = minLen >= 6 ? 2 : minLen >= 4 ? 1 : 0;

          const dist = levenshteinDistance(normT, normalizedToken);

          if (
            maxAllowedDist > 0 &&
            dist <= maxAllowedDist &&
            normT !== normalizedToken
          ) {
            isHighConcern = true;
            observations.push(
              `Domain closely mimics ${org.name} ('${t}' vs '${token}').`
            );
          } else if (normT === normalizedToken && !isOfficialForThisOrg) {
            // Exactly matching token on unofficial domain (e.g. infosys-portal.com or inf0sys)
            isHighConcern = true;
            observations.push(
              `Domain contains ${org.name} brand name on an unofficial host.`
            );
          }
        }

        // Check token + suspicious affix (e.g. aicte-internship-apply, tcs-careers-portal)
        if (token.length >= 3 && host.includes(token)) {
          const matchingAffix = SUSPICIOUS_AFFIXES.find((a) => host.includes(a));
          if (matchingAffix) {
            isHighConcern = true;
            observations.push(
              `Hostname combines ${org.name} keyword with '${matchingAffix}' on an unofficial domain.`
            );
          }
        }
      }
    }
  }

  // 6. Payment keywords in host or path on non-official domain
  try {
    const parsedUrl = new URL(input.url);
    const pathAndQuery = (parsedUrl.pathname + parsedUrl.search).toLowerCase();
    for (const kw of PAYMENT_KEYWORDS) {
      if (host.includes(kw) || pathAndQuery.includes(kw)) {
        isHighConcern = true;
        observations.push(
          `Payment-related keyword ('${kw}') found in URL path or hostname.`
        );
        break;
      }
    }
  } catch {
    // Ignore URL parse error if malformed
  }

  // 7. Subdomain depth (>= 4 labels)
  if (domainParts.length >= 4) {
    isNeedsVerification = true;
    observations.push(
      `Excessive subdomain nesting (${domainParts.length} levels) often hides the true host.`
    );
  }

  // 8. High abuse TLD
  const tld = domainParts[domainParts.length - 1];
  if (HIGH_ABUSE_TLDS.has(tld)) {
    isNeedsVerification = true;
    observations.push(
      `Uses a high-abuse/low-cost top-level domain (.${tld}).`
    );
  }

  // 9. RDAP Age check
  if (input.domainRegisteredAt) {
    const regDate = new Date(input.domainRegisteredAt);
    const ageDays = Math.floor(
      (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (!isNaN(ageDays) && ageDays >= 0) {
      if (ageDays < 30) {
        isHighConcern = true;
        observations.push(
          `Domain was registered only ${ageDays} day(s) ago (very high risk).`
        );
      } else if (ageDays < 180) {
        isNeedsVerification = true;
        observations.push(
          `Domain is relatively new, registered ${ageDays} days ago.`
        );
      } else {
        observations.push(`Domain has been active for ${ageDays} days.`);
      }
    }
  } else if (
    input.rdapStatus === "unavailable" ||
    input.rdapStatus === "timeout" ||
    input.rdapStatus === "not_found"
  ) {
    isNeedsVerification = true;
    observations.push("RDAP domain registration lookup could not be completed.");
    unverified.push("Domain registration date and registrant identity.");
  } else {
    unverified.push("Domain age could not be checked.");
  }

  // Baseline unverified items for all non-official links
  unverified.push("Whether this domain is authorized by the claimed organization.");
  unverified.push("Website security and payment gateway certification.");

  let riskLevel: RiskLevel;
  if (isHighConcern) {
    riskLevel = "HIGH_CONCERN";
  } else if (isNeedsVerification) {
    riskLevel = "NEEDS_VERIFICATION";
  } else {
    riskLevel = "NO_MAJOR_WARNING_SIGNS";
    observations.push("No alarming technical signals detected in domain structure.");
  }

  return {
    riskLevel,
    observations,
    unverified,
    disclaimer: "Still not confirmation that the offer is genuine.",
  };
}
