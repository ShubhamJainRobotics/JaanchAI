import { ChecklistItem, OFFICIAL_PORTALS } from "shared";
import { CheckSquare, ExternalLink } from "lucide-react";
import { useChecklist } from "../../hooks/useChecklist";

interface VerificationChecklistProps {
  initialItems: ChecklistItem[];
  isSavedAnalysis: boolean;
}

export function VerificationChecklist({
  initialItems,
  isSavedAnalysis,
}: VerificationChecklistProps) {
  const { items, toggleItem } = useChecklist(initialItems, isSavedAnalysis);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Verify Next: Recommended Action Steps
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            {completedCount} of {items.length} completed
          </span>
          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const portal = OFFICIAL_PORTALS.find((p) => p.key === item.portalKey);

          return (
            <div
              key={item.id || idx}
              className={`p-3 rounded-xl border transition-colors flex items-start gap-3 ${
                item.completed
                  ? "bg-emerald-50/40 border-emerald-200 text-slate-500"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
              }`}
            >
              <input
                type="checkbox"
                id={`check-${idx}`}
                checked={item.completed}
                onChange={() => toggleItem(idx)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <div className="flex-1 text-xs sm:text-sm">
                <label
                  htmlFor={`check-${idx}`}
                  className={`cursor-pointer leading-snug font-medium block ${
                    item.completed ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {item.label}
                </label>

                {portal && (
                  <div className="mt-2">
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200 transition-colors"
                    >
                      Open {portal.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
