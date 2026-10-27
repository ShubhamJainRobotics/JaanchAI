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
        <div className="rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-800 p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to verify a suspicious message?
            </h2>
            <p className="text-sm sm:text-base text-brand-100 leading-relaxed">
              Takes less than 10 seconds. Works completely without creating an account or providing personal details.
            </p>
            <div className="pt-4 flex justify-center">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-bold text-base shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                Analyze Suspicious Offer
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
