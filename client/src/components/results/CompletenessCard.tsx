import { CompletenessResult } from "shared";
import { CheckCircle2, AlertCircle, ListChecks } from "lucide-react";

interface CompletenessCardProps {
  completeness?: CompletenessResult | null;
}

export function CompletenessCard({ completeness }: CompletenessCardProps) {
  if (!completeness) return null;

  return (
    <div className="rounded-md border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <ListChecks className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Offer Content Completeness
            </h3>
            <p className="text-xs text-muted-foreground">
              {completeness.present.length} of 10 essential offer details detected
            </p>
          </div>
        </div>

        <span className="text-xs font-bold tabular-nums px-3 py-1 rounded-full bg-primary-tint text-primary border border-primary-tint-border">
          {completeness.score}/10
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {completeness.present.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-md bg-status-verified-bg border border-status-verified-border text-status-verified-fg"
          >
            <CheckCircle2 className="w-4 h-4 text-status-verified-icon shrink-0" />
            <span className="font-semibold">{item}</span>
          </div>
        ))}

        {completeness.missing.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2.5 rounded-md bg-status-review-bg border border-status-review-border text-status-review-fg"
          >
            <AlertCircle className="w-4 h-4 text-status-review-icon shrink-0" />
            <span>Missing: {item}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground italic">
        Note: Genuine offers occasionally omit dates or links; missing details alone are never cited as proof of fraud, but require review.
      </p>
    </div>
  );
}
