import { Hero } from "../components/landing/Hero";
import { FeatureMatrix } from "../components/landing/FeatureMatrix";
import { SubmissionCard } from "../components/landing/SubmissionCard";
import { AuditSteps } from "../components/landing/AuditSteps";
import { GuidelinesAndHelpline } from "../components/landing/GuidelinesAndHelpline";

export function Landing() {
  return (
    <div className="space-y-0">
      {/* Page 1: Hero Section */}
      <Hero />

      {/* Page 2: Feature Matrix (4-Column Grid Bar) */}
      <FeatureMatrix />

      {/* Page 3: Interactive Submission Card */}
      <SubmissionCard />

      {/* Page 4: How Jaanch audits an offer in three steps */}
      <AuditSteps />

      {/* Page 5: Guidelines & Helpline Section */}
      <GuidelinesAndHelpline />
    </div>
  );
}
