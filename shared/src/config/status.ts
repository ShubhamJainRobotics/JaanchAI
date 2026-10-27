import { z } from "zod";

export const VerificationStatus = z.enum([
  "VERIFIED_OFFICIAL",
  "LIKELY_GENUINE",
  "NEEDS_REVIEW",
  "HIGH_RISK",
  "CONFIRMED_SCAM",
]);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

export const STATUS_SEVERITY_ORDER: Record<VerificationStatus, number> = {
  CONFIRMED_SCAM: 5,
  HIGH_RISK: 4,
  NEEDS_REVIEW: 3,
  LIKELY_GENUINE: 2,
  VERIFIED_OFFICIAL: 1,
};

export const STATUS_COPY = {
  VERIFIED_OFFICIAL: {
    label: "Verified / Official",
    meaning:
      "Passed all hard-disqualifier checks and was independently confirmed through an official source. See the evidence below.",
    tone: "emerald",
  },
  LIKELY_GENUINE: {
    label: "Likely Genuine",
    meaning:
      "No scam indicators were found, but this offer has not been matched to an official listing.",
    qualifier:
      "No scam indicators were found, but this offer has not been matched to an official listing.",
    tone: "teal",
  },
  NEEDS_REVIEW: {
    label: "Needs Review",
    meaning:
      "The offer looks plausible but has missing details, an unofficial contact channel, incomplete source verification, or not enough could be verified yet.",
    tone: "amber",
  },
  HIGH_RISK: {
    label: "High Risk",
    meaning:
      "One or more scam indicators are present, such as urgency, payment requests, or an unverifiable sender. Do not pay or share details.",
    tone: "red",
  },
  CONFIRMED_SCAM: {
    label: "Confirmed Scam",
    meaning:
      "The sender, domain or account matches a record that has been confirmed as fraudulent.",
    tone: "rose-dark",
  },
} as const;
