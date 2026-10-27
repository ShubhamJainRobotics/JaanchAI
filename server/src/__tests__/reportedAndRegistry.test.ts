import { describe, it, expect, vi } from "vitest";
import { ReportedService } from "../services/reportedService.js";
import { normalizeOrgName } from "../services/listingService.js";

describe("Reported Entities and Hashing", () => {
  it("generates stable sha256 hashes with pepper", () => {
    const hash1 = ReportedService.hashEntity("email", "Scammer.HR@Gmail.com");
    const hash2 = ReportedService.hashEntity("email", "scammer.hr@gmail.com ");
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes phone numbers to E.164 (+91 standard)", () => {
    const hash1 = ReportedService.hashEntity("phone", "9876543210");
    const hash2 = ReportedService.hashEntity("phone", "+91 98765-43210");
    const hash3 = ReportedService.hashEntity("phone", "09876543210");
    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it("normalizes UPI IDs and social handles", () => {
    const upi1 = ReportedService.hashEntity("upi", "SCAMMER@okicici");
    const upi2 = ReportedService.hashEntity("upi", "scammer@okicici ");
    expect(upi1).toBe(upi2);

    const social1 = ReportedService.hashEntity("social_handle", "@ScamRecruiter");
    const social2 = ReportedService.hashEntity("social_handle", "scamrecruiter");
    expect(social1).toBe(social2);
  });

  it("normalizes URLs and domains", () => {
    const dom1 = ReportedService.hashEntity("domain", "HTTP://WWW.Phishing-Site.com/path?foo=bar");
    const dom2 = ReportedService.hashEntity("domain", "phishing-site.com");
    expect(dom1).toBe(dom2);

    const url1 = ReportedService.hashEntity("url", "https://example.com/apply/now/?ref=123#top");
    const url2 = ReportedService.hashEntity("url", "https://example.com/apply/now");
    expect(url1).toBe(url2);
  });

  it("calls check_reported_entities RPC and maps results cleanly", async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: [
        {
          entity_type: "email",
          value_hash: ReportedService.hashEntity("email", "knownscam@bad.com"),
          status: "confirmed",
          report_count: 5,
        },
      ],
      error: null,
    });

    const mockSupabase: any = {
      rpc: mockRpc,
    };

    const matches = await ReportedService.lookupEntities(mockSupabase, [
      { type: "email", value: "knownscam@bad.com" },
      { type: "phone", value: "9999999999" },
    ]);

    expect(mockRpc).toHaveBeenCalled();
    expect(matches.length).toBe(1);
    expect(matches[0].entityType).toBe("email");
    expect(matches[0].status).toBe("confirmed");
    expect(matches[0].reportCount).toBe(5);
  });

  it("submits scam report via submit_scam_report RPC", async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockSupabase: any = {
      rpc: mockRpc,
    };

    await ReportedService.submitReport(
      mockSupabase,
      "upi",
      "fraud@upi",
      "Demanded ₹1000 fee for exam pass"
    );

    expect(mockRpc).toHaveBeenCalledWith("submit_scam_report", {
      p_entity_type: "upi",
      p_value_hash: ReportedService.hashEntity("upi", "fraud@upi"),
      p_description: "Demanded ₹1000 fee for exam pass",
    });
  });
});

describe("Organization Registry Normalization", () => {
  it("strips legal suffixes and cleans org names for similarity matching", () => {
    expect(normalizeOrgName("Tata Consultancy Services Pvt. Ltd.")).toBe(
      "tataconsultancyservices"
    );
    expect(normalizeOrgName("Infosys Technologies Limited")).toBe("infosys");
    expect(normalizeOrgName("Google India Pvt Ltd")).toBe("googleindia");
  });
});
