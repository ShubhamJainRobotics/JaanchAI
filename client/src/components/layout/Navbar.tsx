import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../context/LanguageContext";
import { MobileNavDrawer } from "./MobileNavDrawer";

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border transition-colors duration-150">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Brand Logo & Sub-brand label */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm py-1"
            >
              <span className="font-serif font-semibold text-2xl tracking-[0.1em] text-terracotta uppercase">
                JAANCH
              </span>
            </Link>
            <span className="text-border text-base font-light select-none" aria-hidden="true">
              |
            </span>
            <span className="text-xs uppercase tracking-[0.08em] font-medium text-muted-subtle hidden sm:inline select-none">
              {t.nav.brand_sub}
            </span>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            <a
              href={isHome ? "#how-it-works" : "/#how-it-works"}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.nav.how_it_works}
            </a>
            <a
              href={isHome ? "#coverage" : "/#coverage"}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.nav.coverage_facts}
            </a>
            <Link
              to="/resources"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.nav.verification_guide}
            </Link>
            <a
              href={isHome ? "#helpline" : "/#helpline"}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {t.nav.helpline_nav}
            </a>
          </nav>

          {/* Right Section: Language Selectors | Sign in | Check an offer */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Language Selector: EN / हिंदी / ಕನ್ನಡ */}
            <div className="flex items-center text-xs font-medium select-none" role="group" aria-label="Language selection">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  currentLang === "en"
                    ? "font-bold text-foreground bg-surface-raised shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Select English language"
                aria-pressed={currentLang === "en"}
              >
                EN
              </button>
              <span className="text-border px-0.5" aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  currentLang === "hi"
                    ? "font-bold text-foreground bg-surface-raised shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Select Hindi language"
                aria-pressed={currentLang === "hi"}
              >
                हिंदी
              </button>
              <span className="text-border px-0.5" aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setLang("kn")}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  currentLang === "kn"
                    ? "font-bold text-foreground bg-surface-raised shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Select Kannada language"
                aria-pressed={currentLang === "kn"}
              >
                ಕನ್ನಡ
              </button>
            </div>

            <span className="text-border text-sm font-light select-none" aria-hidden="true">
              |
            </span>

            {/* Theme Toggle (subtle) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-warning" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>

            {/* Auth / Sign in */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="text-sm font-medium text-foreground hover:text-terracotta px-2 py-1 transition-colors"
                >
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-destructive p-1 rounded-sm cursor-pointer transition-colors"
                  title={t.nav.sign_out}
                  aria-label={t.nav.sign_out}
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-foreground hover:text-terracotta transition-colors px-2 py-1"
              >
                {t.nav.sign_in}
              </Link>
            )}

            {/* Primary Action Button: Solid Black */}
            <Link
              to="/analyze"
              className="bg-primary text-primary-foreground hover:bg-neutral-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t.nav.check_offer}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-warning" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-foreground hover:bg-surface-raised rounded-md flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile Nav Drawer */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        triggerRef={menuButtonRef}
      />
    </header>
  );
}
