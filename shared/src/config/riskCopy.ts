import { RiskLevel } from "../schemas/index.js";

export interface RiskCopyDetails {
  label: string;
  badgeClass: string;
  cardClass: string;
  textClass: string;
  formatSummary: (seriousCount: number) => string;
}

export const RISK_COPY: Record<RiskLevel, RiskCopyDetails> = {
  HIGH_CONCERN: {
    label: "High concern",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    cardClass: "bg-red-50 border-red-200 text-red-900",
    textClass: "text-red-700",
    formatSummary: (seriousCount: number) =>
      `We observed ${seriousCount > 0 ? seriousCount : "serious"} warning sign(s). Do not pay or share details until you verify independently.`,
  },
  NEEDS_VERIFICATION: {
    label: "Needs verification",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    cardClass: "bg-amber-50 border-amber-200 text-amber-900",
    textClass: "text-amber-700",
    formatSummary: () =>
      "Some details are missing or unusual. Verify the sender and organization before acting.",
  },
  NO_MAJOR_WARNING_SIGNS: {
    label: "No major warning signs found",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cardClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
    textClass: "text-emerald-700",
    formatSummary: () =>
      "No alarming signal was found in this text. This is not confirmation that the offer is genuine.",
  },
};
