import { useState } from "react";
import { Link } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { FeedbackPill } from "./FeedbackPill";

export function Footer() {
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "kn">("en");

  return (
    <footer className="mt-auto bg-background border-t border-border text-foreground transition-colors duration-150">
      {/* Main Footer Container */}
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-border">
          {/* Left Column: Branding */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="font-serif font-semibold text-2xl tracking-[0.1em] text-terracotta uppercase">
                Jaanch
              </span>
              <span className="text-border" aria-hidden="true">•</span>
              <span className="text-sm font-medium text-muted-foreground">जाँच</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              An independent, student-first verification utility. Check job, internship, and scholarship offers before sharing fees or private data.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-foreground font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-terracotta shrink-0" aria-hidden="true" />
              <span>National Cyber Crime Helpline: <strong>1930</strong></span>
            </div>
          </div>

          {/* Middle Column 1: Educational Guidance */}
          <div className="md:col-span-3 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle">
              EDUCATIONAL GUIDANCE
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jaanch is a non-commercial educational decision support tool. It highlights common warning signs and guides students to independently verify hiring credentials on government databases.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground pt-1">
              <li>
                <Link to="/resources" className="hover:text-terracotta transition-colors underline underline-offset-2">
                  Student Verification Guide
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-terracotta transition-colors underline underline-offset-2">
                  Audit Methodology & Facts
                </Link>
              </li>
            </ul>
          </div>

          {/* Middle Column 2: Local Privacy Architecture */}
          <div className="md:col-span-4 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle">
              LOCAL PRIVACY ARCHITECTURE
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Files and uploaded screenshots are read locally in your browser using client-side WebAssembly. Personal documents and unconsented contact information are never permanently retained on any server.
            </p>
            <div className="pt-1">
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-terracotta transition-colors underline underline-offset-2">
                Plain-Language Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© 2026 Jaanch Student Safety Initiative.</span>
            <span className="text-border" aria-hidden="true">•</span>
            <Link to="/about" className="hover:text-foreground transition-colors">
              Feedback
            </Link>
          </div>

          {/* Right Language Selector */}
          <div className="flex items-center gap-1.5 select-none">
            <span className="text-muted-foreground">Select language: [</span>
            <button
              type="button"
              onClick={() => setSelectedLang("en")}
              className={`hover:text-foreground cursor-pointer transition-colors ${
                selectedLang === "en" ? "font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              English
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={() => setSelectedLang("hi")}
              className={`hover:text-foreground cursor-pointer transition-colors ${
                selectedLang === "hi" ? "font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              हिंदी
            </button>
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={() => setSelectedLang("kn")}
              className={`hover:text-foreground cursor-pointer transition-colors ${
                selectedLang === "kn" ? "font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              ಕನ್ನಡ
            </button>
            <span className="text-muted-foreground">]</span>
          </div>
        </div>
      </div>

      {/* Floating Feedback Pill */}
      <FeedbackPill />
    </footer>
  );
}
