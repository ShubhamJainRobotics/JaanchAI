import { FileText, ShieldAlert, CheckSquare, Lock } from "lucide-react";
import { IconTile } from "../common/IconTile";

export function BenefitsGrid() {
  const benefits = [
    {
      title: "Explains why",
      description: "Every warning sign comes with the exact words from the message and why it matters.",
      icon: FileText,
      variant: "primary" as const,
    },
    {
      title: "Never says \"safe\"",
      description: "We show what we observed and what is still unverified — not a guarantee.",
      icon: ShieldAlert,
      variant: "primary" as const,
    },
    {
      title: "Checks official sources",
      description: "Links to AICTE, the National Scholarship Portal and MCA company records.",
      icon: CheckSquare,
      variant: "primary" as const,
    },
    {
      title: "Screenshots stay on your device",
      description: "Text is read from screenshots and PDFs in your browser; the files are never uploaded.",
      icon: Lock,
      variant: "primary" as const,
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Clear, Credible Verification
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Built to provide honest evidence and independent checks without marketing exaggerations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
