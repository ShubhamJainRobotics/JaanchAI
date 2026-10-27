import { LinkCheckResult } from "../schemas/index.js";
import { evaluateLink } from "./heuristics.js";

const URL_REGEX = /https?:\/\/[^\s<>"'{}|\\^`[\]]+/gi;

export function extractLinks(text: string, maxLinks = 10): LinkCheckResult[] {
  const matches = text.match(URL_REGEX) || [];
  const uniqueUrls = Array.from(new Set(matches)).slice(0, maxLinks);

  const results: LinkCheckResult[] = [];
  for (const rawUrl of uniqueUrls) {
    try {
      const parsed = new URL(rawUrl);
      const evalResult = evaluateLink({
        url: rawUrl,
        hostname: parsed.hostname,
        rdapStatus: "not_run",
      });

      results.push({
        url: rawUrl,
        hostname: parsed.hostname,
        registrableDomain: null,
        riskLevel: evalResult.riskLevel,
        observations: evalResult.observations,
        unverified: evalResult.unverified,
        rdapStatus: "not_run",
        domainRegisteredAt: null,
        disclaimer: evalResult.disclaimer,
      });
    } catch {
      // Skip invalid URLs
    }
  }

  return results;
}
