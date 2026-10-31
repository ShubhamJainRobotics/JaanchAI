import { ClipboardPaste, AlertTriangle, Building2, ShieldAlert } from "lucide-react";
import { IconTile } from "../common/IconTile";
import { SampleReportPreview } from "./SampleReportPreview";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: ClipboardPaste,
      title: "Paste or upload",
      description: "Paste offer text or drop a screenshot. Screenshots and PDFs are read in your browser.",
    },
    {
      number: "2",
      icon: AlertTriangle,
      title: "Inspect warning signs",
      description: "See exact quotes flagged for upfront fees, fake domains, or urgency.",
    },
    {
      number: "3",
      icon: Building2,
      title: "Check official sources",
      description: "Direct links to verify companies on MCA, AICTE, and scholarship portals.",
    },
    {
      number: "4",
      icon: ShieldAlert,
      title: "Decide safely",
      description: "Take recommended next steps or report scams to the 1930 national helpline.",
    },
  ];

  return (
    <section className="py-14 sm:py-18 border-t border-border bg-surface-raised/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How Jaanch Works & What You Get
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Deterministic rule evaluation, independent cross-checks, and transparent verification evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: 4 Steps Flow */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-surface border border-border rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-primary-tint-border transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <IconTile icon={step.icon} variant="primary" size="md" />
                      <span className="text-2xl font-black text-muted-foreground/30 tabular-nums">
                        0{step.number}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Simplified Sample Report Preview */}
          <div className="lg:col-span-5 w-full">
            <SampleReportPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
