import { VerificationStatus, CheckRow, STATUS_COPY } from "shared";
import {
  ShieldCheck,
  Info,
  AlertTriangle,
  ShieldAlert,
  Ban,
  Sparkles,
} from "lucide-react";

interface StatusBannerProps {
  status: VerificationStatus;
  ruleScore?: number;
  summary: string;
  aiUsed: boolean;
  aiStatus: string;
  checks?: CheckRow[];
}

export function StatusBanner({
  status,
  summary,
  aiUsed,
  aiStatus,
  checks = [],
}: StatusBannerProps) {
  const copy = STATUS_COPY[status] || STATUS_COPY.NEEDS_REVIEW;

  const getTheme = () => {
    switch (status) {
      case "VERIFIED_OFFICIAL":
        return {
          bg: "bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-100",
          iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
          icon: <ShieldCheck className="w-8 h-8 text-emerald-700 dark:text-emerald-300 shrink-0" aria-hidden="true" />,
          badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
        };
      case "LIKELY_GENUINE":
        return {
          bg: "bg-teal-50 border-teal-300 text-teal-950 dark:bg-teal-950/30 dark:border-teal-800 dark:text-teal-100",
          iconBg: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
          icon: <Info className="w-8 h-8 text-teal-700 dark:text-teal-300 shrink-0" aria-hidden="true" />,
          badge: "bg-teal-100 text-teal-900 border-teal-300",
        };
      case "NEEDS_REVIEW":
        return {
          bg: "bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100",
          iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
          icon: <AlertTriangle className="w-8 h-8 text-amber-700 dark:text-amber-300 shrink-0" aria-hidden="true" />,
          badge: "bg-amber-100 text-amber-900 border-amber-300",
        };
      case "HIGH_RISK":
        return {
          bg: "bg-red-50 border-red-300 text-red-950 dark:bg-red-950/30 dark:border-red-800 dark:text-red-100",
          iconBg: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
          icon: <ShieldAlert className="w-8 h-8 text-red-700 dark:text-red-300 shrink-0" aria-hidden="true" />,
          badge: "bg-red-100 text-red-900 border-red-300",
        };
      case "CONFIRMED_SCAM":
        return {
          bg: "bg-rose-900 text-white border-rose-950 dark:bg-rose-950 dark:border-rose-900",
          iconBg: "bg-rose-800 text-rose-100",
          icon: <Ban className="w-8 h-8 text-rose-100 shrink-0" aria-hidden="true" />,
          badge: "bg-rose-800 text-rose-100 border-rose-700",
        };
    }
  };

  const theme = getTheme();

  // Verification coverage calculation
  const applicableChecks = checks.length;
  const completedChecks = checks.filter((c) =>
    ["pass", "fail", "user_attested", "none_found"].includes(c.outcome)
  ).length;
  const coveragePercent =
    applicableChecks > 0
      ? Math.round((completedChecks / applicableChecks) * 100)
      : 0;

  return (
    <section
      className={`rounded-2xl border p-6 sm:p-7 shadow-xs ${theme.bg}`}
      role="region"
      aria-label="Verification status banner"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-current/15">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-xl border border-current/15 shadow-xs ${theme.iconBg}`}>
            {theme.icon}
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider block opacity-80">
              Verification Status
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight block">
              {copy.label}
            </span>
          </div>
        </div>

        {/* Engine badges (Rule Engine Score is intentionally removed from UI) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {aiUsed && aiStatus === "ok" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 font-semibold border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-600" aria-hidden="true" />
              Gemini AI Context Included
            </span>
          ) : aiUsed && aiStatus !== "ok" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-medium">
              AI Unavailable (Rule Fallback)
            </span>
          ) : null}
        </div>
      </div>

      <div className="py-4 space-y-2">
        <p className="text-sm font-medium opacity-90 leading-relaxed">
          {copy.meaning}
        </p>
        {summary && summary !== copy.meaning && (
          <p className="text-sm sm:text-base font-semibold leading-relaxed pt-1">
            {summary}
          </p>
        )}
      </div>

      {/* Verification coverage meter */}
      {applicableChecks > 0 && (
        <div className="pt-3 border-t border-current/15 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>
              Verification coverage: {completedChecks} of {applicableChecks} checks completed
            </span>
            <span className="font-mono">{coveragePercent}%</span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-current h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${coveragePercent}%` }}
              role="progressbar"
              aria-valuenow={coveragePercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-[11px] opacity-75">
            More completed checks = stronger evidence. It is not a risk percentage.
          </p>
        </div>
      )}
    </section>
  );
}
