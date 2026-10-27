import { describe, it, expect } from "vitest";
import { evaluateLink, isOfficialDomain } from "../heuristics.js";
import { extractLinks } from "../extract.js";

describe("Link Heuristics and Lookalike Matching", () => {
  it("recognizes official government portals as NO_MAJOR_WARNING_SIGNS with disclaimer", () => {
    expect(isOfficialDomain("scholarships.gov.in")).toBe(true);
    expect(isOfficialDomain("internship.aicte-india.org")).toBe(true);

    const result = evaluateLink({
      url: "https://scholarships.gov.in/fresh-application",
      hostname: "scholarships.gov.in",
    });

    expect(result.riskLevel).toBe("NO_MAJOR_WARNING_SIGNS");
    expect(result.disclaimer).toContain("Still not confirmation that the offer is genuine");
  });

  it("flags lookalike domains like aicte-internship-apply.xyz as HIGH_CONCERN", () => {
    const result = evaluateLink({
      url: "http://aicte-internship-apply.xyz",
      hostname: "aicte-internship-apply.xyz",
    });

    expect(result.riskLevel).toBe("HIGH_CONCERN");
    expect(result.observations.some((o) => o.includes("AICTE"))).toBe(true);
  });

  it("flags brand typo-squatting via Levenshtein as HIGH_CONCERN", () => {
    const result = evaluateLink({
      url: "http://inf0sys-careers.com",
      hostname: "inf0sys-careers.com",
    });

    expect(result.riskLevel).toBe("HIGH_CONCERN");
    expect(result.observations.some((o) => o.includes("Infosys"))).toBe(true);
  });

  it("flags punycode domains as HIGH_CONCERN", () => {
    const result = evaluateLink({
      url: "https://xn--appl-coa.com",
      hostname: "xn--appl-coa.com",
    });

    expect(result.riskLevel).toBe("HIGH_CONCERN");
    expect(result.observations.some((o) => o.includes("punycode"))).toBe(true);
  });

  it("flags numeric IP addresses as HIGH_CONCERN", () => {
    const result = evaluateLink({
      url: "http://192.168.1.50/login",
      hostname: "192.168.1.50",
    });

    expect(result.riskLevel).toBe("HIGH_CONCERN");
    expect(result.observations.some((o) => o.includes("IP address"))).toBe(true);
  });

  it("flags URL shorteners as NEEDS_VERIFICATION", () => {
    const result = evaluateLink({
      url: "https://bit.ly/3xInternOffer",
      hostname: "bit.ly",
    });

    expect(result.riskLevel).toBe("NEEDS_VERIFICATION");
    expect(result.observations.some((o) => o.includes("Shortened URL"))).toBe(true);
  });

  it("flags young domains (< 30 days old) as HIGH_CONCERN", () => {
    const recentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const result = evaluateLink({
      url: "https://freshly-made-offer-portal.org",
      hostname: "freshly-made-offer-portal.org",
      domainRegisteredAt: recentDate,
      rdapStatus: "ok",
    });

    expect(result.riskLevel).toBe("HIGH_CONCERN");
    expect(result.observations.some((o) => o.includes("registered only"))).toBe(true);
  });

  it("handles unavailable RDAP gracefully with NEEDS_VERIFICATION", () => {
    const result = evaluateLink({
      url: "https://unregistered-tld-custom.sample",
      hostname: "unregistered-tld-custom.sample",
      rdapStatus: "unavailable",
    });

    expect(result.riskLevel).toBe("NEEDS_VERIFICATION");
    expect(result.unverified).toContain("Domain registration date and registrant identity.");
  });

  it("extracts multiple unique links from text correctly", () => {
    const text = "Visit https://internship.aicte-india.org or backup http://bit.ly/sample";
    const links = extractLinks(text);
    expect(links.length).toBe(2);
    expect(links[0].hostname).toBe("internship.aicte-india.org");
    expect(links[1].hostname).toBe("bit.ly");
  });
});
