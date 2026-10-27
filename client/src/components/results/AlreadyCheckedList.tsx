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
      className="space-y-3"
      role="region"
      aria-label="Checks completed automatically by Jaanch"
    >
      <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div className="p-1 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Part 1 · Jaanch Already Checked
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
