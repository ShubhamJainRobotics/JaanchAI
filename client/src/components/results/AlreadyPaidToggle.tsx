import { AlertCircle } from "lucide-react";

interface AlreadyPaidToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function AlreadyPaidToggle({ checked, onChange }: AlreadyPaidToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 shrink-0">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-bold text-red-950 dark:text-red-200">
            Did you already transfer money or deposit fees?
          </span>
          <p className="text-[11px] text-red-700 dark:text-red-300">
            Activate this to immediately display golden-hour banking and helpline recovery steps.
          </p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto shrink-0">
        <input
          type="checkbox"
          id="already-paid-toggle"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-red-400 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
        <span className="ms-2 text-xs font-semibold text-red-950 dark:text-red-200 select-none">
          {checked ? "Yes, I paid" : "No"}
        </span>
      </label>
    </div>
  );
}
