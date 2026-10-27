import { STUDENT_SAFETY_RULES } from "shared";
import { Shield, PhoneCall, ExternalLink } from "lucide-react";

export function StudentSafetyRules() {
  return (
    <section
      className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:bg-indigo-950/20 dark:border-indigo-900"
      aria-label="Student safety rules"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-indigo-100 dark:border-indigo-900/60">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
          <Shield className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-100">
            Student Safety Rules
          </h3>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-300">
            Essential principles to safeguard your career, finances, and identity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
        {STUDENT_SAFETY_RULES.map((rule, idx) => (
          <div
            key={rule.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-indigo-100/80 dark:border-indigo-900/40 shadow-2xs"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 text-xs font-black shrink-0 dark:bg-indigo-900 dark:text-indigo-200">
              {idx + 1}
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {rule.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold">
          <PhoneCall className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>National Cyber Crime Helpline: 1930</span>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100 underline decoration-indigo-300 underline-offset-2"
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}
