import {
  AnalyzeRequest,
  AnalysisResult,
  Signal,
  UnknownItem,
  ChecklistItem,
  CheckRow,
  ReportedMatch,
  Organization,
  STATUS_COPY,
  HELPLINE,
  ADVISORY,
  normalizeText,
  runRules,
  scoreHits,
  getBaselineUnknowns,
  extractLinks,
  redactPII,
  buildVerificationChecklist,
  extractOfferFields,
  checkCompleteness,
  analyzeSenderEmail,
  parseEmailHeaders,
  parseEmailAddress,
  computeStatus,
  extractEntities,
  detectPatternInsight,
  buildNextSteps,
  routeFields,
  extractOrganizationDecision,
  findSpan,
} from "shared";
import dns from "node:dns/promises";
import { User, SupabaseClient } from "@supabase/supabase-js";
import { GeminiService } from "../ai/geminiService.js";
import { ListingService, normalizeOrgName } from "./listingService.js";
import { ReportedService } from "./reportedService.js";
import { lookupDomainIntel } from "../lib/domainIntel.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { sha256 } from "../lib/hash.js";
import { logger } from "../lib/logger.js";
import { env } from "../config/env.js";

async function lookupDnsPolicySafe(
  domain: string
): Promise<{ spfRecordFound: boolean; dmarcPolicy: string | null }> {
  let spfRecordFound = false;
  let dmarcPolicy: string | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), env.DNS_TIMEOUT_MS)
    );
    const txtRecords = await Promise.race([
      dns.resolveTxt(domain),
      timeoutPromise,
    ]);
    for (const record of txtRecords) {
      const joined = record.join("");
      if (joined.startsWith("v=spf1")) {
        spfRecordFound = true;
        break;
      }
    }
  } catch {
    // Treat as unknown
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), env.DNS_TIMEOUT_MS)
    );
    const dmarcRecords = await Promise.race([
      dns.resolveTxt(`_dmarc.${domain}`),
      timeoutPromise,
    ]);
    for (const record of dmarcRecords) {
      const joined = record.join("");
      if (joined.startsWith("v=DMARC1")) {
        const pMatch = joined.match(/\bp=([a-z]+)/i);
        if (pMatch) dmarcPolicy = pMatch[1].toLowerCase();
        break;
      }
    }
  } catch {
    // Treat as unknown
  }

  return { spfRecordFound, dmarcPolicy };
}

