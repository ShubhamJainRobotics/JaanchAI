import { useState } from "react";
import { NextStep } from "shared";
import { ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { NextStepCard } from "./NextStepCard";

interface YourTurnListProps {
  yourTurn: NextStep[];
  more?: NextStep[];
  completedMap: Record<string, boolean>;
  onToggleStep: (stepKey: string) => void;
  onToggleSubCheck?: (attestationKey: string, currentCompleted: boolean) => void;
  onOpenSafeReply?: () => void;
  busyKey?: string | null;
}

export function YourTurnList({
  yourTurn,
  more = [],
  completedMap,
  onToggleStep,
  onToggleSubCheck,
  onOpenSafeReply,
  busyKey,
}: YourTurnListProps) {
  const [showMore, setShowMore] = useState(false);

  const allVisibleSteps = [...yourTurn, ...(showMore ? more : [])];
  const totalCount = yourTurn.length + more.length;
  const doneCount = allVisibleSteps.filter(
    (s) => completedMap[s.stepKey] ?? s.completed
  ).length;

  const progressPercent =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Your turn manual verification steps"
    >
      {/* Header with progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
            <ListChecks className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Part 2 · Your Turn
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Manual actions requiring independent human judgment. Max 6 prioritized steps.
            </p>
          </div>
        </div>

        {/* Live progress text & bar */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
            aria-live="polite"
          >
            Your turn · {doneCount} of {totalCount} done
          </span>
          <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shrink-0">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-2.5">
        {yourTurn.map((step) => (
          <NextStepCard
            key={step.stepKey}
            step={step}
            completed={Boolean(completedMap[step.stepKey] ?? step.completed)}
            onToggleStep={onToggleStep}
            onToggleSubCheck={onToggleSubCheck}
            onOpenSafeReply={onOpenSafeReply}
            isBusy={busyKey === step.stepKey}
          />
        ))}

        {/* Collapsible accordion for extra steps */}
        {more.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowMore((prev) => !prev)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors print:hidden cursor-pointer"
            >
              <span>
                {showMore
                  ? "Hide additional steps"
                  : `Show ${more.length} more recommended step${
                      more.length > 1 ? "s" : ""
                    }`}
              </span>
              {showMore ? (
                <ChevronUp className="w-4 h-4 text-slate-500" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden="true" />
              )}
            </button>

            {/* Container displayed on toggle OR always in print */}
            <div
              className={`space-y-2.5 pt-2.5 ${
                showMore ? "block" : "hidden print:block"
              }`}
            >
              {more.map((step) => (
                <NextStepCard
                  key={step.stepKey}
                  step={step}
                  completed={Boolean(completedMap[step.stepKey] ?? step.completed)}
                  onToggleStep={onToggleStep}
                  onToggleSubCheck={onToggleSubCheck}
                  onOpenSafeReply={onOpenSafeReply}
                  isBusy={busyKey === step.stepKey}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
