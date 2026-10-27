import { useState } from "react";
import { LinkCheckResult, RISK_COPY } from "shared";
import { Link2, Search, Loader2 } from "lucide-react";
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-mono text-xs text-slate-800 break-all select-all font-semibold">
            {linkData.url}
          </span>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${copy.badgeClass}`}
        >
          {copy.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Observations
          </span>
          <ul className="space-y-1 text-slate-700">
            {linkData.observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-brand-600 font-bold">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            What is Unverified
          </span>
          <ul className="space-y-1 text-slate-600">
            {linkData.unverified.map((unv, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{unv}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-slate-100">
        <span className="text-slate-400 italic">{linkData.disclaimer}</span>

        {linkData.rdapStatus === "not_run" ? (
          <button
            type="button"
            disabled={linkCheckMutation.isPending}
            onClick={handleRunDomainCheck}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {linkCheckMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Checking RDAP registry...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Run Live RDAP Domain Check
              </>
            )}
          </button>
        ) : (
          <span className="text-slate-500 font-mono">
            RDAP Registration Checked • Status: {linkData.rdapStatus}
          </span>
        )}
      </div>
    </div>
  );
}
