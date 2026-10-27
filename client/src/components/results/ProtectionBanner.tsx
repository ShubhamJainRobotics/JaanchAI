import { ShieldAlert } from "lucide-react";

interface ProtectionBannerProps {
  banner: string[];
}

export function ProtectionBanner({ banner }: ProtectionBannerProps) {
  if (!banner || banner.length === 0) return null;

  return (
    <div
      role="note"
      aria-label="Standing safety protection rules"
      className="rounded-2xl border border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-800/80 p-4 sm:p-5 text-amber-950 dark:text-amber-100 space-y-3"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
        </div>
        <h4 className="text-xs sm:text-sm font-bold tracking-tight uppercase tracking-wider text-amber-900 dark:text-amber-200">
          Stay Safe · Standing Student Protection Rules
        </h4>
      </div>

      <ul className="space-y-1.5 pl-1 text-xs sm:text-sm leading-relaxed text-amber-900/90 dark:text-amber-200/90">
        {banner.map((rule, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0 mt-2" />
            <span className="font-medium">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
