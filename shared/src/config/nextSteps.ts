import {
  OpportunityDomain,
  NextStepAction,
  Signal,
  CheckRow,
  Organization,
  SenderIdentity,
  ExtractedFields,
  VerificationStatus,
} from "../schemas/index.js";
import { OFFICIAL_PORTALS } from "./officialPortals.js";

export interface NextStepsContext {
  status: VerificationStatus;
  domain: OpportunityDomain;
  claimedOrg?: string | null;
  matchedOrganization?: Organization | null;
  senderIdentity?: SenderIdentity | null;
  extractedFields?: ExtractedFields | null;
  signals?: Signal[];
  checks?: CheckRow[];
  rawText?: string;
  alreadyPaid?: boolean;
}

export interface CatalogStepItem {
  stepKey: string;
  priority: number;
  titleTemplate: string;
  whyItMatters: string;
  howToVerifyTemplate: string;
  appliesWhen: (ctx: NextStepsContext) => boolean;
  getActions?: (ctx: NextStepsContext) => NextStepAction[];
  subChecks?: Array<{ key: string; labelTemplate: string }>;
}

export function resolveTemplate(
  text: string,
  vars: { org: string; emailDomain: string; portalName: string }
): string {
  return text
    .replace(/\{org\}/g, vars.org)
    .replace(/\{emailDomain\}/g, vars.emailDomain)
    .replace(/\{portalName\}/g, vars.portalName);
}

export function getTemplateVariables(ctx: NextStepsContext): {
  org: string;
  emailDomain: string;
  portalName: string;
} {
  const org =
    ctx.matchedOrganization?.name ||
    ctx.claimedOrg?.trim() ||
    ctx.extractedFields?.organization?.value?.trim() ||
    "the organization";

  const emailDomain =
    ctx.senderIdentity?.domain ||
    (ctx.senderIdentity?.rawEmail
      ? ctx.senderIdentity.rawEmail.split("@")[1]
      : null) ||
    "the sender's domain";

  let portalName = "";
  if (ctx.domain === "internship") {
    portalName = "AICTE Internship Portal";
  } else if (ctx.domain === "scholarship") {
    portalName = "National Scholarship Portal";
  }

  return { org, emailDomain, portalName };
}

export const STANDARD_STEP_CATALOG: readonly CatalogStepItem[] = [
  {
    stepKey: "find_official_site",
    priority: 1,
    titleTemplate: "Find {org}'s official website yourself",
    whyItMatters:
      "Search engines index genuine company domains; scammers often create lookalike domains or use unrelated webmail addresses.",
    howToVerifyTemplate:
      "Search for {org} in your browser (don't use links from the message). Check whether the opportunity is on its careers or scholarships page and whether {emailDomain} is the domain it uses.",
    appliesWhen: () => true,
    getActions: (ctx) => {
      const vars = getTemplateVariables(ctx);
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        `"${vars.org}" official website`
      )}`;

      const actions: NextStepAction[] = [
        {
          label: "Open web search",
          url: searchUrl,
          kind: "link",
        },
      ];

      // "if registry row is reviewed, also Open official site"
      // "Never show an official-website link from a registry row that still needs team review; show a neutral search link instead"
      if (
        ctx.matchedOrganization &&
        !ctx.matchedOrganization.needsTeamReview &&
        ctx.matchedOrganization.officialDomains &&
        ctx.matchedOrganization.officialDomains.length > 0
      ) {
        actions.push({
          label: "Open official site",
          url: `https://${ctx.matchedOrganization.officialDomains[0]}`,
          kind: "link",
        });
      }

      return actions;
    },
    subChecks: [
      {
        key: "found_independently_on_official_portal",
        labelTemplate: "I found this exact opportunity on the official site.",
      },
    ],
  },
  {
    stepKey: "verify_registration",
    priority: 2,
    titleTemplate: "Check the company's registration",
    whyItMatters:
      "Legitimate corporate employers in India are registered with the Ministry of Corporate Affairs (MCA) as an active Company or LLP.",
    howToVerifyTemplate:
      "On the MCA portal, open Company/LLP Master Data and search for {org}. Confirm it is registered and active, and that the registered name matches the offer.",
    appliesWhen: (ctx) => {
      const allowedDomains: OpportunityDomain[] = [
        "internship",
        "job",
        "freelance",
        "competition",
      ];
      if (!allowedDomains.includes(ctx.domain)) return false;
      if (ctx.matchedOrganization) {
        if (ctx.matchedOrganization.isGovernment) return false;
        if (
          ctx.matchedOrganization.kind === "government" ||
          ctx.matchedOrganization.kind === "university"
        ) {
          return false;
        }
      }
      return true;
    },
    getActions: () => {
      const mcaPortal = OFFICIAL_PORTALS.find((p) => p.key === "mca_master");
      return [
        {
          label: "Open MCA",
          url: mcaPortal?.url || "https://www.mca.gov.in",
          kind: "link",
        },
      ];
    },
  },
  {
    stepKey: "verify_portal",
    priority: 3,
    titleTemplate: "Look for the listing on {portalName}",
    whyItMatters:
      "State and central authorities maintain authoritative portals for accredited student programs.",
    howToVerifyTemplate:
      "Search {portalName} for {org} or the scheme name. If it isn't listed, treat the offer as unconfirmed rather than assuming a mistake on the portal.",
    appliesWhen: (ctx) => {
      return ctx.domain === "internship" || ctx.domain === "scholarship";
    },
    getActions: (ctx) => {
      if (ctx.domain === "internship") {
        const portal = OFFICIAL_PORTALS.find((p) => p.key === "aicte_internship");
        return [
          {
            label: "Open AICTE Internship Portal",
            url: portal?.url || "https://internship.aicte-india.org",
            kind: "link",
          },
        ];
      }
      if (ctx.domain === "scholarship") {
        const portal = OFFICIAL_PORTALS.find((p) => p.key === "nsp");
        return [
          {
            label: "Open National Scholarship Portal",
            url: portal?.url || "https://scholarships.gov.in",
            kind: "link",
          },
        ];
      }
      return [];
    },
  },
  {
    stepKey: "confirm_recruiter",
    priority: 4,
    titleTemplate: "Confirm the recruiter's identity",
    whyItMatters:
      "Fraudulent campaigns frequently forge recruiter names or impersonate staff from reputable brands.",
    howToVerifyTemplate:
      "Find the recruiter's name on {org}'s own website or on LinkedIn and check the profile lists {org} as the current employer. Compare the phone number in the message with the number on {org}'s official website.",
    appliesWhen: () => true,
    subChecks: [
      {
        key: "recruiter_linkedin",
        labelTemplate: "Profile found and linked to {org}",
      },
      {
        key: "recruiter_phone_official",
        labelTemplate: "Phone number matches the official website",
      },
    ],
  },
  {
    stepKey: "send_safe_reply",
    priority: 5,
    titleTemplate: "Send one safe reply with your questions",
    whyItMatters:
      "A safe reply requests critical verification details without surrendering personal information or payment.",
    howToVerifyTemplate:
      "Open the safe reply draft, review it, and send it to the sender. It shares none of your personal details. Wait for a written answer before sharing anything further.",
    appliesWhen: () => true,
    getActions: () => [
      {
        label: "Open safe reply",
        kind: "safe_reply",
      },
    ],
    subChecks: [
      {
        key: "contacted_via_official_channel",
        labelTemplate: "I contacted them using a channel I found myself.",
      },
    ],
  },
  {
    stepKey: "ask_placement_cell",
    priority: 6,
    titleTemplate: "Ask your placement cell or a trusted senior",
    whyItMatters:
      "College training & placement cells track active hiring drives and can rapidly cross-verify unannounced opportunities.",
    howToVerifyTemplate:
      "Show the message to your college placement cell or a senior who has worked at {org} or in the same field. They can often confirm quickly whether the program is real.",
    appliesWhen: (ctx) => {
      const allowed: OpportunityDomain[] = [
        "internship",
        "job",
        "scholarship",
        "competition",
      ];
      return allowed.includes(ctx.domain);
    },
  },
] as const;

