import { OpportunityDomain } from "shared";

export interface ChallengePromptParams {
  domain: OpportunityDomain;
  claimedOrg?: string;
  tone: "polite" | "firm";
  senderName?: string;
}

export function buildChallengePrompt(params: ChallengePromptParams): string {
  return `Write a short, polite, professional email from a student to a recruiter/organizer whose message is under review.
Domain: ${params.domain}
Organization (may be empty): ${params.claimedOrg || ""}
Tone: ${params.tone}
Student's first name (may be empty): ${params.senderName || ""}

The email MUST ask for ALL of:
- the official company/organization domain and an official email address on it,
- company registration details (CIN / LLPIN or equivalent registration),
- a formal offer/selection letter on official letterhead with role, duration, and terms,
- confirmation that no fee or deposit is required at any stage (when applicable to the domain),
- the official channel through which the student can verify the opportunity.

Constraints: 90–150 words in the body. No threats, no accusations, no legal claims. Do not state that the sender is fraudulent. Do not include any information the student did not provide. End with a courteous sign-off using the student's first name if provided, otherwise "[Your Name]".`;
}
