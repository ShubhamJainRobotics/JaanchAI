import { Link } from "react-router-dom";
import { ShieldCheck, PhoneCall, ExternalLink } from "lucide-react";
import { ADVISORY, HELPLINE } from "shared";

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Non-negotiable Disclaimer Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800 py-3.5 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-400 shrink-0"></span>
          <span>{ADVISORY.footer}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Jaanch</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Team QuadCore
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              AI-powered scam verification detector for Indian students. Helping you understand why an opportunity is risky and what to verify before you pay or share sensitive data.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 max-w-md">
              <PhoneCall className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                Cybercrime Emergency? Call <strong>{HELPLINE.number}</strong> or visit{" "}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-300 underline hover:text-brand-200 inline-flex items-center gap-0.5"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Tools & Verification</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/analyze" className="hover:text-white transition-colors">
                  Check an Offer
                </Link>
              </li>
              <li>
                <Link to="/link-check" className="hover:text-white transition-colors">
                  Link & Domain Inspector
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Official Portals Directory
                </Link>
              </li>
              <li>
                <a
                  href="https://internship.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  AICTE Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & transparency */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Trust & Transparency</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Scope & Limitations
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Data Handling
                </Link>
              </li>
              <li>
                <a
                  href="https://www.mca.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  MCA Master Data <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Jaanch. Developed for "Fake or Real" (Digital Trust & Safety) Hackathon.</p>
          <p className="mt-2 sm:mt-0">Built by Team QuadCore.</p>
        </div>
      </div>
    </footer>
  );
}
