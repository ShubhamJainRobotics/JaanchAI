import { describe, it, expect } from "vitest";
import { computeIndependentCoverage } from "../coverage.js";
import type { CheckRow } from "../../schemas/index.js";

describe("computeIndependentCoverage", () => {
  it("returns 0 of 8 when no checks are provided", () => {
    const res = computeIndependentCoverage([]);
    expect(res.completed).toBe(0);
    expect(res.total).toBe(8);
    expect(res.label).toBe("Independent checks completed: 0 of 8");
    expect(res.caption).toContain("Counts only checks against sources outside the message");
  });

  it("never counts text rules or completeness rows", () => {
    const checks: CheckRow[] = [
      {
        checkKey: "payment_request",
        label: "Payment request check",
        outcome: "pass",
        detail: "No payment request found",
        source: "rule",
      },
      {
        checkKey: "completeness",
        label: "Offer completeness",
        outcome: "pass",
        detail: "10 of 10 fields present",
        source: "rule",
      },
      {
        checkKey: "sensitive_data_request",
        label: "Data request",
        outcome: "fail",
        detail: "Aadhaar requested",
        source: "rule",
      },
    ];

    const res = computeIndependentCoverage(checks);
    expect(res.completed).toBe(0);
  });

  it("does not count independent checks with unknown or not_run", () => {
    const checks: CheckRow[] = [
      {
        checkKey: "sender_domain",
        label: "Sender domain",
        outcome: "unknown",
        detail: "Not verified",
        source: "dns",
      },
      {
        checkKey: "registry_match",
        label: "Registry match",
        outcome: "not_run",
        detail: "No registry check",
        source: "registry",
      },
    ];

    const res = computeIndependentCoverage(checks);
    expect(res.completed).toBe(0);
  });

  it("counts independent checks with pass, fail, or user_attested", () => {
    const checks: CheckRow[] = [
      {
        checkKey: "sender_domain",
        label: "Sender domain",
        outcome: "pass",
        detail: "Domain matches official website",
        source: "dns",
      },
      {
        checkKey: "domain_age",
        label: "Domain age",
        outcome: "fail",
        detail: "Registered 2 days ago",
        source: "rdap",
      },
      {
        checkKey: "attest_recruiter",
        label: "Recruiter identity",
        outcome: "user_attested",
        detail: "User verified on LinkedIn",
        source: "user_attested",
      },
    ];

    const res = computeIndependentCoverage(checks);
    expect(res.completed).toBe(3);
    expect(res.label).toBe("Independent checks completed: 3 of 8");
    expect(res.completedKeys).toEqual(["sender_domain", "domain_age", "attest_recruiter"]);
  });

  it("handles reported_entities outcome correctly: none_found with identifiers vs zero identifiers", () => {
    // 0 identifiers available (not_run)
    const checkZero: CheckRow[] = [
      {
        checkKey: "reported_entities",
        label: "Reported entities",
        outcome: "not_run",
        detail: "No sender email, phone, UPI ID, domain or link was available to look up.",
        source: "reported_db",
      },
    ];
    expect(computeIndependentCoverage(checkZero).completed).toBe(0);

    // Identifiers checked and none found
    const checkLookedUp: CheckRow[] = [
      {
        checkKey: "reported_entities",
        label: "Reported entities",
        outcome: "none_found",
        detail: "Checked 2 identifiers: UPI ID, domain. No previous reports found.",
        source: "reported_db",
      },
    ];
    const res = computeIndependentCoverage(checkLookedUp);
    expect(res.completed).toBe(1);
    expect(res.completedKeys).toEqual(["reported_entities"]);
  });

  it("supports legacy aliases without double-counting", () => {
    const checks: CheckRow[] = [
      {
        checkKey: "sender_domain_match",
        label: "Sender domain match",
        outcome: "pass",
        detail: "Matched",
        source: "dns",
      },
      {
        checkKey: "sender_domain",
        label: "Sender domain",
        outcome: "pass",
        detail: "Matched",
        source: "dns",
      },
      {
        checkKey: "header_authentication",
        label: "Header auth",
        outcome: "pass",
        detail: "SPF pass",
        source: "header_parse",
      },
      {
        checkKey: "organization_registry_match",
        label: "Org registry match",
        outcome: "pass",
        detail: "MCA matched",
        source: "registry",
      },
      {
        checkKey: "reported_records",
        label: "Reported records",
        outcome: "none_found",
        detail: "Checked 1 identifier: domain",
        source: "reported_db",
      },
    ];

    const res = computeIndependentCoverage(checks);
    expect(res.completed).toBe(4); // sender_domain (not doubled), email_headers, registry_match, reported_entities
  });

  it("counts all 8 independent checks when all are completed", () => {
    const checks: CheckRow[] = [
      { checkKey: "sender_domain", label: "Sender Domain", outcome: "pass", detail: "ok", source: "dns" },
      { checkKey: "email_headers", label: "Email Headers", outcome: "pass", detail: "ok", source: "header_parse" },
      { checkKey: "domain_age", label: "Domain Age", outcome: "pass", detail: "ok", source: "rdap" },
      { checkKey: "registry_match", label: "Registry", outcome: "pass", detail: "ok", source: "registry" },
      { checkKey: "official_listing", label: "Listing", outcome: "pass", detail: "ok", source: "listing_compare" },
      { checkKey: "reported_entities", label: "Reports", outcome: "none_found", detail: "Checked 1 identifier", source: "reported_db" },
      { checkKey: "attest_found_on_official_site", label: "Official Site", outcome: "user_attested", detail: "ok", source: "user_attested" },
      { checkKey: "attest_recruiter", label: "Recruiter", outcome: "user_attested", detail: "ok", source: "user_attested" },
    ];

    const res = computeIndependentCoverage(checks);
    expect(res.completed).toBe(8);
    expect(res.total).toBe(8);
    expect(res.label).toBe("Independent checks completed: 8 of 8");
  });
});
