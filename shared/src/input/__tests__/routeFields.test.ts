import { describe, it, expect } from "vitest";
import { routeFields } from "../routeFields.js";

describe("routeFields input routing & form validation (§3)", () => {
  it("moves email in claimedOrg to sender.email when sender.email is empty", () => {
    const input = {
      text: "We are offering an internship at Microsoft India.",
      domain: "internship" as const,
      claimedOrg: "careers@microsoft-hiring-india.invalid",
    };

    const res = routeFields(input);
    expect(res.request.claimedOrg).toBeUndefined();
    expect(res.request.sender?.email).toBe("careers@microsoft-hiring-india.invalid");
    expect(res.notices.length).toBe(1);
    expect(res.notices[0]).toContain("moved 'careers@microsoft-hiring-india.invalid' to the sender email field");
  });

  it("removes email in claimedOrg when sender.email is already filled", () => {
    const input = {
      text: "Sample internship offer text here.",
      domain: "internship" as const,
      claimedOrg: "scam@badsite.com",
      sender: {
        email: "hr@company.com",
      },
    };

    const res = routeFields(input);
    expect(res.request.claimedOrg).toBeUndefined();
    expect(res.request.sender?.email).toBe("hr@company.com");
    expect(res.notices.length).toBe(1);
    expect(res.notices[0]).toContain("removed 'scam@badsite.com' from the organization field");
  });

  it("moves URL in claimedOrg to sender.websiteUrl", () => {
    const input = {
      text: "Sample internship offer text here.",
      domain: "internship" as const,
      claimedOrg: "www.merit-scholarship-india.invalid/pay",
    };

    const res = routeFields(input);
    expect(res.request.claimedOrg).toBeUndefined();
    expect(res.request.sender?.websiteUrl).toBe("https://www.merit-scholarship-india.invalid/pay");
    expect(res.notices.length).toBe(1);
    expect(res.notices[0]).toContain("moved 'www.merit-scholarship-india.invalid/pay' to the sender website field");
  });

  it("moves phone in claimedOrg to sender.phone", () => {
    const input = {
      text: "Sample internship offer text here.",
      domain: "internship" as const,
      claimedOrg: "+91 9876543210",
    };

    const res = routeFields(input);
    expect(res.request.claimedOrg).toBeUndefined();
    expect(res.request.sender?.phone).toBe("+91 9876543210");
    expect(res.notices.length).toBe(1);
    expect(res.notices[0]).toContain("moved '+91 9876543210' to the sender phone field");
  });

  it("moves UPI ID in claimedOrg to sender.upiId", () => {
    const input = {
      text: "Sample internship offer text here.",
      domain: "internship" as const,
      claimedOrg: "brightpath.hr@okbank",
    };

    const res = routeFields(input);
    expect(res.request.claimedOrg).toBeUndefined();
    expect(res.request.sender?.upiId).toBe("brightpath.hr@okbank");
    expect(res.notices.length).toBe(1);
    expect(res.notices[0]).toContain("moved 'brightpath.hr@okbank' to the sender UPI ID field");
  });

  it("moves non-email org name in sender.email to claimedOrg when empty", () => {
    const input = {
      text: "Sample internship offer text here.",
      domain: "internship" as const,
      sender: {
        email: "Willowbrook Analytics Pvt. Ltd.",
      },
    };

    const res = routeFields(input);
    expect(res.request.claimedOrg).toBe("Willowbrook Analytics Pvt. Ltd.");
    expect(res.request.sender?.email).toBeUndefined();
    expect(res.notices.length).toBe(1);
    expect(res.notices[0]).toContain("moved 'Willowbrook Analytics Pvt. Ltd.' from the email field to organization name");
  });

  it("leaves normal valid inputs unchanged without notices", () => {
    const input = {
      text: "Sample internship offer text here for Nexora.",
      domain: "internship" as const,
      claimedOrg: "Nexora Digital Solutions",
      sender: {
        email: "careers@nexora.example",
      },
    };

    const res = routeFields(input);
    expect(res.request.claimedOrg).toBe("Nexora Digital Solutions");
    expect(res.request.sender?.email).toBe("careers@nexora.example");
    expect(res.notices.length).toBe(0);
  });

  it("clears invalid email when claimedOrg is already filled", () => {
    const input = {
      text: "Offer text here.",
      domain: "internship" as const,
      claimedOrg: "Existing Corp",
      sender: {
        email: "not-an-email-or-domain",
      },
    };
    const res = routeFields(input);
    expect(res.request.claimedOrg).toBe("Existing Corp");
    expect(res.request.sender?.email).toBeUndefined();
    expect(res.notices[0]).toContain("cleared invalid email");
  });

  it("moves invalid phone with letters to claimedOrg when claimedOrg is empty", () => {
    const input = {
      text: "Offer text here.",
      domain: "internship" as const,
      sender: {
        phone: "Acme Corp 123",
      },
    };
    const res = routeFields(input);
    expect(res.request.claimedOrg).toBe("Acme Corp 123");
    expect(res.request.sender?.phone).toBeUndefined();
    expect(res.notices[0]).toContain("moved 'Acme Corp 123' from phone to organization name");
  });

  it("clears invalid phone with letters when claimedOrg is already filled", () => {
    const input = {
      text: "Offer text here.",
      domain: "internship" as const,
      claimedOrg: "Existing Corp",
      sender: {
        phone: "Acme Corp 123",
      },
    };
    const res = routeFields(input);
    expect(res.request.claimedOrg).toBe("Existing Corp");
    expect(res.request.sender?.phone).toBeUndefined();
    expect(res.notices[0]).toContain("cleared invalid phone");
  });

  it("moves URL in sender.email to sender.websiteUrl", () => {
    const input = {
      text: "Offer text here.",
      domain: "internship" as const,
      sender: {
        email: "https://nexora.example/careers",
      },
    };
    const res = routeFields(input);
    expect(res.request.sender?.email).toBeUndefined();
    expect(res.request.sender?.websiteUrl).toBe("https://nexora.example/careers");
    expect(res.notices[0]).toContain("moved 'https://nexora.example/careers' from email to sender website");
  });
});
