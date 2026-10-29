import { useState } from "react";
import { Signal, Severity, formatQuote } from "shared";
import {
  Quote,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SignalCardProps {
  signal: Signal;
}

const SEVERITY_CONFIG: Record<
  Severity,
  {
    badge: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  critical: {
    badge: "bg-severity-critical-bg text-severity-critical-fg border-severity-critical-border",
    label: "Critical",
    icon: <AlertOctagon className="w-4 h-4 text-status-high-risk-icon shrink-0" strokeWidth={2} aria-hidden="true" />,
  },
  high: {
    badge: "bg-severity-high-bg text-severity-high-fg border-severity-high-border",
    label: "High",
    icon: <AlertTriangle className="w-4 h-4 text-warning shrink-0" strokeWidth={2} aria-hidden="true" />,
  },
  medium: {
    badge: "bg-severity-medium-bg text-severity-medium-fg border-severity-medium-border",
    label: "Medium",
    icon: <AlertCircle className="w-4 h-4 text-warning shrink-0" strokeWidth={2} aria-hidden="true" />,
  },
  low: {
    badge: "bg-severity-low-bg text-severity-low-fg border-severity-low-border",
    label: "Low",
    icon: <Info className="w-4 h-4 text-info shrink-0" strokeWidth={2} aria-hidden="true" />,
  },
  info: {
    badge: "bg-severity-info-bg text-severity-info-fg border-severity-info-border",
    label: "Notice",
    icon: <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />,
  },
};

export function SignalCard({ signal }: SignalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[signal.severity] || SEVERITY_CONFIG.info;
  const isAi = signal.source === "ai" || (signal.ruleId && signal.ruleId.startsWith("AI-"));
  const formattedQuote = formatQuote(signal.evidenceQuote);

  return (
    <article
      data-testid="signal-card"
      className="py-3.5 border-b border-border last:border-b-0 space-y-2 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">{sev.icon}</div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-foreground leading-snug">
                {signal.title}
              </h4>
              <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-surface-raised border border-border text-muted-foreground font-mono">
                {isAi ? "AI-observed" : `Rule: ${signal.ruleId}`}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-sm border font-semibold ${sev.badge}`}
              >
                <span>{sev.label}</span>
              </span>
            </div>

            {/* Short Quote */}
            {formattedQuote && (
              <p className="font-mono text-xs text-muted-foreground italic flex items-center gap-1.5 pt-0.5 break-all">
                <Quote className="w-3 h-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                <span>"{formattedQuote}"</span>
              </p>
            )}
          </div>
        </div>

        {/* Expand Trigger for Why It Matters */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="min-h-[36px] px-2 py-1 text-xs font-semibold text-primary hover:text-primary-hover hover:bg-surface-raised rounded-md transition-colors flex items-center gap-1 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse why it matters" : "Expand why it matters"}
        >
          <span>{isExpanded ? "Less" : "Why"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Expandable Why It Matters Drill-down */}
      {isExpanded && (
        <div className="mt-2 pl-6 text-xs text-foreground bg-surface-raised/60 p-3 rounded-md border border-border space-y-1">
          <strong className="font-bold text-foreground block">Why it matters:</strong>
          <p className="text-muted-foreground leading-relaxed">
            {signal.whyItMatters}
          </p>
        </div>
      )}
    </article>
  );
}
