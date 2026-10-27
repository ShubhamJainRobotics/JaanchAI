import { ChallengeOutput, OpportunityDomain } from "../schemas/index.js";

export interface ChallengeTemplateParams {
  domain: OpportunityDomain;
  claimedOrg?: string;
  tone?: "polite" | "firm";
  senderName?: string;
  includeQuestions?: string[];
}

export function buildChallengeTemplate(
  params: ChallengeTemplateParams
): ChallengeOutput {
  const org = params.claimedOrg?.trim() || "your organization";
  const name = params.senderName?.trim() || "[Your Name]";
  const isFirm = params.tone === "firm";

  const subject = isFirm
    ? `Request for Formal Verification: ${params.domain.toUpperCase()} Opportunity with ${org}`
    : `Verification Inquiry regarding ${params.domain} opportunity with ${org}`;

  const feeClause =
    params.domain === "internship" || params.domain === "job" || params.domain === "scholarship"
      ? "Could you also confirm in writing that no application fee, security deposit, or training charge is required at any point during this process?"
      : "Please clarify any financial requirements or terms associated with this opportunity.";

  const body = isFirm
    ? `Dear Hiring Team at ${org},

Thank you for your communication regarding the ${params.domain} opportunity. 

Before proceeding, I kindly request the following details to verify this position with my college placement office:
1. The official company website domain and your corporate email address on that domain.
2. The company's legal registration details (such as CIN or LLPIN number).
3. A formal offer or selection letter issued on official company letterhead detailing the role, scope of work, duration, and terms.
4. ${feeClause}
5. The official portal or contact channel through which our institution can independently confirm this opportunity.

I look forward to your prompt response with these documents so I may proceed safely.

Sincerely,
${name}`
    : `Dear Recruitment Team at ${org},

Thank you for reaching out regarding the ${params.domain} opportunity. I am eager to learn more about the role.

To ensure proper documentation for my academic records, could you please provide:
1. Your official corporate email address and registered company domain.
2. The organization's registration credentials (CIN or LLPIN).
3. A formal offer letter on official letterhead specifying the duties, timeline, and terms.
4. ${feeClause}
5. An official verification channel where this communication can be validated.

Thank you for your time and assistance. I appreciate your support in verifying these details.

Best regards,
${name}`;

  return { subject, body };
}

export function buildSafeReplyTemplate(
  params: ChallengeTemplateParams
): ChallengeOutput {
  const org = params.claimedOrg?.trim() || "your organization";
  const name = params.senderName?.trim() || "[Your Name]";
  const isFirm = params.tone === "firm";

  const subject = isFirm
    ? `Conditional Acceptance & Verification Request: ${params.domain.toUpperCase()} Opportunity with ${org}`
    : `Thank you: Inquiry regarding ${params.domain} onboarding with ${org}`;

  // Assemble question points deterministically
  const questions: string[] = [];
  const requested = params.includeQuestions;

  if (requested && requested.length > 0) {
    if (requested.includes("official_domain_and_letterhead")) {
      questions.push(
        isFirm
          ? "The official company website domain, your corporate email address on that domain, and a formal offer letter on official letterhead."
          : "Your official organizational email domain, verified website link, and a formal offer letter on official letterhead."
      );
    }
    if (requested.includes("selection_process")) {
      questions.push(
        isFirm
          ? "A formal description of the selection and evaluation rounds conducted for this role."
          : "An outline of the selection process and who will oversee the evaluation."
      );
    }
    if (requested.includes("registration_meaning_and_fee")) {
      questions.push(
        isFirm
          ? "Detailed clarification on what 'registration' involves, with explicit written confirmation that no fees or deposits apply at any stage."
          : "Clarification on what the 'registration' step involves, and confirmation in writing that no fees apply at any stage."
      );
    }
    if (requested.includes("data_minimization")) {
      questions.push(
        "Please confirm which personal details are required and at what stage."
      );
    }
    if (requested.includes("more_time")) {
      questions.push(
        isFirm
          ? "Additional time to complete independent verification before proceeding with onboarding."
          : "A brief extension of time so I may review the opportunity with my institution before confirming."
      );
    }
  }

  // Fallback if no specific questions were provided
  if (questions.length === 0) {
    if (isFirm) {
      questions.push(
        "Your official corporate email domain and the company's verified website.",
        "A formal description of the selection and evaluation rounds conducted for this role.",
        'Detailed clarification on what the "registration" step involves, with explicit confirmation that no fees or deposits apply at any stage.',
        "An official offer letter issued on company letterhead specifying role, duration, and stipend."
      );
    } else {
      questions.push(
        "Your official organizational email address and official website link.",
        "An outline of the selection process and who will oversee the evaluation.",
        'The exact scope of the "registration" step and confirmation in writing that the entire process is free of any fees or charges.',
        "A formal offer letter on official letterhead outlining the duties and stipend."
      );
    }
  }

  const numberedQuestions = questions
    .map((q, idx) => `${idx + 1}. ${q}`)
    .join("\n");

  const body = isFirm
    ? `Dear Recruitment Team at ${org},

Thank you for shortlisting my profile for the ${params.domain} position. I am very interested in this opportunity and look forward to contributing.

Before I submit personal documents or complete onboarding details, I kindly request written clarification on the following items for academic placement records:
${numberedQuestions}

Once these details are received, I will gladly share the requested onboarding documents.

Sincerely,
${name}`
    : `Dear Hiring Team at ${org},

Thank you for your email regarding the ${params.domain} opportunity. I appreciate being considered for this role and am eager to proceed.

To ensure compliance with my institution's placement guidelines, I would be grateful if you could clarify a few details before I provide personal records:
${numberedQuestions}

Thank you for your time and understanding. I look forward to your response.

Best regards,
${name}`;

  return { subject, body };
}
