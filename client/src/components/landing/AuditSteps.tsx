export function AuditSteps() {
  const steps = [
    {
      stepNumber: "01",
      title: "Input & Ingestion",
      summary: "Text paste, messaging apps (WhatsApp, Telegram, LinkedIn), or OCR screenshot upload.",
      details: "Text is extracted safely inside your browser session. Contact identifiers and sensitive identity markers are redacted before contextual evaluation.",
    },
    {
      stepNumber: "02",
      title: "Pattern & Domain Verification",
      summary: "Cross-checking upfront fees, free email domains, and official communication standards.",
      details: "An 8-point deterministic rule engine inspects suspicious keywords, lookalike URLs (e.g. tcs-careers.org vs tcs.com), and coercive 2-hour deadline tactics.",
    },
    {
      stepNumber: "03",
      title: "Risk Assessment & Next Steps",
      summary: "Risk classification, cited evidence phrases, and reporting options.",
      details: "Receive a transparent verdict citing exact flagged quotes, verified MCA and AICTE registry links, and direct escalation to the 1930 Cyber Helpline.",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block mb-2 select-none">
            AUDIT METHODOLOGY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground leading-[1.2] tracking-tight">
            How Jaanch audits an offer in three steps.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-2.5">
            A transparent rule-based evaluation model calibrated to common student recruitment scam vectors and verified hiring standards.
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
                  PHASE {step.stepNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

