import { AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ADVISORY } from "shared";

export function LimitsCallout() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-amber-50/60 border border-amber-200/80 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Our Non-Negotiable Commitment: Honest Scope & Clear Limits
              </h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Jaanch supports informed decisions. It does NOT prove that an opportunity is genuine or fraudulent.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ADVISORY.limitations.map((limit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-amber-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{limit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-brand-700">
                <Link to="/about" className="inline-flex items-center gap-1 hover:underline">
                  Read full methodology & planned evaluation metrics
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
