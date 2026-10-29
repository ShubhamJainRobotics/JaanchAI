import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Search, Lock, FileSearch } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Digital Trust & Safety — Problem Statement: "Fake or Real"</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
          Spot Warning Signs <br className="hidden sm:inline" />
          <span className="text-primary">
            Before You Pay or Share Private Data
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Students encounter hundreds of internship offers, scholarships, and freelance messages online. 
          Jaanch helps you understand <strong>why</strong> something may be risky and <strong>what you should independently verify</strong> before taking action.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/analyze"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            Check an Offer Now
            <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link
            to="/link-check"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-surface hover:bg-surface-raised text-foreground font-semibold text-base border border-border shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            Inspect a Link
          </Link>
        </div>

        {/* Trust & Guarantee Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="bg-surface p-4 rounded-md border border-border shadow-xs">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-2.5">
              <FileSearch className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Deterministic Engine</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Plain TypeScript rules for upfront fees, fake domains, and urgency tactics.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-md border border-border shadow-xs">
            <div className="w-8 h-8 rounded-md bg-warning/10 text-warning flex items-center justify-center mb-2.5">
              <Lock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-foreground">No False Verdicts</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Never declares 'safe' or 'confirmed scam'. We show observed facts & unknowns.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-md border border-border shadow-xs">
            <div className="w-8 h-8 rounded-md bg-status-verified-bg text-status-verified-fg border border-status-verified-border flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Official Portals</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Deep-links to AICTE, National Scholarship Portal (NSP), and MCA Master Data.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-md border border-border shadow-xs">
            <div className="w-8 h-8 rounded-md bg-surface-raised text-foreground flex items-center justify-center mb-2.5">
              <Search className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Client-Side OCR</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              WhatsApp screenshots & PDFs are parsed in your browser. Files never uploaded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
