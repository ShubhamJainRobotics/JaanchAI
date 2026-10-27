import { Signal, PatternInsight } from "../schemas/index.js";

export interface PatternContext {
  signals: Signal[];
  senderVerified: boolean;
  text?: string;
  hasOnboardingOrDataRequest?: boolean;
}

export interface PatternDefinition {
  id: string;
  heading: string;
  description: string;
  dontSendYet: string[];
  matches: (ctx: PatternContext) => boolean;
}

export const PATTERN_CATALOGUE: PatternDefinition[] = [
  {
    id: "advance_fee_internship_precursor",
    heading: "Advance-Fee Internship Precursor Pattern",
    description:
      "In similar offers, the first message is friendly and asks only for basic details; a payment request such as a 'registration' or 'security' fee can come in a later message. Before replying, confirm who is asking and what 'registration' involves.",
    dontSendYet: [
      "Résumé with full contact details",
      "Government ID documents or numbers",
      "Bank or UPI details",
      "Any upfront registration or security deposit",
    ],
    matches: (ctx: PatternContext) => {
      const hasMis007 = ctx.signals.some((s) => s.ruleId === "MIS-007");
      const hasMis003 = ctx.signals.some((s) => s.ruleId === "MIS-003");
      const hasUrg004 = ctx.signals.some((s) => s.ruleId === "URG-004");
      const hasDataOrOnboarding =
        ctx.hasOnboardingOrDataRequest ||
        ctx.signals.some((s) => s.ruleId === "DAT-006") ||
        (ctx.text
          ? /(?:onboarding|reply\s*to\s*this\s*email|send\s*(?:your)?\s*details|resume|cv)/i.test(
              ctx.text
            )
          : false);

      const ruleTrigger = hasMis007 || (hasMis003 && hasUrg004);
      return ruleTrigger && !ctx.senderVerified && Boolean(hasDataOrOnboarding);
    },
  },
  {
    id: "data_harvesting_precursor",
    heading: "Premature Data Collection Pattern",
    description:
      "In similar communications, extensive personal details are gathered before the recruiter's identity or company affiliation is verified. These details can often be reused for identity spoofing or targeted scams.",
    dontSendYet: [
      "Phone number and WhatsApp contact",
      "Current or permanent home address",
      "Official ID numbers (Aadhaar, PAN)",
      "Passport or identity photos",
    ],
    matches: (ctx: PatternContext) => {
      const hasDat006 = ctx.signals.some((s) => s.ruleId === "DAT-006");
      return hasDat006 && !ctx.senderVerified;
    },
  },
  {
    id: "fake_cheque_or_advance_payment",
    heading: "Advance Payment or Overpayment Scheme Pattern",
    description:
      "In similar situations, the candidate is sent an advance cheque or transferred money with instructions to forward a portion back or buy specific equipment from an unverified vendor. When the original transfer bounces, the candidate loses their own money.",
    dontSendYet: [
      "Any refund or transfer from received funds",
      "Equipment purchases via specified vendor links",
      "Bank account credentials or UPI PIN",
    ],
    matches: (ctx: PatternContext) => {
      return ctx.signals.some(
        (s) => s.ruleId === "PAY-009" || s.ruleId === "PAY-005"
      );
    },
  },
  {
    id: "brand_impersonation",
    heading: "Brand Impersonation & Lookalike Domain Pattern",
    description:
      "In similar offers, the communication mimics a well-known organization using a typo-squatted domain or personal webmail address. The real organization's official portal will have the authentic career listings.",
    dontSendYet: [
      "Applications submitted through links in the message",
      "Personal identity documents",
      "Responses to unverified email addresses",
    ],
    matches: (ctx: PatternContext) => {
      return ctx.signals.some(
        (s) => s.ruleId === "SND-002" || s.ruleId === "SND-004"
      );
    },
  },
  {
    id: "government_scheme_lure",
    heading: "Government Scheme Impersonation Pattern",
    description:
      "In similar schemes, national or state welfare programs are cited to create trust, but use unofficial websites or request application charges. Genuine government benefits are handled only on official .gov.in or .nic.in portals.",
    dontSendYet: [
      "Application or registration fees",
      "Bank account details or OTPs",
      "Submissions on non-government portals",
    ],
    matches: (ctx: PatternContext) => {
      return ctx.signals.some((s) => s.ruleId === "GOV-001");
    },
  },
];

export function detectPatternInsight(
  ctx: PatternContext
): PatternInsight | null {
  for (const pattern of PATTERN_CATALOGUE) {
    if (pattern.matches(ctx)) {
      return {
        id: pattern.id,
        heading: pattern.heading,
        description: pattern.description,
        dontSendYet: pattern.dontSendYet,
      };
    }
  }
  return null;
}
