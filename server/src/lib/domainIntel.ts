import { getDomain } from "tldts";
import { CheckRow } from "shared";
import { env } from "../config/env.js";
import { lookupRdap } from "./rdap.js";
import { safeFetch } from "./safeFetch.js";
import { logger } from "./logger.js";

export interface DomainIntelResult {
  registrableDomain: string | null;
  rdapAgeDays: number | null;
  domainRegisteredAt: string | null;
  ctFirstSeenDate: string | null;
  ctAgeDays: number | null;
  safeBrowsingStatus: "clean" | "threat" | "not_run" | "unknown";
  threatDetails?: string[];
  checks: CheckRow[];
}

interface CacheEntry {
  data: DomainIntelResult;
  expiresAt: number;
}

const INTEL_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function lookupDomainIntel(
  hostname: string,
  options?: { runThirdPartyChecks?: boolean; url?: string }
): Promise<DomainIntelResult> {
  const registrableDomain = getDomain(hostname) || hostname;
  const cacheKey = registrableDomain.toLowerCase();

  const cached = INTEL_CACHE.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const checks: CheckRow[] = [];

  // 1. RDAP Registration Date
  let domainRegisteredAt: string | null = null;
  let rdapAgeDays: number | null = null;

  try {
    const rdapRes = await lookupRdap(registrableDomain);
    if (rdapRes.rdapStatus === "ok" && rdapRes.domainRegisteredAt) {
      domainRegisteredAt = rdapRes.domainRegisteredAt;
      const regDate = new Date(domainRegisteredAt);
      rdapAgeDays = Math.floor(
        (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (rdapAgeDays < 30) {
        checks.push({
          checkKey: "domain_age",
          label: "Domain Age (RDAP)",
          outcome: "fail",
          detail: `Domain was registered only ${rdapAgeDays} day(s) ago (high scam correlation).`,
          source: "rdap",
        });
      } else if (rdapAgeDays < 180) {
        checks.push({
          checkKey: "domain_age",
          label: "Domain Age (RDAP)",
          outcome: "unknown",
          detail: `Domain is relatively young (${rdapAgeDays} days active).`,
          source: "rdap",
        });
      } else {
        checks.push({
          checkKey: "domain_age",
          label: "Domain Age (RDAP)",
          outcome: "pass",
          detail: `Domain has been established for ${rdapAgeDays} days (${domainRegisteredAt.split("T")[0]}).`,
          source: "rdap",
        });
      }
    } else {
      checks.push({
        checkKey: "domain_age",
        label: "Domain Age (RDAP)",
        outcome: "unknown",
        detail: `RDAP lookup returned '${rdapRes.rdapStatus}'; registration date could not be confirmed.`,
        source: "rdap",
      });
    }
  } catch (err: any) {
    checks.push({
      checkKey: "domain_age",
      label: "Domain Age (RDAP)",
      outcome: "unknown",
      detail: "RDAP lookup failed or timed out.",
      source: "rdap",
    });
  }

  // 2. Certificate Transparency Log Lookup (crt.sh)
  let ctFirstSeenDate: string | null = null;
  let ctAgeDays: number | null = null;

  if (options?.runThirdPartyChecks && env.ENABLE_THIRD_PARTY_CHECKS) {
    try {
      const ctUrl = `${env.CT_LOG_BASE_URL.replace(/\/$/, "")}/?q=${encodeURIComponent(hostname)}&output=json`;
      const ctRes = await safeFetch(ctUrl, {
        timeoutMs: env.CT_LOG_TIMEOUT_MS,
        maxBytes: 500000,
        allowedContentTypes: ["application/json", "text/plain", "text/html"],
      });

      const certs = JSON.parse(ctRes.text);
      if (Array.isArray(certs) && certs.length > 0) {
        let earliestDate: Date | null = null;
        for (const cert of certs) {
          if (cert.not_before) {
            const d = new Date(cert.not_before);
            if (!isNaN(d.getTime())) {
              if (!earliestDate || d < earliestDate) {
                earliestDate = d;
              }
            }
          }
        }

        if (earliestDate) {
          ctFirstSeenDate = earliestDate.toISOString();
          ctAgeDays = Math.floor(
            (Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (ctAgeDays < 30) {
            checks.push({
              checkKey: "ct_first_seen",
              label: "Certificate Transparency History",
              outcome: "unknown",
              detail: `Earliest SSL certificate for '${hostname}' was issued only ${ctAgeDays} day(s) ago.`,
              source: "ct_log",
            });
          } else {
            checks.push({
              checkKey: "ct_first_seen",
              label: "Certificate Transparency History",
              outcome: "pass",
              detail: `First logged SSL certificate seen ${ctAgeDays} days ago (${ctFirstSeenDate.split("T")[0]}).`,
              source: "ct_log",
            });
          }
        }
      }
    } catch (ctErr: any) {
      checks.push({
        checkKey: "ct_first_seen",
        label: "Certificate Transparency History",
        outcome: "unknown",
        detail: "Certificate transparency log query was unavailable or timed out.",
        source: "ct_log",
      });
    }
  }

  // 3. Google Safe Browsing (Optional)
  let safeBrowsingStatus: "clean" | "threat" | "not_run" | "unknown" = "not_run";
  let threatDetails: string[] = [];

  if (
    options?.runThirdPartyChecks &&
    env.ENABLE_THIRD_PARTY_CHECKS &&
    env.SAFE_BROWSING_API_KEY &&
    options.url
  ) {
    try {
      const sbApiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.SAFE_BROWSING_API_KEY}`;
      const payload = {
        client: {
          clientId: "jaanch-verification",
          clientVersion: "2.0.0",
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION",
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url: options.url }],
        },
      };

      const sbRes = await fetch(sbApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });

      if (sbRes.ok) {
        const sbData = await sbRes.json();
        if (sbData.matches && sbData.matches.length > 0) {
          safeBrowsingStatus = "threat";
          threatDetails = sbData.matches.map((m: any) => m.threatType);
          checks.push({
            checkKey: "safe_browsing",
            label: "Google Safe Browsing Reputation",
            outcome: "fail",
            detail: `Flagged as malicious by Google Safe Browsing: ${threatDetails.join(", ")}.`,
            source: "safe_browsing",
          });
        } else {
          safeBrowsingStatus = "clean";
          checks.push({
            checkKey: "safe_browsing",
            label: "Google Safe Browsing Reputation",
            outcome: "pass",
            detail: "No active threats listed in Google Safe Browsing database.",
            source: "safe_browsing",
          });
        }
      } else {
        safeBrowsingStatus = "unknown";
        checks.push({
          checkKey: "safe_browsing",
          label: "Google Safe Browsing Reputation",
          outcome: "unknown",
          detail: "Safe Browsing service returned an unexpected response.",
          source: "safe_browsing",
        });
      }
    } catch {
      safeBrowsingStatus = "unknown";
      checks.push({
        checkKey: "safe_browsing",
        label: "Google Safe Browsing Reputation",
        outcome: "unknown",
        detail: "Safe Browsing check failed or timed out.",
        source: "safe_browsing",
      });
    }
  }

  const result: DomainIntelResult = {
    registrableDomain,
    rdapAgeDays,
    domainRegisteredAt,
    ctFirstSeenDate,
    ctAgeDays,
    safeBrowsingStatus,
    threatDetails,
    checks,
  };

  // Cache result
  INTEL_CACHE.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return result;
}
