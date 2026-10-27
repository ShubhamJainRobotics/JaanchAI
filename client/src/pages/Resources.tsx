import { OFFICIAL_PORTALS, HELPLINE, ADVISORY, DOMAIN_GUIDES, OpportunityDomain, STATUS_COPY } from "shared";
import { ExternalLink, PhoneCall, ShieldCheck, BookOpen, Scale, ShieldAlert, CheckCircle2, AlertTriangle, Ban } from "lucide-react";
import { useState } from "react";
import { StudentSafetyRules } from "../components/results/StudentSafetyRules";

export function Resources() {
  const [selectedDomain, setSelectedDomain] = useState<OpportunityDomain>("internship");

  const guide = DOMAIN_GUIDES[selectedDomain];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Official Verification Directory & Guides
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Trusted portals, government helplines, and domain-specific checklists for Indian students.
        </p>
      </div>

      {/* 1. Student Safety Rules */}
      <StudentSafetyRules />

      {/* 2. How Jaanch Decides — The 5 Verification Statuses */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              How Jaanch Decides — Verification Policy
            </h2>
            <p className="text-xs text-slate-500">
              Evidence-gated 5-level status model. Verified and Confirmed are never assigned from text alone.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{STATUS_COPY.VERIFIED_OFFICIAL.label}</span>
            </div>
            <p className="leading-relaxed opacity-90">{STATUS_COPY.VERIFIED_OFFICIAL.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-emerald-800">
              Requires: Official registry match + exact corporate email domain + SPF/DKIM/DMARC headers + platform-fetched listing match.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-teal-950 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>{STATUS_COPY.LIKELY_GENUINE.label}</span>
            </div>
            <p className="leading-relaxed opacity-90">{STATUS_COPY.LIKELY_GENUINE.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-teal-800">
              Assigned when zero scam signals are found and completeness is satisfactory, but official listing was not cross-referenced.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>{STATUS_COPY.NEEDS_REVIEW.label}</span>
            </div>
            <p className="leading-relaxed opacity-90">{STATUS_COPY.NEEDS_REVIEW.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-amber-800">
              Assigned when an offer uses free webmail, has 3+ missing details, unverified recruiters, or listing discrepancies.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 text-red-950 space-y-1.5">
            <div className="flex items-center gap-2 font-black text-red-900">
              <ShieldAlert className="w-4 h-4 text-red-700" />
              <span>{STATUS_COPY.HIGH_RISK.label}</span>
            </div>
            <p className="leading-relaxed opacity-90">{STATUS_COPY.HIGH_RISK.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-red-800">
              Assigned immediately on any hard disqualifier (fees, UPI/crypto demands, credential theft, lookalike domain, fake government scheme).
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-900 border border-rose-950 text-white space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-2 font-black text-rose-100">
              <Ban className="w-4 h-4 text-rose-200" />
              <span>{STATUS_COPY.CONFIRMED_SCAM.label}</span>
            </div>
            <p className="leading-relaxed opacity-90">{STATUS_COPY.CONFIRMED_SCAM.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-rose-200">
              Gated: Reachable ONLY when sender email, domain, phone, or UPI ID matches a moderator-confirmed fraudulent record.
            </span>
          </div>
        </div>
      </section>

      {/* 3. Official Government & Statutory Portals */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          Curated Official Indian Portals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_PORTALS.map((portal) => (
            <div
              key={portal.key}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{portal.name}</h3>
                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                    {portal.domains.join(", ")}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{portal.use}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 truncate max-w-[200px]">
                  {portal.url}
                </span>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800"
                >
                  Visit Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Cybercrime Reporting & Helpline */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-950">
              National Cyber Crime Reporting Helpline: {HELPLINE.number}
            </h2>
            <p className="text-xs text-red-800">
              If you lost money or shared confidential passwords/OTPs, report immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/80 p-4 rounded-xl border border-red-200/80 space-y-2">
            <h3 className="font-bold text-slate-900">What to Keep as Evidence:</h3>
            <ul className="space-y-1.5 text-slate-700">
              {ADVISORY.evidenceToKeep.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/80 p-4 rounded-xl border border-red-200/80 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-slate-900">Golden Hour Financial Freezing:</h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Calling 1930 within the first 2 hours of an unauthorized UPI or net-banking debit drastically increases the chance of law enforcement freezing the fraudster's recipient bank account.
              </p>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 self-start"
            >
              Open cybercrime.gov.in <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Category-Specific Verification Guides */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            Domain Verification Playbook
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(DOMAIN_GUIDES) as OpportunityDomain[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDomain(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  selectedDomain === d
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {d.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{guide.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{guide.description}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mandatory Steps:
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {guide.keyVerificationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
