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
});
