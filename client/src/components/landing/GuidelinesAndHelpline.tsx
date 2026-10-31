import { PhoneCall, ExternalLink, ShieldAlert } from "lucide-react";

export function GuidelinesAndHelpline() {
  return (
    <section id="helpline" className="py-12 sm:py-16 lg:py-20 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-8">
        {/* Guideline Box */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="md:col-span-5 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block">
                STATUTORY PROTECTIONS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground leading-snug">
                Recruitment Integrity Guidelines
              </h2>
              <p className="text-sm font-medium text-terracotta">
                Legitimate hiring standards and student protections
              </p>
            </div>

            <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8 space-y-3">
              <p className="text-sm text-foreground/90 leading-relaxed">
                Under advisory notices issued by the Ministry of Labour & Employment and Ministry of Corporate Affairs, <strong>no legitimate employer or recruiting agency is permitted to charge candidates application fees, security deposits, seat reservation charges, or documentation processing fees.</strong>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Any demand for upfront payment via UPI, gift cards, or crypto — even if promised as "100% refundable" — is an immediate disqualifier and standard hallmark of student employment scams.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Response Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-destructive">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>SUSPECT FRAUD OR LOST FUNDS?</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-foreground leading-snug">
              National Cyber Crime Reporting Helpline: Dial 1930
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              If you transferred money or shared bank details with a fraudulent recruiter, dial 1930 immediately to register a formal complaint with state cyber cells before UPI transactions clear.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:1930"
              className="bg-primary text-primary-foreground hover:bg-neutral-800 rounded-lg px-6 py-3 font-medium text-sm transition-colors shadow-xs inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <PhoneCall className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              <span>Call 1930</span>
            </a>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface border border-border-pill text-foreground hover:bg-neutral-50 rounded-lg px-6 py-3 font-medium text-sm transition-colors shadow-xs inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
