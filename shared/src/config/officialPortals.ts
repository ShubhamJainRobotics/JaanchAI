export interface PortalDefinition {
  key: string;
  name: string;
  url: string;
  domains: readonly string[];
  use: string;
}

export const OFFICIAL_PORTALS: readonly PortalDefinition[] = [
  {
    key: "nsp",
    name: "National Scholarship Portal",
    url: "https://scholarships.gov.in",
    domains: ["scholarship"],
    use: "Confirm that a government scholarship exists and apply only through the portal.",
  },
  {
    key: "aicte_internship",
    name: "AICTE Internship Portal",
    url: "https://internship.aicte-india.org",
    domains: ["internship"],
    use: "Check whether the organization and internship are listed on the official portal.",
  },
  {
    key: "mca_master",
    name: "MCA – Company Master Data",
    url: "https://www.mca.gov.in",
    domains: ["internship", "job", "freelance", "competition"],
    use: "Look up the company's registration (CIN/LLPIN) and status under 'MCA Services → Company/LLP Master Data'.",
  },
  {
    key: "cybercrime",
    name: "National Cyber Crime Reporting Portal",
    url: "https://cybercrime.gov.in",
    domains: [
      "internship",
      "scholarship",
      "job",
      "freelance",
      "competition",
      "website",
      "message_other",
    ],
    use: "Report online financial fraud or cybercrime.",
  },
] as const;

export const HELPLINE = {
  number: "1930",
  label: "National Cyber Crime Helpline",
} as const;

export const OFFICIAL_DOMAIN_ALLOWLIST = [
  "scholarships.gov.in",
  "aicte-india.org",
  "mca.gov.in",
  "cybercrime.gov.in",
] as const;
