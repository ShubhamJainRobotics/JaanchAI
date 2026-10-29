import { Hero } from "../components/landing/Hero";
import { FiveStepFlow } from "../components/landing/FiveStepFlow";
import { ExampleWalkthrough } from "../components/landing/ExampleWalkthrough";
import { LimitsCallout } from "../components/landing/LimitsCallout";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";

export function Landing() {
  return (
    <div className="space-y-12 pb-16">
      <Hero />
      <FiveStepFlow />
      <ExampleWalkthrough />
      <LimitsCallout />

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-surface border border-border p-8 sm:p-12 text-center shadow-elevation-1 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Ready to verify a suspicious message?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Takes less than 10 seconds. Works completely without creating an account or providing personal details.
            </p>
            <div className="pt-4 flex justify-center">
              <Link
                to="/analyze"
                className="min-h-[48px] inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-bold text-base shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                Analyze Suspicious Offer
                <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
