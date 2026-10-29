import { ADVISORY, STATUS_COPY } from "shared";
import {
  Target,
  AlertTriangle,
  Users,
  Award,
  Scale,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Ban,
} from "lucide-react";

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
          Built for the &ldquo;Fake or Real&rdquo; (Digital Trust &amp; Safety) problem statement
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          About Jaanch (&ldquo;जाँच&rdquo;)
        </h1>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed">
          Built by <strong>Team QuadCore</strong>, Jaanch is an explainable risk-assessment tool designed to help Indian students navigate suspicious internship offers, scholarships, freelance work, and unsolicited digital communications.
        </p>
      </div>

      {/* The Core Mission */}
      <section className="bg-surface border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Target className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Our Core Mission &amp; Philosophy
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Students encounter opportunities on Telegram, WhatsApp, LinkedIn, and job boards daily. While many are genuine, bad actors increasingly exploit youthful ambition to harvest money through &ldquo;refundable registration deposits&rdquo;, fake laptop kits, or identity theft.
        </p>
        <p className="text-sm text-foreground leading-relaxed font-semibold">
          The non-negotiable principle of Jaanch is: <em>We support informed decisions. We do NOT pretend to prove that an opportunity is genuine or fraudulent.</em>
        </p>
      </section>

      {/* How Jaanch Decides — The 5 Verification Statuses */}
      <section className="bg-surface border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Scale className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              How Jaanch Decides — The 5 Verification Statuses
            </h2>
            <p className="text-xs text-muted-foreground">
              Evidence-gated status model. Statuses are determined by transparent heuristics and verified evidence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-4 rounded-md bg-status-verified-bg border border-status-verified-border text-status-verified-fg space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-status-verified-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.VERIFIED_OFFICIAL.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.VERIFIED_OFFICIAL.meaning}</p>
            <span className="text-[11px] font-bold block pt-1">
              Required: Registry match + corporate domain + SPF/DKIM authentication + listing cross-reference.
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-likely-bg border border-status-likely-border text-status-likely-fg space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-status-likely-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.LIKELY_GENUINE.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.LIKELY_GENUINE.meaning}</p>
            <span className="text-[11px] font-bold block pt-1">
              Required: 0 scam signals, satisfactory completeness, but unconfirmed on official listing.
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-review-bg border border-status-review-border text-status-review-fg space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-status-review-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.NEEDS_REVIEW.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.NEEDS_REVIEW.meaning}</p>
            <span className="text-[11px] font-bold block pt-1">
              Triggered: Free webmail, 3+ missing details, unverified recruiter, or minor discrepancies.
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-high-risk-bg border border-status-high-risk-border text-status-high-risk-fg space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-status-high-risk-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.HIGH_RISK.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.HIGH_RISK.meaning}</p>
            <span className="text-[11px] font-bold block pt-1">
              Triggered: Immediate on hard disqualifiers (advance fees, UPI/crypto demands, credential theft).
            </span>
          </div>

          <div className="p-4 rounded-md bg-status-confirmed-scam-bg border border-status-confirmed-scam-border text-status-confirmed-scam-fg space-y-1 md:col-span-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Ban className="w-4 h-4 text-status-confirmed-scam-icon shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{STATUS_COPY.CONFIRMED_SCAM.label}</span>
            </div>
            <p className="leading-relaxed opacity-95">{STATUS_COPY.CONFIRMED_SCAM.meaning}</p>
            <span className="text-[11px] font-bold block pt-1">
              Triggered: Reachable ONLY when sender email, domain, phone, or UPI matches a moderator-confirmed fraud record.
            </span>
          </div>
        </div>
      </section>

      {/* Honest Scope & Limitations */}
      <section className="bg-warning/10 border border-warning/30 rounded-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-warning/20 text-warning flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Known Limitations &amp; Honest Scope
          </h2>
        </div>
        <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
          {ADVISORY.limitations.map((lim, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-warning font-bold">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Verification Policy & Architecture Decisions */}
      <section className="bg-surface border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          Verification Policy &amp; Architecture Decisions
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          To protect students from false confidence while delivering rigorous fraud prevention, Jaanch implements explicit trust &amp; safety principles:
        </p>
        <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <div>
              <strong className="text-foreground">Verified is Evidence-Gated:</strong> Verified / Official requires an official registry match, exact corporate email domain, SPF/DKIM/DMARC header authentication, and an independently platform-fetched listing comparison. Text alone can never produce a verified verdict.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <div>
              <strong className="text-foreground">Confirmed Scam is Moderator-Gated:</strong> Hard disqualifiers found in message text immediately produce High Risk. An offer is marked Confirmed Scam only when an identifier matches an internal database record confirmed by human moderators.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <div>
              <strong className="text-foreground">Never Contact Suspect Hosts:</strong> Jaanch never opens TCP, TLS, or HTTP connections to suspect or user-supplied URLs. Only allowlisted official registry domains are ever fetched, with strict SSRF protection (IP pinning, loopback/private range blocking).
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <div>
              <strong className="text-foreground">Grammar Is Not Fraud Evidence:</strong> Major grammar or spelling errors contribute only 3 points (severity low, capped at 1 hit) and can never trigger High Risk alone, acknowledging that genuine senders also make typing mistakes.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <div>
              <strong className="text-foreground">Rule Engine Authority:</strong> Deterministic rules always govern verification status. Optional Gemini AI provides supplementary explanations and field fill-in, but can never raise status or override hard disqualifiers.
            </div>
          </li>
        </ul>
      </section>

      {/* Planned Evaluation Metrics */}
      <section className="bg-surface border border-border rounded-md p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-status-verified-bg text-status-verified-fg border border-status-verified-border flex items-center justify-center">
            <Award className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Planned Evaluation Metrics
          </h2>
        </div>

        <div className="p-3.5 bg-status-verified-bg border border-status-verified-border rounded-md text-xs font-bold text-status-verified-fg">
          {ADVISORY.plannedNotice}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Rather than citing unverified accuracy claims, the system architecture is designed around the following measurable benchmarks:
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground">
          {ADVISORY.evaluationPlanned.map((metric, idx) => (
            <li key={idx} className="p-3 bg-surface-raised rounded-md border border-border flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
              <span>{metric}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Team QuadCore */}
      <section className="bg-surface-raised border border-border rounded-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <Users className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Team QuadCore
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Developed with a focus on privacy-first design, deterministic heuristics, zero telemetry leakage, and evidence-grounded explainability for the Digital Trust &amp; Safety hackathon.
        </p>
      </section>
    </div>
  );
}
