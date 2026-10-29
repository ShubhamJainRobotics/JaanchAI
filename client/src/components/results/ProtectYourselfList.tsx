import { NextStep } from "shared";
import { ShieldAlert } from "lucide-react";
import { NextStepCard } from "./NextStepCard";
import { AlreadyPaidToggle } from "./AlreadyPaidToggle";

interface ProtectYourselfListProps {
  steps: NextStep[];
  completedMap: Record<string, boolean>;
  onToggleStep: (stepKey: string) => void;
  alreadyPaid: boolean;
  onAlreadyPaidChange: (paid: boolean) => void;
}

export function ProtectYourselfList({
  steps,
  completedMap,
  onToggleStep,
  alreadyPaid,
  onAlreadyPaidChange,
}: ProtectYourselfListProps) {
  const totalCount = steps.length;
  const doneCount = steps.filter(
    (s) => completedMap[s.stepKey] ?? s.completed
  ).length;

  const progressPercent =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="High-risk protection instructions"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-red-200 dark:border-red-950">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-red-950 dark:text-red-200 uppercase tracking-wider">
              Part 2 · Protect Yourself (Immediate Actions)
            </h4>
            <p className="text-[11px] text-red-700 dark:text-red-300">
              High-risk indicators observed. Follow these steps immediately to stay safe.
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className="text-xs font-semibold text-red-900 dark:text-red-300"
            aria-live="polite"
          >
            {doneCount} of {totalCount} completed
          </span>
          <div className="w-20 bg-red-100 dark:bg-red-950/60 rounded-full h-2 overflow-hidden shrink-0">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* "I already paid" toggle */}
      <AlreadyPaidToggle
        checked={alreadyPaid}
        onChange={onAlreadyPaidChange}
      />

      {/* Steps Cards */}
      <div className="space-y-2.5">
        {steps.map((step) => (
          <NextStepCard
            key={step.stepKey}
            step={step}
            completed={Boolean(completedMap[step.stepKey] ?? step.completed)}
            onToggleStep={onToggleStep}
            variant="protect"
          />
        ))}
      </div>
    </div>
  );
}
