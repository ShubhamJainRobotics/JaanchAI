import { Signal, Severity, formatQuote } from "shared";
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

const CATEGORY_NAMES: Record<string, string> = {
  payment: "Payment",
  urgency: "Urgency",
  data_request: "Data Request",
  missing_details: "Missing Details",
  channel: "Channel",
  too_good_to_be_true: "Unrealistic Claim",
  link: "Link",
  sender_identity: "Sender Identity",
  source_authenticity: "Source Authenticity",
  reported_record: "Reported Record",
  content_quality: "Content Quality",
};

export function SignalCard({ signal }: SignalCardProps) {
  const sev = SEVERITY_STYLES[signal.severity];
  const isAi = signal.source === "ai" || (signal.ruleId && signal.ruleId.startsWith("AI-"));
  const formattedQuote = formatQuote(signal.evidenceQuote);

  return (
    <div
      className={`signal-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3 ${sev.border}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {signal.title}
        </h4>
        <div className="flex items-center gap-2">
          {isAi ? (
            <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              AI-observed · {CATEGORY_NAMES[signal.category] || signal.category}
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {signal.ruleId}
            </span>
          )}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${sev.badge}`}
          >
            {sev.label}
          </span>
        </div>
      </div>

      {/* Clean Evidence Quote (§7) */}
      {formattedQuote && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 font-sans text-xs text-slate-800 dark:text-slate-200">
          <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="italic break-words select-all">
            "{formattedQuote}"
          </span>
        </div>
      )}

      {/* Why It Matters */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
          Why it matters
        </span>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {signal.whyItMatters}
        </p>
      </div>
    </div>
  );
}
