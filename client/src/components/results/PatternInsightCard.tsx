import { PatternInsight } from "shared";
import { Lightbulb, Ban, AlertCircle } from "lucide-react";

interface PatternInsightCardProps {
  insight: PatternInsight;
}

export function PatternInsightCard({ insight }: PatternInsightCardProps) {
  return (
    <div
      className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/60 p-5 sm:p-6 shadow-xs space-y-4"
      role="region"
      aria-label="Pattern insight: what usually happens next"
    >
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60 dark:border-amber-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
            <Lightbulb className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-amber-800 dark:text-amber-300 block">
              Pattern Insight
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {insight.heading}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {insight.description}
        </p>

        {insight.dontSendYet && insight.dontSendYet.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-white/80 dark:bg-slate-900/80 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
              <Ban className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Don't send yet:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              {insight.dontSendYet.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-amber-800/80 dark:text-amber-400/80 italic">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>
            Pattern insights reflect observed stages in similar communications. They describe possibilities to prepare for, not certainty about this sender.
          </span>
        </div>
      </div>
    </div>
  );
}
