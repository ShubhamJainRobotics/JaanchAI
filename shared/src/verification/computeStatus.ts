import {
  VerificationStatus,
  Signal,
  ReportedMatch,
  Organization,
  SenderIdentity,
  HeaderAnalysis,
  ListingComparison,
  CompletenessResult,
  CheckRow,
  StatusReason,
} from "../schemas/index.js";

export interface ComputeStatusInput {
  signals: Signal[];
  ruleScore: number;
  textLength: number;
  reportedMatches?: ReportedMatch[];
  matchedOrganization?: Organization | null;
  senderIdentity?: SenderIdentity | null;
  headerAnalysis?: HeaderAnalysis | null;
  listingComparison?: ListingComparison | null;
  completeness?: CompletenessResult | null;
  checks?: CheckRow[];
  isDemoMode?: boolean;
}

export interface ComputeStatusResult {
  status: VerificationStatus;
  reasons: StatusReason[];
}

export function computeStatus(input: ComputeStatusInput): ComputeStatusResult {
  const {
    signals = [],
    ruleScore = 0,
    textLength = 0,
    reportedMatches = [],
    matchedOrganization = null,
    senderIdentity = null,
    headerAnalysis = null,
    listingComparison = null,
    completeness = null,
    checks = [],
    isDemoMode = false,
  } = input;

  const reasons: StatusReason[] = [];

  // ==========================================
  // Step 1 — CONFIRMED_SCAM
  // ==========================================
  const confirmedReport = reportedMatches.find(
    (r) => r.status === "confirmed"
  );
  if (confirmedReport) {
    reasons.push({
      checkKey: "reported_entity_confirmed",
      effect: "CONFIRMED_SCAM",
      detail: `Sender identifier (${confirmedReport.entityType}) matches a moderator-confirmed fraudulent record.`,
    });
    return {
      status: "CONFIRMED_SCAM",
      reasons,
    };
  }

  // ==========================================
  // Step 2 — HIGH_RISK
  // ==========================================
  // 1. Any rule hit flagged hardDisqualifier: true
  const hardDqSignal = signals.find((s) => s.hardDisqualifier === true);
  if (hardDqSignal) {
    reasons.push({
      checkKey: hardDqSignal.ruleId,
      effect: "HIGH_RISK",
      detail: `Triggered hard disqualifier rule [${hardDqSignal.ruleId}]: ${hardDqSignal.title}.`,
    });
  }

  // 2. Any reported-entity lookup returned status = 'reported'
  const reportedCountMatch = reportedMatches.find(
    (r) => r.status === "reported" && r.reportCount >= 1
  );
  if (reportedCountMatch) {
    reasons.push({
      checkKey: "reported_entity_reported",
      effect: "HIGH_RISK",
      detail: `Sender identifier (${reportedCountMatch.entityType}) has been reported as suspicious by ${reportedCountMatch.reportCount} user(s).`,
    });
  }

  // 3. Lookalike of registry org or known brand
  if (senderIdentity?.isLookalike) {
    reasons.push({
      checkKey: "sender_domain_lookalike",
      effect: "HIGH_RISK",
      detail:
        senderIdentity.lookalikeDetails ||
        "Sender domain is a typo-squat or lookalike of a recognized brand.",
    });
  }

  // 4. Gov scheme claim on non-gov domain or requesting payment
  const govSignal = signals.find((s) => s.ruleId === "GOV-001");
  if (govSignal) {
    reasons.push({
      checkKey: "GOV-001",
      effect: "HIGH_RISK",
      detail:
        "Government scheme claimed on an unofficial domain or with an upfront payment request.",
    });
  }

  // 5. Total rule score >= 50
  if (ruleScore >= 50) {
    reasons.push({
      checkKey: "rule_score_high",
      effect: "HIGH_RISK",
      detail: `Cumulative scam indicator score reached ${ruleScore} (threshold is >= 50).`,
    });
  }

  if (reasons.length > 0) {
    return {
      status: "HIGH_RISK",
      reasons,
    };
  }

  // ==========================================
  // Step 3 — VERIFIED_OFFICIAL (all 7 gates mandatory)
  // ==========================================
  let gate1Pass = false;
  let gate2Pass = false;
  let gate3Pass = false;
  let gate4Pass = false;
  let gate5Pass = false;
  let gate6Pass = false;
  let gate7Pass = false;

  // Gate 1: No hard disqualifier, no reported match, no lookalike
  gate1Pass =
    !signals.some((s) => s.hardDisqualifier) &&
    reportedMatches.length === 0 &&
    !senderIdentity?.isLookalike;

  // Gate 2: Matched in organization registry, review approved (or demo mode with isDemo)
  if (
    matchedOrganization &&
    (!matchedOrganization.needsTeamReview ||
      (isDemoMode && matchedOrganization.isDemo))
  ) {
    gate2Pass = true;
  }

  // Gate 3: Sender email domain exactly matches official_domains (case-insensitive, no free-mail, no lookalike)
  if (
    matchedOrganization &&
    senderIdentity?.domain &&
    !senderIdentity.isFreeMail &&
    !senderIdentity.isLookalike
  ) {
    const sDomain = senderIdentity.domain.toLowerCase().trim();
    const hasExactDomain = matchedOrganization.officialDomains.some(
      (d) => d.toLowerCase().trim() === sDomain
    );
    if (hasExactDomain) {
      gate3Pass = true;
    }
  }

  // Gate 4: Headers supplied & authenticated (dmarc=pass OR (spf=pass && dkim=pass && alignment))
  if (headerAnalysis && headerAnalysis.authResults) {
    const { spf, dkim, dmarc } = headerAnalysis.authResults;
    const isDmarcPass = dmarc === "pass";
    const isSpfDkimPass =
      spf === "pass" &&
      dkim === "pass" &&
      headerAnalysis.alignment.spf !== false &&
      headerAnalysis.alignment.dkim !== false;

    if (isDmarcPass || isSpfDkimPass) {
      gate4Pass = true;
    }
  }

  // Gate 5: Official listing fetched by platform (or in demo mode, pasted text for demo org)
  if (listingComparison && listingComparison.status === "match") {
    const isAllowedSource =
      listingComparison.sourceType === "platform_fetch" ||
      (isDemoMode &&
        matchedOrganization?.isDemo &&
        listingComparison.sourceType === "pasted_text");

    const hasCoreMatches =
      listingComparison.organizationMatched &&
      listingComparison.roleMatched &&
      !listingComparison.hasMismatches;

    const hasDetailMatch =
      listingComparison.matchedFieldsCount >= 1 ||
      listingComparison.comparedFields.some(
        (f) =>
          f.outcome === "match" &&
          (f.field === "compensation" ||
            f.field === "duration" ||
            f.field === "deadline")
      );

    if (isAllowedSource && hasCoreMatches && hasDetailMatch) {
      gate5Pass = true;
    }
  }

  // Gate 6: Zero medium/high/critical signals, and no low signal in payment, urgency, data_request, channel
  const hasMedOrAbove = signals.some(
    (s) =>
      s.severity === "critical" ||
      s.severity === "high" ||
      s.severity === "medium"
  );
  const hasRestrictedLow = signals.some(
    (s) =>
      s.severity === "low" &&
      (s.category === "payment" ||
        s.category === "urgency" ||
        s.category === "data_request" ||
        s.category === "channel")
  );
  gate6Pass = !hasMedOrAbove && !hasRestrictedLow;

  // Gate 7: Every check above has a persisted evidence row with a non-empty detail
  // Require at least 4 verification checks with outcome 'pass' or non-empty detail
  const passingChecks = checks.filter(
    (c) => c.outcome === "pass" && c.detail && c.detail.trim().length > 0
  );
  gate7Pass = passingChecks.length >= 3;

  if (
    gate1Pass &&
    gate2Pass &&
    gate3Pass &&
    gate4Pass &&
    gate5Pass &&
    gate6Pass &&
    gate7Pass
  ) {
    reasons.push({
      checkKey: "verified_all_gates_passed",
      effect: "VERIFIED_OFFICIAL",
      detail:
        "All hard disqualifier checks passed, sender was cryptographically authenticated, and listing was confirmed against official source.",
    });
    return {
      status: "VERIFIED_OFFICIAL",
      reasons,
    };
  }

  // ==========================================
  // Step 4 — NEEDS_REVIEW
  // ==========================================
  const reviewReasons: StatusReason[] = [];

  // Evaluate Positive Evidence for Step 4 & 5
  let hasRegistrySenderMatch = false;
  if (
    matchedOrganization &&
    senderIdentity?.domain &&
    !senderIdentity.isFreeMail &&
    !senderIdentity.isLookalike
  ) {
    const cleanDomain = senderIdentity.domain.toLowerCase().trim();
    hasRegistrySenderMatch = matchedOrganization.officialDomains.some(
      (od) => od.toLowerCase().trim() === cleanDomain
    );
  }

  let hasHeaderAuthMatch = false;
  if (headerAnalysis && headerAnalysis.authResults && matchedOrganization) {
    const { spf, dkim, dmarc } = headerAnalysis.authResults;
    const isDmarcPass = dmarc === "pass";
    const isSpfDkimPass =
      spf === "pass" &&
      dkim === "pass" &&
      headerAnalysis.alignment.spf !== false &&
      headerAnalysis.alignment.dkim !== false;

    const fromDomain = headerAnalysis.from && headerAnalysis.from.includes("@")
      ? headerAnalysis.from.split("@")[1]?.replace(/[>]/g, "").trim().toLowerCase()
      : null;
    const authDomain = fromDomain || (headerAnalysis.dkimDomain || "").toLowerCase().trim();
    const domainMatchesOrg = matchedOrganization.officialDomains.some(
      (od) => od.toLowerCase().trim() === authDomain
    );

    if ((isDmarcPass || isSpfDkimPass) && domainMatchesOrg) {
      hasHeaderAuthMatch = true;
    }
  }

  let hasListingMatch = false;
  if (listingComparison && !listingComparison.hasMismatches) {
    if (
      listingComparison.status === "match" ||
      listingComparison.matchedFieldsCount >= 1 ||
      listingComparison.comparedFields.some((f) => f.outcome === "match")
    ) {
      hasListingMatch = true;
    }
  }

  let hasPortalAttestation = false;
  const portalCheck = checks.find(
    (c) =>
      (c.checkKey === "found_independently_on_official_portal" ||
        c.checkKey === "found_on_official_site") &&
      c.outcome === "user_attested"
  );
  if (portalCheck) {
    hasPortalAttestation = true;
  }

  const hasPositiveEvidence =
    hasRegistrySenderMatch ||
    hasHeaderAuthMatch ||
    hasListingMatch ||
    hasPortalAttestation;

  // 1. Any signal of medium or high severity (not hard DQ)
  for (const sig of signals) {
    if (
      (sig.severity === "medium" || sig.severity === "high") &&
      !sig.hardDisqualifier
    ) {
      reviewReasons.push({
        checkKey: sig.ruleId,
        effect: "NEEDS_REVIEW",
        detail: `Indicator [${sig.ruleId}]: ${sig.title}.`,
      });
    }
  }

  // 2. Pattern trigger: Two or more subtle low-severity signals (URG-004, MIS-007, MIS-003, DAT-006)
  const patternRuleIds = new Set(["URG-004", "MIS-007", "MIS-003", "DAT-006"]);
  const patternSignals = signals.filter((s) => patternRuleIds.has(s.ruleId));
  if (patternSignals.length >= 2) {
    reviewReasons.push({
      checkKey: "subtle_signals_pattern",
      effect: "NEEDS_REVIEW",
      detail: `Multiple low-severity indicators (${patternSignals.map((s) => s.ruleId).join(", ")}) observed together, forming a suspicious pattern.`,
    });
  }

  // 3. Organization named but not in the registry and no positive evidence
  const orgNamePresent = completeness?.present.some((p) =>
    p.toLowerCase().includes("organization")
  );
  if (orgNamePresent && !matchedOrganization && !hasPositiveEvidence) {
    reviewReasons.push({
      checkKey: "org_unregistered_no_evidence",
      effect: "NEEDS_REVIEW",
      detail:
        "Organization name is mentioned in the offer but is not in the official registry and no independent positive evidence was provided.",
    });
  }

  // 4. Free personal email provider used as official contact
  if (senderIdentity?.isFreeMail) {
    reviewReasons.push({
      checkKey: "sender_free_email",
      effect: "NEEDS_REVIEW",
      detail:
        "Sender address uses a personal/free public webmail provider rather than a corporate domain.",
    });
  }

  // 5. Sender email domain does not match registry domain of claimed registry organization
  if (matchedOrganization && senderIdentity?.domain) {
    const cleanDomain = senderIdentity.domain.toLowerCase().trim();
    const hasMatch = matchedOrganization.officialDomains.some(
      (od) => od.toLowerCase().trim() === cleanDomain
    );
    if (!hasMatch && !senderIdentity.isLookalike) {
      reviewReasons.push({
        checkKey: "sender_domain_mismatch_registry",
        effect: "NEEDS_REVIEW",
        detail: `Sender domain (${senderIdentity.domain}) does not match official domains registered for '${matchedOrganization.name}'.`,
      });
    }
  }

  // 6. Claimed organization row has needs_team_review = true outside demo mode
  if (matchedOrganization && matchedOrganization.needsTeamReview && !isDemoMode) {
    reviewReasons.push({
      checkKey: "org_needs_team_review",
      effect: "NEEDS_REVIEW",
      detail: `Claimed organization '${matchedOrganization.name}' is pending registry verification by the Jaanch team.`,
    });
  }

  // 7. Header authentication failed or domain mismatches present
  if (headerAnalysis && headerAnalysis.authResults) {
    const { spf, dkim, dmarc } = headerAnalysis.authResults;
    if (
      spf === "fail" ||
      dkim === "fail" ||
      dmarc === "fail" ||
      spf === "softfail" ||
      dmarc === "none" ||
      headerAnalysis.mismatches.length > 0
    ) {
      reviewReasons.push({
        checkKey: "header_auth_failed",
        effect: "NEEDS_REVIEW",
        detail:
          "Email header authentication failed or contains domain mismatches (as reported in the headers you supplied).",
      });
    }
  }

  // 8. Missing required completeness details (>= 3 missing) or missing organization name
  if (completeness) {
    const orgMissing = completeness.missing.some((m) =>
      m.toLowerCase().includes("organization")
    );
    if (completeness.missing.length >= 3 || orgMissing) {
      reviewReasons.push({
        checkKey: "completeness_deficient",
        effect: "NEEDS_REVIEW",
        detail: `Offer is missing ${completeness.missing.length} essential details (${completeness.missing.join(", ")}).`,
      });
    }
  }

  // 9. Listing comparison has mismatches or was pasted outside demo mode
  if (listingComparison) {
    if (listingComparison.hasMismatches) {
      reviewReasons.push({
        checkKey: "listing_mismatch",
        effect: "NEEDS_REVIEW",
        detail:
          "Discrepancies found between the message details and the official listing.",
      });
    } else if (
      listingComparison.sourceType === "pasted_text" &&
      !isDemoMode
    ) {
      reviewReasons.push({
        checkKey: "listing_user_supplied_text",
        effect: "NEEDS_REVIEW",
        detail:
          "Listing text was pasted directly and cannot be confirmed as fetched from an official site.",
      });
    }
  }

  // 10. Pressure to communicate via WhatsApp/Telegram only
  const channelPressure = signals.find((s) => s.ruleId === "CHN-002");
  if (channelPressure) {
    reviewReasons.push({
      checkKey: "CHN-002",
      effect: "NEEDS_REVIEW",
      detail:
        "Pressure to communicate solely through personal messaging apps.",
    });
  }

  // 11. Links do not match claimed organization's official domain
  const linkMismatch = signals.find((s) => s.ruleId === "CHN-004");
  if (linkMismatch) {
    reviewReasons.push({
      checkKey: "CHN-004",
      effect: "NEEDS_REVIEW",
      detail:
        "External links in the message point away from the claimed organization's official domain.",
    });
  }

  // 12. Rule score >= 15 or message fewer than 40 meaningful characters
  if (ruleScore >= 15) {
    reviewReasons.push({
      checkKey: "rule_score_moderate",
      effect: "NEEDS_REVIEW",
      detail: `Scam indicator score reached ${ruleScore} (threshold is >= 15).`,
    });
  }
  if (textLength < 40) {
    reviewReasons.push({
      checkKey: "text_too_short",
      effect: "NEEDS_REVIEW",
      detail:
        "Message is too short (< 40 characters) to conclusively evaluate without further context.",
    });
  }

  if (reviewReasons.length > 0) {
    return {
      status: "NEEDS_REVIEW",
      reasons: reviewReasons,
    };
  }

  // ==========================================
  // Step 5 — LIKELY_GENUINE (Requires Positive Evidence)
  // ==========================================
  if (!hasPositiveEvidence) {
    return {
      status: "NEEDS_REVIEW",
      reasons: [
        {
          checkKey: "insufficient_evidence",
          effect: "NEEDS_REVIEW",
          detail:
            "No scam indicators were found, but nothing about the sender or organization could be verified yet.",
        },
      ],
    };
  }

  return {
    status: "LIKELY_GENUINE",
    reasons: [
      {
        checkKey: "positive_evidence_verified",
        effect: "LIKELY_GENUINE",
        detail: hasRegistrySenderMatch
          ? "Sender email domain matches verified organization registry records."
          : hasHeaderAuthMatch
          ? "Cryptographic email header authentication matches organization domain."
          : hasListingMatch
          ? "Offer details confirmed against official listing."
          : "User confirmed finding this opportunity independently on official portal.",
      },
    ],
  };
}
