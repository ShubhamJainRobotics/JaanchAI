import { Link } from "react-router-dom";
import { ShieldCheck, PhoneCall, ExternalLink } from "lucide-react";
import { ADVISORY, HELPLINE } from "shared";

export function Footer() {
  return (
    <footer className="mt-auto bg-surface-raised border-t border-border text-muted-foreground transition-colors duration-150">
      {/* Non-negotiable Disclaimer Banner */}
      <div className="bg-surface border-b border-border py-3.5 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-foreground max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
          <span>{ADVISORY.footer}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">Jaanch</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-surface text-muted-foreground border border-border">
                Team QuadCore
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              AI-powered scam verification detector for Indian students. Helping you understand why an opportunity is risky and what to verify before you pay or share sensitive data.
            </p>
            <div className="flex items-center gap-2.5 text-xs text-foreground bg-surface p-3.5 rounded-md border border-border max-w-md shadow-sm">
              <PhoneCall className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>
                Cybercrime Emergency? Call <strong>{HELPLINE.number}</strong> or visit{" "}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link underline hover:text-link-hover inline-flex items-center gap-0.5 font-semibold"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Tools & Verification</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/analyze" className="text-muted-foreground hover:text-foreground transition-colors">
                  Check an Offer
                </Link>
              </li>
              <li>
                <Link to="/link-check" className="text-muted-foreground hover:text-foreground transition-colors">
                  Link & Domain Inspector
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Official Portals Directory
                </Link>
              </li>
              <li>
                <a
                  href="https://internship.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  AICTE Portal <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & transparency */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Trust & Transparency</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  Scope & Limitations
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy & Data Handling
                </Link>
              </li>
              <li>
                <a
                  href="https://www.mca.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  MCA Master Data <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Jaanch. Developed for "Fake or Real" (Digital Trust & Safety) Hackathon.</p>
          <p className="mt-2 sm:mt-0 font-medium">Built by Team QuadCore.</p>
        </div>
      </div>
    </footer>
  );
}
