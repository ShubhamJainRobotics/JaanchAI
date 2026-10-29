import { ShieldAlert } from "lucide-react";

interface ProtectionBannerProps {
  banner: string[];
}

export function ProtectionBanner({ banner }: ProtectionBannerProps) {
  if (!banner || banner.length === 0) return null;

  return (
    <aside
      role="note"
      data-testid="protection-banner"
      aria-label="Standing safety protection rules"
      className="rounded-md border border-warning/40 bg-surface p-4 sm:p-5 text-foreground space-y-3 shadow-xs transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-severity-medium-bg border border-severity-medium-border text-severity-medium-fg shrink-0">
          <ShieldAlert className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-warning">
          Stay Safe · Standing Student Protection Rules
        </h3>
      </div>

      <ul className="space-y-1.5 pl-1 text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium">
        {banner.map((rule, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-2" aria-hidden="true" />
            <span className="text-foreground/90">{rule}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