export class AnalyzeService {
  public static async analyze(
    request: AnalyzeRequest,
    user?: User,
    supabase?: SupabaseClient
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    // 0. Input Routing & Normalization (Fix A)
    const routed = routeFields(request);
    request = routed.request;
    const inputNotices = routed.notices;
    if (inputNotices.length > 0) {
      logger.info({ notices: inputNotices }, "Input fields routed");
    }

    // 1. Text Normalization
    const rawText = request.text;
    const normalizedText = normalizeText(rawText);
    const inputHash = sha256(normalizedText);

    // 2. Extract Entities & Organization Decision from Body (Fix C)
    const extractedEntities = extractEntities(rawText);
    const orgDecision = extractOrganizationDecision(rawText);

    // Resolve claimed organization candidate
    let effectiveClaimedOrg = request.claimedOrg?.trim() || "";
    let orgSource: "user_provided" | "extracted_from_text" = "user_provided";
    const topOrgCandidate = orgDecision.organization
      ? {
          name: orgDecision.organization,
          confidence: orgDecision.confidence,
          evidenceQuote: orgDecision.allCandidates[0]?.evidenceQuote || orgDecision.organization,
          count: orgDecision.allCandidates[0]?.count || 1,
        }
      : extractedEntities.organizationCandidates[0];

    if (!effectiveClaimedOrg && orgDecision.organization) {
      effectiveClaimedOrg = orgDecision.organization;
      orgSource = "extracted_from_text";
    }

    // 3. Deterministic Field Extraction & Completeness
    let extractedFields = extractOfferFields(rawText, effectiveClaimedOrg);
    if (!extractedFields.organization && effectiveClaimedOrg) {
      extractedFields.organization = {
        value: effectiveClaimedOrg,
        evidenceQuote: topOrgCandidate ? topOrgCandidate.evidenceQuote : effectiveClaimedOrg,
        source: "rule",
      };
    }
    let { completeness, checks: completenessChecks } =
      checkCompleteness(extractedFields);

    // 4. Sender Identity Parsing & Candidate Email
    let effectiveSenderEmail = request.sender?.email?.trim();
    let senderEmailSource: "user_provided" | "extracted_from_text" = "user_provided";

    if (!effectiveSenderEmail && extractedEntities.emails.length === 1) {
      effectiveSenderEmail = extractedEntities.emails[0].value;
      senderEmailSource = "extracted_from_text";
    }

    const senderIdentity = analyzeSenderEmail(effectiveSenderEmail, {
      claimedOrg: effectiveClaimedOrg,
      phone: request.sender?.phone || extractedEntities.phones[0]?.value,
      upiId: request.sender?.upiId || extractedEntities.upiIds[0]?.value,
      socialHandle: request.sender?.socialHandle || extractedEntities.socialHandles[0]?.value,
      websiteUrl: request.sender?.websiteUrl || extractedEntities.urls[0]?.value,
      recruiterName: request.sender?.recruiterName,
    });

    if (senderEmailSource === "extracted_from_text") {
      (senderIdentity as any).candidateSource = "extracted_from_text";
    }

    // 5. Header Parsing & DNS Policy (if supplied)
    let headerAnalysis = request.emailHeaders
      ? parseEmailHeaders(request.emailHeaders)
      : null;

    if (headerAnalysis && headerAnalysis.from) {
      const parsedFrom = parseEmailAddress(headerAnalysis.from);
      if (parsedFrom.domain) {
        const dnsPolicy = await lookupDnsPolicySafe(parsedFrom.domain);
        headerAnalysis.dnsPolicy = dnsPolicy;
      }
    }

    // 6. Organization Registry Match
    let matchedOrg: Organization | null = null;
    if (request.organizationId) {
      try {
        const { data: orgRow } = await supabaseAdmin
          .from("organizations")
          .select("*")
          .eq("id", request.organizationId)
          .single();
        if (orgRow) {
          matchedOrg = {
            id: orgRow.id,
            name: orgRow.name,
            aliases: orgRow.aliases || [],
            kind: orgRow.kind,
            officialDomains: orgRow.official_domains,
            careersUrl: orgRow.careers_url,
            scholarshipsUrl: orgRow.scholarships_url,
            isGovernment: orgRow.is_government,
            isDemo: orgRow.is_demo,
            needsTeamReview: orgRow.needs_team_review,
          };
        }
      } catch {
        // Fallback to name search
      }
    }

    if (!matchedOrg) {
      const orgNameToSearch =
        effectiveClaimedOrg || extractedFields.organization?.value || "";
      if (orgNameToSearch) {
        matchedOrg = await ListingService.matchOrganization(
          supabaseAdmin,
          orgNameToSearch
        );
      }
    }

    // Update senderIdentity matchesRegistryOrg if matchedOrg found
    if (matchedOrg && senderIdentity.domain) {
      senderIdentity.matchesRegistryOrg = matchedOrg.officialDomains.some(
        (od) => od.toLowerCase().trim() === senderIdentity.domain?.toLowerCase().trim()
      );
    }

    // 7. Deterministic Rule Engine
    const ruleHits = runRules({
      rawText,
      normalizedText,
      domain: request.domain,
      channel: request.channel,
      claimedOrg: effectiveClaimedOrg,
      senderEmail: effectiveSenderEmail,
      senderDomain: senderIdentity.domain || undefined,
    });

    // 8. Link Extraction & Heuristics
    const links = extractLinks(rawText, 10);
    const hasLinks = links.length > 0;

    // 9. Scoring
    const { score: ruleScore, dedupedHits } = scoreHits(
      ruleHits,
      rawText.length
    );

    // Convert RuleHit to Signal
    const signals: Signal[] = dedupedHits.map((h) => ({
      ruleId: h.ruleId,
      category: h.category,
      severity: h.severity,
      source: "rule",
      title: h.title,
      whyItMatters: h.whyItMatters,
      evidenceQuote: h.evidenceQuote,
      hardDisqualifier: h.hardDisqualifier || false,
    }));

    // Check organization conflict (SND-001): if user specified one and it conflicts with text
    if (
      request.claimedOrg &&
      topOrgCandidate &&
      normalizeOrgName(request.claimedOrg) !== normalizeOrgName(topOrgCandidate.name)
    ) {
      signals.push({
        ruleId: "SND-001",
        category: "sender_identity",
        severity: "medium",
        source: "rule",
        title: "Claimed organization conflicts with name found in message text",
        whyItMatters: `You specified '${request.claimedOrg}', but the message body indicates '${topOrgCandidate.name}'. Discrepancies between claimed sender and text indicate spoofing or forwarding.`,
        evidenceQuote: topOrgCandidate.evidenceQuote,
        hardDisqualifier: false,
      });
    }

    // Check sender email conflict (SND-001): if user specified sender email and it differs from email found in text
    if (
      request.sender?.email &&
      extractedEntities.emails.length > 0 &&
      extractedEntities.emails[0].value.toLowerCase().trim() !==
        request.sender.email.toLowerCase().trim()
    ) {
      signals.push({
        ruleId: "SND-001",
        category: "sender_identity",
        severity: "medium",
        source: "rule",
        title: "Sender email field conflicts with address found in message text",
        whyItMatters: `You specified '${request.sender.email}', but the message body contained '${extractedEntities.emails[0].value}'. Discrepancies between claimed sender and text indicate forwarding or spoofing.`,
        evidenceQuote: `${request.sender.email} vs ${extractedEntities.emails[0].value}`,
        hardDisqualifier: false,
      });
    }

    // SND-006 exemption: if DEMO_MODE and matchedOrg.isDemo, remove SND-006
    if (env.DEMO_MODE && matchedOrg?.isDemo) {
      const idx = signals.findIndex((s) => s.ruleId === "SND-006");
      if (idx >= 0) signals.splice(idx, 1);
    }

    // Baseline unknowns
    const unknownsMap = new Map<string, string>();
    for (const u of getBaselineUnknowns()) {
      unknownsMap.set(u.item, u.howToVerify);
    }
    for (const h of dedupedHits) {
      if (h.unknowns) {
        for (const u of h.unknowns) {
          unknownsMap.set(u.item, u.howToVerify);
        }
      }
    }

    // 10. Parallel Outbound Telemetry: Domain Intel, Reported DB Lookup, Listing Acquisition
    const candidateEntities: Array<{ type: any; value: string }> = [];
    if (request.sender?.email) {
      candidateEntities.push({ type: "email", value: request.sender.email });
      if (senderIdentity.domain) {
        candidateEntities.push({ type: "email_domain", value: senderIdentity.domain });
      }
    }
    if (request.sender?.phone) {
      candidateEntities.push({ type: "phone", value: request.sender.phone });
    }
    if (request.sender?.upiId) {
      candidateEntities.push({ type: "upi", value: request.sender.upiId });
    }
    if (request.sender?.websiteUrl) {
      candidateEntities.push({ type: "url", value: request.sender.websiteUrl });
      candidateEntities.push({ type: "domain", value: request.sender.websiteUrl });
    }
    if (request.sender?.socialHandle) {
      candidateEntities.push({ type: "social_handle", value: request.sender.socialHandle });
    }
    for (const l of links) {
      candidateEntities.push({ type: "url", value: l.url });
      candidateEntities.push({ type: "domain", value: l.hostname });
    }
    // Include all extracted entities
    for (const em of extractedEntities.emails) {
      candidateEntities.push({ type: "email", value: em.value });
      const domain = em.value.split("@")[1];
      if (domain) candidateEntities.push({ type: "email_domain", value: domain });
    }
    for (const ph of extractedEntities.phones) {
      candidateEntities.push({ type: "phone", value: ph.value });
    }
    for (const upi of extractedEntities.upiIds) {
      candidateEntities.push({ type: "upi", value: upi.value });
    }
    for (const u of extractedEntities.urls) {
      candidateEntities.push({ type: "url", value: u.value });
      try {
        const host = new URL(u.value.startsWith("http") ? u.value : `http://${u.value}`).hostname;
        if (host) candidateEntities.push({ type: "domain", value: host });
      } catch {}
    }

    const domainToLookup = senderIdentity.domain || (links[0]?.hostname ?? null);
    const runThirdParty = Boolean(env.ENABLE_THIRD_PARTY_CHECKS && request.runThirdPartyChecks);

    const [domainIntelSettled, reportedMatchesSettled, listingResultSettled] =
      await Promise.allSettled([
        domainToLookup
          ? lookupDomainIntel(domainToLookup, {
              runThirdPartyChecks: runThirdParty,
              url: links[0]?.url,
            })
          : Promise.resolve(null),
        ReportedService.lookupEntities(supabaseAdmin, candidateEntities),
        ListingService.processOfficialListing(
          extractedFields,
          matchedOrg,
          request.officialListing,
          env.DEMO_MODE
        ),
      ]);

    const domainIntel =
      domainIntelSettled.status === "fulfilled"
        ? domainIntelSettled.value
        : null;

    const reportedMatches: ReportedMatch[] =
      reportedMatchesSettled.status === "fulfilled"
        ? reportedMatchesSettled.value
        : [];

    const listingResult =
      listingResultSettled.status === "fulfilled"
        ? listingResultSettled.value
        : {
            comparison: {
              status: "not_checked" as const,
              sourceType: null,
              listingUrl: null,
              organizationMatched: false,
              roleMatched: false,
              hasMismatches: false,
              matchedFieldsCount: 0,
              comparedFields: [],
              notes: "Listing check failed or was skipped.",
            },
            check: {
              checkKey: "official_listing",
              label: "Official Listing Verification",
              outcome: "unknown" as const,
              detail: "Listing check failed or could not be completed.",
              source: "listing_compare" as const,
            },
          };

    // If reported matches returned hits, emit REP-001 signal
    for (const rep of reportedMatches) {
      if (rep.status === "confirmed") {
        signals.push({
          ruleId: "REP-001",
          category: "reported_record",
          severity: "critical",
          source: "reported_db",
          title: "Sender matches a confirmed fraudulent scam record",
          whyItMatters:
            "This sender, account, or domain has been reviewed and confirmed as fraudulent by Jaanch moderators.",
          evidenceQuote: rep.valueHash.slice(0, 16),
          hardDisqualifier: true,
        });
      } else if (rep.status === "reported") {
        signals.push({
          ruleId: "REP-001",
          category: "reported_record",
          severity: "high",
          source: "reported_db",
          title: `Sender identifier reported as suspicious by ${rep.reportCount} user(s)`,
          whyItMatters:
            "Community members have flagged this contact channel as suspicious. Exercise extreme caution.",
          evidenceQuote: rep.valueHash.slice(0, 16),
          hardDisqualifier: false,
        });
      }
    }

    // 10. Optional Gemini AI Layer
    let aiUsed = false;
    let aiStatus: "not_requested" | "ok" | "failed" | "invalid_output" | "timeout" =
      "not_requested";
    let textOnlyConfidence: "low" | "medium" | "high" | null = null;
    let extraSteps: string[] = [];

    if (request.useAi && GeminiService.isAvailable()) {
      aiUsed = true;
      const redactedText = redactPII(rawText);

      // 10a. Field extraction fill-in for missing deterministic fields
      if (completeness.missing.length > 0) {
        try {
          const aiFilledFields = await GeminiService.fillMissingFields(
            redactedText,
            completeness.missing
          );
          extractedFields = {
            ...extractedFields,
            ...aiFilledFields,
          };
          const rechecked = checkCompleteness(extractedFields);
          completeness = rechecked.completeness;
          completenessChecks = rechecked.checks;
        } catch {
          // Keep deterministic fields on error
        }
      }

      // 10b. Additional signals & unknowns
      const aiRes = await GeminiService.analyzeOpportunity({
        domain: request.domain,
        channel: request.channel,
        claimedOrg: request.claimedOrg,
        ruleHits: dedupedHits,
        redactedText,
      });

      aiStatus = aiRes.status;
      if (aiRes.status === "ok") {
        textOnlyConfidence = aiRes.confidence || "medium";
        extraSteps = aiRes.extraSteps || [];

        // Grounded AI signals (capped at 5)
        signals.push(...aiRes.signals);

        // Dev-only rule-gap diagnostics
        if (process.env.DEV_RULE_GAP_REPORT === "true") {
          const gapCategories = new Set([
            "payment",
            "data_request",
            "too_good_to_be_true",
            "urgency",
          ]);
          for (const sig of aiRes.signals) {
            if (gapCategories.has(sig.category)) {
              const hasRuleMatch = dedupedHits.some(
                (h) => h.category === sig.category
              );
              if (!hasRuleMatch) {
                logger.info(
                  {
                    category: sig.category,
                    severity: sig.severity,
                    ruleIdsFired: dedupedHits.map((h) => h.ruleId),
                  },
                  "DEV_RULE_GAP_REPORT: AI signal without overlapping rule"
                );
              }
            }
          }
        }

        // Grounded AI unknowns
        for (const u of aiRes.unknowns) {
          if (!unknownsMap.has(u.item)) {
            unknownsMap.set(u.item, u.howToVerify);
          }
        }
      }
    }

    // 11. Traceable Evidence Rows (Analysis Checks)
    const checks: CheckRow[] = [];

    // Check: Organization Claim & Match
    checks.push({
      checkKey: "organization_registry_match",
      label: "Organization Registry Verification",
      outcome: matchedOrg ? "pass" : "unknown",
      detail: matchedOrg
        ? `Matched registered organization '${matchedOrg.name}' (${matchedOrg.officialDomains.join(", ")})`
        : effectiveClaimedOrg
        ? `Claimed organization '${effectiveClaimedOrg}' was not found in the verified registry.`
        : "No specific organization was claimed.",
      source: "registry",
    });

    // Check: Sender Domain Match
    const isReserved = Boolean(
      senderIdentity.domain &&
        (/\b(?:invalid|test|example|localhost)\b/i.test(senderIdentity.domain) ||
          /\bexample\.(?:com|net|org)\b/i.test(senderIdentity.domain))
    );
    const senderDomainOutcome = senderIdentity.domain
      ? senderIdentity.isLookalike
        ? "fail"
        : senderIdentity.matchesRegistryOrg
        ? "pass"
        : isReserved
        ? "unknown"
        : senderIdentity.isFreeMail
        ? "unknown"
        : "unknown"
      : "not_run";

    checks.push({
      checkKey: "sender_domain_match",
      label: "Sender Domain Legitimacy",
      outcome: senderDomainOutcome,
      detail: senderIdentity.domain
        ? senderIdentity.isLookalike
          ? `Lookalike domain detected: ${senderIdentity.lookalikeDetails}`
          : senderIdentity.matchesRegistryOrg
          ? `Sender domain matches official registry domain (${senderIdentity.domain}).`
          : isReserved
          ? `Reserved or placeholder domain (${senderIdentity.domain}); not a verified sender.`
          : senderIdentity.isFreeMail
          ? `Personal webmail provider (${senderIdentity.domain}) used instead of official corporate domain.`
          : `Sender domain (${senderIdentity.domain}) does not match registry.`
        : "Sender email address was not provided.",
      source: "rule",
    });

    // Check: Email Header Authentication
    if (headerAnalysis) {
      const headerOutcome =
        headerAnalysis.authResults.dmarc === "pass" ||
        (headerAnalysis.authResults.spf === "pass" && headerAnalysis.authResults.dkim === "pass")
          ? "pass"
          : headerAnalysis.authResults.dmarc === "fail" || headerAnalysis.authResults.spf === "fail"
          ? "fail"
          : "unknown";

      checks.push({
        checkKey: "header_authentication",
        label: "Header Authentication (SPF / DKIM / DMARC)",
        outcome: headerOutcome,
        detail: `SPF: ${headerAnalysis.authResults.spf}, DKIM: ${headerAnalysis.authResults.dkim}, DMARC: ${headerAnalysis.authResults.dmarc} (as reported in the headers you supplied).`,
        source: "header_parse",
      });
    } else {
      checks.push({
        checkKey: "header_authentication",
        label: "Header Authentication (SPF / DKIM / DMARC)",
        outcome: "not_run",
        detail: "Headers not supplied",
        source: "header_parse",
      });
    }

    // Check: Domain Age / Certificates
    if (domainIntel && domainIntel.checks.length > 0) {
      const filteredDomainChecks = domainIntel.checks.filter((c) => {
        if (!env.ENABLE_THIRD_PARTY_CHECKS) {
          return c.checkKey !== "ct_first_seen" && c.checkKey !== "safe_browsing";
        }
        return true;
      });
      checks.push(...filteredDomainChecks);
    } else {
      checks.push({
        checkKey: "domain_age",
        label: "Domain Age (RDAP)",
        outcome: "unknown",
        detail: "Domain intelligence lookup not run or unavailable.",
        source: "rdap",
      });
    }

    // Check: Official Listing
    checks.push(listingResult.check);

    // Check: Payment Request
    const paySignal = signals.find((s) => s.category === "payment");
    checks.push({
      checkKey: "payment_request",
      label: "Payment Request Check",
      outcome: paySignal ? "fail" : "none_found",
      detail: paySignal
        ? `Payment detected: ${paySignal.title} ("${paySignal.evidenceQuote}")`
        : "No match found in the message text. This does not confirm the offer is genuine.",
      source: "rule",
    });

    // Check: Sensitive Data Request
    const dataSignal = signals.find((s) => s.category === "data_request");
    checks.push({
      checkKey: "sensitive_data_request",
      label: "Sensitive Data Request Check",
      outcome: dataSignal ? "fail" : "none_found",
      detail: dataSignal
        ? `Sensitive request detected: ${dataSignal.title} ("${dataSignal.evidenceQuote}")`
        : "No match found in the message text. This does not confirm the offer is genuine.",
      source: "rule",
    });

    // Check: Urgency Language
    const urgSignal = signals.find((s) => s.category === "urgency");
    checks.push({
      checkKey: "urgency_language",
      label: "Urgency & Pressure Language",
      outcome: urgSignal ? "fail" : "none_found",
      detail: urgSignal
        ? `Artificial urgency detected: "${urgSignal.evidenceQuote}"`
        : "No match found in the message text. This does not confirm the offer is genuine.",
      source: "rule",
    });

    // Check: Guarantee / Unrealistic Claims
    const tgbSignal = signals.find((s) => s.category === "too_good_to_be_true");
    checks.push({
      checkKey: "guarantee_unrealistic",
      label: "Guaranteed Selection & Unrealistic Claims",
      outcome: tgbSignal ? "fail" : "none_found",
      detail: tgbSignal
        ? `Unrealistic claim detected: "${tgbSignal.evidenceQuote}"`
        : "No match found in the message text. This does not confirm the offer is genuine.",
      source: "rule",
    });

    // Check: Reported Records (Fix F)
    const hasConfirmedReport = reportedMatches.some((r) => r.status === "confirmed");
    const hasReportedRecord = reportedMatches.some((r) => r.status === "reported");

    const checkedTypeLabels: string[] = [];
    if (candidateEntities.some((c) => c.type === "email" || c.type === "email_domain")) {
      checkedTypeLabels.push("email");
    }
    if (candidateEntities.some((c) => c.type === "upi")) {
      checkedTypeLabels.push("UPI ID");
    }
    if (candidateEntities.some((c) => c.type === "phone")) {
      checkedTypeLabels.push("phone");
    }
    if (candidateEntities.some((c) => c.type === "domain")) {
      checkedTypeLabels.push("domain");
    }
    if (candidateEntities.some((c) => c.type === "url")) {
      checkedTypeLabels.push("link");
    }

    const uniqueIdentifierCount = checkedTypeLabels.length;

    if (uniqueIdentifierCount === 0) {
      checks.push({
        checkKey: "reported_records",
        label: "Reported Fraud Database Check",
        outcome: "not_run",
        detail: "No sender email, phone, UPI ID, domain or link was available to look up.",
        source: "reported_db",
      });
    } else {
      const idPlural = uniqueIdentifierCount === 1 ? "identifier" : "identifiers";
      const prefix = `Checked ${uniqueIdentifierCount} ${idPlural}: ${checkedTypeLabels.join(", ")}`;
      checks.push({
        checkKey: "reported_records",
        label: "Reported Fraud Database Check",
        outcome: hasConfirmedReport || hasReportedRecord ? "fail" : "none_found",
        detail: hasConfirmedReport
          ? `${prefix}. Confirmed fraudulent record matched.`
          : hasReportedRecord
          ? `${prefix}. Reported by ${reportedMatches[0].reportCount} user(s) (not yet confirmed).`
          : `${prefix}. No previous reports were found.`,
        source: "reported_db",
      });
    }

    // Check: Payment Destination
    const upiEntity =
      extractedEntities.upiIds[0] ||
      (request.sender?.upiId ? { value: request.sender.upiId, evidenceQuote: request.sender.upiId } : null);
    if (upiEntity) {
      const upiReported = reportedMatches.find((r) => r.entityType === "upi");
      checks.push({
        checkKey: "payment_destination",
        label: "Payment Destination Check",
        outcome: upiReported ? "fail" : "none_found",
        detail: `UPI ID '${upiEntity.value}' was checked against reported accounts (${
          upiReported ? "reported suspicious" : "no previous reports"
        }). Never pay an individual UPI ID or phone number for an opportunity.`,
        source: "reported_db",
      });
    }

    // Append completeness field checks
    checks.push(...completenessChecks);

    // 12. Compute 5-Level Verification Status
    const statusResult = computeStatus({
      signals,
      ruleScore,
      textLength: rawText.length,
      reportedMatches,
      matchedOrganization: matchedOrg,
      senderIdentity,
      headerAnalysis,
      listingComparison: listingResult.comparison,
      completeness,
      checks,
      isDemoMode: env.DEMO_MODE,
    });

    // 13. Detect Pattern Insight (Change F)
    const senderVerified = Boolean(
      matchedOrg &&
      senderIdentity.domain &&
      matchedOrg.officialDomains.some(
        (od) => od.toLowerCase().trim() === senderIdentity.domain?.toLowerCase().trim()
      )
    );

    const patternInsight = detectPatternInsight({
      signals,
      senderVerified,
      text: rawText,
      hasOnboardingOrDataRequest:
        signals.some((s) => s.ruleId === "DAT-006") ||
        /(?:onboarding|reply\s*to\s*this\s*email|send\s*(?:your)?\s*details|resume|cv)/i.test(rawText),
    });

    // 14. Assemble Unknowns & Next Steps (Patch v4)
    const unknowns: UnknownItem[] = Array.from(unknownsMap.entries()).map(
      ([item, howToVerify]) => ({ item, howToVerify })
    );

    // Build redesigned next steps (Patch v4)
    const nextSteps = buildNextSteps({
      status: statusResult.status,
      domain: request.domain,
      claimedOrg: effectiveClaimedOrg || null,
      matchedOrganization: matchedOrg,
      senderIdentity,
      extractedFields,
      signals,
      checks,
      rawText,
    });

    const checklist: ChecklistItem[] = [
      ...nextSteps.yourTurn,
      ...nextSteps.more,
    ].map((step, idx) => ({
      stepKey: step.stepKey,
      position: idx,
      label: step.title,
      portalKey: null,
      completed: Boolean(step.completed),
    }));

    // Report Guidance for HIGH_RISK or CONFIRMED_SCAM
    const reportGuidance = {
      show:
        statusResult.status === "HIGH_RISK" ||
        statusResult.status === "CONFIRMED_SCAM",
      helpline: HELPLINE.number,
      portalUrl: "https://cybercrime.gov.in",
      keepAsEvidence: Array.from(ADVISORY.evidenceToKeep),
    };

    const statusCopy = STATUS_COPY[statusResult.status];
    const summary = statusCopy.meaning;
    const durationMs = Date.now() - startTime;

    const paymentAlert = signals.some(
      (s) => s.category === "payment" || (s.ruleId && s.ruleId.startsWith("PAY-"))
    );

    const resultPayload: AnalysisResult = {
      id: null,
      saved: false,
      domain: request.domain,
      status: statusResult.status,
      claimedOrg: effectiveClaimedOrg || null,
      reasons: statusResult.reasons,
      ruleScore,
      internalRuleScore: ruleScore,
      summary,
      signals,
      checks,
      extractedFields,
      extractedEntities,
      completeness,
      senderIdentity,
      headerAnalysis,
      listingComparison: listingResult.comparison,
      reportedMatches,
      matchedOrganization: matchedOrg,
      paymentAlert,
      inputNotices,
      unknowns,
      checklist,
      nextSteps,
      links,
      reportGuidance,
      patternInsight,
      aiUsed,
      aiStatus,
      textOnlyConfidence,
      durationMs,
      disclaimer: ADVISORY.footer,
      createdAt: new Date().toISOString(),
    };

    // 14. Persistence to Supabase (if authenticated & allowed)
    if (user && supabase && request.saveToHistory) {
      try {
        const inputTextToStore = request.storeRawText ? rawText : null;

        const { data: analysisRow, error: insertError } = await supabase
          .from("analyses")
          .insert({
            user_id: user.id,
            domain: request.domain,
            input_type: request.inputType,
            channel: request.channel,
            claimed_org: request.claimedOrg || null,
            input_text: inputTextToStore,
            input_hash: inputHash,
            input_length: rawText.length,
            verification_status: statusResult.status,
            rule_score: ruleScore,
            summary,
            ai_used: aiUsed,
            ai_status: aiStatus,
            duration_ms: durationMs,
            matched_organization_id: matchedOrg?.id || null,
            sender_email_domain: senderIdentity.domain || null,
            headers_supplied: !!request.emailHeaders,
            listing_match_status: listingResult.comparison.status,
            result: resultPayload,
          })
          .select("id")
          .single();

        if (insertError || !analysisRow) {
          logger.error({ err: insertError }, "Failed to persist analysis row");
          return resultPayload;
        }

        const analysisId = analysisRow.id;
        resultPayload.id = analysisId;
        resultPayload.saved = true;

        // Insert child rows in parallel
        try {
          await Promise.allSettled([
            signals.length > 0
              ? supabase.from("analysis_signals").insert(
                  signals.map((s) => ({
                    analysis_id: analysisId,
                    user_id: user.id,
                    rule_id: s.ruleId,
                    category: s.category,
                    severity: s.severity,
                    source: s.source,
                    title: s.title,
                    why_it_matters: s.whyItMatters,
                    evidence_quote: s.evidenceQuote,
                  }))
                )
              : Promise.resolve(),
            unknowns.length > 0
              ? supabase.from("analysis_unknowns").insert(
                  unknowns.map((u) => ({
                    analysis_id: analysisId,
                    user_id: user.id,
                    item: u.item,
                    how_to_verify: u.howToVerify,
                  }))
                )
              : Promise.resolve(),
            checks.length > 0
              ? supabase.from("analysis_checks").insert(
                  checks.map((c) => ({
                    analysis_id: analysisId,
                    user_id: user.id,
                    check_key: c.checkKey,
                    label: c.label,
                    outcome: c.outcome,
                    detail: c.detail.slice(0, 600),
                    source: c.source,
                  }))
                )
              : Promise.resolve(),
            checklist.length > 0
              ? supabase.from("checklist_items").insert(
                  checklist.map((c) => ({
                    analysis_id: analysisId,
                    user_id: user.id,
                    step_key: c.stepKey || `step_${c.position}`,
                    position: c.position,
                    label: c.label,
                    portal_key: c.portalKey,
                    completed: false,
                  }))
                )
              : Promise.resolve(),
            links.length > 0
              ? supabase.from("link_checks").insert(
                  links.map((l) => ({
                    analysis_id: analysisId,
                    user_id: user.id,
                    url: l.url,
                    hostname: l.hostname,
                    registrable_domain: l.registrableDomain,
                    risk_level: l.riskLevel,
                    observations: l.observations,
                    unverified: l.unverified,
                    rdap_status: l.rdapStatus,
                    domain_registered_at: l.domainRegisteredAt,
                  }))
                )
              : Promise.resolve(),
          ]);
        } catch (childErr) {
          logger.warn({ err: childErr }, "Child insert warnings during analysis persistence");
        }
      } catch (dbErr) {
        logger.error({ err: dbErr }, "Database persistence exception");
        resultPayload.id = null;
        resultPayload.saved = false;
      }
    }

    return resultPayload;
  }
}
