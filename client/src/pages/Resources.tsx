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
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Official Verification Directory & Guides
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trusted portals, government helplines, and domain-specific checklists for Indian students.
        </p>
      </div>

      {/* 1. Student Safety Rules */}
      <StudentSafetyRules />

      {/* 2. How Jaanch Decides — The 5 Verification Statuses */}
      <section className="bg-surface border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Scale className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              How Jaanch Decides — Verification Policy
            </h2>
            <p className="text-xs text-muted-foreground">
              Evidence-gated 5-level status model. Verified and Confirmed are never assigned from text alone.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-md bg-status-verified-bg border border-status-verified-border text-status-verified-fg space-y-1.5">
            <div className="flex items-center gap-2 font-black text-status-verified-fg">
              <CheckCircle2 className="w-4 h-4 text-status-verified-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.VERIFIED_OFFICIAL.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.VERIFIED_OFFICIAL.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-status-verified-fg">
              Requires: Official registry match + exact corporate email domain + SPF/DKIM/DMARC headers + platform-fetched listing match.
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-likely-bg border border-status-likely-border text-status-likely-fg space-y-1.5">
            <div className="flex items-center gap-2 font-black text-status-likely-fg">
              <ShieldCheck className="w-4 h-4 text-status-likely-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.LIKELY_GENUINE.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.LIKELY_GENUINE.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-status-likely-fg">
              Assigned when zero scam signals are found and completeness is satisfactory, but official listing was not cross-referenced.
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-review-bg border border-status-review-border text-status-review-fg space-y-1.5">
            <div className="flex items-center gap-2 font-black text-status-review-fg">
              <AlertTriangle className="w-4 h-4 text-status-review-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.NEEDS_REVIEW.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.NEEDS_REVIEW.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-status-review-fg">
              Assigned when an offer uses free webmail, has 3+ missing details, unverified recruiters, or listing discrepancies.
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-high-risk-bg border border-status-high-risk-border text-status-high-risk-fg space-y-1.5">
            <div className="flex items-center gap-2 font-black text-status-high-risk-fg">
              <ShieldAlert className="w-4 h-4 text-status-high-risk-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.HIGH_RISK.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.HIGH_RISK.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-status-high-risk-fg">
              Assigned immediately on any hard disqualifier (fees, UPI/crypto demands, credential theft, lookalike domain, fake government scheme).
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-confirmed-scam-bg border border-status-confirmed-scam-border text-status-confirmed-scam-fg space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-2 font-black text-status-confirmed-scam-fg">
              <Ban className="w-4 h-4 text-status-confirmed-scam-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.CONFIRMED_SCAM.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.CONFIRMED_SCAM.meaning}</p>
            <span className="text-[11px] font-bold block pt-1 text-status-confirmed-scam-fg">
              Gated: Reachable ONLY when sender email, domain, phone, or UPI ID matches a moderator-confirmed fraudulent record.
            </span>
          </div>
        </div>
      </section>

      {/* 3. Official Government & Statutory Portals */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
          Curated Official Indian Portals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_PORTALS.map((portal) => (
            <div
              key={portal.key}
              className="bg-surface border border-border rounded-md p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-foreground">{portal.name}</h3>
                  <span className="text-[10px] font-mono uppercase bg-surface-raised text-muted-foreground px-2 py-0.5 rounded-sm font-semibold">
                    {portal.domains.join(", ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{portal.use}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                  {portal.url}
                </span>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Visit Portal <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Cybercrime Reporting & Helpline */}
      <section className="p-6 rounded-md bg-surface-raised border border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-status-high-risk-bg text-status-high-risk-fg border border-status-high-risk-border flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              National Cyber Crime Reporting Helpline: {HELPLINE.number}
            </h2>
            <p className="text-xs text-muted-foreground">
              If you lost money or shared confidential passwords/OTPs, report immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-surface p-4 rounded-md border border-border space-y-2">
            <h3 className="font-bold text-foreground">What to Keep as Evidence:</h3>
            <ul className="space-y-1.5 text-muted-foreground">
              {ADVISORY.evidenceToKeep.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface p-4 rounded-md border border-border flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-foreground">Golden Hour Financial Freezing:</h3>
              <p className="text-muted-foreground mt-1 leading-relaxed">
                Calling 1930 within the first 2 hours of an unauthorized UPI or net-banking debit drastically increases the chance of law enforcement freezing the fraudster's recipient bank account.
              </p>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start"
            >
              Open cybercrime.gov.in <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Category-Specific Verification Guides */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            Domain Verification Playbook
          </h2>

          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(DOMAIN_GUIDES) as OpportunityDomain[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDomain(d)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  selectedDomain === d
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-surface-raised hover:bg-surface text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {d.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground">{guide.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{guide.description}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mandatory Steps:
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-foreground">
              {guide.keyVerificationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
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
