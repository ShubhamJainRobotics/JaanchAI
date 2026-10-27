import { Signal, Severity } from "shared";
import { Quote } from "lucide-react";

interface SignalCardProps {
  signal: Signal;
}

const SEVERITY_STYLES: Record<
  Severity,
  { badge: string; border: string; label: string }
> = {
  critical: {
    badge: "bg-red-100 text-red-800 border-red-300",
    border: "border-l-4 border-l-red-600",
    label: "Critical",
  },
  high: {
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    border: "border-l-4 border-l-orange-500",
    label: "High",
  },
  medium: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    border: "border-l-4 border-l-amber-500",
    label: "Medium",
  },
  low: {
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    border: "border-l-4 border-l-blue-400",
    label: "Low",
  },
  info: {
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    border: "border-l-4 border-l-slate-400",
    label: "Notice",
  },
};

export function SignalCard({ signal }: SignalCardProps) {
  const sev = SEVERITY_STYLES[signal.severity];

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3 ${sev.border}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900">{signal.title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase">
            {signal.ruleId}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${sev.badge}`}
          >
            {sev.label}
          </span>
        </div>
      </div>

      {/* Exact Evidence Quote */}
      {signal.evidenceQuote && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-800">
          <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="italic break-words select-all">
            "{signal.evidenceQuote}"
          </span>
        </div>
      )}

      {/* Why It Matters */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
          Why it matters
        </span>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {signal.whyItMatters}
        </p>
      </div>
    </div>
  );
}
