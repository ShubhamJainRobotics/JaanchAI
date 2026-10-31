import { Link } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { FeedbackPill } from "./FeedbackPill";
import { useLanguage } from "../../context/LanguageContext";

export function Footer() {
  const { currentLang, setLang, t } = useLanguage();

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
              {t.footer.tagline}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-foreground font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-terracotta shrink-0" aria-hidden="true" />
              <span>{t.footer.helpline_label}<strong>1930</strong></span>
            </div>
          </div>

          {/* Middle Column 1: Educational Guidance */}
          <div className="md:col-span-3 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle">
              {t.footer.edu_title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.footer.edu_desc}
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground pt-1">
              <li>
                <Link to="/resources" className="hover:text-terracotta transition-colors underline underline-offset-2">
                  {t.footer.edu_link1}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-terracotta transition-colors underline underline-offset-2">
                  {t.footer.edu_link2}
                </Link>
              </li>
            </ul>
          </div>

          {/* Middle Column 2: Local Privacy Architecture */}
          <div className="md:col-span-4 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle">
              {t.footer.privacy_title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.footer.privacy_desc}
            </p>
            <div className="pt-1">
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-terracotta transition-colors underline underline-offset-2">
                {t.footer.privacy_link}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{t.footer.copyright}</span>
            <span className="text-border" aria-hidden="true">•</span>
            <Link to="/about" className="hover:text-foreground transition-colors">
              {t.footer.feedback}
            </Link>
          </div>

          {/* Right Language Selector */}
          <div className="flex items-center gap-1.5 select-none" role="group" aria-label="Language selection">
            <span className="text-muted-foreground">{t.footer.select_lang} [</span>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`hover:text-foreground cursor-pointer transition-colors px-1 py-0.5 rounded ${
                currentLang === "en" ? "font-bold text-foreground bg-surface-raised shadow-xs" : "text-muted-foreground"
              }`}
              aria-label="Select English language"
              aria-pressed={currentLang === "en"}
            >
              {t.footer.lang_en}
            </button>
            <span className="text-border" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`hover:text-foreground cursor-pointer transition-colors px-1 py-0.5 rounded ${
                currentLang === "hi" ? "font-bold text-foreground bg-surface-raised shadow-xs" : "text-muted-foreground"
              }`}
              aria-label="Select Hindi language"
              aria-pressed={currentLang === "hi"}
            >
              {t.footer.lang_hi}
            </button>
            <span className="text-border" aria-hidden="true">|</span>
            <button
              type="button"
              onClick={() => setLang("kn")}
              className={`hover:text-foreground cursor-pointer transition-colors px-1 py-0.5 rounded ${
                currentLang === "kn" ? "font-bold text-foreground bg-surface-raised shadow-xs" : "text-muted-foreground"
              }`}
              aria-label="Select Kannada language"
              aria-pressed={currentLang === "kn"}
            >
              {t.footer.lang_kn}
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
