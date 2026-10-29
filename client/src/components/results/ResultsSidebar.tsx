import { useEffect, useState } from "react";
import { AnalysisResult, VerificationStatus } from "shared";
import { ExportReportButtons } from "./ExportReportButtons";
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

interface ResultsSidebarProps {
  result: AnalysisResult;
  sections: { id: string; label: string }[];
}

const STATUS_ICONS: Record<VerificationStatus, React.ReactNode> = {
  VERIFIED_OFFICIAL: <CheckCircle2 className="w-4 h-4 text-status-verified-icon shrink-0" aria-hidden="true" />,
  LIKELY_GENUINE: <ShieldCheck className="w-4 h-4 text-status-likely-icon shrink-0" aria-hidden="true" />,
  NEEDS_REVIEW: <AlertTriangle className="w-4 h-4 text-status-review-icon shrink-0" aria-hidden="true" />,
  HIGH_RISK: <AlertOctagon className="w-4 h-4 text-status-high-risk-icon shrink-0" aria-hidden="true" />,
  CONFIRMED_SCAM: <ShieldAlert className="w-4 h-4 text-status-confirmed-scam-icon shrink-0" aria-hidden="true" />,
};

const STATUS_LABELS: Record<VerificationStatus, string> = {
  VERIFIED_OFFICIAL: "Verified Official",
  LIKELY_GENUINE: "Likely Genuine",
  NEEDS_REVIEW: "Needs Review",
  HIGH_RISK: "High Risk",
  CONFIRMED_SCAM: "Confirmed Scam",
};

export function ResultsSidebar({ result, sections }: ResultsSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  const completedChecks = result.checks?.filter(
    (c) => c.outcome === "pass" || c.outcome === "fail"
  ).length || 0;
  const totalChecks = result.checks?.length || 8;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  };

  return (
    <aside className="sticky top-20 space-y-5" aria-label="Results navigation and actions">
      {/* 1. Compact Status Chip & Meter */}
      <div className="bg-surface border border-border rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Current Status
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-surface-raised border border-border text-xs font-bold text-foreground">
            {STATUS_ICONS[result.status]}
            <span>{STATUS_LABELS[result.status]}</span>
          </div>
        </div>

        {/* Coverage Meter */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs font-medium text-foreground">
            <span>Independent checks</span>
            <span className="font-semibold tabular-nums">{completedChecks} of {totalChecks}</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={completedChecks}
            aria-valuemin={0}
            aria-valuemax={totalChecks}
            aria-label="Independent verification checks coverage"
            className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden border border-border"
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
            />
          </div>
        </div>

        {/* Export Actions */}
        <div className="pt-2 border-t border-border">
          <ExportReportButtons result={result} />
        </div>
      </div>

      {/* 2. On This Page Jump List */}
      <div className="bg-surface border border-border rounded-lg p-4 shadow-xs space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
          On This Page
        </h3>
        <nav aria-label="Section shortcuts" className="space-y-1">
          {sections.map((sec) => {
            const isActive = activeId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                className={`w-full min-h-[36px] flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-surface-raised text-primary font-bold border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised/50"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <span>{sec.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
