import { AnalysisResult } from "shared";

/**
 * Static, non-interactive sample report data used exclusively for the landing page preview.
 * Strictly conforms to the AnalysisResult schema.
 * Labelled as a fictional example per §4.2.
 */
export const SAMPLE_REPORT: AnalysisResult = {
  id: null,
  saved: false,
  domain: "internship",
  status: "HIGH_RISK",
  claimedOrg: "Apex Systems Labs",
  reasons: [
    {
      checkKey: "payment_demand",
      effect: "high_risk",
      detail: "Legitimate internships do not ask candidates to pay refundable deposits.",
    },
    {
      checkKey: "urgency_check",
      effect: "high_risk",
      detail: "Offers expiring within 2 hours are designed to prevent independent checks.",
    },
  ],
  ruleScore: 78,
  summary: "High-risk indicators identified: upfront fee requirement and artificial 2-hour deadline pressure.",
  signals: [
    {
      ruleId: "PAY-001",
      category: "payment",
      severity: "critical",
      source: "rule",
      title: "Upfront security deposit demanded",
      whyItMatters: "Legitimate internships never require candidates to pay for training, security deposits, or ID cards.",
      evidenceQuote: "Pay ₹1,500 refundable security deposit within 2 hours to confirm your seat",
      hardDisqualifier: true,
    },
    {
      ruleId: "URG-002",
      category: "urgency",
      severity: "high",
      source: "rule",
      title: "Artificial 2-hour deadline",
      whyItMatters: "Scammers create false panic so you pay before verifying the offer with mentors or official sources.",
      evidenceQuote: "within 2 hours to confirm your seat or offer will be cancelled",
    },
  ],
  checks: [
    {
      checkKey: "payment_demand",
      outcome: "fail",
      label: "No upfront fee demanded",
      detail: "Demanded ₹1,500 security deposit",
      source: "rule",
    },
    {
      checkKey: "urgency_check",
      outcome: "fail",
      label: "No artificial deadline pressure",
      detail: "Artificial 2-hour confirmation window",
      source: "rule",
    },
    {
      checkKey: "official_domain",
      outcome: "not_run",
      label: "Official sender domain verified",
      detail: "Sender email domain not provided",
      source: "rule",
    },
    {
      checkKey: "registration_mca",
      outcome: "not_run",
      label: "MCA corporate registration cross-check",
      detail: "Registration lookup not executed",
      source: "registry",
    },
    {
      checkKey: "official_listing",
      outcome: "not_run",
      label: "Public careers listing match",
      detail: "Listing URL not supplied",
      source: "listing_compare",
    },
    {
      checkKey: "recruiter_contact",
      outcome: "not_run",
      label: "Recruiter identity verification",
      detail: "Recruiter contact not attested",
      source: "user_attested",
    },
    {
      checkKey: "stipend_terms",
      outcome: "pass",
      label: "Reasonable role scope and terms",
      detail: "Terms within standard intern ranges",
      source: "rule",
    },
    {
      checkKey: "public_reviews",
      outcome: "pass",
      label: "Scam database cross-reference",
      detail: "Zero prior student complaints on domain",
      source: "reported_db",
    },
  ],
  paymentAlert: true,
  reportedMatches: [],
  inputNotices: [],
  patternInsight: {
    id: "pat-sec-dep",
    heading: "Security Deposit Advance Fee Scam",
    description: "Common pattern targeting students on WhatsApp claiming a refundable fee is needed for onboarding.",
    dontSendYet: [
      "Do not send money via UPI, Google Pay, or QR codes",
      "Do not share your Aadhaar, PAN, or bank account statements",
    ],
  },
  unknowns: [
    {
      item: "Official Company Listing",
      howToVerify: "Check the company's verified domain directly through a search engine.",
    },
  ],
  checklist: [
    {
      position: 1,
      label: "Never transfer any deposit or registration fee",
      portalKey: null,
      completed: true,
    },
  ],
  nextSteps: {
    variant: "protect",
    banner: ["Do not pay any upfront deposit."],
    alreadyChecked: [
      {
        checkKey: "payment_demand",
        outcome: "fail",
        label: "Upfront security fee",
        detail: "Demanded ₹1,500 security deposit",
        source: "rule",
      },
      {
        checkKey: "urgency_check",
        outcome: "fail",
        label: "Artificial deadline",
        detail: "2-hour expiration window",
        source: "rule",
      },
    ],
    yourTurn: [
      {
        stepKey: "no-funds",
        title: "Do not transfer any money",
        whyItMatters: "Any request for upfront payment for an internship is a warning sign.",
        howToVerify: "Stop payment discussions immediately. Do not scan UPI QR codes.",
        completed: false,
        priority: 1,
      },
      {
        stepKey: "verify-mca",
        title: "Verify the company through official MCA records",
        whyItMatters: "Ensure the organization is legally registered in India.",
        howToVerify: "Search mca.gov.in using company master data.",
        completed: false,
        priority: 2,
      },
    ],
    more: [],
  },
  links: [],
  reportGuidance: {
    show: true,
    helpline: "1930",
    portalUrl: "https://cybercrime.gov.in",
    keepAsEvidence: [
      "WhatsApp chat screenshots",
      "UPI payment requests or QR codes",
      "Offer letter messages and sender numbers",
    ],
  },
  aiUsed: false,
  aiStatus: "not_requested",
  textOnlyConfidence: "high",
  durationMs: 38,
  disclaimer: "Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent.",
  createdAt: "2026-10-29T10:00:00.000Z",
};
