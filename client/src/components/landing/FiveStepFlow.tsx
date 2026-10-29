import { FileText, Cpu, Eye, HelpCircle, CheckSquare } from "lucide-react";

export function FiveStepFlow() {
  const steps = [
    {
      num: "01",
      icon: FileText,
      title: "Paste or Upload",
      desc: "Paste suspicious WhatsApp messages, offer letters, or upload screenshots. In-browser OCR extracts text locally without sending media to any server.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "Analyze",
      desc: "Deterministic rule engine checks for upfront deposit demands, payment pressure, UPI IDs, missing details, and lookalike domain names.",
    },
    {
      num: "03",
      icon: Eye,
      title: "Understand",
      desc: "Every detected signal is highlighted alongside an exact quote from your message and a transparent explanation of why it presents a risk.",
    },
    {
      num: "04",
      icon: HelpCircle,
      title: "Identify Unknowns",
      desc: "Review what remains unproven—such as recruiter corporate credentials, official registration on MCA, or whether you actually applied.",
    },
    {
      num: "05",
      icon: CheckSquare,
      title: "Verify Independently",
      desc: "Follow an interactive verification checklist with direct links to AICTE, National Scholarship Portal (NSP), or generate a recruiter challenge inquiry.",
    },
  ];

  return (
    <section className="py-16 bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">The Jaanch Framework</h2>
          <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
            From Uncertainty to Informed Action
          </h3>
          <p className="mt-3 text-base text-muted-foreground">
            A structured workflow designed to safeguard students from advance-fee traps and impersonation scams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-surface-raised border border-border rounded-md p-6 flex flex-col justify-between transition-colors shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-md bg-surface border border-border text-primary flex items-center justify-center shadow-xs">
                      <IconComponent className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <span className="text-2xl font-black text-muted-foreground/40 font-mono tabular-nums">
                      {step.num}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
