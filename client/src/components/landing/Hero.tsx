import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function Hero() {
  const { t } = useLanguage();

  const scrollToSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("submit-offer");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const portals = [
    {
      num: "01",
      name: t.hero.portal1_name,
      url: "https://pminternship.mca.gov.in",
      displayUrl: "pminternship.mca.gov.in",
    },
    {
      num: "02",
      name: t.hero.portal2_name,
      url: "https://ncs.gov.in",
      displayUrl: "ncs.gov.in",
    },
    {
      num: "03",
      name: t.hero.portal3_name,
      url: "https://scholarships.gov.in",
      displayUrl: "scholarships.gov.in",
    },
  ];

  return (
    <section className="pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-24 lg:pb-20 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Eyebrow */}
              <div className="inline-block text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle mb-3 select-none">
                {t.hero.eyebrow}
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-foreground tracking-tight">
                {t.hero.title_p1} <br />
                <span className="text-terracotta">{t.hero.title_accent}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-5 max-w-xl">
                {t.hero.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mt-8">
                <a
                  href="#submit-offer"
                  onClick={scrollToSubmit}
                  className="bg-primary text-primary-foreground hover:bg-neutral-800 rounded-lg px-6 py-3 font-medium text-sm sm:text-base transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <span>{t.hero.cta_check}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                </a>

                <Link
                  to="/results/local"
                  className="bg-surface border border-border-pill text-foreground hover:bg-neutral-50 rounded-lg px-6 py-3 font-medium text-sm sm:text-base transition-colors shadow-xs inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <span>{t.hero.cta_sample}</span>
                </Link>
              </div>
            </div>

            {/* 3-Column Mini Feature Strip */}
            <div className="border-t border-border pt-6 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="font-serif text-lg font-normal text-terracotta block">
                  {t.hero.feature1_num}
                </span>
                <span className="text-sm font-semibold text-foreground block">
                  {t.hero.feature1_title}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.hero.feature1_desc}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-serif text-lg font-normal text-terracotta block">
                  {t.hero.feature2_num}
                </span>
                <span className="text-sm font-semibold text-foreground block">
                  {t.hero.feature2_title}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.hero.feature2_desc}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-serif text-lg font-normal text-terracotta block">
                  {t.hero.feature3_num}
                </span>
                <span className="text-sm font-semibold text-foreground block">
                  {t.hero.feature3_title}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.hero.feature3_desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Official Portals Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 flex flex-col justify-between h-full shadow-xs">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block mb-1">
                    {t.hero.portals_eyebrow}
                  </span>
                  <h2 className="font-serif text-2xl font-normal text-foreground leading-snug">
                    {t.hero.portals_title}
                  </h2>
                </div>

                <div className="space-y-4 divide-y divide-border">
                  {portals.map((portal) => (
                    <div key={portal.num} className="pt-4 first:pt-0">
                      <div className="flex items-start gap-3">
                        <span className="font-serif text-base text-terracotta font-medium shrink-0 mt-0.5">
                          {portal.num}
                        </span>
                        <div className="space-y-1 flex-1">
                          <h3 className="text-sm font-semibold text-foreground leading-snug">
                            {portal.name}
                          </h3>
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-terracotta inline-flex items-center gap-1 underline underline-offset-2 transition-colors font-mono"
                          >
                            <span>{portal.displayUrl}</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-6">
                <p className="text-xs text-muted-subtle leading-relaxed flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" aria-hidden="true" />
                  <span>{t.hero.portals_footer}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
