import { AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";
import { SAMPLE_REPORT } from "../../content/sampleReport";

export function SampleReportPreview() {
  const data = SAMPLE_REPORT;
  const completedChecks = data.checks.filter((c) => c.outcome === "pass" || c.outcome === "fail").length;
  const totalChecks = data.checks.length;

  return (
    <div
      role="region"
      aria-label="Example report preview"
      className="bg-surface border border-border rounded-lg shadow-elevation-1 p-5 text-left select-none pointer-events-none"
    >
      {/* Label indicating this is a fictional example */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-surface-raised border border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Example — fictional offer
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          Sample Preview
        </span>
      </div>

      {/* Compact Status Banner (§4.2 / High Risk) */}
      <div className="p-3.5 rounded-md bg-status-high-risk-bg border border-status-high-risk-border flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-status-high-risk-bg border border-status-high-risk-border flex items-center justify-center shrink-0 text-status-high-risk-fg">
          <AlertOctagon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-status-high-risk-bg border border-status-high-risk-border text-status-high-risk-fg uppercase tracking-wide">
              High Risk
            </span>
            <span className="text-xs font-medium text-status-high-risk-fg">
              Apex Systems Labs
            </span>
          </div>
          <p className="text-xs text-status-high-risk-fg mt-1 font-medium leading-snug">
            Upfront payment requested for internship onboarding.
          </p>
        </div>
      </div>

      {/* Payment Alert Line (§4.2) */}
      <div className="mt-3 p-3 rounded-md bg-status-high-risk-bg/60 border border-status-high-risk-border text-xs text-status-high-risk-fg">
        <strong className="font-bold flex items-center gap-1.5 mb-0.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Do not pay:
        </strong>
        <span>
          Legitimate employers and scholarship bodies never ask candidates to pay for training, security deposits, or interview kits.
        </span>
      </div>

      {/* Evidence Rows (2 short quotes + why it matters) */}
      <div className="mt-3.5 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Observed Warning Signs
        </div>
        {data.signals.slice(0, 2).map((sig) => (
          <div
            key={sig.ruleId}
            className="p-2.5 rounded-md bg-surface-raised border border-border text-xs space-y-1"
          >
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-status-high-risk-fg" aria-hidden="true" />
              <span>{sig.title}</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground italic bg-surface p-1.5 rounded-sm border border-border/60">
              "{sig.evidenceQuote}"
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              <strong className="text-foreground">Why it matters:</strong> {sig.whyItMatters}
            </p>
          </div>
        ))}
      </div>

      {/* Next Steps (2 steps) */}
      <div className="mt-3.5 space-y-1.5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Recommended Next Steps
        </div>
        {data.nextSteps?.yourTurn?.slice(0, 2).map((step, idx) => (
          <div
            key={step.id || idx}
            className="flex items-start gap-2 p-2 rounded-md bg-surface-raised/60 border border-border text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
            <div className="flex-1">
              <span className="font-semibold text-foreground block">{step.title}</span>
              <span className="text-muted-foreground text-xs">{step.whyItMatters}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Independent Checks Completed Meter (§4.2: 2 of 8) */}
      <div className="mt-4 pt-3 border-t border-border space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-foreground">
          <span>Independent checks completed</span>
          <span className="font-mono tabular-nums">{completedChecks} of {totalChecks}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={completedChecks}
          aria-valuemin={0}
          aria-valuemax={totalChecks}
          aria-label="Independent verification checks coverage"
          className="h-1.5 w-full bg-surface-raised rounded-full overflow-hidden border border-border"
        >
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Add sender email and headers to unlock remaining checks.
        </p>
      </div>
    </div>
  );
}
