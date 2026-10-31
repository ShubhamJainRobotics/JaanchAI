import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("JAANCH UI Specification & Design Tokens Verification", () => {
  it("verifies Header & Navigation Bar matches design specification (§2)", () => {
    const navbarPath = path.resolve(__dirname, "../components/layout/Navbar.tsx");
    const navbarCode = fs.readFileSync(navbarPath, "utf-8");

    // Brand Logo: JAANCH in serif, uppercase, terracotta
    expect(navbarCode).toContain("JAANCH");
    expect(navbarCode).toContain("font-serif");
    expect(navbarCode).toContain("text-terracotta");

    // Sub-brand label: OFFER VERIFICATION
    expect(navbarCode).toContain("OFFER VERIFICATION");

    // Center Links
    expect(navbarCode).toContain("How it works");
    expect(navbarCode).toContain("Coverage & Facts");
    expect(navbarCode).toContain("Verification Guide");
    expect(navbarCode).toContain("Helpline 1930");

    // Language Selectors
    expect(navbarCode).toContain("EN");
    expect(navbarCode).toContain("हिंदी");
    expect(navbarCode).toContain("ಕನ್ನಡ");

    // Sign in & CTA button
    expect(navbarCode).toContain("Sign in");
    expect(navbarCode).toContain("Check an offer");
  });

  it("verifies Hero Section matches design specification (§3 Page 1)", () => {
    const heroPath = path.resolve(__dirname, "../components/landing/Hero.tsx");
    const heroCode = fs.readFileSync(heroPath, "utf-8");

    // Eyebrow
    expect(heroCode).toContain("INDEPENDENT VERIFICATION FOR STUDENTS");

    // Headline with terracotta span
    expect(heroCode).toContain("Know it's real");
    expect(heroCode).toContain("before you reply.");
    expect(heroCode).toContain("text-terracotta");

    // Subtitle
    expect(heroCode).toContain(
      "A free tool that helps Indian students check job, internship and training offers before sharing money or documents."
    );

    // Buttons
    expect(heroCode).toContain("Check an offer");
    expect(heroCode).toContain("See a sample report");

    // 3-Column Mini Feature Strip
    expect(heroCode).toContain("01");
    expect(heroCode).toContain("Don't pay to start");
    expect(heroCode).toContain("02");
    expect(heroCode).toContain("Check the sender");
    expect(heroCode).toContain("03");
    expect(heroCode).toContain("Verify, then reply");

    // Right Column: Official Portals Card
    expect(heroCode).toContain("Official portals are always 100% free.");
    expect(heroCode).toContain("PM Internship Scheme (Ministry of Corporate Affairs)");
    expect(heroCode).toContain("National Career Service (Ministry of Labour)");
    expect(heroCode).toContain("National Scholarship Portal (NSP)");
    expect(heroCode).toContain("Reference: Official Government Portals • Zero Application Fees");
  });

  it("verifies Feature Matrix 4-Column Grid Bar matches specification (§3 Page 2)", () => {
    const matrixPath = path.resolve(__dirname, "../components/landing/FeatureMatrix.tsx");
    const matrixCode = fs.readFileSync(matrixPath, "utf-8");

    expect(matrixCode).toContain("OFFER TYPES COVERED");
    expect(matrixCode).toContain("Comprehensive Coverage");

    expect(matrixCode).toContain("REGIONAL LANGUAGES");
    expect(matrixCode).toContain("English & 12 Indian Scripts");

    expect(matrixCode).toContain("OPEN ACCESS");
    expect(matrixCode).toContain("100% Free & Independent");

    expect(matrixCode).toContain("OFFICIAL REPORTING");
    expect(matrixCode).toContain("National Helpline 1930");
  });

  it("verifies Interactive Submission Card matches specification (§3 Page 3)", () => {
    const cardPath = path.resolve(__dirname, "../components/landing/SubmissionCard.tsx");
    const cardCode = fs.readFileSync(cardPath, "utf-8");

    // Heading & Subtitle
    expect(cardCode).toContain("Submit offer details for verification.");
    expect(cardCode).toContain("Analyzed locally in your browser.");

    // Tab Switcher & Quick Action
    expect(cardCode).toContain("Paste offer text");
    expect(cardCode).toContain("Upload screenshot");
    expect(cardCode).toContain("Paste from clipboard");

    // Textarea & Minimum 25 characters
    expect(cardCode).toContain("minimum 25 characters");
    expect(cardCode).toContain("characters");

    // 3 Realistic Scenarios
    expect(cardCode).toContain("OR TEST WITH REALISTIC SCENARIOS:");
    expect(cardCode).toContain("Fake TechCorp Internship (Deposit Trap)");
    expect(cardCode).toContain("Scholarship Grant KYC Trap");
    expect(cardCode).toContain("Genuine Enterprise Invite (Clean)");

    // Submit Footer
    expect(cardCode).toContain("Check offer");
    expect(cardCode).toContain("Instant local check");
  });

  it("verifies Three Steps Audit Section matches specification (§3 Page 4)", () => {
    const stepsPath = path.resolve(__dirname, "../components/landing/AuditSteps.tsx");
    const stepsCode = fs.readFileSync(stepsPath, "utf-8");

    expect(stepsCode).toContain("How Jaanch audits an offer in three steps.");
    expect(stepsCode).toContain("01");
    expect(stepsCode).toContain("Input & Ingestion");
    expect(stepsCode).toContain("02");
    expect(stepsCode).toContain("Pattern & Domain Verification");
    expect(stepsCode).toContain("03");
    expect(stepsCode).toContain("Risk Assessment & Next Steps");
  });

  it("verifies Guidelines & Helpline Section matches specification (§3 Page 5)", () => {
    const guidePath = path.resolve(__dirname, "../components/landing/GuidelinesAndHelpline.tsx");
    const guideCode = fs.readFileSync(guidePath, "utf-8");

    expect(guideCode).toContain("Recruitment Integrity Guidelines");
    expect(guideCode).toContain("Legitimate hiring standards and student protections");
    expect(guideCode).toContain("National Cyber Crime Reporting Helpline: Dial 1930");
    expect(guideCode).toContain("Call 1930");
    expect(guideCode).toContain("cybercrime.gov.in");
  });

  it("verifies Global Footer & Feedback Pill match specification (§3 Page 6)", () => {
    const footerPath = path.resolve(__dirname, "../components/layout/Footer.tsx");
    const footerCode = fs.readFileSync(footerPath, "utf-8");

    expect(footerCode).toContain("Jaanch");
    expect(footerCode).toContain("जाँच");
    expect(footerCode).toContain("EDUCATIONAL GUIDANCE");
    expect(footerCode).toContain("LOCAL PRIVACY ARCHITECTURE");
    expect(footerCode).toContain("© 2026 Jaanch Student Safety Initiative.");
    expect(footerCode).toContain("Select language:");

    const feedbackPath = path.resolve(__dirname, "../components/layout/FeedbackPill.tsx");
    const feedbackCode = fs.readFileSync(feedbackPath, "utf-8");
    expect(feedbackCode).toContain("Was this helpful?");
  });
});
