import { RiskLevel, Severity, UnknownItem } from "../schemas/index.js";
import { RuleHit } from "./types.js";

const SEVERITY_POINTS: Record<Severity, number> = {
  critical: 40,
  high: 25,
  medium: 12,
  low: 5,
  info: 0,
};

export interface ScoreResult {
  score: number;
  riskLevel: RiskLevel;
  hasHardDisqualifier: boolean;
  dedupedHits: RuleHit[];
}

export function scoreHits(hits: RuleHit[], textLength: number): ScoreResult {
  // Deduplicate by ruleId, keeping first occurrence
  const seenRuleIds = new Set<string>();
  const dedupedHits: RuleHit[] = [];

  for (const hit of hits) {
    if (!seenRuleIds.has(hit.ruleId)) {
      seenRuleIds.add(hit.ruleId);
      dedupedHits.push(hit);
    }
  }

  let totalScore = 0;
  let hasCritical = false;
  let hasHardDisqualifier = false;
  let hasMis001 = false;

  for (const hit of dedupedHits) {
    // CNT-001 uses 3 points specifically
    if (hit.ruleId === "CNT-001") {
      totalScore += 3;
    } else {
      totalScore += SEVERITY_POINTS[hit.severity] || 0;
    }

    if (hit.severity === "critical") {
      hasCritical = true;
    }
    if (hit.hardDisqualifier) {
      hasHardDisqualifier = true;
    }
    if (hit.ruleId === "MIS-001") {
      hasMis001 = true;
    }
  }

  // Cap at 100
  const score = Math.min(totalScore, 100);

  let riskLevel: RiskLevel;
  if (hasCritical || hasHardDisqualifier || score >= 50) {
    riskLevel = "HIGH_CONCERN";
  } else if (score >= 15 || textLength < 40 || hasMis001) {
    riskLevel = "NEEDS_VERIFICATION";
  } else {
    riskLevel = "NO_MAJOR_WARNING_SIGNS";
  }

  return {
    score,
    riskLevel,
    hasHardDisqualifier,
    dedupedHits,
  };
}

export function getBaselineUnknowns(): UnknownItem[] {
  return [
    {
      item: "Recruiter / sender identity",
      howToVerify:
        "Ask for an official email address from the organization's verified domain and check their professional profile on LinkedIn.",
    },
    {
      item: "Organization registration and official website",
      howToVerify:
        "Search for the company on the MCA portal (mca.gov.in) to verify CIN/LLPIN, or visit their genuine website directly.",
    },
    {
      item: "Whether you applied or were contacted unsolicited",
      howToVerify:
        "Review your job portal applications and sent emails to confirm you initiated contact for this role.",
    },
  ];
}
