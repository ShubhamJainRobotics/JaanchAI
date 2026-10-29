import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface AnalysisProgressProps {
  onCancel?: () => void;
}

const STEPS = [
  "Reading the message…",
  "Running rule checks…",
  "Looking up domain age…",
  "Building your report…",
];

export function AnalysisProgress({ onCancel }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 350);
    const timer2 = setTimeout(() => setCurrentStep(2), 850);
    const timer3 = setTimeout(() => setCurrentStep(3), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-6 rounded-lg bg-surface border border-border shadow-elevation-1 space-y-5 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 text-primary animate-spin" aria-hidden="true" />
          <h3 className="text-base font-bold text-foreground">
            Analyzing Offer
          </h3>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 p-1 rounded-md hover:bg-surface-raised cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={stepText} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-status-verified-fg" strokeWidth={2} aria-hidden="true" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-border" aria-hidden="true" />
                )}
              </div>
              <span
                className={`font-medium ${
                  isDone
                    ? "text-muted-foreground line-through"
                    : isCurrent
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground/60"
                }`}
              >
                {stepText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Skeletons feedback */}
      <div className="pt-2 space-y-2 border-t border-border">
        <div className="h-3 w-3/4 bg-surface-raised rounded-sm animate-pulse" />
        <div className="h-3 w-1/2 bg-surface-raised rounded-sm animate-pulse" />
      </div>
    </div>
  );
}
