import { VerificationStatus } from "shared";
import { ShieldCheck, PhoneCall, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface CompactSafetySummaryProps {
  status: VerificationStatus;
}

export function CompactSafetySummary({ status }: CompactSafetySummaryProps) {
  const isHighRiskOrScam = status === "HIGH_RISK" || status === "CONFIRMED_SCAM";
  const [helplineOpen, setHelplineOpen] = useState(isHighRiskOrScam);

  return (
    <section
      className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 sm:p-6 space-y-4"
      aria-label="Core safety principles"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Essential Student Safety Rules
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              3 core principles to remember for every opportunity
            </p>
          </div>
        </div>

        <Link
          to="/resources"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 underline decoration-brand-200 underline-offset-2 self-start sm:self-auto print:hidden"
        >
          See all 8 rules →
        </Link>
      </div>

      {/* 3-line contextual summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 space-y-1">
          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-black flex items-center justify-center">
            1
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Never pay for an opportunity
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Legitimate internships, jobs, and government programs never demand registration fees, security deposits, or kit charges.
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 space-y-1">
          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-black flex items-center justify-center">
            2
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Never share sensitive data early
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Never send Aadhaar, PAN card, bank account numbers, or OTPs before independently verifying the organization.
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 space-y-1">
          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 text-xs font-black flex items-center justify-center">
            3
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Verify via self-found contacts
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Do not trust phone numbers or email addresses provided inside the message. Look up the official website independently.
          </p>
        </div>
      </div>

      {/* 1930 / cybercrime.gov.in Helpline Strip */}
      {isHighRiskOrScam ? (
        <div className="p-4 rounded-xl bg-red-100/80 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 font-bold">
            <PhoneCall className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0" />
            <span>National Cyber Crime Helpline: 1930 (Immediate 24x7 Assistance)</span>
          </div>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-red-800 hover:text-red-950 dark:text-red-300 dark:hover:text-red-100 underline decoration-red-400 underline-offset-2"
          >
            <span>File a report at cybercrime.gov.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="pt-2 border-t border-indigo-100/60 dark:border-indigo-900/40">
          <button
            type="button"
            onClick={() => setHelplineOpen(!helplineOpen)}
            className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium py-1"
          >
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
              Need to report fraud? National Cyber Crime Helpline
            </span>
            {helplineOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {helplineOpen && (
            <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Helpline: <strong>1930</strong>
              </span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 underline"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
