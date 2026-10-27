import { getDomain } from "tldts";
import { isFreeMailDomain } from "../config/freeMail.js";
import { checkLookalikeDomain } from "../links/lookalike.js";
import { SenderIdentity } from "../schemas/index.js";

export interface ParseEmailAddressResult {
  displayName: string | null;
  email: string | null;
  localPart: string | null;
  domain: string | null;
  registrableDomain: string | null;
}

export function parseEmailAddress(raw: string): ParseEmailAddressResult {
  if (!raw) {
    return {
      displayName: null,
      email: null,
      localPart: null,
      domain: null,
      registrableDomain: null,
    };
  }

  const trimmed = raw.trim();
  // Name <email@domain.com>
  const angleMatch = trimmed.match(/^(.*?)\s*<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>$/);
  if (angleMatch) {
    const displayName = angleMatch[1].replace(/["']/g, "").trim() || null;
    const email = angleMatch[2].toLowerCase();
    const [localPart, domain] = email.split("@");
    const regDomain = getDomain(domain) || domain;
    return {
      displayName,
      email,
      localPart,
      domain,
      registrableDomain: regDomain,
    };
  }

  // Bare email
  const bareMatch = trimmed.match(/^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
  if (bareMatch) {
    const email = trimmed.toLowerCase();
    const localPart = bareMatch[1].toLowerCase();
    const domain = bareMatch[2].toLowerCase();
    const regDomain = getDomain(domain) || domain;
    return {
      displayName: null,
      email,
      localPart,
      domain,
      registrableDomain: regDomain,
    };
  }

  return {
    displayName: trimmed,
    email: null,
    localPart: null,
    domain: null,
    registrableDomain: null,
  };
}

export interface AnalyzeSenderOptions {
  claimedOrg?: string;
  officialDomains?: string[];
  phone?: string;
  upiId?: string;
  socialHandle?: string;
  websiteUrl?: string;
  recruiterName?: string;
}

export function analyzeSenderEmail(
  rawInput: string | undefined | null,
  options?: AnalyzeSenderOptions
): SenderIdentity {
  const parsed = parseEmailAddress(rawInput || "");
  const domain = parsed.domain;
  const isFreeMail = domain ? isFreeMailDomain(domain) : false;

  let matchesRegistryOrg = false;
  if (domain && options?.officialDomains && options.officialDomains.length > 0) {
    const cleanDomain = domain.toLowerCase().trim();
    matchesRegistryOrg = options.officialDomains.some(
      (od) => od.toLowerCase().trim() === cleanDomain
    );
  }

  // Lookalike detection
  let isLookalike = false;
  let lookalikeDetails: string | null = null;
  if (domain && !isFreeMail) {
    const lookRes = checkLookalikeDomain(domain);
    if (lookRes.isLookalike) {
      isLookalike = true;
      lookalikeDetails = lookRes.reason;
    }
  }

  // Consistency check (SND-001)
  let consistencyIssue: string | null = null;
  const claimedOrg = options?.claimedOrg?.toLowerCase();
  const displayName = parsed.displayName?.toLowerCase();

  if (claimedOrg && isFreeMail) {
    consistencyIssue = `Sender claims to represent '${options?.claimedOrg}', but writes from a personal webmail host (${domain}).`;
  } else if (claimedOrg && domain && !matchesRegistryOrg && !isFreeMail) {
    consistencyIssue = `Sender domain '${domain}' does not match official domains registered for '${options?.claimedOrg}'.`;
  } else if (displayName && isFreeMail) {
    if (
      displayName.includes("hr") ||
      displayName.includes("recruitment") ||
      displayName.includes("careers") ||
      displayName.includes("technologies") ||
      displayName.includes("officer")
    ) {
      consistencyIssue = `Display name indicates corporate or HR function ('${parsed.displayName}') while using a personal email provider.`;
    }
  }

  // Local-part / subdomain impersonation (SND-004)
  if (parsed.localPart && isFreeMail) {
    const brands = ["microsoft", "google", "amazon", "apple", "tcs", "infosys", "wipro", "flipkart"];
    for (const b of brands) {
      if (parsed.localPart.includes(b)) {
        isLookalike = true;
        lookalikeDetails = `Local part '${parsed.localPart}' incorporates brand '${b}' inside free mail provider '${domain}'.`;
        break;
      }
    }
  }

  return {
    rawEmail: parsed.email,
    displayName: parsed.displayName,
    localPart: parsed.localPart,
    domain: parsed.domain,
    registrableDomain: parsed.registrableDomain,
    isFreeMail,
    matchesRegistryOrg,
    isLookalike,
    lookalikeDetails,
    phone: options?.phone || null,
    upiId: options?.upiId || null,
    socialHandle: options?.socialHandle || null,
    websiteUrl: options?.websiteUrl || null,
    recruiterName: options?.recruiterName || null,
    consistencyIssue,
  };
}
