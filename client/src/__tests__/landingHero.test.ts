import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SHOW_PROBLEM_STATEMENT_BADGE } from "../config/landing";

describe("Landing Hero Configuration & Structure", () => {
  it("exports SHOW_PROBLEM_STATEMENT_BADGE boolean configuration", () => {
    expect(typeof SHOW_PROBLEM_STATEMENT_BADGE).toBe("boolean");
    expect(SHOW_PROBLEM_STATEMENT_BADGE).toBe(true);
  });

  it("Hero component contains two buttons pointing to /analyze and /link-check without inline textarea", () => {
    const heroPath = path.resolve(__dirname, "../components/landing/Hero.tsx");
    const heroCode = fs.readFileSync(heroPath, "utf-8");

    // Must NOT contain textarea or inline analyzer
    expect(heroCode).not.toContain("<textarea");
    expect(heroCode).not.toContain("HeroAnalyzer");

    // Must contain exact H1 clauses with non-breaking space
    expect(heroCode).toContain("Spot Warning Signs");
    expect(heroCode).toContain("Before You Pay or Share Private&nbsp;Data");

    // Must contain exact Subhead wording
    expect(heroCode).toContain(
      "Students encounter hundreds of internship offers, scholarships, and freelance messages online."
    );
    expect(heroCode).toContain("why");
    expect(heroCode).toContain("what you should independently verify");

    // Must contain two buttons
    expect(heroCode).toContain('to="/analyze"');
    expect(heroCode).toContain("Check an Offer Now");
    expect(heroCode).toContain('to="/link-check"');
    expect(heroCode).toContain("Inspect a Link");

    // Must contain 4 feature cards
    expect(heroCode).toContain("Explains why");
    expect(heroCode).toContain('Never says "safe"');
    expect(heroCode).toContain("Checks official sources");
    expect(heroCode).toContain("Screenshots stay on your device");

    // Uses IconTile
    expect(heroCode).toContain("<IconTile");
  });

  it("Landing page does not duplicate BenefitsGrid", () => {
    const landingPath = path.resolve(__dirname, "../pages/Landing.tsx");
    const landingCode = fs.readFileSync(landingPath, "utf-8");

    expect(landingCode).not.toContain("BenefitsGrid");
    expect(landingCode).toContain("<Hero />");
    expect(landingCode).toContain("<HowItWorks />");
    expect(landingCode).toContain("<LimitsStrip />");
    expect(landingCode).toContain("<ClosingCta />");
  });

  it("Privacy copy checks: no misleading browser-side or absolute claims", () => {
    const privacyPath = path.resolve(__dirname, "../pages/Privacy.tsx");
    const privacyCode = fs.readFileSync(privacyPath, "utf-8");
    expect(privacyCode).not.toContain("100% inside your browser");

    const imgUploadPath = path.resolve(__dirname, "../components/analyze/ImageUploadPanel.tsx");
    const imgUploadCode = fs.readFileSync(imgUploadPath, "utf-8");
    expect(imgUploadCode).not.toContain("100% in your browser");

    const howItWorksPath = path.resolve(__dirname, "../components/landing/HowItWorks.tsx");
    const howItWorksCode = fs.readFileSync(howItWorksPath, "utf-8");
    expect(howItWorksCode).not.toContain("Files stay in your browser.");
  });
});
