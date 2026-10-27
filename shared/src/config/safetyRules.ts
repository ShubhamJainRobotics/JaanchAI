export interface SafetyRuleItem {
  id: string;
  title: string;
  description: string;
  actionText?: string;
}

export const STUDENT_SAFETY_RULES: SafetyRuleItem[] = [
  {
    id: "RULE_1_NEVER_PAY",
    title: "Never pay for an opportunity",
    description:
      "Legitimate employers, scholarships, and fellowships will never ask you to pay registration, training, security deposit, software, or documentation fees to receive an offer.",
  },
  {
    id: "RULE_2_PROTECT_DOCS",
    title: "Never share sensitive documents or banking credentials prematurely",
    description:
      "Never share Aadhaar, PAN card, bank account details, debit/credit cards, passwords, or OTPs via chat, email, or unverified forms before a formal onboarding process.",
  },
  {
    id: "RULE_3_NO_DIRECT_CLICK",
    title: "Do not click links directly from unknown messages",
    description:
      "Avoid clicking short links, login portals, or payment requests sent over WhatsApp, Telegram, SMS, or unsolicited emails.",
  },
  {
    id: "RULE_4_SEARCH_INDEPENDENTLY",
    title: "Search the organization independently",
    description:
      "Open your browser and search for the company, foundation, or ministry directly. Check their official website and verify their contact channels.",
  },
  {
    id: "RULE_5_OFFICIAL_CONTACT",
    title: "Use contact details from the official website",
    description:
      "Reach out to HR or program coordinators using the phone numbers and domain-based emails published on the official corporate or institutional website, not the sender's personal number.",
  },
  {
    id: "RULE_6_VERIFY_LISTING",
    title: "Check the opportunity on an official portal",
    description:
      "Ensure the exact job opening, internship post, or scholarship bulletin is publicly listed on the organization's careers portal, university notice board, or verified platform.",
  },
  {
    id: "RULE_7_BEWARE_URGENCY",
    title: "Be cautious of urgency and guaranteed selection",
    description:
      "Phrases like 'Pay within 1 hour', 'Immediate selection without interview', or 'Only 2 seats left' are classic psychological manipulation tactics.",
  },
  {
    id: "RULE_8_REPORT_SCAMS",
    title: "Report suspicious offers immediately",
    description:
      "Report fraud to the Jaanch community and to India's National Cyber Crime Reporting Portal (call 1930 or file on cybercrime.gov.in). Keep messages and receipts as evidence.",
  },
];
