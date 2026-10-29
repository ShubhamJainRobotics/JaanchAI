import { CheckRow, CheckOutcome } from "shared";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  MinusCircle,
  Minus,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  Plus,
} from "lucide-react";

interface AlreadyCheckedRowProps {
  check: CheckRow;
  onTriggerInput?: (type: "email" | "headers" | "listing" | "org") => void;
}

export function AlreadyCheckedRow({ check, onTriggerInput }: AlreadyCheckedRowProps) {
  const getOutcomeBadge = (outcome: CheckOutcome) => {
    switch (outcome) {
      case "pass":
        return {
          label: "Pass",
          icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
          style: "bg-outcome-pass-bg text-outcome-pass-fg border-outcome-pass-border",
        };
      case "fail":
        return {
          label: "Fail",
          icon: <XCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
          style: "bg-outcome-fail-bg text-outcome-fail-fg border-outcome-fail-border",
        };
      case "unknown":
        return {
          label: "Unknown",
          icon: <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
          style: "bg-outcome-unknown-bg text-outcome-unknown-fg border-outcome-unknown-border",
        };
      case "not_run":
        return {
          label: "Not run",
          icon: <MinusCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
          style: "bg-outcome-not-run-bg text-outcome-not-run-fg border-outcome-not-run-border",
        };
      case "none_found":
        return {
          label: "None found",
          icon: <Minus className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
          style: "bg-outcome-none-found-bg text-outcome-none-found-fg border-outcome-none-found-border",
        };
      case "user_attested":
        return {
          label: "Confirmed by you",
          icon: <UserCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
          style: "bg-outcome-user-attested-bg text-outcome-user-attested-fg border-outcome-user-attested-border",
        };
    }
  };

  const badge = getOutcomeBadge(check.outcome);

  const isMissingHeaders =
    (check.checkKey === "header_authentication" || check.checkKey === "header_spf/dkim/dmarc") &&
    check.outcome === "not_run";
  const isMissingSenderEmail =
    check.checkKey === "sender_domain_match" && check.outcome === "not_run";
  const isOfficialWebsiteRow = check.checkKey === "official_website_registry";

  return (
    <div
      data-testid="already-checked-row"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-md border border-border bg-surface hover:bg-surface-raised/50 transition-colors"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {check.label}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.style} whitespace-nowrap`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </span>

          {check.outcome !== "not_run" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-raised text-muted-foreground border border-border whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 text-primary" aria-hidden="true" />
              <span>Checked by Jaanch</span>
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed break-words font-medium">
          {check.detail}
        </p>

        {isOfficialWebsiteRow && (
          <div className="pt-0.5">
            <a
              href={`https://${check.detail}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-link hover:text-link-hover hover:underline"
            >
              <span>Visit https://{check.detail}</span>
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>

      {/* Inline input trigger for not_run checks */}
      {isMissingHeaders && onTriggerInput && (
        <button
          type="button"
          onClick={() => onTriggerInput("headers")}
          className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-surface-raised hover:bg-surface text-primary border border-border shrink-0 self-start sm:self-auto cursor-pointer print:hidden transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          <span>Add email headers</span>
        </button>
      )}

      {isMissingSenderEmail && onTriggerInput && (
        <button
          type="button"
          onClick={() => onTriggerInput("email")}
          className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-surface-raised hover:bg-surface text-primary border border-border shrink-0 self-start sm:self-auto cursor-pointer print:hidden transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          <span>Add sender email</span>
        </button>
      )}
    </div>
  );
}
