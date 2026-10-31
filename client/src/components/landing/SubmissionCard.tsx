import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clipboard, Shield, UploadCloud, AlertCircle, Loader2 } from "lucide-react";
import { useAnalyze } from "../../hooks/useAnalyze";
import { useLanguage } from "../../context/LanguageContext";
import { OpportunityDomain, Channel } from "shared";

interface Scenario {
  id: string;
  name: string;
  domain: OpportunityDomain;
  channel: Channel;
  claimedOrg: string;
  text: string;
}

export function SubmissionCard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"text" | "screenshot">("text");
  const [text, setText] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  const analyzeMutation = useAnalyze();
  const navigate = useNavigate();

  const scenarios: Scenario[] = [
    {
      id: "techcorp",
      name: t.submission.scenarios.techcorp_name,
      domain: "internship",
      channel: "whatsapp",
      claimedOrg: "TechCorp Labs",
      text: "Congratulations! You have been shortlisted for the Web Development Internship at TechCorp Labs with a stipend of ₹25,000/month. To confirm your joining slot and receive your laptop courier, you must deposit a mandatory refundable security charge of ₹1,500 within 2 hours to UPI: techcorp-security@okhdfc. If not deposited, your offer will be cancelled and given to the waitlist candidate.",
    },
    {
      id: "scholarship",
      name: t.submission.scenarios.scholarship_name,
      domain: "scholarship",
      channel: "email",
      claimedOrg: "National Merit Foundation",
      text: "URGENT: Your National Youth Merit Scholarship application for ₹50,000 grant has received conditional approval. To process the direct bank disbursement today, you must provide your Aadhaar copy, bank account number, and complete KYC debit card verification by submitting your bank OTP at the grant portal link before 5 PM deadline.",
    },
    {
      id: "genuine",
      name: t.submission.scenarios.genuine_name,
      domain: "job",
      channel: "email",
      claimedOrg: "Tata Consultancy Services",
      text: "Dear Candidate, Thank you for expressing interest in the Graduate Engineering Trainee opening at Tata Consultancy Services. We invite you to attend the online technical assessment on Saturday at 10:00 AM IST via our secure portal. Please note that TCS never charges any registration fees, security deposits, or documentation charges at any stage of hiring. Verify your candidacy status anytime on ibegin.tcs.com.",
    },
  ];

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        setSelectedScenarioId(null);
        setError(null);
        setClipboardNotice(t.submission.pasted_notice);
        setTimeout(() => setClipboardNotice(null), 2500);
      }
    } catch {
      setClipboardNotice(t.submission.clipboard_err);
      setTimeout(() => setClipboardNotice(null), 3000);
    }
  };

  const handleSelectScenario = (scenario: Scenario) => {
    setText(scenario.text);
    setSelectedScenarioId(scenario.id);
    setError(null);
  };

  const handleCheckOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (trimmed.length < 25) {
      setError(t.submission.err_min_chars);
      return;
    }

    // Identify active domain/channel from scenario if matched, else defaults
    const activeScenario = scenarios.find((s) => s.id === selectedScenarioId);
    const domain: OpportunityDomain = activeScenario?.domain || "internship";
    const channel: Channel = activeScenario?.channel || "whatsapp";
    const claimedOrg = activeScenario?.claimedOrg || undefined;

    try {
      await analyzeMutation.mutateAsync({
        text: trimmed,
        inputType: "text",
        domain,
        channel,
        claimedOrg,
        saveToHistory: false,
        useAi: false,
        runThirdPartyChecks: false,
        storeRawText: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.submission.err_generic);
    }
  };

  return (
    <section id="submit-offer" className="py-12 sm:py-16 lg:py-20 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground leading-tight tracking-tight">
            {t.submission.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-2.5">
            {t.submission.subtitle}
          </p>
        </div>

        {/* Main Input Container (White Card) */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 mt-8 shadow-xs">
          {/* Tab Switcher & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-6 text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`pb-2 -mb-4 transition-colors cursor-pointer ${
                  activeTab === "text"
                    ? "text-foreground font-semibold border-b-2 border-foreground"
                    : "text-muted-subtle hover:text-foreground"
                }`}
              >
                {t.submission.tab_paste}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("screenshot");
                  navigate("/analyze", { state: { tab: "image" } });
                }}
                className={`pb-2 -mb-4 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "screenshot"
                    ? "text-foreground font-semibold border-b-2 border-foreground"
                    : "text-muted-subtle hover:text-foreground"
                }`}
              >
                <UploadCloud className="w-4 h-4" aria-hidden="true" />
                <span>{t.submission.tab_upload}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {clipboardNotice && (
                <span className="text-xs text-muted-foreground animate-fadeIn">
                  {clipboardNotice}
                </span>
              )}
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-xs text-muted-foreground hover:text-terracotta inline-flex items-center gap-1 cursor-pointer transition-colors py-1 px-2 rounded-md hover:bg-neutral-100"
              >
                <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.submission.action_paste}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleCheckOffer} className="pt-6 space-y-6">
            {/* Large Textarea */}
            <div className="relative">
              <label htmlFor="landing-offer-text" className="sr-only">
                {t.submission.title}
              </label>
              <textarea
                id="landing-offer-text"
                rows={5}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t.submission.placeholder}
                className="w-full bg-surface border border-border rounded-xl p-4 text-sm sm:text-base text-foreground placeholder:text-muted-subtle focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta resize-y transition-colors leading-relaxed"
              />

              {/* Character Counter at bottom left */}
              <div className="mt-2 flex items-center justify-between text-xs text-muted-subtle select-none">
                <span className={text.length >= 25 ? "text-foreground font-medium" : "text-muted-subtle"}>
                  {text.length} {t.submission.characters} {text.length < 25 && t.submission.min_chars}
                </span>
                {selectedScenarioId && (
                  <span className="text-terracotta font-medium">{t.submission.scenario_active}</span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Test Scenarios Section */}
            <div className="pt-2 border-t border-border space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-subtle block">
                {t.submission.scenario_eyebrow}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {scenarios.map((scenario) => {
                  const isSelected = selectedScenarioId === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => handleSelectScenario(scenario)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors shadow-xs ${
                        isSelected
                          ? "bg-primary text-primary-foreground border border-primary font-semibold"
                          : "bg-surface border border-border-pill text-foreground hover:border-border-highlight"
                      }`}
                    >
                      {scenario.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Footer */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="submit"
                disabled={analyzeMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-neutral-800 disabled:opacity-60 rounded-lg px-6 py-3 font-medium text-sm transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>{t.submission.analyzing_btn}</span>
                  </>
                ) : (
                  <span>{t.submission.submit_btn}</span>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-muted-subtle">
                <Shield className="w-3.5 h-3.5 text-muted-subtle shrink-0" aria-hidden="true" />
                <span>{t.submission.instant_check}</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
