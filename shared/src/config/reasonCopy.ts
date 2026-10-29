/**
 * Human-readable plain language copy dictionary for verification reasons.
 * Maps machine check keys and reason identifiers to student-accessible sentences.
 * Strictly adheres to Jaanch non-verdict policy (never claims definitive safety or proof of fraud).
 */

export const REASON_COPY: Record<string, string> = {
  // Fraud registry & reported records
  reported_entity_confirmed:
    "This sender identifier matches a confirmed fraudulent record in the verification database.",
  reported_entity_reported:
    "This sender identifier has been reported as suspicious by other users.",

  // Domain & sender identity
  sender_domain_lookalike:
    "The sender's email domain closely mimics a recognized brand or institution name.",
  sender_free_email:
    "The sender address uses a personal or free webmail service rather than an official corporate domain.",
  sender_domain_mismatch_registry:
    "The sender's email domain does not match the official domains registered for the claimed organization.",
  sender_domain_match:
    "Sender email domain was checked against official registry records.",

  // Organization registry & listing
  org_unregistered_no_evidence:
    "The organization isn't in our registry and nothing independent has confirmed it.",
  org_needs_team_review:
    "The claimed organization is currently pending registry verification by the Jaanch team.",
  organization_registry_match:
    "Organization was checked against the official institution registry.",
  official_listing:
    "Offer details were compared against official job or internship listings.",
  official_website_registry:
    "Official website domain verified from the registry.",
  listing_mismatch:
    "Discrepancies were found between the message details and the official listing.",
  listing_user_supplied_text:
    "The listing text was supplied directly and could not be verified against an official website.",

  // Authentication & headers
  header_auth_failed:
    "Email header authentication failed or contains domain mismatches.",
  header_authentication:
    "Cryptographic email headers (SPF, DKIM, DMARC) were evaluated for domain alignment.",
  domain_age:
    "Domain registration age was inspected for recent creation.",

  // Content, rules & patterns
  subtle_signals_pattern:
    "Multiple subtle inconsistency signals were detected in the offer message.",
  completeness_deficient:
    "The offer is missing essential details such as role description, compensation, or eligibility criteria.",
  completeness:
    "Offer completeness across essential parameters was evaluated.",
  text_too_short:
    "The message is too short to evaluate conclusively without further context.",
  insufficient_evidence:
    "No scam indicators were found, but nothing about the sender or organization could be verified yet.",
  positive_evidence_verified:
    "Sender email domain and opportunity details were verified against official records.",
  verified_all_gates_passed:
    "The opportunity passed all independent verification gates and official source matching.",

  // Disqualifier and high risk triggers
  "PAY-001":
    "An upfront payment or registration fee is requested for this opportunity.",
  "PAY-002":
    "Payment requested via UPI ID, QR code, or personal transfer handle.",
  "PAY-003":
    "Payment requested with claims of being refundable after joining or completion.",
  "PAY-005":
    "Payment of GST, taxes, or handling fees requested to release scholarship or award money.",
  "PAY-007":
    "Payment demanded before laptops, welcome kits, or onboarding materials will be dispatched.",
  "PAY-008":
    "Mandatory purchase of a software kit, uniform, training tools, or vendor package.",
  "TGB-004":
    "Guaranteed 100% selection or placement claimed without standard evaluation.",
  "GOV-001":
    "Government scheme or benefit claimed on an unofficial domain or with an upfront payment request.",
  "SND-002":
    "The sender domain closely mimics a recognized brand or institution name.",
  "SND-004":
    "The sender uses a free personal webmail address while claiming to represent a recognized company.",
  "DAT-001":
    "Requests for sensitive banking credentials, ATM PIN, or one-time passwords (OTPs).",
  "CHN-002":
    "Pressure to communicate solely through personal messaging apps like WhatsApp or Telegram.",
  "CHN-004":
    "External links in the message point away from the claimed organization's official domain.",
  rule_score_high:
    "Multiple high-risk indicators were detected across the offer text and sender identity.",
  rule_score_moderate:
    "Several warning indicators were detected that require independent verification.",

  // Rule categories & common checks
  payment_request:
    "Text checked for upfront fee, registration fee, or security deposit requests.",
  sensitive_data_request:
    "Text checked for premature requests for bank details, Aadhaar, PAN, or OTPs.",
  urgency_language:
    "Text checked for high-pressure deadlines or artificial urgency.",
  guarantee_unrealistic:
    "Text checked for unrealistic compensation or guaranteed selection claims.",
};

/**
 * Fallback plain sentence for unrecognized reason keys.
 */
export const DEFAULT_UNKNOWN_REASON =
  "Additional independent verification is recommended for this check.";

/**
 * Clean up machine text or lookup plain-language reason.
 */
export function lookupReasonCopy(key: string, detail?: string): string {
  if (key && REASON_COPY[key]) {
    return REASON_COPY[key];
  }

  // If detail is present, sanitize any internal score or pseudo-code jargon
  if (detail && detail.trim().length > 0) {
    let clean = detail.trim();

    // Strip internal score phrases like "Cumulative scam indicator score reached 55 (threshold is >= 50)."
    if (/score\s+reached\s+\d+/i.test(clean)) {
      return /threshold\s+is\s+>=\s*50/i.test(clean) || /score\s+reached\s+[5-9]\d/i.test(clean)
        ? REASON_COPY.rule_score_high
        : REASON_COPY.rule_score_moderate;
    }

    // Strip [RULE-ID] tags like "Triggered hard disqualifier rule [PAY-001]: Upfront fee requested."
    clean = clean.replace(/Triggered hard disqualifier rule\s*\[[A-Z0-9_-]+\]:\s*/i, "Disqualifying indicator: ");
    clean = clean.replace(/Indicator\s*\[[A-Z0-9_-]+\]:\s*/i, "Warning indicator: ");
    clean = clean.replace(/\[(?:AI-)?[A-Z]{2,4}-\d{3}\]/g, "");
    clean = clean.replace(/\s+/g, " ").trim();

    // If cleaned detail is reasonable, return it
    if (clean.length > 10 && !/^[a-z0-9_-]+$/i.test(clean)) {
      return clean;
    }
  }

  return DEFAULT_UNKNOWN_REASON;
}
