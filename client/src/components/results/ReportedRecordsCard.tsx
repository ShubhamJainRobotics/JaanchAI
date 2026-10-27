import { useState } from "react";
import { ReportedMatch } from "shared";
import { ReportEntityDialog } from "./ReportEntityDialog";
import { Database, AlertTriangle, ShieldCheck, Flag } from "lucide-react";

interface ReportedRecordsCardProps {
  reportedMatches?: ReportedMatch[];
}

export function ReportedRecordsCard({
  reportedMatches = [],
}: ReportedRecordsCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasMatches = reportedMatches.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Database className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Community Reported Records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Internal reported-entities registry cross-reference
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
        >
          <Flag className="w-3.5 h-3.5" />
          Report Entity
        </button>
      </div>

      {hasMatches ? (
        <div className="space-y-2">
          {reportedMatches.map((m, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                m.status === "confirmed"
                  ? "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                  : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 text-amber-900 dark:text-amber-200"
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 pt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="space-y-0.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold">
                  <span>Matched {m.entityType}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/30 border border-current/20">
                    {m.status === "confirmed" ? "Confirmed Fraud" : `Reported (${m.reportCount} reports)`}
                  </span>
                </div>
                <p className="opacity-90">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Clean Record: None of the sender coordinates or link domains match any reported fraudulent records in our database.
          </span>
        </div>
      )}

      <ReportEntityDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
