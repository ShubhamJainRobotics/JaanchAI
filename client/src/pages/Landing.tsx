import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { BenefitsGrid } from "../components/landing/BenefitsGrid";
import { LimitsStrip } from "../components/landing/LimitsStrip";
import { ClosingCta } from "../components/landing/ClosingCta";

export function Landing() {
  return (
    <div className="space-y-0">
      {/* 4.1 & 4.2 Hero with Inline Analyzer and Sample Report Preview */}
      <Hero />

      {/* 4.3 4-Step How It Works Flow */}
      <HowItWorks />

      {/* 4.4 Plain-language Benefits Grid with IconTile */}
      <BenefitsGrid />

      {/* 4.5 What Jaanch Can't Do Limitations Strip */}
      <LimitsStrip />

      {/* 4.6 Closing Call to Action Band */}
      <ClosingCta />
    </div>
  );
}
