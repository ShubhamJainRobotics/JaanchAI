import {
  AnalysisResult,
  CheckRow,
  NextStep,
  NextSteps,
  Signal,
  CompletenessResult,
} from "../schemas/index.js";
import {
  NextStepsContext,
  STANDARD_STEP_CATALOG,
  PROTECT_STEP_CATALOG,
  getTemplateVariables,
  resolveTemplate,
} from "../config/nextSteps.js";
import { getSafetyBannerRules } from "../config/safetyBanner.js";

export interface BuildNextStepsOptions {
  alreadyPaid?: boolean;
  checklistCompletions?: Record<string, boolean>;
}

export function getSafeReplyQuestions(result: {
  signals?: Signal[];
  completeness?: CompletenessResult | null;
  rawText?: string;
  text?: string;
}): string[] {
  const questions: string[] = [];
  const signals = result.signals || [];
  const text = result.rawText || result.text || "";

  // 1. registration_meaning_and_fee (when MIS-007 fired or the text contains "registration"/"fee")
  const hasMis007 = signals.some((s) => s.ruleId === "MIS-007");
  const hasRegOrFee = /\b(?:registration|fee|fees|deposit|charges)\b/i.test(text);
  if (hasMis007 || hasRegOrFee) {
    questions.push("registration_meaning_and_fee");
  }

  // 2. selection_process (when MIS-003 fired or completeness lacks a selection process)
  const hasMis003 = signals.some((s) => s.ruleId === "MIS-003");
  const missingSelection = Boolean(
    result.completeness?.missing?.includes("selectionProcess")
  );
  if (hasMis003 || missingSelection) {
    questions.push("selection_process");
  }

  // 3. more_time (when URG-004/URG-001 fired)
  const hasUrg = signals.some(
    (s) => s.ruleId === "URG-004" || s.ruleId === "URG-001"
  );
  if (hasUrg) {
    questions.push("more_time");
  }

  // 4. official_domain_and_letterhead (always)
  questions.push("official_domain_and_letterhead");

  // 5. data_minimization (when DAT-006 fired)
  const hasDat006 = signals.some((s) => s.ruleId === "DAT-006");
  if (hasDat006) {
    questions.push("data_minimization");
  }

  return questions;
}

