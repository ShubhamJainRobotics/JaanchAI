import { VerificationStatus, CheckRow, STATUS_COPY, computeIndependentCoverage } from "shared";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
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
          containerClass: "bg-status-verified-bg border-status-verified-border text-status-verified-fg",
          iconContainer: "bg-surface/80 border-status-verified-border text-status-verified-icon",
          icon: <ShieldCheck className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />,
          statusType: "Verified Official",
        };
      case "LIKELY_GENUINE":
        return {
          containerClass: "bg-status-likely-bg border-status-likely-border text-status-likely-fg",
          iconContainer: "bg-surface/80 border-status-likely-border text-status-likely-icon",
          icon: <CheckCircle2 className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />,
          statusType: "Likely Genuine",
        };
      case "NEEDS_REVIEW":
        return {
          containerClass: "bg-status-review-bg border-status-review-border text-status-review-fg",
          iconContainer: "bg-surface/80 border-status-review-border text-status-review-icon",
          icon: <AlertCircle className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />,
          statusType: "Needs Review",
        };
      case "HIGH_RISK":
        return {
          containerClass: "bg-status-high-risk-bg border-status-high-risk-border text-status-high-risk-fg",
          iconContainer: "bg-surface/80 border-status-high-risk-border text-status-high-risk-icon",
          icon: <AlertTriangle className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />,
          statusType: "High Concern",
        };
      case "CONFIRMED_SCAM":
        return {
          containerClass: "bg-status-confirmed-scam-bg border-status-confirmed-scam-border text-status-confirmed-scam-fg",
          iconContainer: "bg-surface/80 border-status-confirmed-scam-border text-status-confirmed-scam-icon",
          icon: <ShieldAlert className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />,
          statusType: "Confirmed Scam",
        };
    }
  };

  const theme = getTheme();
  const coverage = computeIndependentCoverage(checks);

  return (
    <section
      data-testid="status-banner"
      className={`rounded-lg border p-6 sm:p-7 shadow-sm transition-colors ${theme.containerClass}`}
      role="region"
      aria-label="Verification status banner"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-current/20">
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-md border shadow-xs ${theme.iconContainer}`}>
            {theme.icon}
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider block opacity-85">
              Verification Status
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight block">
              {copy.label}
            </h1>
          </div>
        </div>

        {/* AI status badge if included */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {aiUsed && aiStatus === "ok" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-foreground font-semibold border border-current/25 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>Gemini AI Context Included</span>
            </span>
          ) : aiUsed && aiStatus !== "ok" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-raised text-muted-foreground font-medium border border-border">
              <span>AI Unavailable (Rule Fallback)</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="py-4 space-y-2">
        <p className="text-sm font-semibold opacity-95 leading-relaxed">
          {copy.meaning}
        </p>
        {summary && summary !== copy.meaning && (
          <p className="text-sm sm:text-base font-medium opacity-90 leading-relaxed pt-1">
            {summary}
          </p>
        )}
      </div>

      {/* Verification coverage meter */}
      <div
        data-testid="coverage-meter"
        className="pt-3 border-t border-current/20 space-y-2"
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>{coverage.label}</span>
          <span className="tabular-nums font-mono text-xs opacity-90">
            {coverage.completed} / {coverage.total}
          </span>
        </div>
        <div className="w-full bg-current/15 rounded-full h-2 overflow-hidden">
          <div
            className="bg-current h-2 rounded-full transition-all duration-300"
            style={{ width: `${(coverage.completed / coverage.total) * 100}%` }}
            role="progressbar"
            aria-valuenow={coverage.completed}
            aria-valuemin={0}
            aria-valuemax={coverage.total}
            aria-label={`${coverage.label}: ${coverage.completed} of ${coverage.total} completed`}
          />
        </div>
        <p className="text-xs opacity-80 leading-normal">
          {coverage.caption}
        </p>
      </div>
    </section>
  );
}
