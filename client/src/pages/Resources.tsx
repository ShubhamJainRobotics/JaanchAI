import { useState } from "react";
import {
  OFFICIAL_PORTALS,
  HELPLINE,
  ADVISORY,
  DOMAIN_GUIDES,
  OpportunityDomain,
  STATUS_COPY,
} from "shared";
import {
  ExternalLink,
  PhoneCall,
  ShieldCheck,
  BookOpen,
  Scale,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  MessageSquare,
  Building2,
} from "lucide-react";
import { StudentSafetyRules } from "../components/results/StudentSafetyRules";

const DOMAIN_ICONS: Record<OpportunityDomain, typeof GraduationCap> = {
  internship: GraduationCap,
  scholarship: Award,
  job: Briefcase,
  freelance: Building2,
  competition: Award,
  website: Globe,
  message_other: MessageSquare,
};

export function Resources() {
  const [openDomain, setOpenDomain] = useState<OpportunityDomain | null>("internship");

  const toggleDomain = (domain: OpportunityDomain) => {
    setOpenDomain((current) => (current === domain ? null : domain));
  };

  const accordionDomains: OpportunityDomain[] = [
    "internship",
    "scholarship",
    "job",
    "freelance",
    "competition",
    "website",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block mb-1.5 select-none">
          KNOWLEDGE BASE & GUIDELINES
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal text-foreground tracking-tight">
          Official Verification Directory &amp; Guides
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Authoritative portals, statutory helplines, and domain-specific verification guides for Indian students.
        </p>
      </div>

      {/* 1. Full Eight Student Safety Rules */}
      <StudentSafetyRules />

      {/* 2. Category Verification Guides — Accordion by Offer Type */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            Verification Guides by Offer Type
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step-by-step verification procedures and official portals for each type of opportunity.
          </p>
        </div>

        <div className="space-y-2.5">
          {accordionDomains.map((domain) => {
            const guide = DOMAIN_GUIDES[domain];
            const isOpen = openDomain === domain;
            const Icon = DOMAIN_ICONS[domain] || BookOpen;

            // Find recommended portal definitions
            const portals = (guide.recommendedPortals || [])
              .map((portalKey) => OFFICIAL_PORTALS.find((p) => p.key === portalKey))
              .filter(Boolean);

            return (
              <div
                key={domain}
                className="bg-surface rounded-md border border-border shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className="w-full min-h-[52px] p-4 text-left flex items-center justify-between gap-3 hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={isOpen}
                  aria-controls={`accordion-panel-${domain}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {guide.title}
                      </h3>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {domain}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div
                    id={`accordion-panel-${domain}`}
                    className="p-5 border-t border-border space-y-4 bg-surface-raised/40"
                  >
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                      {guide.description}
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Mandatory Verification Steps:
                      </h4>
                      <ol className="space-y-2 text-xs sm:text-sm text-foreground">
                        {guide.keyVerificationSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Direct Official Portal Links */}
                    {portals.length > 0 && (
                      <div className="pt-3 border-t border-border space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Direct Official Verification Portals:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {portals.map((portal) => {
                            if (!portal) return null;
                            return (
                              <a
                                key={portal.key}
                                href={portal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-surface border border-border hover:border-primary/40 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                              >
                                <Building2 className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                                <span>{portal.name}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-0.5" strokeWidth={1.75} aria-hidden="true" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Official Government & Statutory Portals Directory */}
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
                  <span className="text-[10px] uppercase bg-surface-raised text-muted-foreground px-2 py-0.5 rounded-sm font-semibold tracking-wide">
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

      {/* 4. Cybercrime Reporting & Emergency Helpline */}
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

      {/* 5. How Jaanch Decides — The 5 Verification Statuses */}
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
    </div>
  );
}
