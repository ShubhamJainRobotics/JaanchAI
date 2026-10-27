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
        // Account needs OTP verification -> seamlessly transition to OTP entry!
        setIsVerifyingUnconfirmed(true);
        setOtpStep("enter_otp");
        setError("Your account requires email OTP confirmation. Enter the 6-digit code sent to your email below:");
        // Also trigger resend so an OTP is fresh
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
        // Verify account activation OTP
        await verifySignupOtp(email, otp);
      } else {
        // Verify standard login OTP
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
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            {otpStep === "enter_otp" ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log in to Jaanch
          </h1>
          <p className="text-xs text-slate-500">
            Access your saved offer verifications and checklist history
          </p>
        </div>

        {/* Mode Toggle: Password vs OTP */}
        {otpStep !== "enter_otp" && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("password");
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "password"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("otp");
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "otp"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Email OTP
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Login successful! Redirecting...</span>
          </div>
        )}

        {/* MODE 1: Password Login Form */}
        {mode === "password" && otpStep !== "enter_otp" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In with Password"}
            </button>
          </form>
        )}

        {/* MODE 2: OTP Login - Step 1: Send OTP */}
        {mode === "otp" && otpStep === "enter_email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send 6-Digit OTP"}
            </button>
          </form>
        )}

        {/* OTP Input Form (Used in OTP mode Step 2 or when unconfirmed user logs in) */}
        {otpStep === "enter_otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-brand-50/60 border border-brand-100 rounded-2xl text-xs text-slate-600 space-y-1 text-center">
              <p>
                Enter the 6-digit verification code sent to <span className="font-bold text-slate-900">{email}</span>.
              </p>
              <p className="text-[11px] text-slate-400">
                Check your inbox and spam folder.
              </p>
            </div>

            <div className="space-y-1.5 text-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
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
                className="w-full py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || success}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP & Log In"}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setOtpStep("enter_email");
                  setError(null);
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Method
              </button>

              <button
                type="button"
                disabled={resendLoading || resendSent}
                onClick={handleResendOtp}
                className="text-brand-600 hover:text-brand-700 font-semibold disabled:text-slate-400"
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
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold font-mono">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              ⚡ Google Sign-In authenticates directly via your Google account (no password or OTP needed).
            </p>

            <div className="pt-2 text-center space-y-2 text-xs text-slate-500">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="text-brand-600 font-bold hover:underline">
                  Sign up
                </Link>
              </p>
              <p>
                <Link to="/analyze" className="text-slate-600 hover:text-slate-900 font-medium">
                  Continue as Guest (No login required) →
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
