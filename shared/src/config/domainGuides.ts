import { OpportunityDomain } from "../schemas/index.js";

export interface DomainGuide {
  title: string;
  description: string;
  keyVerificationSteps: string[];
  recommendedPortals: string[];
}

export const DOMAIN_GUIDES: Record<OpportunityDomain, DomainGuide> = {
  internship: {
    title: "Internship Verification Guide",
    description: "Internships should never require candidates to pay fees or deposits. Genuine companies provide formal offer letters and clear responsibilities.",
    keyVerificationSteps: [
      "Check whether the organization and internship are listed on the official AICTE Internship Portal.",
      "Look up the employer's CIN/LLPIN on the Ministry of Corporate Affairs (MCA) portal.",
      "Visit the company's official careers page directly (not via links in messages).",
      "Consult your college training and placement cell or faculty advisor before accepting.",
      "Refuse any demand for 'registration fees', 'training charges', or 'refundable equipment deposits'.",
    ],
    recommendedPortals: ["aicte_internship", "mca_master"],
  },
  scholarship: {
    title: "Scholarship Verification Guide",
    description: "Government and legitimate institutional scholarships never ask for application fees or advance payments to release funds.",
    keyVerificationSteps: [
      "Verify the scholarship on the National Scholarship Portal (NSP scholarships.gov.in) or state education portal.",
      "Check the official notification directly from the issuing university, ministry, or foundation.",
      "Never share net-banking credentials, OTPs, or UPI PINs to receive money.",
      "Remember: Receiving money never requires you to enter your UPI PIN.",
    ],
    recommendedPortals: ["nsp"],
  },
  job: {
    title: "Employment & Job Offer Verification Guide",
    description: "Genuine employers never charge money for recruitment, interviews, laptop security deposits, or background checks.",
    keyVerificationSteps: [
      "Search the company on MCA Company Master Data to verify its legal registration.",
      "Verify that the recruiter's email domain matches the company's official corporate domain (not a public Gmail/Yahoo account).",
      "Confirm that an actual interview and formal selection process occurred.",
      "Cross-check open vacancies on the official company careers portal.",
    ],
    recommendedPortals: ["mca_master"],
  },
  freelance: {
    title: "Freelance & Remote Work Verification Guide",
    description: "Freelancers should be wary of clients requesting security deposits, kit costs, or software license fees.",
    keyVerificationSteps: [
      "Use established freelance platforms with escrow payment protection when working with unknown clients.",
      "Never pay money in advance to receive client files or project assignments.",
      "Confirm the client's identity and registered company details before starting extensive work.",
      "Avoid tasks claiming high daily earnings for trivial work like typing, ad clicks, or video likes.",
    ],
    recommendedPortals: ["mca_master"],
  },
  competition: {
    title: "Competition & Hackathon Verification Guide",
    description: "Competitions and awards should have verifiable organizers, published rules, transparent judging panels, and clear sponsor backing.",
    keyVerificationSteps: [
      "Check if the organizer is an established institution, college, or recognized company.",
      "Verify the competition website, rules, and privacy policy independently.",
      "Be cautious if significant registration fees are requested to personal UPI accounts.",
      "Never pay 'handling charges' or 'taxes' to claim an unearned prize.",
    ],
    recommendedPortals: ["mca_master"],
  },
  website: {
    title: "Website & Portal Authenticity Guide",
    description: "Lookalike domains and freshly registered portals often mimic government schemes or reputable companies.",
    keyVerificationSteps: [
      "Examine the domain name carefully for subtle misspellings, hyphenations, or unusual top-level domains (.xyz, .top).",
      "Inspect the domain registration details using Jaanch's Link Checker.",
      "Search for the organization on a trusted search engine and compare the top official result.",
      "Never enter sensitive personal data or financial credentials on unverified websites.",
    ],
    recommendedPortals: ["cybercrime"],
  },
  message_other: {
    title: "General Online Communication Guide",
    description: "Unsolicited messages claiming urgent opportunities, prizes, or job selections should be treated with heightened caution.",
    keyVerificationSteps: [
      "Ask yourself: Did I apply for this or participate in this initiative?",
      "Do not click shortened links (e.g. bit.ly, tinyurl) sent by unknown contacts.",
      "Never share OTPs, Aadhaar numbers, or bank passwords over messaging apps.",
      "Verify the claims independently before sharing or responding.",
    ],
    recommendedPortals: ["cybercrime"],
  },
};
