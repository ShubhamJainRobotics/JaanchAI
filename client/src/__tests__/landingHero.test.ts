import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("JAANCH UI Specification & Design Tokens Verification", () => {
  const translationsPath = path.resolve(__dirname, "../i18n/translations.ts");
  const translationsCode = fs.readFileSync(translationsPath, "utf-8");

  it("verifies Header & Navigation Bar matches design specification (§2)", () => {
    const navbarPath = path.resolve(__dirname, "../components/layout/Navbar.tsx");
    const navbarCode = fs.readFileSync(navbarPath, "utf-8");
    const combined = navbarCode + translationsCode;

    // Brand Logo: JAANCH in serif, uppercase, terracotta
    expect(navbarCode).toContain("JAANCH");
    expect(navbarCode).toContain("font-serif");
    expect(navbarCode).toContain("text-terracotta");

    // Sub-brand label: OFFER VERIFICATION
    expect(combined).toContain("OFFER VERIFICATION");

    // Center Links
    expect(combined).toContain("How it works");
    expect(combined).toContain("Coverage & Facts");
    expect(combined).toContain("Verification Guide");
    expect(combined).toContain("Helpline 1930");

    // Language Selectors
    expect(navbarCode).toContain("EN");
    expect(navbarCode).toContain("हिंदी");
    expect(navbarCode).toContain("ಕನ್ನಡ");

    // Sign in & CTA button
    expect(combined).toContain("Sign in");
    expect(combined).toContain("Check an offer");
  });

  it("verifies Hero Section matches design specification (§3 Page 1)", () => {
    const heroPath = path.resolve(__dirname, "../components/landing/Hero.tsx");
    const heroCode = fs.readFileSync(heroPath, "utf-8");
    const combined = heroCode + translationsCode;

    // Eyebrow
    expect(combined).toContain("INDEPENDENT VERIFICATION FOR STUDENTS");

    // Headline with terracotta span
    expect(combined).toContain("Know it's real");
    expect(combined).toContain("before you reply.");
    expect(heroCode).toContain("text-terracotta");

    // Subtitle
    expect(combined).toContain(
      "A free tool that helps Indian students check job, internship and training offers before sharing money or documents."
    );

    // Buttons
    expect(combined).toContain("Check an offer");
    expect(combined).toContain("See a sample report");

    // 3-Column Mini Feature Strip
    expect(combined).toContain("01");
    expect(combined).toContain("Don't pay to start");
    expect(combined).toContain("02");
    expect(combined).toContain("Check the sender");
    expect(combined).toContain("03");
    expect(combined).toContain("Verify, then reply");

    // Right Column: Official Portals Card
    expect(combined).toContain("Official portals are always 100% free.");
    expect(combined).toContain("PM Internship Scheme (Ministry of Corporate Affairs)");
    expect(combined).toContain("National Career Service (Ministry of Labour)");
    expect(combined).toContain("National Scholarship Portal (NSP)");
    expect(combined).toContain("Reference: Official Government Portals • Zero Application Fees");
  });

  it("verifies Feature Matrix 4-Column Grid Bar matches specification (§3 Page 2)", () => {
    const matrixPath = path.resolve(__dirname, "../components/landing/FeatureMatrix.tsx");
    const matrixCode = fs.readFileSync(matrixPath, "utf-8");
    const combined = matrixCode + translationsCode;

    expect(combined).toContain("OFFER TYPES COVERED");
    expect(combined).toContain("Comprehensive Coverage");

    expect(combined).toContain("REGIONAL LANGUAGES");
    expect(combined).toContain("English & 12 Indian Scripts");

    expect(combined).toContain("OPEN ACCESS");
    expect(combined).toContain("100% Free & Independent");

    expect(combined).toContain("OFFICIAL REPORTING");
    expect(combined).toContain("National Helpline 1930");
  });

  it("verifies Interactive Submission Card matches specification (§3 Page 3)", () => {
    const cardPath = path.resolve(__dirname, "../components/landing/SubmissionCard.tsx");
    const cardCode = fs.readFileSync(cardPath, "utf-8");
    const combined = cardCode + translationsCode;

    // Heading & Subtitle
    expect(combined).toContain("Submit offer details for verification.");
    expect(combined).toContain("Analyzed locally in your browser.");

    // Tab Switcher & Quick Action
    expect(combined).toContain("Paste offer text");
    expect(combined).toContain("Upload screenshot");
    expect(combined).toContain("Paste from clipboard");

    // Textarea & Minimum 25 characters
    expect(combined).toContain("minimum 25 characters");
    expect(combined).toContain("characters");

    // 3 Realistic Scenarios
    expect(combined).toContain("OR TEST WITH REALISTIC SCENARIOS:");
    expect(combined).toContain("Fake TechCorp Internship (Deposit Trap)");
    expect(combined).toContain("Scholarship Grant KYC Trap");
    expect(combined).toContain("Genuine Enterprise Invite (Clean)");

    // Submit Footer
    expect(combined).toContain("Check offer");
    expect(combined).toContain("Instant local check");
  });

  it("verifies Three Steps Audit Section matches specification (§3 Page 4)", () => {
    const stepsPath = path.resolve(__dirname, "../components/landing/AuditSteps.tsx");
    const stepsCode = fs.readFileSync(stepsPath, "utf-8");
    const combined = stepsCode + translationsCode;

    expect(combined).toContain("How Jaanch audits an offer in three steps.");
    expect(combined).toContain("01");
    expect(combined).toContain("Input & Ingestion");
    expect(combined).toContain("02");
    expect(combined).toContain("Pattern & Domain Verification");
    expect(combined).toContain("03");
    expect(combined).toContain("Risk Assessment & Next Steps");
  });

  it("verifies Guidelines & Helpline Section matches specification (§3 Page 5)", () => {
    const guidePath = path.resolve(__dirname, "../components/landing/GuidelinesAndHelpline.tsx");
    const guideCode = fs.readFileSync(guidePath, "utf-8");
    const combined = guideCode + translationsCode;

    expect(combined).toContain("Recruitment Integrity Guidelines");
    expect(combined).toContain("Legitimate hiring standards and student protections");
    expect(combined).toContain("National Cyber Crime Reporting Helpline: Dial 1930");
    expect(combined).toContain("Call 1930");
    expect(combined).toContain("cybercrime.gov.in");
  });

  it("verifies Global Footer & Feedback Pill match specification (§3 Page 6)", () => {
    const footerPath = path.resolve(__dirname, "../components/layout/Footer.tsx");
    const footerCode = fs.readFileSync(footerPath, "utf-8");
    const combined = footerCode + translationsCode;

    expect(footerCode).toContain("Jaanch");
    expect(footerCode).toContain("जाँच");
    expect(combined).toContain("EDUCATIONAL GUIDANCE");
    expect(combined).toContain("LOCAL PRIVACY ARCHITECTURE");
    expect(combined).toContain("© 2026 Jaanch Student Safety Initiative.");
    expect(combined).toContain("Select language:");

    const feedbackPath = path.resolve(__dirname, "../components/layout/FeedbackPill.tsx");
    const feedbackCode = fs.readFileSync(feedbackPath, "utf-8");
    expect(feedbackCode).toContain("Was this helpful?");
  });
});
