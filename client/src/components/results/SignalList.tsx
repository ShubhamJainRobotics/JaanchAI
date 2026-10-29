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

export function SignalList({ signals }: SignalListProps) {
  if (signals.length === 0) {
    return (
      <section
        id="signals-section"
        data-testid="signals-section"
        className="bg-surface border border-border rounded-lg p-6 text-center space-y-2.5 transition-colors"
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

  // Sorted critical -> info per §6.3
  const sortedSignals = [...signals].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <section
      id="signals-section"
      data-testid="signals-section"
      className="bg-surface border border-border rounded-lg p-5 sm:p-6 shadow-xs space-y-4"
      aria-label={`Observed signals: ${signals.length} findings`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground tracking-tight">
            What We Observed ({signals.length})
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          Sorted by severity
        </span>
      </div>

      <div className="divide-y divide-border">
        {sortedSignals.map((signal, idx) => (
          <SignalCard key={`${signal.ruleId}-${idx}`} signal={signal} />
        ))}
      </div>
    </section>
  );
}
