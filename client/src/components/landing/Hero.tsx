import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  FileText,
  ShieldAlert,
  CheckSquare,
  Lock,
} from "lucide-react";
import { IconTile } from "../common/IconTile";
import { SHOW_PROBLEM_STATEMENT_BADGE } from "../../config/landing";

export function Hero() {
  const benefits = [
    {
      title: "Explains why",
      description:
        "Every warning sign comes with the exact words from the message and why it matters.",
      icon: FileText,
      variant: "primary" as const,
    },
    {
      title: 'Never says "safe"',
      description:
        "We show what we observed and what is still unverified — not a guarantee.",
      icon: ShieldAlert,
      variant: "primary" as const,
    },
    {
      title: "Checks official sources",
      description:
        "Links to AICTE, the National Scholarship Portal and MCA company records.",
      icon: CheckSquare,
      variant: "primary" as const,
    },
    {
      title: "Screenshots stay on your device",
      description:
        "Text is read from screenshots and PDFs in your browser; the files are never uploaded.",
      icon: Lock,
      variant: "primary" as const,
    },
  ];

  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20 overflow-hidden">
      {/* Static CSS-only ambient backdrop decoration */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden forced-colors:hidden print:hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary-tint/60 blur-3xl opacity-70" />
        <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary-tint/50 blur-3xl opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Optional hackathon problem statement badge pill */}
        {SHOW_PROBLEM_STATEMENT_BADGE && (
          <div
            id="problem-statement-badge"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint border border-primary-tint-border text-primary text-xs font-semibold mb-4 sm:mb-6 shadow-xs"
          >
            <span>Digital Trust & Safety — Problem Statement: 'Fake or Real'</span>
          </div>
        )}

        {/* Main centered headline & subcopy container */}
        <div className="max-w-4xl mx-auto">
          <h1 className="font-extrabold text-foreground tracking-tight [text-wrap:balance] text-[clamp(2rem,4vw+0.5rem,3.5rem)] leading-[1.15] max-w-4xl mx-auto">
            <span>Spot Warning Signs</span>{" "}
            <span className="block mt-1 sm:mt-2">
              <span className="bg-gradient-to-r from-gradient-accent-from to-gradient-accent-to bg-clip-text text-transparent">
                Before You Pay or Share Private&nbsp;Data
              </span>
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
            Students encounter hundreds of internship offers, scholarships, and freelance messages online. Jaanch helps you understand <strong className="text-foreground font-semibold">why</strong> something may be risky and <strong className="text-foreground font-semibold">what you should independently verify</strong> before taking action.
          </p>

          {/* Two Action Buttons: Check an Offer Now + Inspect a Link */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Link
              to="/analyze"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-pressed text-primary-foreground font-bold text-sm sm:text-base shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <ShieldCheck className="w-5 h-5 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>Check an Offer Now</span>
              <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            </Link>

            <Link
              to="/link-check"
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-md bg-surface hover:bg-surface-raised active:bg-surface border border-border text-foreground hover:text-foreground font-semibold text-sm sm:text-base shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Search className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>Inspect a Link</span>
            </Link>
          </div>
        </div>

        {/* Four Plain-Language Feature Cards directly under the buttons */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-5xl mx-auto">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-surface border border-border rounded-lg p-5 shadow-xs flex flex-col transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-sm hover:border-primary-tint-border"
            >
              <div className="mb-3.5">
                <IconTile icon={b.icon} variant={b.variant} size="md" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {b.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
