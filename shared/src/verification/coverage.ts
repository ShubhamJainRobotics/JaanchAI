import type { CheckRow } from "../schemas/index.js";

export const INDEPENDENT_CHECKS = [
  "sender_domain",
  "email_headers",
  "domain_age",
  "registry_match",
  "official_listing",
  "reported_entities",
  "attest_found_on_official_site",
  "attest_recruiter",
] as const;

export type IndependentCheckKey = (typeof INDEPENDENT_CHECKS)[number];

const CHECK_ALIASES: Record<string, IndependentCheckKey> = {
  sender_domain: "sender_domain",
  sender_domain_match: "sender_domain",
  email_headers: "email_headers",
  header_authentication: "email_headers",
  header_domain_alignment: "email_headers",
  domain_age: "domain_age",
  registry_match: "registry_match",
  organization_registry_match: "registry_match",
  official_listing: "official_listing",
  reported_entities: "reported_entities",
  reported_records: "reported_entities",
  attest_found_on_official_site: "attest_found_on_official_site",
  attest_recruiter: "attest_recruiter",
};

export interface IndependentCoverageResult {
  completed: number;
  total: 8;
  label: string;
  caption: string;
  completedKeys: IndependentCheckKey[];
}

export function computeIndependentCoverage(checks: CheckRow[]): IndependentCoverageResult {
  const completedKeysSet = new Set<IndependentCheckKey>();

  for (const check of checks) {
    const canonicalKey = CHECK_ALIASES[check.checkKey];
    if (!canonicalKey) {
      // Not one of the 8 independent checks (e.g. text rules, completeness, payment destination)
      continue;
    }

    if (check.outcome === "unknown" || check.outcome === "not_run") {
      continue;
    }

    if (["pass", "fail", "user_attested"].includes(check.outcome)) {
      completedKeysSet.add(canonicalKey);
      continue;
    }

    if (canonicalKey === "reported_entities" && check.outcome === "none_found") {
      // Must have actually looked up at least one identifier
      // If detail says "No sender email..." or zero identifiers, do not count
      const detailLower = check.detail.toLowerCase();
      const hasCheckedIndicators =
        detailLower.includes("checked") &&
        !detailLower.includes("no sender email, phone, upi id") &&
        !detailLower.includes("checked 0");

      if (hasCheckedIndicators) {
        completedKeysSet.add(canonicalKey);
      }
    }
  }

  const completed = completedKeysSet.size;
  const total = 8 as const;

  return {
    completed,
    total,
    label: `Independent checks completed: ${completed} of ${total}`,
    caption:
      "Counts only checks against sources outside the message. More completed checks = stronger evidence. It is not a risk percentage.",
    completedKeys: Array.from(completedKeysSet),
  };
}
