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
      data-testid="protect-yourself-list"
      className="space-y-4"
      role="region"
      aria-label="High-risk protection instructions"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-status-high-risk-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-status-high-risk-bg text-status-high-risk-icon border border-status-high-risk-border">
            <ShieldAlert className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
              Part 2 · Protect Yourself (Immediate Actions)
            </h3>
            <p className="text-xs text-muted-foreground">
              High-concern indicators observed. Follow these steps immediately to stay safe.
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <span
            className="text-xs font-semibold text-foreground/90 tabular-nums"
            aria-live="polite"
          >
            {doneCount} of {totalCount} completed
          </span>
          <div className="w-20 bg-surface-raised rounded-full h-2 overflow-hidden shrink-0 border border-border">
            <div
              className="bg-destructive h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Protection progress: ${doneCount} of ${totalCount} steps completed`}
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
