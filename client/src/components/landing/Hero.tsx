import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Search, Lock, FileSearch } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/50 via-slate-50/20 to-transparent -z-10 pointer-events-none rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>Digital Trust & Safety — Problem Statement: "Fake or Real"</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Spot Warning Signs <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-800">
            Before You Pay or Share Private Data
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Students encounter hundreds of internship offers, scholarships, and freelance messages online. 
          Jaanch helps you understand <strong>why</strong> something may be risky and <strong>what you should independently verify</strong> before taking action.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/analyze"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <ShieldCheck className="w-5 h-5" />
            Check an Offer Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            to="/link-check"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-300 shadow-xs transition-colors"
          >
            <Search className="w-4 h-4 text-slate-500" />
            Inspect a Link
          </Link>
        </div>

        {/* Trust & Guarantee Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center mb-2.5">
              <FileSearch className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Deterministic Engine</h2>
            <p className="text-xs text-slate-500 mt-1">
              Plain TypeScript rules for upfront fees, fake domains, and urgency tactics.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">No False Verdicts</h2>
            <p className="text-xs text-slate-500 mt-1">
              Never declares 'safe' or 'confirmed scam'. We show observed facts & unknowns.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Official Portals</h2>
            <p className="text-xs text-slate-500 mt-1">
              Deep-links to AICTE, National Scholarship Portal (NSP), and MCA Master Data.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2.5">
              <Search className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Client-Side OCR</h2>
            <p className="text-xs text-slate-500 mt-1">
              WhatsApp screenshots & PDFs are parsed in your browser. Files never uploaded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
