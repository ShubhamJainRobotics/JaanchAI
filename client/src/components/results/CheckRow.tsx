import { CheckOutcome } from "shared";
import { CheckCircle, XCircle, HelpCircle, MinusCircle, UserCheck } from "lucide-react";

interface CheckRowProps {
  label: string;
  outcome: CheckOutcome;
  detail: string;
  source?: string;
  className?: string;
}

export function CheckRow({
  label,
  outcome,
  detail,
  source,
  className = "",
}: CheckRowProps) {
  const getOutcomeChip = () => {
    switch (outcome) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Pass
          </span>
        );
      case "fail":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
            Fail
          </span>
        );
      case "unknown":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            Unknown
          </span>
        );
      case "none_found":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            None found
          </span>
        );
      case "not_run":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <MinusCircle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            Not run
          </span>
        );
      case "user_attested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Confirmed by you
          </span>
        );
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900/60 dark:border-slate-800 hover:border-slate-300 transition-colors ${className}`}
    >
      <div className="space-y-1 flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {label}
          </span>
          {source && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {source}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words">
          {detail}
        </p>
      </div>

      <div className="shrink-0 pt-0.5 sm:pt-0">{getOutcomeChip()}</div>
    </div>
  );
}
