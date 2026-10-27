import { RiskLevel, RISK_COPY } from "shared";
import { ShieldAlert, AlertTriangle, ShieldCheck, Sparkles, Cpu } from "lucide-react";

interface RiskBannerProps {
  riskLevel: RiskLevel;
  ruleScore: number;
  summary: string;
  aiUsed: boolean;
  aiStatus: string;
}

export function RiskBanner({
  riskLevel,
  ruleScore,
  summary,
  aiUsed,
  aiStatus,
}: RiskBannerProps) {
  const copy = RISK_COPY[riskLevel];

  const renderIcon = () => {
    switch (riskLevel) {
      case "HIGH_CONCERN":
        return <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />;
      case "NEEDS_VERIFICATION":
        return <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />;
      case "NO_MAJOR_WARNING_SIGNS":
        return <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border p-6 sm:p-7 shadow-xs ${copy.cardClass}`}
      role="region"
      aria-label="Risk assessment banner"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-current/10">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/80 shadow-xs border border-current/10">
            {renderIcon()}
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider block opacity-75">
              Risk Level
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              {copy.label}
            </span>
          </div>
        </div>

        {/* Engine badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 font-mono font-medium border border-current/10">
            <Cpu className="w-3.5 h-3.5" />
            Rule Engine Score: {ruleScore}/100
          </span>

          {aiUsed && aiStatus === "ok" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-100 text-brand-800 font-semibold border border-brand-200">
              <Sparkles className="w-3 h-3 text-brand-600" />
              Gemini AI Context Included
            </span>
          ) : aiUsed && aiStatus !== "ok" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              AI Unavailable (Rule Fallback)
            </span>
          ) : null}
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm sm:text-base font-semibold leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  );
}
