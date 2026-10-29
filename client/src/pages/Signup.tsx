import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

export function Signup() {
  const { signUpWithEmail, verifySignupOtp, resendVerificationEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // UI flow states: 'form' | 'otp'
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Step 1: Submit details & Password
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await signUpWithEmail(email, password, fullName);
      if (data?.session) {
        setSuccess(true);
        setTimeout(() => navigate("/analyze"), 1500);
      } else {
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await verifySignupOtp(email, otp);
      setSuccess(true);
      setTimeout(() => navigate("/analyze"), 1500);
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP. Please verify the 6-digit code sent to your email.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError(null);
      await resendVerificationEmail(email);
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
            {step === "otp" ? (
              <KeyRound className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {step === "otp" ? "Verify with OTP" : "Create your Account"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === "otp"
              ? `Enter the 6-digit verification code sent to ${email}`
              : "Set up your credentials to save analyses and track verification progress"}
          </p>
        </div>

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
            <span>Account verified successfully! Redirecting to analyzer...</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "form" && (
          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" strokeWidth={1.75} aria-hidden="true" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

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
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" strokeWidth={1.75} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" /> : "Sign Up & Send OTP"}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-3 text-muted-foreground font-semibold font-mono">Or</span>
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
              Sign up with Google
            </button>

            <p className="text-[11px] text-muted-foreground text-center leading-normal">
              ⚡ Google Sign-In automatically verifies your email through your Google account (no password or OTP required). To set a password and verify with an OTP code, use the form above.
            </p>

            <div className="pt-2 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline min-h-[44px] inline-flex items-center">
                Log in
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-md text-xs text-foreground space-y-1 text-center">
              <p>
                We sent a 6-digit verification code to <span className="font-bold">{email}</span>.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Check your inbox and spam folder. Enter the code below to complete registration.
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" /> : "Verify OTP & Activate Account"}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError(null);
                }}
                className="min-h-[44px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                Edit Details
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
      </div>
    </div>
  );
}
