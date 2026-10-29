import { Signal, Severity, formatQuote } from "shared";
import {
  Quote,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
} from "lucide-react";

interface SignalCardProps {
  signal: Signal;
}

const SEVERITY_CONFIG: Record<
  Severity,
  {
    badge: string;
    border: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  critical: {
    badge: "bg-severity-critical-bg text-severity-critical-fg border-severity-critical-border",
    border: "border-l-4 border-l-destructive",
    label: "Critical",
    icon: <AlertOctagon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
  },
  high: {
    badge: "bg-severity-high-bg text-severity-high-fg border-severity-high-border",
    border: "border-l-4 border-l-warning",
    label: "High",
    icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
  },
  medium: {
    badge: "bg-severity-medium-bg text-severity-medium-fg border-severity-medium-border",
    border: "border-l-4 border-l-warning",
    label: "Medium",
    icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
  },
  low: {
    badge: "bg-severity-low-bg text-severity-low-fg border-severity-low-border",
    border: "border-l-4 border-l-info",
    label: "Low",
    icon: <Info className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
  },
  info: {
    badge: "bg-severity-info-bg text-severity-info-fg border-severity-info-border",
    border: "border-l-4 border-l-border",
    label: "Notice",
    icon: <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />,
  },
};

const CATEGORY_NAMES: Record<string, string> = {
  payment: "Payment",
  urgency: "Urgency",
  data_request: "Data Request",
  missing_details: "Missing Details",
  channel: "Channel",
  too_good_to_be_true: "Unrealistic Claim",
  link: "Link",
  sender_identity: "Sender Identity",
  source_authenticity: "Source Authenticity",
  reported_record: "Reported Record",
  content_quality: "Content Quality",
};

export function SignalCard({ signal }: SignalCardProps) {
  const sev = SEVERITY_CONFIG[signal.severity] || SEVERITY_CONFIG.info;
  const isAi = signal.source === "ai" || (signal.ruleId && signal.ruleId.startsWith("AI-"));
  const formattedQuote = formatQuote(signal.evidenceQuote);

  return (
    <article
      data-testid="signal-card"
      className={`signal-card surface-card p-4 sm:p-5 shadow-xs space-y-3 transition-colors ${sev.border}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-sm font-bold text-foreground leading-snug">
          {signal.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {isAi ? (
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-raised text-primary border border-border">
              AI-observed · {CATEGORY_NAMES[signal.category] || signal.category}
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-surface-raised text-muted-foreground border border-border">
              {signal.ruleId}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${sev.badge}`}
          >
            {sev.icon}
            <span>{sev.label}</span>
          </span>
        </div>
      </div>

      {/* Evidence Quote */}
      {formattedQuote && (
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-surface-raised border border-border text-xs text-foreground font-sans">
          <Quote className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
          <span className="italic break-words select-all leading-relaxed">
            "{formattedQuote}"
          </span>
        </div>
      )}

      {/* Why It Matters */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
          Why it matters
        </span>
        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
          {signal.whyItMatters}
        </p>
      </div>
    </article>
  );
}
