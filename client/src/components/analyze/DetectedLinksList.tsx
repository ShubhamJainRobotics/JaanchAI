import { Link2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface DetectedLinksListProps {
  text: string;
}

export function DetectedLinksList({ text }: DetectedLinksListProps) {
  const urlRegex = /https?:\/\/[^\s<>"'{}|\\^`[\]]+/gi;
  const matches = Array.from(new Set(text.match(urlRegex) || [])).slice(0, 5);

  if (matches.length === 0) return null;

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-brand-600" />
          Detected Link(s) in Text ({matches.length})
        </span>
        <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Links disabled for safety — do not visit unverified links
        </span>
      </div>

      <div className="space-y-1.5">
        {matches.map((url, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 font-mono text-xs"
          >
            <span className="text-slate-700 truncate max-w-xs sm:max-w-md select-all">
              {url}
            </span>
            <Link
              to={`/link-check?url=${encodeURIComponent(url)}`}
              className="ml-2 text-xs font-sans font-semibold text-brand-600 hover:text-brand-800 shrink-0"
            >
              Inspect Link →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
