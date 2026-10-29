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
      data-testid="your-turn-list"
      className="space-y-4"
      role="region"
      aria-label="Your turn manual verification steps"
    >
      {/* Header with progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-surface-raised text-primary">
            <ListChecks className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              Part 2 · Your Turn
            </h3>
            <p className="text-xs text-muted-foreground">
              Manual actions requiring independent human judgment. Max 6 prioritized steps.
            </p>
          </div>
        </div>

        {/* Live progress text & bar */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <span
            className="text-xs font-semibold text-foreground/90 tabular-nums"
            aria-live="polite"
          >
            Your turn · {doneCount} of {totalCount} done
          </span>
          <div className="w-20 bg-surface-raised rounded-full h-2 overflow-hidden shrink-0 border border-border">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress: ${doneCount} of ${totalCount} steps completed`}
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
              className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-md border border-border bg-surface-raised hover:bg-surface text-xs font-bold text-foreground transition-colors print:hidden cursor-pointer"
            >
              <span>
                {showMore
                  ? "Hide additional steps"
                  : `Show ${more.length} more recommended step${
                      more.length > 1 ? "s" : ""
                    }`}
              </span>
              {showMore ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
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
