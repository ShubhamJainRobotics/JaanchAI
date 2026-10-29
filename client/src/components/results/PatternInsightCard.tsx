import { PatternInsight } from "shared";
import { Lightbulb, Ban, AlertCircle } from "lucide-react";

interface PatternInsightCardProps {
  insight: PatternInsight;
}

export function PatternInsightCard({ insight }: PatternInsightCardProps) {
  return (
    <section
      data-testid="pattern-insight-card"
      className="surface-card p-5 sm:p-6 space-y-4 border-warning/30 bg-surface transition-colors"
      role="region"
      aria-label="Pattern insight: what usually happens next"
    >
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-severity-medium-bg border border-severity-medium-border text-severity-medium-fg">
            <Lightbulb className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-warning block">
              Pattern Insight
            </span>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              {insight.heading}
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        <p className="text-sm text-foreground/90 leading-relaxed font-medium">
          {insight.description}
        </p>

        {insight.dontSendYet && insight.dontSendYet.length > 0 && (
          <div className="surface-card-raised p-4 space-y-2.5 border-border">
            <div className="flex items-center gap-2 text-xs font-bold text-destructive">
              <Ban className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>Don't send yet:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/80 font-medium">
              {insight.dontSendYet.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
          <AlertCircle className="w-4 h-4 text-warning shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>
            Pattern insights reflect observed stages in similar communications. They describe possibilities to prepare for, not certainty about this sender.
          </span>
        </div>
      </div>
    </section>
  );
}