export function buildNextSteps(
  result: Partial<AnalysisResult> & NextStepsContext,
  options?: BuildNextStepsOptions
): NextSteps {
  const isHighRisk =
    result.status === "HIGH_RISK" || result.status === "CONFIRMED_SCAM";
  const variant: "standard" | "protect" = isHighRisk ? "protect" : "standard";

  // Context preparation
  const ctx: NextStepsContext = {
    status: result.status || "NEEDS_REVIEW",
    domain: result.domain || "internship",
    claimedOrg: result.claimedOrg,
    matchedOrganization: result.matchedOrganization,
    senderIdentity: result.senderIdentity,
    extractedFields: result.extractedFields,
    signals: result.signals || [],
    checks: result.checks || [],
    rawText: result.rawText,
    alreadyPaid: options?.alreadyPaid,
  };

  const vars = getTemplateVariables(ctx);

  // --- Part 1: Jaanch already checked (Read-Only) ---
  const checks = result.checks || [];
  const alreadyChecked: CheckRow[] = [];

  const findCheck = (keys: string[]) =>
    checks.find((c) => keys.includes(c.checkKey));

  // 1. Sender Domain Match
  const senderCheck = findCheck(["sender_domain_match"]);
  if (senderCheck) {
    alreadyChecked.push(senderCheck);
  } else {
    alreadyChecked.push({
      checkKey: "sender_domain_match",
      label: "Sender Domain Legitimacy",
      outcome: "not_run",
      detail: "Sender email address was not provided.",
      source: "rule",
    });
  }

  // 2. Reported Records / Entities
  const reportedCheck = findCheck(["reported_records", "reported_entities"]);
  if (reportedCheck) {
    alreadyChecked.push(reportedCheck);
  }

  // 3. Organization Registry Match
  const registryCheck = findCheck([
    "organization_registry_match",
    "registry_match",
  ]);
  if (registryCheck) {
    alreadyChecked.push(registryCheck);
  }

  // 4. Header Authentication
  const headerCheck = findCheck([
    "header_authentication",
    "header_spf/dkim/dmarc",
  ]);
  if (headerCheck) {
    alreadyChecked.push(headerCheck);
  } else if (!result.headerAnalysis) {
    alreadyChecked.push({
      checkKey: "header_authentication",
      label: "Header Authentication (SPF / DKIM / DMARC)",
      outcome: "not_run",
      detail: "Headers not supplied",
      source: "header_parse",
    });
  }

  // 5. Domain Age (RDAP)
  const ageCheck = findCheck(["domain_age"]);
  if (ageCheck) {
    alreadyChecked.push(ageCheck);
  }

  // 6. Official website from registry (only if needs_team_review is false)
  if (
    ctx.matchedOrganization &&
    !ctx.matchedOrganization.needsTeamReview &&
    ctx.matchedOrganization.officialDomains &&
    ctx.matchedOrganization.officialDomains.length > 0
  ) {
    alreadyChecked.push({
      checkKey: "official_website_registry",
      label: "Official website (from registry)",
      outcome: "pass",
      detail: ctx.matchedOrganization.officialDomains[0],
      source: "registry",
    });
  }

  // --- Part 2: Your turn (or Protect yourself) ---
  const catalog =
    variant === "protect" ? PROTECT_STEP_CATALOG : STANDARD_STEP_CATALOG;

  const isAttested = (key: string): boolean => {
    return Boolean(
      checks.some(
        (c) =>
          (c.checkKey === key ||
            (key === "found_independently_on_official_portal" &&
              c.checkKey === "found_on_official_site")) &&
          c.outcome === "user_attested"
      )
    );
  };

  const isStepCompleted = (stepKey: string): boolean => {
    if (options?.checklistCompletions && stepKey in options.checklistCompletions) {
      return Boolean(options.checklistCompletions[stepKey]);
    }
    const matchingChecklistItem = result.checklist?.find(
      (item) => item.stepKey === stepKey || (item as any).id === stepKey
    );
    return Boolean(matchingChecklistItem?.completed);
  };

  const eligibleSteps: NextStep[] = [];
  const seenStepKeys = new Set<string>();
  const seenTitles = new Set<string>();
  const seenHowToVerify = new Set<string>();

  for (const item of catalog) {
    if (!item.appliesWhen(ctx)) {
      continue;
    }

    if (seenStepKeys.has(item.stepKey)) continue;

    const title = resolveTemplate(item.titleTemplate, vars);
    const normalizedTitle = title.toLowerCase().trim();
    if (seenTitles.has(normalizedTitle)) continue;

    const howToVerify = resolveTemplate(item.howToVerifyTemplate, vars);
    if (seenHowToVerify.has(howToVerify)) continue;

    seenStepKeys.add(item.stepKey);
    seenTitles.add(normalizedTitle);
    seenHowToVerify.add(howToVerify);

    const actions = item.getActions ? item.getActions(ctx) : undefined;
    const subChecks = item.subChecks
      ? item.subChecks.map((sc) => ({
          key: sc.key,
          label: resolveTemplate(sc.labelTemplate, vars),
          completed: isAttested(sc.key),
        }))
      : undefined;

    eligibleSteps.push({
      stepKey: item.stepKey,
      title,
      whyItMatters: item.whyItMatters,
      howToVerify,
      priority: item.priority,
      completed: isStepCompleted(item.stepKey),
      actions,
      subChecks,
    });
  }

  // Sort by priority ascending
  eligibleSteps.sort((a, b) => a.priority - b.priority);

  // Max 6 steps in yourTurn; extras go into more
  const yourTurn = eligibleSteps.slice(0, 6);
  const more = eligibleSteps.slice(6);

  // --- Part 3: Stay safe banner ---
  const banner = getSafetyBannerRules({ signals: ctx.signals });

  return {
    alreadyChecked,
    yourTurn,
    more,
    banner,
    variant,
  };
}
