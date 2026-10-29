import { NextStep } from "shared";
import { ExternalLink, UserCheck, Mail, Phone } from "lucide-react";

interface NextStepCardProps {
  step: NextStep;
  completed: boolean;
  onToggleStep: (stepKey: string) => void;
  onToggleSubCheck?: (attestationKey: string, currentCompleted: boolean) => void;
  onOpenSafeReply?: () => void;
  isBusy?: boolean;
  variant?: "standard" | "protect";
}

export function NextStepCard({
  step,
  completed,
  onToggleStep,
  onToggleSubCheck,
  onOpenSafeReply,
  isBusy = false,
  variant = "standard",
}: NextStepCardProps) {
  const checkboxId = `step-check-${step.stepKey}`;

  return (
    <div
      className={`step-card p-4 rounded-xl border transition-all duration-200 space-y-3 ${
        completed
          ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Large tap-target accessible checkbox */}
        <div className="pt-0.5">
          <input
            type="checkbox"
            id={checkboxId}
            checked={completed}
            disabled={isBusy}
            onChange={() => onToggleStep(step.stepKey)}
            className="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0 transition"
            aria-label={`Mark step as completed: ${step.title}`}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <label
            htmlFor={checkboxId}
            className={`block text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
              completed
                ? "line-through text-slate-500 dark:text-slate-400"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {step.title}
          </label>

          {variant === "protect" ? (
            step.whyItMatters ? (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.whyItMatters}
              </p>
            ) : step.howToVerify &&
              step.howToVerify.toLowerCase().trim() !==
                step.title.toLowerCase().trim() ? (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.howToVerify}
              </p>
            ) : null
          ) : (
            <>
              {step.whyItMatters && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  {step.whyItMatters}
                </p>
              )}

              {step.howToVerify &&
                step.howToVerify.toLowerCase().trim() !==
                  step.title.toLowerCase().trim() && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                    <strong className="font-semibold text-slate-800 dark:text-slate-200">
                      How to verify:{" "}
                    </strong>
                    {step.howToVerify}
                  </p>
                )}
            </>
          )}

          {/* Action buttons */}
          {step.actions && step.actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
              {step.actions.map((action, idx) => {
                if (action.kind === "safe_reply") {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={onOpenSafeReply}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 cursor-pointer transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{action.label}</span>
                    </button>
                  );
                }

                if (action.kind === "tel" && action.url) {
                  return (
                    <a
                      key={idx}
                      href={action.url}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{action.label}</span>
                    </a>
                  );
                }

                if (action.url) {
                  return (
                    <a
                      key={idx}
                      href={action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <span>{action.label}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" aria-hidden="true" />
                    </a>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Nested Sub-Checks (Attestations) */}
          {step.subChecks && step.subChecks.length > 0 && (
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Independent Confirmation Sub-checks:
              </span>
              {step.subChecks.map((sc) => {
                const subId = `subcheck-${sc.key}`;
                return (
                  <div
                    key={sc.key}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <input
                      type="checkbox"
                      id={subId}
                      checked={sc.completed}
                      disabled={isBusy}
                      onChange={() =>
                        onToggleSubCheck &&
                        onToggleSubCheck(sc.key, Boolean(sc.completed))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <label
                          htmlFor={subId}
                          className="text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          {sc.label}
                        </label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                          <UserCheck className="w-3 h-3" aria-hidden="true" />
                          Confirmed by you, not by Jaanch
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
