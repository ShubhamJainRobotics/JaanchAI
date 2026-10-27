import { describe, it, expect } from "vitest";
import { parseEmailAddress, analyzeSenderEmail } from "../email.js";
import { parseEmailHeaders, HEADER_COPY_HELP } from "../headers.js";

describe("Sender Identity & Email Analysis", () => {
  it("parses Name <address@domain> and bare email correctly", () => {
    const withName = parseEmailAddress("Acme HR <careers@acme.com>");
    expect(withName.displayName).toBe("Acme HR");
    expect(withName.email).toBe("careers@acme.com");
    expect(withName.domain).toBe("acme.com");
    expect(withName.registrableDomain).toBe("acme.com");

    const bare = parseEmailAddress("candidate@gmail.com");
    expect(bare.displayName).toBeNull();
    expect(bare.email).toBe("candidate@gmail.com");
    expect(bare.domain).toBe("gmail.com");
    expect(bare.registrableDomain).toBe("gmail.com");
  });

  it("identifies free mail domains", () => {
    const res = analyzeSenderEmail("recruiter@gmail.com");
    expect(res.isFreeMail).toBe(true);
    expect(res.matchesRegistryOrg).toBe(false);
  });

  it("identifies exact match against registry official domains", () => {
    const res = analyzeSenderEmail("careers@tcs.com", {
      claimedOrg: "Tata Consultancy Services",
      officialDomains: ["tcs.com"],
    });
    expect(res.matchesRegistryOrg).toBe(true);
    expect(res.isFreeMail).toBe(false);
    expect(res.consistencyIssue).toBeNull();
  });

  it("flags consistency issue when claimed org uses free mail", () => {
    const res = analyzeSenderEmail("globaltech-hr@gmail.com", {
      claimedOrg: "Global Tech Solutions",
      officialDomains: ["globaltech.com"],
    });
    expect(res.consistencyIssue).toContain("personal webmail host");
  });

  it("flags local-part impersonation on free mail e.g. hr.microsoft.careers@gmail.com", () => {
    const res = analyzeSenderEmail("hr.microsoft.careers@gmail.com");
    expect(res.isLookalike).toBe(true);
    expect(res.lookalikeDetails).toContain("microsoft");
  });
});

describe("Email Header Parser & Fixtures", () => {
  it("Fixture 1: Valid Gmail Authentication-Results (dmarc=pass, spf=pass, dkim=pass)", () => {
    const rawHeaders = `
From: Example Careers <careers@example.com>
To: student@college.edu
Subject: Offer of Internship
Date: Mon, 26 Oct 2026 10:00:00 +0530
Return-Path: <bounce@example.com>
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com; s=google;
Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com header.s=google header.b=XyZ;
       spf=pass (google.com: domain of bounce@example.com designates 192.0.2.1 as permitted sender) smtp.mailfrom=bounce@example.com;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=example.com
Received: from mail.example.com (mail.example.com [192.0.2.1]) by mx.google.com; Mon, 26 Oct 2026 10:00:01 +0530
    `.trim();

    const analysis = parseEmailHeaders(rawHeaders);
    expect(analysis.from).toBe("careers@example.com");
    expect(analysis.authResults.spf).toBe("pass");
    expect(analysis.authResults.dkim).toBe("pass");
    expect(analysis.authResults.dmarc).toBe("pass");
    expect(analysis.dkimDomain).toBe("example.com");
    expect(analysis.alignment.spf).toBe(true);
    expect(analysis.alignment.dkim).toBe(true);
    expect(analysis.mismatches.length).toBe(0);
  });

  it("Fixture 2: Spoofed sender with Authentication-Results failure (spf=fail, dmarc=fail)", () => {
    const rawHeaders = `
From: Microsoft HR <careers@microsoft.com>
Return-Path: <spammer@suspicious.net>
Authentication-Results: mx.google.com;
       spf=fail (google.com: domain of spammer@suspicious.net does not designate 198.51.100.1 as permitted sender);
       dkim=fail header.i=@microsoft.com;
       dmarc=fail (p=REJECT) header.from=microsoft.com
Received: from fake.host (fake.host [198.51.100.1])
    `.trim();

    const analysis = parseEmailHeaders(rawHeaders);
    expect(analysis.authResults.spf).toBe("fail");
    expect(analysis.authResults.dkim).toBe("fail");
    expect(analysis.authResults.dmarc).toBe("fail");
    expect(analysis.mismatches.some((m) => m.includes("Return-Path"))).toBe(true);
  });

  it("Fixture 3: Softfail from Received-SPF header", () => {
    const rawHeaders = `
From: Recruiter <recruiter@unverified.org>
Return-Path: <recruiter@unverified.org>
Received-SPF: softfail (google.com: domain of transitioning recruiter@unverified.org does not designate IP)
    `.trim();

    const analysis = parseEmailHeaders(rawHeaders);
    expect(analysis.authResults.spf).toBe("softfail");
    expect(analysis.authResults.dkim).toBe("unknown");
    expect(analysis.authResults.dmarc).toBe("unknown");
  });

  it("Fixture 4: Missing authentication headers completely", () => {
    const rawHeaders = `
From: Unknown <unknown@domain.com>
Subject: Test
Date: Mon, 26 Oct 2026 12:00:00 +0000
    `.trim();

    const analysis = parseEmailHeaders(rawHeaders);
    expect(analysis.authResults.spf).toBe("unknown");
    expect(analysis.authResults.dkim).toBe("unknown");
    expect(analysis.authResults.dmarc).toBe("unknown");
    expect(analysis.receivedChainCount).toBe(0);
  });

  it("Fixture 5: Reply-To domain mismatch", () => {
    const rawHeaders = `
From: Official HR <hr@legitcorp.com>
Reply-To: Scammer Direct <payouts@gmail.com>
Return-Path: <hr@legitcorp.com>
Authentication-Results: mx.google.com; spf=pass; dkim=pass; dmarc=pass
    `.trim();

    const analysis = parseEmailHeaders(rawHeaders);
    expect(analysis.mismatches.some((m) => m.includes("Reply-To"))).toBe(true);
  });

  it("Fixture 6: DKIM domain misalignment with From domain", () => {
    const rawHeaders = `
From: Bank Officer <support@bank.com>
Return-Path: <support@bank.com>
DKIM-Signature: v=1; a=rsa-sha256; d=thirdpartysender.net;
Authentication-Results: mx.google.com; spf=pass; dkim=pass; dmarc=fail
    `.trim();

    const analysis = parseEmailHeaders(rawHeaders);
    expect(analysis.dkimDomain).toBe("thirdpartysender.net");
    expect(analysis.alignment.dkim).toBe(false);
  });

  it("provides client help instructions for Gmail, Outlook, and Apple Mail", () => {
    expect(HEADER_COPY_HELP.gmail.steps.some((s) => s.includes("Show original"))).toBe(true);
    expect(HEADER_COPY_HELP.outlook.steps.some((s) => s.includes("View message source"))).toBe(true);
    expect(HEADER_COPY_HELP.appleMail.steps.some((s) => s.includes("All Headers"))).toBe(true);
  });
});
