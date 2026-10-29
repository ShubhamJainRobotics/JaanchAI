import { CheckOutcome } from "shared";
import { CheckCircle2, XCircle, HelpCircle, MinusCircle, UserCheck } from "lucide-react";

interface CheckRowProps {
  label: string;
  outcome: CheckOutcome;
  detail: string;
  source?: string;
  className?: string;
  outcomeLabel?: string;
}

export function CheckRow({
  label,
  outcome,
  detail,
  source,
  className = "",
  outcomeLabel,
}: CheckRowProps) {
  const getOutcomeChip = () => {
    if (outcomeLabel) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-outcome-unknown-bg text-outcome-unknown-fg border border-outcome-unknown-border whitespace-nowrap">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>{outcomeLabel}</span>
        </span>
      );
    }
    switch (outcome) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-outcome-pass-bg text-outcome-pass-fg border border-outcome-pass-border whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Pass</span>
          </span>
        );
      case "fail":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-outcome-fail-bg text-outcome-fail-fg border border-outcome-fail-border whitespace-nowrap">
            <XCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Fail</span>
          </span>
        );
      case "unknown":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-outcome-unknown-bg text-outcome-unknown-fg border border-outcome-unknown-border whitespace-nowrap">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Unknown</span>
          </span>
        );
      case "none_found":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-outcome-none-found-bg text-outcome-none-found-fg border border-outcome-none-found-border whitespace-nowrap">
            <MinusCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>None found</span>
          </span>
        );
      case "not_run":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-outcome-not-run-bg text-outcome-not-run-fg border border-outcome-not-run-border whitespace-nowrap">
            <MinusCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Not run</span>
          </span>
        );
      case "user_attested":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-outcome-user-attested-bg text-outcome-user-attested-fg border border-outcome-user-attested-border whitespace-nowrap">
            <UserCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Confirmed by you</span>
          </span>
        );
    }
  };

  return (
    <div
      data-testid="check-row"
      className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3.5 rounded-md border border-border bg-surface hover:border-border-subtle transition-colors ${className}`}
    >
      <div className="space-y-1 flex-1 min-w-0 pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            {label}
          </span>
          {source && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-surface-raised text-muted-foreground border border-border">
              {source}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
          {detail}
        </p>
      </div>

      <div className="shrink-0 pt-0.5 sm:pt-0">{getOutcomeChip()}</div>
    </div>
  );
}
