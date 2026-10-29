import { useState } from "react";
import { LinkCheckResult, RISK_COPY } from "shared";
import { Link2, Search, Loader2, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLinkCheck } from "../../hooks/useLinkCheck";

interface LinkInspectorCardProps {
  initialLink: LinkCheckResult;
}

export function LinkInspectorCard({ initialLink }: LinkInspectorCardProps) {
  const [linkData, setLinkData] = useState<LinkCheckResult>(initialLink);
  const linkCheckMutation = useLinkCheck();

  const handleRunDomainCheck = async () => {
    try {
      const updated = await linkCheckMutation.mutateAsync({
        url: linkData.url,
      });
      setLinkData(updated);
    } catch (err) {
      console.error("Link check failed:", err);
    }
  };

  const copy = RISK_COPY[linkData.riskLevel];

  const getRiskBadge = () => {
    switch (linkData.riskLevel) {
      case "HIGH_CONCERN":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold bg-status-high-risk-bg text-status-high-risk-fg border-status-high-risk-border shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{copy.label}</span>
          </span>
        );
      case "NEEDS_VERIFICATION":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold bg-status-review-bg text-status-review-fg border-status-review-border shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{copy.label}</span>
          </span>
        );
      case "NO_MAJOR_WARNING_SIGNS":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold bg-status-likely-bg text-status-likely-fg border-status-likely-border shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{copy.label}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-semibold bg-surface-raised text-muted-foreground border-border shrink-0">
            <span>{copy.label}</span>
          </span>
        );
    }
  };

  return (
    <div className="surface-card p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span className="font-mono text-xs text-foreground break-all select-all font-semibold">
            {linkData.url}
          </span>
        </div>
        {getRiskBadge()}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Observations
          </span>
          <ul className="space-y-1.5 text-foreground/90 font-medium">
            {linkData.observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-primary font-bold" aria-hidden="true">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            What is Unverified
          </span>
          <ul className="space-y-1.5 text-muted-foreground font-medium">
            {linkData.unverified.map((unv, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-warning font-bold" aria-hidden="true">•</span>
                <span>{unv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-border">
        <span className="text-muted-foreground italic leading-normal">{linkData.disclaimer}</span>

        {linkData.rdapStatus === "not_run" ? (
          <button
            type="button"
            disabled={linkCheckMutation.isPending}
            onClick={handleRunDomainCheck}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 btn-secondary font-semibold text-xs rounded-md disabled:opacity-50 transition-colors"
          >
            {linkCheckMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
                <span>Checking RDAP registry...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                <span>Run Live RDAP Domain Check</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-muted-foreground font-mono text-xs">
            RDAP Registration Checked • Status: {linkData.rdapStatus}
          </span>
        )}
      </div>
    </div>
  );
}
