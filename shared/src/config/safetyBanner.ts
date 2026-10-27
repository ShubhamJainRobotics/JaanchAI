import { Signal } from "../schemas/index.js";

export const SAFETY_BANNER_RULES = {
  ALWAYS_NO_FEE: "Never pay any fee to receive an opportunity.",
  ALWAYS_PROTECT_SECRETS:
    "Don't share Aadhaar, PAN, bank, card details, passwords or OTPs before you have verified who is asking.",
  MINIMUM_PERSONAL_DETAILS:
    "Share only the minimum personal details, and only after the sender is verified.",
  DONT_BE_RUSHED:
    "A genuine employer will allow time to verify. Don't let a deadline rush you.",
} as const;

export interface SafetyBannerContext {
  signals?: Signal[];
}

export function getSafetyBannerRules(ctx?: SafetyBannerContext): string[] {
  const rules: string[] = [
    SAFETY_BANNER_RULES.ALWAYS_NO_FEE,
    SAFETY_BANNER_RULES.ALWAYS_PROTECT_SECRETS,
  ];

  const signals = ctx?.signals || [];

  if (signals.some((s) => s.ruleId === "DAT-006")) {
    rules.push(SAFETY_BANNER_RULES.MINIMUM_PERSONAL_DETAILS);
  }

  if (signals.some((s) => s.ruleId === "URG-004" || s.ruleId === "URG-001")) {
    rules.push(SAFETY_BANNER_RULES.DONT_BE_RUSHED);
  }

  return rules;
}
