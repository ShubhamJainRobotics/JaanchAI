import { ShieldAlert, PhoneCall, ExternalLink } from "lucide-react";

export function StopAndProtectBlock() {
  return (
    <div
      id="stop-and-protect-block"
      role="alert"
      data-testid="stop-and-protect-block"
      className="rounded-lg border-2 border-status-high-risk-border bg-status-high-risk-bg p-4 sm:p-5 text-status-high-risk-fg shadow-xs space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-status-high-risk-bg border border-status-high-risk-border flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-status-high-risk-fg" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-extrabold uppercase tracking-tight">
            Stop and Protect Yourself
          </h2>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed">
            Do not send money, do not scan UPI QR codes, and do not share Aadhaar or bank account details with this contact.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-status-high-risk-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>If you already paid: call 1930 immediately or visit</span>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline inline-flex items-center gap-0.5 hover:opacity-80"
          >
            cybercrime.gov.in
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
