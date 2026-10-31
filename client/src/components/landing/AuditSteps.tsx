import { useLanguage } from "../../context/LanguageContext";

export function AuditSteps() {
  const { t } = useLanguage();

  const steps = [
    {
      stepNumber: t.audit.step1_num,
      title: t.audit.step1_title,
      summary: t.audit.step1_summary,
      details: t.audit.step1_details,
    },
    {
      stepNumber: t.audit.step2_num,
      title: t.audit.step2_title,
      summary: t.audit.step2_summary,
      details: t.audit.step2_details,
    },
    {
      stepNumber: t.audit.step3_num,
      title: t.audit.step3_title,
      summary: t.audit.step3_summary,
      details: t.audit.step3_details,
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block mb-2 select-none">
            {t.audit.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground leading-[1.2] tracking-tight">
            {t.audit.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-2.5">
            {t.audit.subtitle}
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-10">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-surface rounded-2xl border border-border p-6 sm:p-8 flex flex-col justify-between shadow-xs transition-colors hover:border-border-highlight"
            >
              <div>
                {/* Step Number in Large Serif Display */}
                <span className="font-serif text-4xl sm:text-5xl font-normal text-foreground leading-none block mb-6 select-none">
                  {step.stepNumber}
                </span>

                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug mb-2.5">
                  {step.title}
                </h3>

                <p className="text-sm font-medium text-foreground/90 leading-relaxed mb-3">
                  {step.summary}
                </p>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.details}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-border">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-terracotta">
                  {t.audit.phase_prefix} {step.stepNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

