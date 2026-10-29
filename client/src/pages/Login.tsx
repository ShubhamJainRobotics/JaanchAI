import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export function Login() {
  const {
    signInWithEmail,
    signInWithGoogle,
    sendLoginOtp,
    verifyLoginOtp,
    verifySignupOtp,
    resendVerificationEmail,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/analyze";

  // Login Mode: 'password' | 'otp'
  const [mode, setMode] = useState<"password" | "otp">("password");

  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // OTP flow sub-step (for OTP mode or unconfirmed email verification)
  const [otpStep, setOtpStep] = useState<"enter_email" | "enter_otp">("enter_email");
  const [isVerifyingUnconfirmed, setIsVerifyingUnconfirmed] = useState(false);

  // Statuses
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Handle Password-based login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      setSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err: any) {
      const msg = err.message || "";
      if (
        msg.toLowerCase().includes("email not confirmed") ||
        err.code === "email_not_confirmed"
      ) {
        setIsVerifyingUnconfirmed(true);
        setOtpStep("enter_otp");
        setError("Your account requires email OTP confirmation. Enter the 6-digit code sent to your email below:");
        try {
          await resendVerificationEmail(email);
        } catch {}
      } else {
        setError(msg || "Failed to sign in. Please verify your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of OTP mode: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await sendLoginOtp(email);
      setOtpStep("enter_otp");
      setIsVerifyingUnconfirmed(false);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please check your email or wait a moment.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 of OTP mode: Verify OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isVerifyingUnconfirmed) {
        await verifySignupOtp(email, otp);
      } else {
        await verifyLoginOtp(email, otp);
      }
      setSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError(null);
      if (isVerifyingUnconfirmed) {
        await resendVerificationEmail(email);
      } else {
        await sendLoginOtp(email);
      }
      setResendSent(true);
      setTimeout(() => setResendSent(false), 8000);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. If rate-limited, please wait a minute.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-border rounded-md p-6 sm:p-8 shadow-elevation-1 space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-md flex items-center justify-center mx-auto">
            {otpStep === "enter_otp" ? (
              <KeyRound className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Log in to Jaanch
          </h1>
          <p className="text-xs text-muted-foreground">
            Access your saved offer verifications and checklist history
          </p>
        </div>

        {/* Mode Toggle: Password vs OTP */}
        {otpStep !== "enter_otp" && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-raised rounded-md text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setError(null);
              }}
              className={`min-h-[44px] rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                mode === "password"
                  ? "bg-surface text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("otp");
                setError(null);
              }}
              className={`min-h-[44px] rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                mode === "otp"
                  ? "bg-surface text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
              Email OTP
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-status-high-risk-bg text-status-high-risk-fg text-xs rounded-md border border-status-high-risk-border">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="flex items-center justify-center gap-2 p-4 bg-status-verified-bg border border-status-verified-border rounded-md text-center text-xs font-semibold text-status-verified-fg">
            <CheckCircle2 className="w-4 h-4 text-status-verified-icon" strokeWidth={2} aria-hidden="true" />
            <span>Login successful! Redirecting...</span>
          </div>
        )}

        {/* MODE 1: Password Login Form */}
        {mode === "password" && otpStep !== "enter_otp" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" strokeWidth={1.75} aria-hidden="true" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" strokeWidth={1.75} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-10 pr-12 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center absolute right-1 top-0 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full min-h-[44px] py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" /> : "Log In with Password"}
            </button>
          </form>
        )}

        {/* MODE 2: OTP Login - Step 1: Send OTP */}
        {mode === "otp" && otpStep === "enter_email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" strokeWidth={1.75} aria-hidden="true" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full min-h-[44px] py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" /> : "Send 6-Digit OTP"}
            </button>
          </form>
        )}

        {/* OTP Input Form */}
        {otpStep === "enter_otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-md text-xs text-foreground space-y-1 text-center">
              <p>
                Enter the 6-digit verification code sent to <span className="font-bold">{email}</span>.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Check your inbox and spam folder.
              </p>
            </div>

            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full min-h-[48px] py-3 px-4 bg-surface-raised border border-border rounded-md text-center text-2xl font-mono tracking-[0.5em] text-foreground focus:bg-surface focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || success}
              className="w-full min-h-[44px] py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" /> : "Verify OTP & Log In"}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setOtpStep("enter_email");
                  setError(null);
                }}
                className="min-h-[44px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                Change Method
              </button>

              <button
                type="button"
                disabled={resendLoading || resendSent}
                onClick={handleResendOtp}
                className="min-h-[44px] text-primary hover:underline font-semibold disabled:text-muted-foreground cursor-pointer"
              >
                {resendSent ? "✓ OTP Resent!" : resendLoading ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Secondary options (Google & Sign up links) */}
        {otpStep !== "enter_otp" && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-3 text-muted-foreground font-semibold tracking-wider">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full min-h-[44px] py-2.5 border border-border hover:bg-surface-raised text-foreground font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="var(--color-brand-google-blue)"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="var(--color-brand-google-green)"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="var(--color-brand-google-yellow)"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="var(--color-brand-google-red)"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="text-[11px] text-muted-foreground text-center leading-normal">
              ⚡ Google Sign-In authenticates directly via your Google account (no password or OTP needed).
            </p>

            <div className="pt-2 text-center space-y-2 text-xs text-muted-foreground">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-bold hover:underline min-h-[44px] inline-flex items-center">
                  Sign up
                </Link>
              </p>
              <p>
                <Link to="/analyze" className="text-muted-foreground hover:text-foreground font-medium min-h-[44px] inline-flex items-center">
                  Continue as Guest (No login required) →
                </Link>
              </p>
              <p className="pt-2 border-t border-border text-[11px]">
                By signing in, you agree to our{" "}
                <Link to="/about" className="text-primary underline hover:text-primary/80">
                  Privacy Principles
                </Link>
                . We never sell your data or share your reports.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
