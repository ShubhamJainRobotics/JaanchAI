import { AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ADVISORY } from "shared";

export function LimitsCallout() {
  return (
    <section className="py-12 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-md bg-warning/10 border border-warning/30 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-warning/20 text-warning flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Our Non-Negotiable Commitment: Honest Scope & Clear Limits
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Jaanch supports informed decisions. It does NOT prove that an opportunity is genuine or fraudulent.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ADVISORY.limitations.map((limit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-foreground bg-surface p-2.5 rounded-sm border border-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0"></span>
                    <span>{limit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4 text-xs font-semibold text-primary">
                <Link to="/about" className="inline-flex items-center gap-1 hover:underline min-h-[44px]">
                  Read full methodology & planned evaluation metrics
                  <ExternalLink className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
