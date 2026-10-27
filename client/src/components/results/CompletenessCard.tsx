import { CompletenessResult } from "shared";
import { CheckCircle2, AlertCircle, ListChecks } from "lucide-react";

interface CompletenessCardProps {
  completeness?: CompletenessResult | null;
}

export function CompletenessCard({ completeness }: CompletenessCardProps) {
  if (!completeness) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <ListChecks className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Offer Content Completeness
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completeness.present.length} of 10 essential offer details detected
            </p>
          </div>
        </div>

        <span className="text-sm font-black font-mono px-3 py-1 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100">
          {completeness.score}/10
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {completeness.present.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{item}</span>
          </div>
        ))}

        {completeness.missing.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Missing: {item}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
        Note: Genuine offers occasionally omit dates or links; missing details alone are never cited as proof of fraud, but require review.
      </p>
    </div>
  );
}
