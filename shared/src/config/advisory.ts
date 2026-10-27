export const ADVISORY = {
  footer:
    "Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent.",
  limitations: [
    "False positives and false negatives are possible.",
    "Message text alone cannot prove authenticity.",
    "External checks may be incomplete or unavailable.",
    "Independent verification is always needed.",
  ],
  evaluationPlanned: [
    "Accuracy in detecting predefined warning signs",
    "Clarity and quality of explanations",
    "Share of users completing recommended checks",
    "Time needed to produce an assessment",
    "Reliability across test scenarios.",
  ],
  plannedNotice: "No measured results are claimed yet. These are planned metrics.",
  evidenceToKeep: [
    "Full conversation screenshots showing phone numbers, handles, and dates",
    "Original message headers or email addresses",
    "Payment transaction receipts, UPI transaction IDs, and bank account numbers",
    "Any offer letters, brochures, links, or documents sent to you",
  ],
} as const;
