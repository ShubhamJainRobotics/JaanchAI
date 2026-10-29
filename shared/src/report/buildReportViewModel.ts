import {
  AnalysisResult,
  CheckRow,
  Severity,
  VerificationStatus,
} from "../schemas/index.js";
import { STATUS_COPY } from "../config/status.js";
import { getSafetyBannerRules } from "../config/safetyBanner.js";
import { buildNextSteps } from "../nextSteps/build.js";
import { redactPII } from "../privacy/redact.js";
import {
  formatQuote,
  signalSourceLabel,
  humanizeReason,
  safeText,
} from "./format.js";

export interface ReportAlert {
  type: "critical" | "standing";
  title: string;
  body: string;
}

export interface ReportSignalItem {
  ruleId: string;
  severity: Severity;
  title: string;
  sourceLabel: string;
  evidenceQuote: string;
  whyItMatters: string;
  hardDisqualifier: boolean;
}

export interface ReportCheckItem {
  checkKey: string;
  label: string;
  outcome: string;
  outcomeLabel: string;
  detail: string;
  source: string;
}

export interface ReportOfferDetail {
  key: string;
  label: string;
  status: "Found" | "Missing";
  quoteOrReason: string;
}

export interface ReportNextStep {
  title: string;
  instruction: string;
  whyItMatters?: string;
  isHighRisk: boolean;
}

export interface ReportDraftReply {
  subject: string;
  body: string;
}

export interface ReportHelplineStrip {
  helpline: string;
  portalUrl: string;
  label: string;
}

export interface ReportViewModel {
  reportId: string;
  generatedAt: string;
  status: VerificationStatus;
  statusLabel: string;
  statusMeaning: string;
  statusTone: string;
  domainLabel: string;
  claimedOrg?: string;
  aiUsed: boolean;
  reasons: string[];
  alert: ReportAlert;
  signals: ReportSignalItem[];
  checks: ReportCheckItem[];
  notRunInputs: string[];
  notRunSummary: string;
  offerDetails: ReportOfferDetail[];
  nextSteps: ReportNextStep[];
  standingRules: string[];
  draftReply?: ReportDraftReply | null;
  messageExcerpt?: string | null;
  helplineStrip?: ReportHelplineStrip | null;
  disclaimer: string;
}

export interface BuildReportViewModelOptions {
  includeNextSteps?: boolean;
  includeMessageText?: boolean;
  draftReply?: { subject: string; body: string } | null;
  alreadyPaid?: boolean;
  checklistCompletions?: Record<string, boolean>;
}

// Canonical category order for checks (§4.1)
const CHECK_CATEGORY_ORDER: Record<string, number> = {
  // 1. sender identity
  sender_domain_match: 10,
  sender_identity: 11,

  // 2. domain/headers/age
  header_authentication: 20,
  "header_spf/dkim/dmarc": 21,
  domain_age: 22,

  // 3. organization registry/listing
  organization_registry_match: 30,
  registry_match: 31,
  official_website_registry: 32,
  official_listing: 33,

  // 4. reported records
  reported_records: 40,
  reported_entities: 41,

  // 5. text rules
  payment_request: 50,
  sensitive_data_request: 51,
  urgency_language: 52,
  guarantee_unrealistic: 53,

  // 6. completeness
  completeness: 60,
};

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
  info: 5,
};

const CHECK_NOT_RUN_LABELS: Record<string, string> = {
  sender_domain_match: "sender email",
  header_authentication: "email headers",
  official_listing: "official listing",
  organization_registry_match: "organization registry",
  domain_age: "domain age lookup",
  reported_records: "fraud records check",
};

/**
 * Pure function to build the comprehensive ReportViewModel for PDF export,
 * JSON export, and on-screen report consistency.
 */
