import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { extractEntities } from "../entities.js";
import { extractOfferFields, checkCompleteness } from "../fields.js";

describe("Entity and Completeness Extraction (Nexora Fixture)", () => {
  const nexoraPath = path.resolve(__dirname, "../../__fixtures__/nexora.txt");
  const nexoraText = fs.readFileSync(nexoraPath, "utf-8");

  it("extracts exact entities from Nexora text", () => {
    const entities = extractEntities(nexoraText);

    // Organization candidates
    expect(entities.organizationCandidates.length).toBeGreaterThan(0);
    const topOrg = entities.organizationCandidates[0];
    expect(topOrg.name).toBe("Nexora Digital Solutions");
    expect(topOrg.confidence).toBe("high");

    // Sender email candidate
    expect(entities.emails.length).toBe(1);
    expect(entities.emails[0].value).toBe("hr@nexora-example.invalid");
    expect(entities.emails[0].evidenceQuote).toContain("hr@nexora-example.invalid");
  });

  it("produces strictly 6 of 10 completeness for Nexora fixture", () => {
    const fields = extractOfferFields(nexoraText);
    const { completeness } = checkCompleteness(fields);

    expect(completeness.score).toBe(6);
    expect(completeness.present).toContain("Organization name");
    expect(completeness.present).toContain("Role or program title");
    expect(completeness.present).toContain("Location or work mode");
    expect(completeness.present).toContain("Duration or event date");
    expect(completeness.present).toContain("Stipend, salary, or prize details");
    expect(completeness.present).toContain("Official contact channel");

    // Missing: eligibility, selection process, deadline, official link
    expect(completeness.missing).toContain("Eligibility criteria");
    expect(completeness.missing).toContain("Selection and evaluation process");
    expect(completeness.missing).toContain("Application deadline");
    expect(completeness.missing).toContain("Official website or application link");

    // Check details contain reasons for missing fields
    const eligDetail = completeness.details?.find((d) => d.key === "eligibility");
    expect(eligDetail?.present).toBe(false);
    expect(eligDetail?.reason).toBeDefined();

    const procDetail = completeness.details?.find((d) => d.key === "selectionProcess");
    expect(procDetail?.present).toBe(false);
    expect(procDetail?.reason).toBeDefined();
  });

  it("guarantees consistency: no field marked present in completeness can be null in extracted fields", () => {
    const fields = extractOfferFields(nexoraText);
    const { completeness } = checkCompleteness(fields);

    for (const item of completeness.details || []) {
      if (item.present) {
        const fieldVal = (fields as any)[item.key];
        expect(fieldVal).not.toBeNull();
        expect(fieldVal.evidenceQuote).toBeDefined();
      }
    }
  });

  it("extracts phones, upiIds, urls, and social handles with whole-word quotes", () => {
    const text = `
      Please reach out to +91 9876543210 or 9876543211.
      Payment can be made to UPI ID user.pay@okaxis.
      Visit our portal at https://careers.example.com.
      Join our official Telegram group at t.me/examplejobs or wa.me/919876543210.
    `;
    const entities = extractEntities(text);

    expect(entities.phones.length).toBeGreaterThanOrEqual(1);
    expect(entities.phones[0].evidenceQuote).toBeDefined();

    expect(entities.upiIds.length).toBe(1);
    expect(entities.upiIds[0].value).toBe("user.pay@okaxis");

    expect(entities.urls.length).toBeGreaterThanOrEqual(1);
    expect(entities.urls.some((u) => u.value.includes("careers.example.com"))).toBe(true);

    expect(entities.socialHandles.length).toBeGreaterThanOrEqual(1);
    expect(entities.socialHandles.some((h) => h.value === "examplejobs")).toBe(true);
  });

  it("extracts 10/10 completeness for Willowbrook fixture (T4)", () => {
    const t4Path = path.resolve(__dirname, "../../__fixtures__/corpus/t4_willowbrook_polished.txt");
    const t4Text = fs.readFileSync(t4Path, "utf-8").replace(/^#[^\n]*\n/gm, "").trim();
    const fields = extractOfferFields(t4Text);
    const { completeness } = checkCompleteness(fields);

    expect(completeness.score).toBe(10);
    expect(completeness.present.length).toBe(10);
    expect(completeness.missing.length).toBe(0);
  });

  it("extracts 6/10 completeness for Sunrise fixture (T5)", () => {
    const t5Path = path.resolve(__dirname, "../../__fixtures__/corpus/t5_sunrise_benign.txt");
    const t5Text = fs.readFileSync(t5Path, "utf-8").replace(/^#[^\n]*\n/gm, "").trim();
    const fields = extractOfferFields(t5Text);
    const { completeness } = checkCompleteness(fields);

    expect(completeness.score).toBe(6);
    expect(completeness.present).toContain("Organization name");
    expect(completeness.present).toContain("Role or program title");
    expect(completeness.present).toContain("Location or work mode");
    expect(completeness.present).toContain("Duration or event date");
    expect(completeness.present).toContain("Stipend, salary, or prize details");
    expect(completeness.present).toContain("Selection and evaluation process");
  });
});
