import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, User as UserIcon, LogOut, History, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../context/LanguageContext";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function MobileNavDrawer({ isOpen, onClose, triggerRef }: MobileNavDrawerProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLang, setLang, t } = useLanguage();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { name: t.nav.check_offer, path: "/analyze" },
    { name: "Link checker", path: "/link-check" },
    { name: t.nav.verification_guide, path: "/resources" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Focus trap & Esc handler
  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      ref={drawerRef}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity"
        onClick={() => {
          onClose();
          triggerRef.current?.focus();
        }}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-surface border-l border-border shadow-elevation-2 flex flex-col justify-between overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link
            to="/"
            onClick={() => {
              onClose();
              triggerRef.current?.focus();
            }}
            className="min-h-[44px] flex items-center gap-2 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-serif font-semibold text-xl tracking-[0.1em] text-terracotta uppercase">
              JAANCH
            </span>
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => {
              onClose();
              triggerRef.current?.focus();
            }}
            className="min-h-[44px] min-w-[44px] p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close navigation menu"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5 flex-1" aria-label="Mobile main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => {
                onClose();
                triggerRef.current?.focus();
              }}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-md text-base font-medium flex items-center transition-colors ${
                isActive(link.path)
                  ? "bg-surface-raised text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-raised/60"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated && (
            <>
              <Link
                to="/history"
                onClick={() => {
                  onClose();
                  triggerRef.current?.focus();
                }}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
                  isActive("/history")
                    ? "bg-surface-raised text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised/60"
                }`}
              >
                <History className="w-5 h-5" aria-hidden="true" />
                <span>{t.nav.my_history}</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => {
                  onClose();
                  triggerRef.current?.focus();
                }}
                className={`min-h-[44px] px-3.5 py-2.5 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
                  isActive("/settings")
                    ? "bg-surface-raised text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised/60"
                }`}
              >
                <UserIcon className="w-5 h-5" aria-hidden="true" />
                <span>{t.nav.settings}</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom Language, Theme & Auth */}
        <div className="p-4 border-t border-border space-y-3 bg-surface-raised/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Language</span>
            <div className="flex items-center text-xs font-medium select-none" role="group" aria-label="Language selection">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded min-h-[36px] cursor-pointer transition-colors ${
                  currentLang === "en" ? "font-bold text-foreground bg-surface border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <span className="text-border px-0.5" aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2 py-1 rounded min-h-[36px] cursor-pointer transition-colors ${
                  currentLang === "hi" ? "font-bold text-foreground bg-surface border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                हिंदी
              </button>
              <span className="text-border px-0.5" aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setLang("kn")}
                className={`px-2 py-1 rounded min-h-[36px] cursor-pointer transition-colors ${
                  currentLang === "kn" ? "font-bold text-foreground bg-surface border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-md border border-border text-foreground hover:bg-surface-raised transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-warning" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </button>
          </div>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2 truncate">
                Signed in as <strong className="text-foreground">{user?.email}</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  onClose();
                  triggerRef.current?.focus();
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-surface-raised flex items-center justify-center gap-2 cursor-pointer border border-border"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>{t.nav.sign_out}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => {
                  onClose();
                  triggerRef.current?.focus();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 flex items-center justify-center text-sm font-medium text-foreground border border-border rounded-md hover:bg-surface-raised transition-colors"
              >
                {t.nav.log_in}
              </Link>
              <Link
                to="/signup"
                onClick={() => {
                  onClose();
                  triggerRef.current?.focus();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 flex items-center justify-center text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-md shadow-xs transition-colors"
              >
                {t.nav.sign_up}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
