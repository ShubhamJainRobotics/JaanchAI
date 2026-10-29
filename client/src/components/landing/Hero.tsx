import { ShieldCheck, Lock, Cpu } from "lucide-react";
import { HeroAnalyzer } from "./HeroAnalyzer";

export function Hero() {
  return (
    <section className="relative pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-16 overflow-hidden">
      {/* Static CSS-only ambient backdrop decoration (§5.1) */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden forced-colors:hidden print:hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary-tint/60 blur-3xl opacity-70" />
        <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary-tint/50 blur-3xl opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main centered headline & subcopy container (max-w-3xl) */}
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
          <h1 className="font-extrabold text-foreground tracking-tight [text-wrap:balance] text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.12]">
            <span>Verify Indian Internships & Jobs</span>{" "}
            <span className="block mt-1 sm:mt-1.5">
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to bg-clip-text text-transparent">
                  Before You Pay
                </span>
                <span
                  className="absolute left-0 bottom-1 sm:bottom-2 w-full h-2.5 sm:h-3 bg-highlight/85 -rotate-1 rounded-sm -z-0"
                  aria-hidden="true"
                />
              </span>{" "}
              <span className="bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to bg-clip-text text-transparent">
                a Rupee
              </span>
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
            Instant, browser-side checks for security deposits, fake offers, unverified recruiters, and scam domains. Free, private, and built for students.
          </p>
        </div>

        {/* Centered Inline Analyzer Card (§5.2) */}
        <div className="max-w-2xl mx-auto">
          <HeroAnalyzer />

          {/* Trust Row — 3 Verified Truth Pills (§5.3) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-medium">100% Free & Open Source</span>
            </div>
            <div className="hidden sm:inline text-border">•</div>
            <div className="inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-medium">Private · Zero tracking for guests</span>
            </div>
            <div className="hidden sm:inline text-border">•</div>
            <div className="inline-flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-medium">Deterministic 8-point rule engine</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
