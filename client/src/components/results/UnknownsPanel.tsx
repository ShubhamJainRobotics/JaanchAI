import { UnknownItem } from "shared";
import { HelpCircle } from "lucide-react";

interface UnknownsPanelProps {
  unknowns: UnknownItem[];
}

export function UnknownsPanel({ unknowns }: UnknownsPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-amber-600" />
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            What is Still Unverified ({unknowns.length})
          </h3>
          <p className="text-xs text-slate-500">
            Crucial facts that cannot be confirmed from the message text alone.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {unknowns.map((u, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <h4 className="text-xs font-bold text-slate-900">{u.item}</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-4">
              <strong className="text-slate-700">How to verify: </strong>
              {u.howToVerify}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
