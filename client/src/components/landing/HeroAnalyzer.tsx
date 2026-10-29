import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, AlertCircle, FileUp, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { OpportunityDomain } from "shared";
import { OfferTypeSelect } from "../common/OfferTypeSelect";

const MIN_CHARS = 20;
const MAX_CHARS = 20000;

export function HeroAnalyzer() {
  const [text, setText] = useState("");
  const [domain, setDomain] = useState<OpportunityDomain>("internship");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (trimmed.length < MIN_CHARS) {
      setError(`Please paste at least ${MIN_CHARS} characters of the offer message to analyze.`);
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setError(`Message exceeds maximum limit of ${MAX_CHARS.toLocaleString()} characters.`);
      return;
    }

    setError(null);

    // Save prefilled text via sessionStorage (wrapped in try/catch) and router state (never in URL)
    try {
      sessionStorage.setItem(
        "jaanch_prefill_offer",
        JSON.stringify({ text: trimmed, domain })
      );
    } catch (err) {
      console.warn("Could not save prefill to sessionStorage:", err);
    }

    navigate("/analyze", {
      state: {
        prefill: { text: trimmed, domain },
      },
    });
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-md p-5 sm:p-6 text-left">
      <form onSubmit={handleAnalyze} className="space-y-4">
        {/* Label and textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="hero-offer-text" className="block text-sm font-bold text-foreground">
              Paste the offer message
            </label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {text.length > 0 ? `${text.length} chars` : "WhatsApp / Telegram / Email"}
            </span>
          </div>
          <textarea
            id="hero-offer-text"
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error && e.target.value.trim().length >= MIN_CHARS) {
                setError(null);
              }
            }}
            placeholder="e.g. Congratulations! You are shortlisted for our remote internship. To receive your offer letter and welcome kit, submit ₹999 refundable deposit..."
            className={`w-full p-3.5 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
              error ? "border-destructive ring-1 ring-destructive" : "border-border"
            }`}
          />
          {error && (
            <p
              id="hero-analyzer-error"
              role="alert"
              className="mt-1.5 text-xs text-destructive flex items-center gap-1 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Offer Type Selector */}
        <OfferTypeSelect
          id="hero-offer-type"
          value={domain}
          onChange={setDomain}
          layout="chips"
        />

        {/* Action Button */}
        <div>
          <button
            type="submit"
            className="w-full min-h-[48px] px-6 py-3 rounded-md bg-primary hover:bg-primary-hover active:bg-primary-pressed text-primary-foreground font-semibold text-base shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            <span>Analyze Offer</span>
            <ArrowRight className="w-4 h-4 ml-0.5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Quiet Alternative Links */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-border/60">
          <Link
            to="/analyze"
            state={{ tab: "screenshot" }}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors min-h-[36px] py-1"
          >
            <FileUp className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span>Upload a screenshot or PDF</span>
          </Link>

          <Link
            to="/link-check"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors min-h-[36px] py-1"
          >
            <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            <span>Inspect a link</span>
          </Link>
        </div>
      </form>

      {/* Accurate Privacy Line (§2.4 / §4.1) */}
      <div className="mt-3.5 pt-3 border-t border-border/60 text-center sm:text-left">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Analysis runs in your browser. Pasted text is never stored for guests.
        </p>
      </div>
    </div>
  );
}
