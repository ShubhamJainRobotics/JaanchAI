import { CheckRow } from "shared";
import { ShieldCheck } from "lucide-react";
import { AlreadyCheckedRow } from "./AlreadyCheckedRow";

interface AlreadyCheckedListProps {
  checks: CheckRow[];
  onTriggerInput?: (type: "email" | "headers" | "listing" | "org") => void;
}

export function AlreadyCheckedList({ checks, onTriggerInput }: AlreadyCheckedListProps) {
  if (!checks || checks.length === 0) return null;

  return (
    <div
      data-testid="already-checked-list"
      className="space-y-3"
      role="region"
      aria-label="Checks completed automatically by Jaanch"
    >
      <div className="flex items-center gap-2 pb-1.5 border-b border-border">
        <div className="p-1 rounded-md bg-surface-raised text-primary">
          <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
            Part 1 · Jaanch Already Checked
          </h3>
          <p className="text-xs text-muted-foreground">
            Automated verification lookups computed on verifiable public data. Not tickable tasks.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((check, idx) => (
          <AlreadyCheckedRow
            key={`${check.checkKey}-${idx}`}
            check={check}
            onTriggerInput={onTriggerInput}
          />
        ))}
      </div>
    </div>
  );
}
