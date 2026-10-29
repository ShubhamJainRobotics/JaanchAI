import { ClipboardPaste, AlertTriangle, Building2, ShieldAlert } from "lucide-react";
import { IconTile } from "../common/IconTile";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: ClipboardPaste,
      title: "Paste or upload",
      description: "Paste offer text or drop a screenshot. Files stay in your browser.",
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
    <section className="py-12 sm:py-16 border-t border-border bg-surface-raised/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How Jaanch Works
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A fast, 4-step verification process designed specifically for Indian college students.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-surface border border-border rounded-lg p-5 shadow-xs relative flex flex-col justify-between"
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
    </section>
  );
}
