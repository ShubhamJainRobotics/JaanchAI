import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { LimitsStrip } from "../components/landing/LimitsStrip";
import { ClosingCta } from "../components/landing/ClosingCta";

export function Landing() {
  return (
    <div className="space-y-0">
      {/* Centered Hero with Problem Statement Pill, Two Action Buttons, and 4 Feature Cards */}
      <Hero />

      {/* 4-Step How It Works Flow with Sample Report Preview */}
      <HowItWorks />

      {/* What Jaanch Can't Do Limitations Strip */}
      <LimitsStrip />

      {/* Closing Call to Action Band */}
      <ClosingCta />
    </div>
  );
}
