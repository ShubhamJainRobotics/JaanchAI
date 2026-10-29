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
    <article
      data-testid="next-step-card"
      className={`step-card p-4 rounded-md border transition-colors space-y-3 ${
        completed
          ? "bg-status-verified-bg/30 border-status-verified-border"
          : "surface-card border-border hover:border-border-subtle shadow-xs"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Large tap-target accessible checkbox (min 44x44px hit container) */}
        <div className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2.5">
          <input
            type="checkbox"
            id={checkboxId}
            checked={completed}
            disabled={isBusy}
            onChange={() => onToggleStep(step.stepKey)}
            className="h-5 w-5 rounded-sm border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer shrink-0 transition"
            aria-label={`Mark step as completed: ${step.title}`}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 pt-1">
          <label
            htmlFor={checkboxId}
            className={`block text-xs sm:text-sm font-bold cursor-pointer transition-colors leading-snug ${
              completed
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {step.title}
          </label>

          {variant === "protect" ? (
            step.whyItMatters ? (
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {step.whyItMatters}
              </p>
            ) : step.howToVerify &&
              step.howToVerify.toLowerCase().trim() !==
                step.title.toLowerCase().trim() ? (
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {step.howToVerify}
              </p>
            ) : null
          ) : (
            <>
              {step.whyItMatters && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.whyItMatters}
                </p>
              )}

              {step.howToVerify &&
                step.howToVerify.toLowerCase().trim() !==
                  step.title.toLowerCase().trim() && (
                  <p className="text-xs text-foreground/90 leading-relaxed pt-0.5">
                    <strong className="font-semibold text-foreground">
                      How to verify:{" "}
                    </strong>
                    {step.howToVerify}
                  </p>
                )}
            </>
          )}

          {/* Action buttons with minimum 44px touch targets */}
          {step.actions && step.actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 pt-2 print:hidden">
              {step.actions.map((action, idx) => {
                if (action.kind === "safe_reply") {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={onOpenSafeReply}
                      className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold bg-surface-raised hover:bg-surface text-primary border border-border cursor-pointer transition-colors"
                    >
                      <Mail className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span>{action.label}</span>
                    </button>
                  );
                }

                if (action.kind === "tel" && action.url) {
                  return (
                    <a
                      key={idx}
                      href={action.url}
                      className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold bg-status-high-risk-bg text-status-high-risk-fg border border-status-high-risk-border hover:opacity-90 transition-colors"
                    >
                      <Phone className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
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
                      className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold bg-surface-raised hover:bg-surface text-foreground border border-border transition-colors"
                    >
                      <span>{action.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    </a>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* Nested Sub-Checks (Attestations) */}
          {step.subChecks && step.subChecks.length > 0 && (
            <div className="pt-3 mt-2 border-t border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Independent Confirmation Sub-checks:
              </span>
              {step.subChecks.map((sc) => {
                const subId = `subcheck-${sc.key}`;
                return (
                  <div
                    key={sc.key}
                    className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface-raised border border-border"
                  >
                    <div className="min-w-[36px] min-h-[36px] flex items-center justify-center -m-1">
                      <input
                        type="checkbox"
                        id={subId}
                        checked={sc.completed}
                        disabled={isBusy}
                        onChange={() =>
                          onToggleSubCheck &&
                          onToggleSubCheck(sc.key, Boolean(sc.completed))
                        }
                        className="h-4 w-4 rounded-sm border-border text-primary focus:ring-ring cursor-pointer shrink-0"
                      />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <label
                          htmlFor={subId}
                          className="text-xs font-medium text-foreground cursor-pointer"
                        >
                          {sc.label}
                        </label>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-outcome-user-attested-bg text-outcome-user-attested-fg border border-outcome-user-attested-border">
                          <UserCheck className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
                          <span>Confirmed by you, not by Jaanch</span>
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
    </article>
  );
}
