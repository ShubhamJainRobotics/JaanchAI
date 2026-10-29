import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";

export function LimitsStrip() {
  const limits = [
    "It cannot prove that an opportunity is 100% genuine or fraudulent.",
    "Some checks may be unavailable if sender headers or corporate listings are missing.",
    "Always independently verify offers through official phone numbers and domains you find yourself.",
  ];

  return (
    <section className="py-10 border-t border-border bg-surface-raised/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-border rounded-lg p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <h2 className="text-base font-bold text-foreground">
              What Jaanch Can't Do
            </h2>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-disc list-inside">
            {limits.map((limit, idx) => (
              <li key={idx} className="leading-relaxed">
                <span>{limit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              We prioritize honest student protection over false confidence.
            </span>
            <Link
              to="/about"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 min-h-[36px] py-1"
            >
              <span>Read the limitations</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
