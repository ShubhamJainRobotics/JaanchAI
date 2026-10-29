import { Signal, Severity } from "shared";
import { SignalCard } from "./SignalCard";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface SignalListProps {
  signals: Signal[];
}

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const CATEGORY_NAMES: Record<string, string> = {
  payment: "Payment & Financial Demands",
  urgency: "Urgency & Artificial Deadlines",
  data_request: "Identity & Credential Demands",
  missing_details: "Missing Role / Employer Details",
  channel: "Communication Channel Indicators",
  too_good_to_be_true: "Unrealistic Promises & Earnings",
  link: "Link & Technical Web Signals",
};

export function SignalList({ signals }: SignalListProps) {
  if (signals.length === 0) {
    return (
      <section
        data-testid="signals-section"
        className="surface-card p-6 text-center space-y-2.5 transition-colors"
        aria-label="Observed signals"
      >
        <div className="w-10 h-10 rounded-full bg-status-verified-bg text-status-verified-icon border border-status-verified-border flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          No Warning Signs Observed
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          No common scam markers were detected in this message. Remember that text alone cannot prove authenticity—always verify independently before making commitments.
        </p>
      </section>
    );
  }

  // Group signals by category
  const categories = Array.from(new Set(signals.map((s) => s.category)));

  return (
    <section
      data-testid="signals-section"
      className="space-y-6"
      aria-label={`Observed signals: ${signals.length} findings`}
    >
      <div className="flex items-center gap-2.5 pb-1 border-b border-border">
        <AlertCircle className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          What We Observed ({signals.length})
        </h2>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const catSignals = signals
            .filter((s) => s.category === cat)
            .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {CATEGORY_NAMES[cat] || cat}
              </h3>
              <div className="space-y-3">
                {catSignals.map((signal, idx) => (
                  <SignalCard key={`${signal.ruleId}-${idx}`} signal={signal} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
