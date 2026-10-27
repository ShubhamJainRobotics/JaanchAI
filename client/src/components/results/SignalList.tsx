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
  payment: "Payment & Financial Requests",
  urgency: "Urgency & Pressure Tactics",
  data_request: "Identity & Credential Requests",
  missing_details: "Missing Role / Employer Details",
  channel: "Communication Channel Indicators",
  too_good_to_be_true: "Unrealistic Promises & Claims",
  link: "Link & Technical Web Signals",
};

export function SignalList({ signals }: SignalListProps) {
  if (signals.length === 0) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Warning Signs Observed</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No common scam markers were detected in this message. Remember that text alone cannot prove authenticity—always verify independently.
        </p>
      </div>
    );
  }

  // Group signals by category
  const categories = Array.from(new Set(signals.map((s) => s.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-brand-600" />
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          What We Observed ({signals.length})
        </h3>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const catSignals = signals
            .filter((s) => s.category === cat)
            .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

          return (
            <div key={cat} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {CATEGORY_NAMES[cat] || cat}
              </h4>
              <div className="space-y-3">
                {catSignals.map((signal, idx) => (
                  <SignalCard key={`${signal.ruleId}-${idx}`} signal={signal} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
