import { STUDENT_SAFETY_RULES } from "shared";
import { Shield, PhoneCall, ExternalLink } from "lucide-react";

export function StudentSafetyRules() {
  return (
    <section
      className="rounded-md border border-border bg-surface-raised p-6 shadow-xs"
      aria-label="Student safety rules"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <Shield className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">
            Student Safety Rules
          </h3>
          <p className="text-xs text-muted-foreground">
            Essential principles to safeguard your career, finances, and identity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
        {STUDENT_SAFETY_RULES.map((rule, idx) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 p-3.5 rounded-md bg-surface border border-border shadow-xs"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 tabular-nums">
              {idx + 1}
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">
                {rule.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <PhoneCall className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>National Cyber Crime Helpline: 1930</span>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