export const PROTECT_STEP_CATALOG: readonly CatalogStepItem[] = [
  {
    stepKey: "stop_replying",
    priority: 1,
    titleTemplate: "Stop replying and don't click links or open attachments",
    whyItMatters:
      "Further engagement allows scammers to collect more personal details or attempt technical exploits.",
    howToVerifyTemplate:
      "Stop replying and don't click links or open attachments.",
    appliesWhen: () => true,
  },
  {
    stepKey: "keep_evidence",
    priority: 2,
    titleTemplate: "Preserve all evidence",
    whyItMatters:
      "Documentation of messages, contact handles, and transaction receipts is required by cybercrime investigators and banks.",
    howToVerifyTemplate:
      "Screenshot the message, sender details and any payment receipts.",
    appliesWhen: () => true,
  },
  {
    stepKey: "report_it",
    priority: 3,
    titleTemplate: "Report at cybercrime.gov.in or call 1930",
    whyItMatters:
      "Prompt reporting triggers account freezes on fraudulent beneficiary banks across India.",
    howToVerifyTemplate: "Report at cybercrime.gov.in or call 1930.",
    appliesWhen: () => true,
    getActions: () => [
      {
        label: "Report at cybercrime.gov.in",
        url: "https://cybercrime.gov.in",
        kind: "link",
      },
      {
        label: "Call 1930",
        url: "tel:1930",
        kind: "tel",
      },
    ],
  },
  {
    stepKey: "if_money_sent",
    priority: 4,
    titleTemplate: "Take immediate action if money was sent",
    whyItMatters:
      "Reporting to 1930 and your bank within golden hours significantly increases the chance of recovering lost funds.",
    howToVerifyTemplate:
      "If you already paid, call 1930 and your bank right away and share the transaction details.",
    appliesWhen: (ctx) => {
      const textSaysPaid = Boolean(
        ctx.rawText &&
          /(?:you\s+(?:have\s+)?paid|payment\s+(?:was\s+)?received|amount\s+deducted|funds\s+transferred|payment\s+successful|already\s+paid)/i.test(
            ctx.rawText
          )
      );
      const hasOverpayment = Boolean(ctx.signals?.some((s) => s.ruleId === "PAY-009"));
      if (ctx.alreadyPaid === true) return true;
      if (textSaysPaid || hasOverpayment) return true;
      if (ctx.alreadyPaid === false) return false;
      return Boolean(ctx.signals?.some((s) => s.category === "payment"));
    },
    getActions: () => [
      {
        label: "Call 1930 immediately",
        url: "tel:1930",
        kind: "tel",
      },
    ],
  },
  {
    stepKey: "warn_others",
    priority: 5,
    titleTemplate: "Tell your college so others aren't caught",
    whyItMatters:
      "Students in the same branch, batch, or placement group are likely being targeted by the exact same campaign.",
    howToVerifyTemplate: "Tell your college so others aren't caught.",
    appliesWhen: () => true,
  },
] as const;
