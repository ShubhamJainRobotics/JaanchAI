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
    <div className="p-4 bg-surface-raised border border-border rounded-md space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
          Detected Link(s) in Text ({matches.length})
        </span>
        <span className="text-[11px] text-warning bg-warning/10 border border-warning/30 px-2 py-1 rounded-sm font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
          Links disabled for safety — do not visit unverified links
        </span>
      </div>

      <div className="space-y-2">
        {matches.map((url, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-surface rounded-md border border-border text-xs gap-2"
          >
            <span className="font-mono text-foreground select-all break-all overflow-wrap-anywhere">
              {url}
            </span>
            <Link
              to={`/link-check?url=${encodeURIComponent(url)}`}
              className="min-h-[44px] inline-flex items-center text-xs font-sans font-semibold text-primary hover:underline shrink-0 self-start sm:self-center"
            >
              Inspect Link →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
