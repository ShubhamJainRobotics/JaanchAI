import { ADVISORY } from "shared";
import { Target, AlertTriangle, Users, Award } from "lucide-react";

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
          Problem Statement: "Fake or Real" (Digital Trust & Safety)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Jaanch ("जाँच")
        </h1>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          Built by <strong>Team QuadCore</strong>, Jaanch is an explainable risk-assessment tool designed to help Indian students navigate suspicious internship offers, scholarships, freelance work, and unsolicited digital communications.
        </p>
      </div>

      {/* The Core Mission */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Our Core Mission & Philosophy
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Students encounter opportunities on Telegram, WhatsApp, LinkedIn, and job boards daily. While many are genuine, bad actors increasingly exploit youthful ambition to harvest money through "refundable registration deposits", fake laptop kits, or identity theft.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed font-semibold text-slate-800">
          The non-negotiable principle of Jaanch is: <em>We support informed decisions. We do NOT pretend to prove that an opportunity is genuine or fraudulent.</em>
        </p>
      </section>

      {/* Honest Scope & Limitations */}
      <section className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Known Limitations & Honest Scope
          </h2>
        </div>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          {ADVISORY.limitations.map((lim, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Verification Policy & Reconciliation Decisions */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Verification Policy & Architecture Decisions
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          To protect students from false confidence while delivering rigorous fraud prevention, Jaanch implements explicit trust & safety principles:
        </p>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">•</span>
            <div>
              <strong>Verified is Evidence-Gated:</strong> Verified / Official requires an official registry match, exact corporate email domain, SPF/DKIM/DMARC header authentication, and an independently platform-fetched listing comparison. Text alone can never produce a verified verdict.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">•</span>
            <div>
              <strong>Confirmed Scam is Moderator-Gated:</strong> Hard disqualifiers found in message text immediately produce High Risk. An offer is marked Confirmed Scam only when an identifier matches an internal database record confirmed by human moderators.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">•</span>
            <div>
              <strong>Never Contact Suspect Hosts:</strong> Jaanch never opens TCP, TLS, or HTTP connections to suspect or user-supplied URLs. Only allowlisted official registry domains are ever fetched, with strict SSRF protection (IP pinning, loopback/private range blocking).
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">•</span>
            <div>
              <strong>Grammar Is Not Fraud Evidence:</strong> Major grammar or spelling errors contribute only 3 points (severity low, capped at 1 hit) and can never trigger High Risk alone, acknowledging that genuine senders also make typing mistakes.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">•</span>
            <div>
              <strong>Rule Engine Authority:</strong> Deterministic rules always govern verification status. Optional Gemini AI provides supplementary explanations and field fill-in, but can never raise status or override hard disqualifiers.
            </div>
          </li>
        </ul>
      </section>

      {/* Planned Evaluation Metrics */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Planned Evaluation Metrics
          </h2>
        </div>

        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
          {ADVISORY.plannedNotice}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Rather than citing unverified accuracy claims, the system architecture is designed around the following measurable benchmarks:
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          {ADVISORY.evaluationPlanned.map((metric, idx) => (
            <li key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0"></span>
              <span>{metric}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Team QuadCore */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Team QuadCore
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Developed with a focus on privacy-first design, deterministic heuristics, zero telemetry leakage, and evidence-grounded explainability for the Digital Trust & Safety hackathon.
        </p>
      </section>
    </div>
  );
}
