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
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
          style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "fail":
        return {
          label: "Fail",
          icon: <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" aria-hidden="true" />,
          style: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
        };
      case "unknown":
        return {
          label: "Unknown",
          icon: <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
          style: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        };
      case "not_run":
        return {
          label: "Not run",
          icon: <MinusCircle className="w-3 h-3 text-slate-500 dark:text-slate-400" aria-hidden="true" />,
          style: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        };
      case "none_found":
        return {
          label: "None found",
          icon: <Minus className="w-3 h-3 text-slate-500 dark:text-slate-400" aria-hidden="true" />,
          style: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        };
      case "user_attested":
        return {
          label: "Confirmed by you",
          icon: <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />,
          style: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        };
    }
  };

  const badge = getOutcomeBadge(check.outcome);

  // Check if this row is blocked by a missing input
  const isMissingHeaders =
    (check.checkKey === "header_authentication" || check.checkKey === "header_spf/dkim/dmarc") &&
    check.outcome === "not_run";
  const isMissingSenderEmail =
    check.checkKey === "sender_domain_match" && check.outcome === "not_run";
  const isOfficialWebsiteRow = check.checkKey === "official_website_registry";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
            {check.label}
          </span>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.style}`}
          >
            {badge.icon}
            {badge.label}
          </span>

          {check.outcome !== "not_run" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3 h-3 text-slate-500" aria-hidden="true" />
              Checked by Jaanch
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed truncate-2-lines">
          {check.detail}
        </p>

        {isOfficialWebsiteRow && (
          <div className="pt-0.5">
            <a
              href={`https://${check.detail}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>Visit https://{check.detail}</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>

      {/* Inline input trigger for not_run checks */}
      {isMissingHeaders && onTriggerInput && (
        <button
          type="button"
          onClick={() => onTriggerInput("headers")}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 shrink-0 self-start sm:self-auto cursor-pointer print:hidden transition-colors"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          <span>Add email headers</span>
        </button>
      )}

      {isMissingSenderEmail && onTriggerInput && (
        <button
          type="button"
          onClick={() => onTriggerInput("email")}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 shrink-0 self-start sm:self-auto cursor-pointer print:hidden transition-colors"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          <span>Add sender email</span>
        </button>
      )}
    </div>
  );
}
