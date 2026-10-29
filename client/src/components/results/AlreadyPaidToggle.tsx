import { AlertCircle } from "lucide-react";

interface AlreadyPaidToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AlreadyPaidToggle({ checked, onChange }: AlreadyPaidToggleProps) {
  return (
    <div
      data-testid="already-paid-toggle-container"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-md border border-status-high-risk-border bg-status-high-risk-bg text-status-high-risk-fg transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-surface text-status-high-risk-icon shrink-0 shadow-2xs">
          <AlertCircle className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-bold block">
            Did you already transfer money or deposit fees?
          </span>
          <p className="text-xs opacity-90 leading-relaxed font-medium">
            Activate this to immediately display golden-hour banking and helpline recovery steps.
          </p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto shrink-0 min-h-[44px]">
        <input
          type="checkbox"
          id="already-paid-toggle"
          data-testid="already-paid-toggle"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-surface-raised border border-border peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-destructive" />
        <span className="ms-2.5 text-xs font-bold select-none">
          {checked ? "Yes, I paid" : "No"}
        </span>
      </label>
    </div>
  );
}
