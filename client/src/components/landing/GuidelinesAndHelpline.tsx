import { PhoneCall, ExternalLink, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function GuidelinesAndHelpline() {
  const { t } = useLanguage();

  return (
    <section id="helpline" className="py-12 sm:py-16 lg:py-20 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-8">
        {/* Guideline Box */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="md:col-span-5 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block">
                {t.guidelines.guide_eyebrow}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground leading-snug">
                {t.guidelines.guide_title}
              </h2>
              <p className="text-sm font-medium text-terracotta">
                {t.guidelines.guide_sub}
              </p>
            </div>

            <div className="md:col-span-7 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8 space-y-3">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {t.guidelines.guide_p1_prefix}<strong>{t.guidelines.guide_p1_strong}</strong>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.guidelines.guide_p2}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Response Card */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-destructive">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.guidelines.helpline_eyebrow}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-foreground leading-snug">
              {t.guidelines.helpline_title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t.guidelines.helpline_desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:1930"
              className="bg-primary text-primary-foreground hover:bg-neutral-800 rounded-lg px-6 py-3 font-medium text-sm transition-colors shadow-xs inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <PhoneCall className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              <span>{t.guidelines.call_btn}</span>
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