export function buildReportViewModel(
  result: AnalysisResult,
  opts?: BuildReportViewModelOptions
): ReportViewModel {
  const isHighRisk =
    result.status === "HIGH_RISK" || result.status === "CONFIRMED_SCAM";

  // 1. Identification & Metadata
  const reportId =
    result.id ||
    "guest-" +
      (result.createdAt
        ? new Date(result.createdAt).getTime().toString(36)
        : "session");

  const createdDate = result.createdAt ? new Date(result.createdAt) : new Date();
  const generatedAt = createdDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusConfig = STATUS_COPY[result.status] || {
    label: result.status,
    meaning: "",
    tone: "amber",
  };

  const domainLabel = result.domain
    ? result.domain.charAt(0).toUpperCase() +
      result.domain.slice(1).replace(/_/g, " ")
    : "Opportunity";

  const claimedOrg =
    result.claimedOrg ||
    result.matchedOrganization?.name ||
    result.extractedFields?.organization?.value ||
    undefined;

  // 2. Reasons (up to 3 plain-language bullets, scores omitted)
  const rawReasons = result.reasons || [];
  const reasons: string[] = [];
  const seenReasons = new Set<string>();

  for (const r of rawReasons) {
    const text = humanizeReason(r);
    if (text && !seenReasons.has(text)) {
      seenReasons.add(text);
      reasons.push(text);
      if (reasons.length >= 3) break;
    }
  }

  if (reasons.length === 0) {
    reasons.push(humanizeReason("insufficient_evidence"));
  }

  // 3. Alert Box or Standing Rules (§5.3)
  const rawSignals = result.signals || [];
  const hasPaymentSignal = rawSignals.some(
    (s) =>
      s.category === "payment" || (s.ruleId && s.ruleId.startsWith("PAY-"))
  );

  let alert: ReportAlert;
  if (isHighRisk || hasPaymentSignal) {
    alert = {
      type: "critical",
      title: "Immediate Action Required",
      body: "Do not pay anything or share Aadhaar/PAN/bank details/OTPs. If you have already paid or shared details, call 1930 and report at cybercrime.gov.in.",
    };
  } else {
    alert = {
      type: "standing",
      title: "Standing Student Safety Rules",
      body: "1. Never pay any fee to receive an opportunity. 2. Don't share Aadhaar, PAN, bank details, card details, or OTPs before independently verifying the sender.",
    };
  }

  // 4. Signals: Sorted critical -> info, source as "Rule" / "AI-observed", quotes formatted
  const sortedSignals = [...rawSignals].sort(
    (a, b) =>
      (SEVERITY_RANK[a.severity] || 99) - (SEVERITY_RANK[b.severity] || 99)
  );

  const signals: ReportSignalItem[] = sortedSignals.map((s) => ({
    ruleId: s.ruleId && s.ruleId.startsWith("AI-") ? "AI" : s.ruleId,
    severity: s.severity,
    title: safeText(s.title),
    sourceLabel: signalSourceLabel(s),
    evidenceQuote: formatQuote(s.evidenceQuote, 140),
    whyItMatters: safeText(s.whyItMatters),
    hardDisqualifier: Boolean(s.hardDisqualifier),
  }));

  // 5. De-duplicate and order checks (§4.1, §4.2)
  const nextStepsData = buildNextSteps(result, {
    alreadyPaid: opts?.alreadyPaid,
    checklistCompletions: opts?.checklistCompletions,
  });

  const mergedMap = new Map<string, CheckRow>();

  // Add nextSteps alreadyChecked first
  for (const c of nextStepsData.alreadyChecked || []) {
    mergedMap.set(c.checkKey, c);
  }

  // Overlay with result.checks (preserving more specific outcomes)
  for (const c of result.checks || []) {
    const existing = mergedMap.get(c.checkKey);
    if (!existing || existing.outcome === "not_run" || c.outcome !== "not_run") {
      mergedMap.set(c.checkKey, c);
    }
  }

  const allMergedChecks = Array.from(mergedMap.values());

  // Sort checks by canonical category ordering
  allMergedChecks.sort((a, b) => {
    const orderA = CHECK_CATEGORY_ORDER[a.checkKey] ?? 100;
    const orderB = CHECK_CATEGORY_ORDER[b.checkKey] ?? 100;
    if (orderA !== orderB) return orderA - orderB;
    return a.checkKey.localeCompare(b.checkKey);
  });

  const checks: ReportCheckItem[] = [];
  const notRunInputs: string[] = [];

  const OUTCOME_LABELS: Record<string, string> = {
    pass: "Pass",
    fail: "Fail",
    unknown: "Unknown",
    none_found: "None found",
    user_attested: "Confirmed by you",
  };

  for (const c of allMergedChecks) {
    if (c.outcome === "not_run") {
      const friendlyName =
        CHECK_NOT_RUN_LABELS[c.checkKey] || c.label.toLowerCase();
      if (!notRunInputs.includes(friendlyName)) {
        notRunInputs.push(friendlyName);
      }
    } else {
      checks.push({
        checkKey: c.checkKey,
        label: safeText(c.label),
        outcome: c.outcome,
        outcomeLabel: OUTCOME_LABELS[c.outcome] || c.outcome,
        detail: safeText(c.detail),
        source: c.source,
      });
    }
  }

  const notRunSummary =
    notRunInputs.length > 0
      ? `Not run (add details to run these): ${notRunInputs.join(", ")}`
      : "";

  // 6. 10 Offer Details Found / Missing (§5.6)
  const ext = result.extractedFields;
  const compDetails = result.completeness?.details || [];

  const getReasonForMissing = (fieldKey: string): string => {
    const d = compDetails.find((item) => item.key === fieldKey);
    return d?.reason || "Not mentioned in the message";
  };

  const offerDetails: ReportOfferDetail[] = [
    {
      key: "organization",
      label: "Organization",
      status: ext?.organization?.value ? "Found" : "Missing",
      quoteOrReason: ext?.organization?.value
        ? formatQuote(ext.organization.evidenceQuote || ext.organization.value, 80)
        : getReasonForMissing("organization"),
    },
    {
      key: "roleOrProgram",
      label: "Role / Program",
      status: ext?.roleOrProgram?.value ? "Found" : "Missing",
      quoteOrReason: ext?.roleOrProgram?.value
        ? formatQuote(ext.roleOrProgram.evidenceQuote || ext.roleOrProgram.value, 80)
        : getReasonForMissing("role"),
    },
    {
      key: "eligibility",
      label: "Eligibility",
      status: ext?.eligibility?.value ? "Found" : "Missing",
      quoteOrReason: ext?.eligibility?.value
        ? formatQuote(ext.eligibility.evidenceQuote || ext.eligibility.value, 80)
        : getReasonForMissing("eligibility"),
    },
    {
      key: "locationOrMode",
      label: "Location / Mode",
      status: ext?.locationOrMode?.value ? "Found" : "Missing",
      quoteOrReason: ext?.locationOrMode?.value
        ? formatQuote(ext.locationOrMode.evidenceQuote || ext.locationOrMode.value, 80)
        : getReasonForMissing("location"),
    },
    {
      key: "duration",
      label: "Duration",
      status: ext?.duration?.value ? "Found" : "Missing",
      quoteOrReason: ext?.duration?.value
        ? formatQuote(ext.duration.evidenceQuote || ext.duration.value, 80)
        : getReasonForMissing("duration"),
    },
    {
      key: "compensation",
      label: "Compensation",
      status: ext?.compensation?.value ? "Found" : "Missing",
      quoteOrReason: ext?.compensation?.value
        ? formatQuote(
            ext.compensation.value.raw || ext.compensation.evidenceQuote,
            80
          )
        : getReasonForMissing("compensation"),
    },
    {
      key: "selectionProcess",
      label: "Selection Process",
      status: ext?.selectionProcess?.value ? "Found" : "Missing",
      quoteOrReason: ext?.selectionProcess?.value
        ? formatQuote(
            ext.selectionProcess.evidenceQuote || ext.selectionProcess.value,
            80
          )
        : getReasonForMissing("selectionProcess"),
    },
    {
      key: "deadline",
      label: "Deadline",
      status: ext?.deadline?.value ? "Found" : "Missing",
      quoteOrReason: ext?.deadline?.value
        ? formatQuote(ext.deadline.evidenceQuote || ext.deadline.value, 80)
        : getReasonForMissing("deadline"),
    },
    {
      key: "contactChannel",
      label: "Contact Channel",
      status: ext?.contactChannel?.value ? "Found" : "Missing",
      quoteOrReason: ext?.contactChannel?.value
        ? formatQuote(
            ext.contactChannel.evidenceQuote || ext.contactChannel.value,
            80
          )
        : getReasonForMissing("contactChannel"),
    },
    {
      key: "officialLink",
      label: "Official Link",
      status: ext?.officialLink?.value ? "Found" : "Missing",
      quoteOrReason: ext?.officialLink?.value
        ? formatQuote(ext.officialLink.evidenceQuote || ext.officialLink.value, 80)
        : getReasonForMissing("officialLink"),
    },
  ];

  // 7. Next Steps: "Your turn" or "Protect yourself" (§5.7)
  const nextSteps: ReportNextStep[] = [];
  if (opts?.includeNextSteps !== false) {
    const rawSteps = nextStepsData.yourTurn || [];
    for (const step of rawSteps) {
      if (isHighRisk) {
        // High risk: print title and one-line explanation without "How to verify:" label duplication
        const instruction = safeText(
          step.whyItMatters || (step.howToVerify !== step.title ? step.howToVerify : "")
        );
        nextSteps.push({
          title: safeText(step.title),
          instruction,
          whyItMatters: undefined,
          isHighRisk: true,
        });
      } else {
        nextSteps.push({
          title: safeText(step.title),
          instruction: safeText(step.howToVerify),
          whyItMatters: safeText(step.whyItMatters),
          isHighRisk: false,
        });
      }
    }
  }

  // 8. Standing Rules (§5.7)
  const standingRules = getSafetyBannerRules({ signals: result.signals });

  // 9. Draft Reply (§5.8): only if generated AND not high-risk
  let draftReply: ReportDraftReply | null = null;
  if (!isHighRisk && opts?.draftReply && opts.draftReply.body?.trim().length > 0) {
    draftReply = {
      subject: safeText(opts.draftReply.subject),
      body: safeText(opts.draftReply.body),
    };
  }

  // 10. Message excerpt (appendix; off by default; PII redacted, max 1500 chars)
  let messageExcerpt: string | null = null;
  if (opts?.includeMessageText) {
    const rawMsg =
      (result as any).input_text ||
      (result as any).rawText ||
      (result as any).text ||
      "";
    if (typeof rawMsg === "string" && rawMsg.trim().length > 0) {
      let redacted = redactPII(rawMsg.trim());
      if (redacted.length > 1500) {
        redacted = redacted.substring(0, 1500).trim() + "…";
      }
      messageExcerpt = redacted;
    }
  }

  // 11. Closing disclaimer & helpline strip (§5.10)
  const disclaimer =
    "Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent.";

  const helplineStrip: ReportHelplineStrip | null = isHighRisk
    ? {
        helpline: "1930",
        portalUrl: "https://cybercrime.gov.in",
        label: "National Cybercrime Helpline: Call 1930 · cybercrime.gov.in",
      }
    : null;

  return {
    reportId,
    generatedAt,
    status: result.status,
    statusLabel: statusConfig.label,
    statusMeaning: statusConfig.meaning,
    statusTone: statusConfig.tone,
    domainLabel,
    claimedOrg,
    aiUsed: Boolean(result.aiUsed),
    reasons,
    alert,
    signals,
    checks,
    notRunInputs,
    notRunSummary,
    offerDetails,
    nextSteps,
    standingRules,
    draftReply,
    messageExcerpt,
    helplineStrip,
    disclaimer,
  };
}
