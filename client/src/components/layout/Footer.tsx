import { Link } from "react-router-dom";
import { ShieldCheck, PhoneCall, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-surface-raised border-t border-border text-muted-foreground transition-colors duration-150">
      {/* Standing Disclaimer Banner */}
      <div className="bg-surface border-b border-border py-3 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-foreground max-w-4xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
          <span>Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent.</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Brand & mission */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-foreground">Jaanch</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-surface text-muted-foreground border border-border">
                जाँच
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              A student-first verification utility for internships, scholarships, and opportunities.
            </p>
          </div>

          {/* Links: Resources, About, Privacy, Link checker */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/link-check" className="text-muted-foreground hover:text-foreground transition-colors">
                  Link checker
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Helpline Row */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <PhoneCall className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>
              If you've lost money to online fraud: call <strong>1930</strong> or visit{" "}
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

          <div>
            <span>Team QuadCore · Built for Indian college students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
