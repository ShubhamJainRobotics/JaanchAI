/**
 * Verification Policy & Reconciliation Decisions
 *
 * Implements the decisions reconciling the Offer Verification Rules document
 * with the Jaanch safety architecture.
 */

export const VERIFICATION_POLICY = {
  /**
   * Five-tier verification status model.
   * VERIFIED_OFFICIAL and CONFIRMED_SCAM are strictly evidence-gated:
   * they can NEVER be produced from unstructured message text alone.
   */
  EVIDENCE_GATED_STATUSES: ["VERIFIED_OFFICIAL", "CONFIRMED_SCAM"] as const,

  /**
   * Hard disqualifiers found in text/sender data default to HIGH_RISK.
   * They escalate to CONFIRMED_SCAM only when a sender identifier or domain
   * matches an internal reported-entities record with status = 'confirmed'.
   */
  HARD_DISQUALIFIER_DEFAULT_STATUS: "HIGH_RISK" as const,
  CONFIRMED_SCAM_REQUIRES_MODERATOR_RECORD: true,

  /**
   * Major grammar/spelling errors (rule CNT-001):
   * Severity: low (3 points), max 1 hit.
   * Can NEVER change the verification status by itself.
   * UI notice: Genuine senders also make mistakes; this alone proves nothing.
   */
  GRAMMAR_CHECK: {
    ruleId: "CNT-001",
    severity: "low" as const,
    points: 3,
    maxHits: 1,
    minDistinctErrors: 4,
    canChangeStatusAlone: false,
    uiNotice: "Genuine senders also make mistakes; this alone proves nothing.",
  },

  /**
   * Domain SSL & Reputation Checks:
   * The app NEVER connects to a suspect host (no HTTP, no TLS handshake).
   * External telemetry is restricted to:
   * 1. RDAP (domain age / registration date)
   * 2. Certificate Transparency log lookup by hostname (crt.sh)
   * 3. Google Safe Browsing (optional, only if SAFE_BROWSING_API_KEY is configured).
   * Unavailable or failed checks are shown as 'unknown', never 'pass'.
   */
  SUSPECT_HOST_POLICY: {
    allowDirectConnectionToSuspectHosts: false,
    unknownIsNotPass: true,
  },

  /**
   * Internal Reported-Entities Database:
   * Replaces external/government repository claims.
   * Stores salted SHA-256 hashes only. No claim to government access.
   */
  REPORTED_ENTITIES: {
    source: "Jaanch Community Reports & Moderator Confirmations",
    disclaimer: "Matches are based on internal reports and do not claim access to government databases.",
  },

  /**
   * Official Listing Fetching:
   * Allowed ONLY from organization registry-allowlisted hosts or .gov.in / .nic.in for government orgs.
   * Suspect / user-supplied URLs from message text are NEVER fetched.
   */
  LISTING_FETCH: {
    strictRegistryAllowlistOnly: true,
    allowGovSubdomains: true,
  },

  /**
   * Recruiter Attestations:
   * Recruiter verification (LinkedIn, phone) cannot be automated reliably.
   * Supported as user-attested checks, outcome 'user_attested', labelled:
   * "confirmed by you, not by Jaanch".
   * Attestations never alone satisfy a verification gate.
   */
  ATTESTATIONS: {
    outcome: "user_attested" as const,
    label: "confirmed by you, not by Jaanch",
    canAloneSatisfyVerifiedGate: false,
  },

  /**
   * Banned Phrase Rule:
   * The exact labels "Verified / Official" and "Confirmed Scam" may be rendered
   * ONLY by StatusBanner / STATUS_COPY when the computed status equals
   * VERIFIED_OFFICIAL / CONFIRMED_SCAM.
   * Everywhere else (rule copy, AI output, marketing text), these definitive claims remain forbidden.
   * "Likely Genuine" must always carry the qualifier:
   * "No scam indicators were found, but this offer has not been matched to an official listing."
   */
  BANNED_PHRASES: {
    allowDefinitiveLabelInStatusBannerOnly: true,
    likelyGenuineQualifierRequired: true,
  },
} as const;
