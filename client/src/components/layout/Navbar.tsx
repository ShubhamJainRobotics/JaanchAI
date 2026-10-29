import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Menu, X, User as UserIcon, LogOut, History, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Check Offer", path: "/analyze" },
    { name: "Link Checker", path: "/link-check" },
    { name: "Resources", path: "/resources" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:bg-primary-hover transition-colors">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                Jaanch
              </span>
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-surface-raised text-primary border border-border">
                जाँच
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 min-h-[44px] inline-flex items-center rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-surface-raised text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised/60"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                to="/history"
                className={`px-3.5 py-2 min-h-[44px] inline-flex items-center rounded-md text-sm font-medium transition-colors gap-1.5 ${
                  isActive("/history")
                    ? "bg-surface-raised text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised/60"
                }`}
              >
                <History className="w-4 h-4" aria-hidden="true" />
                <span>History</span>
              </Link>
            )}
          </nav>

          {/* User actions + Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors flex items-center justify-center cursor-pointer"
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-warning" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/settings"
                  className="min-h-[44px] flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary px-3.5 py-2 rounded-md border border-border hover:bg-surface-raised transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span>{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive p-2.5 rounded-md hover:bg-surface-raised transition-colors cursor-pointer flex items-center justify-center"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="min-h-[44px] px-4 py-2 inline-flex items-center text-sm font-medium text-foreground hover:bg-surface-raised rounded-md transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="min-h-[44px] px-4 py-2 inline-flex items-center text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-hover rounded-md shadow-sm transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger & theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] p-2 rounded-md text-muted-foreground hover:text-foreground flex items-center justify-center"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-warning" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] p-2 text-foreground hover:bg-surface-raised rounded-md flex items-center justify-center"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-md text-base font-medium min-h-[44px] flex items-center ${
                isActive(link.path)
                  ? "bg-surface-raised text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-raised/50"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-surface-raised/50 min-h-[44px] flex items-center"
              >
                My History
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-surface-raised/50 min-h-[44px] flex items-center"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-md text-base font-medium text-destructive hover:bg-surface-raised min-h-[44px] flex items-center"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-border flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-sm font-medium border border-border text-foreground rounded-md hover:bg-surface-raised"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 min-h-[44px] flex items-center justify-center text-sm font-semibold bg-primary hover:bg-primary-hover text-primary-foreground rounded-md shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
