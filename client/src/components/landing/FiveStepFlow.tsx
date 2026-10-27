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
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">The Jaanch Framework</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            From Uncertainty to Informed Action
          </h3>
          <p className="mt-3 text-base text-slate-600">
            A structured workflow designed to safeguard students from advance-fee traps and impersonation scams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center shadow-xs">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {step.num}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
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
