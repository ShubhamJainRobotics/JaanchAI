export interface KnownOrg {
  name: string;
  tokens: readonly string[];
  officialDomains: readonly string[];
}

export const KNOWN_ORGS: readonly KnownOrg[] = [
  { name: "AICTE", tokens: ["aicte"], officialDomains: ["aicte-india.org", "internship.aicte-india.org"] },
  { name: "National Scholarship Portal", tokens: ["scholarships", "nsp"], officialDomains: ["scholarships.gov.in"] },
  { name: "UGC", tokens: ["ugc"], officialDomains: ["ugc.gov.in", "ugc.ac.in"] },
  { name: "TCS", tokens: ["tcs", "tataconsultancy"], officialDomains: ["tcs.com"] },
  { name: "Infosys", tokens: ["infosys"], officialDomains: ["infosys.com"] },
  { name: "Wipro", tokens: ["wipro"], officialDomains: ["wipro.com"] },
  { name: "HCLTech", tokens: ["hcl", "hcltech"], officialDomains: ["hcltech.com", "hcl.com"] },
  { name: "Accenture", tokens: ["accenture"], officialDomains: ["accenture.com"] },
  { name: "Cognizant", tokens: ["cognizant"], officialDomains: ["cognizant.com"] },
  { name: "Google", tokens: ["google"], officialDomains: ["google.com", "careers.google.com"] },
  { name: "Microsoft", tokens: ["microsoft"], officialDomains: ["microsoft.com", "careers.microsoft.com"] },
  { name: "Amazon", tokens: ["amazon"], officialDomains: ["amazon.com", "amazon.jobs", "amazon.in"] },
  { name: "Flipkart", tokens: ["flipkart"], officialDomains: ["flipkart.com", "flipkartcareers.com"] },
  { name: "Paytm", tokens: ["paytm"], officialDomains: ["paytm.com"] },
  { name: "Unstop", tokens: ["unstop"], officialDomains: ["unstop.com"] },
  { name: "Internshala", tokens: ["internshala"], officialDomains: ["internshala.com"] },
  { name: "LinkedIn", tokens: ["linkedin"], officialDomains: ["linkedin.com"] },
  { name: "NPTEL", tokens: ["nptel"], officialDomains: ["nptel.ac.in"] },
  { name: "ISRO", tokens: ["isro"], officialDomains: ["isro.gov.in"] },
  { name: "DRDO", tokens: ["drdo"], officialDomains: ["drdo.gov.in"] },
  { name: "Reliance", tokens: ["reliance", "jio"], officialDomains: ["ril.com", "jio.com"] },
  { name: "Tata", tokens: ["tata"], officialDomains: ["tata.com"] },
  { name: "IBM", tokens: ["ibm"], officialDomains: ["ibm.com"] },
  { name: "Adobe", tokens: ["adobe"], officialDomains: ["adobe.com"] },
  { name: "Meta", tokens: ["meta", "facebook"], officialDomains: ["meta.com", "about.meta.com"] },
  { name: "Apple", tokens: ["apple"], officialDomains: ["apple.com"] },
  { name: "Capgemini", tokens: ["capgemini"], officialDomains: ["capgemini.com"] },
  { name: "Tech Mahindra", tokens: ["techmahindra"], officialDomains: ["techmahindra.com"] },
  { name: "L&T", tokens: ["larsentoubro", "lnt"], officialDomains: ["larsentoubro.com"] },
  { name: "Swiggy", tokens: ["swiggy"], officialDomains: ["swiggy.com"] },
  { name: "Zomato", tokens: ["zomato"], officialDomains: ["zomato.com"] },
] as const;
