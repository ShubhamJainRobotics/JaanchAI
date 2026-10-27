import { OpportunityDomain, Channel } from "shared";

export interface DemoSample {
  id: string;
  title: string;
  expectedOutcome: string;
  domain: OpportunityDomain;
  channel: Channel;
  claimedOrg?: string;
  text: string;
}

export const DEMO_SAMPLES: readonly DemoSample[] = [
  {
    id: "illustrative_deposit",
    title: "Internship: ₹999 Security Deposit (Walkthrough Example)",
    expectedOutcome: "High Concern (Deposit + Urgency + Direct Selection)",
    domain: "internship",
    channel: "whatsapp",
    claimedOrg: "Global Tech Solutions",
    text: "Congratulations! You have been selected for an internship. Pay ₹999 as a refundable security deposit within two hours to confirm your position. The amount will be 100% refunded with your first month stipend.",
  },
  {
    id: "scholarship_fee",
    title: "Scholarship: Advance GST / Processing Fee",
    expectedOutcome: "High Concern (Pay money to release funds)",
    domain: "scholarship",
    channel: "sms",
    claimedOrg: "National Higher Education Aid",
    text: "Dear Student, your National Merit Scholarship of ₹50,000 has been sanctioned! To release your fund disbursement, please pay ₹1,499 as registration fee and GST within 24 hours to our clearance portal: http://aicte-internship-apply.xyz/verify",
  },
  {
    id: "banking_creds",
    title: "Data Request: OTP & Banking Credentials",
    expectedOutcome: "High Concern (Direct financial credential request)",
    domain: "internship",
    channel: "whatsapp",
    claimedOrg: "Apex Hire",
    text: "For stipend bank transfer authorization, enter your UPI PIN and share your net-banking password with HR immediately on WhatsApp.",
  },
  {
    id: "task_scam",
    title: "Freelance: Earn ₹5,000/day Liking Videos",
    expectedOutcome: "High Concern (Unrealistic earnings + Telegram channel)",
    domain: "freelance",
    channel: "telegram",
    claimedOrg: "Media Promotions Ltd",
    text: "Urgent typing job and data entry from mobile! Earn ₹5,000 per day by doing simple like & subscribe tasks. Work 1 hour daily. Contact only on Telegram @daily_task_payout.",
  },
  {
    id: "vague_unsolicited",
    title: "Vague Offer: Missing Organization & Details",
    expectedOutcome: "Needs Verification (Missing details)",
    domain: "internship",
    channel: "whatsapp",
    text: "Hello candidate, part-time work from home opportunity available for college students. High stipend and certificate provided upon completion. Message on WhatsApp for full details.",
  },
  {
    id: "genuine_internship",
    title: "Authentic Listing: Structured Responsibilities & Stipend",
    expectedOutcome: "No Major Warning Signs (Clear process, duties & no fee)",
    domain: "internship",
    channel: "email",
    claimedOrg: "Acme Technologies Pvt Ltd",
    text: "Acme Technologies Pvt Ltd invites applications for our 3-month Software Engineering Internship. Key responsibilities include frontend feature development and unit testing. Monthly stipend is 25000 INR. Eligibility: Computer Science undergrads. Shortlisted candidates will be invited for an online assessment and technical interview.",
  },
  {
    id: "genuine_non_native",
    title: "Benign Phrasing: Non-Native English",
    expectedOutcome: "No Major Warning Signs (Language fluency not penalized)",
    domain: "internship",
    channel: "email",
    claimedOrg: "Infosys Limited",
    text: "Hello respected student, Infosys Limited hiring trainee engineers for Chennai location. Work is software code writing and testing bug fix. Duration 6 months, stipend 20000 per month. Selected by written interview test next week on campus.",
  },
] as const;
