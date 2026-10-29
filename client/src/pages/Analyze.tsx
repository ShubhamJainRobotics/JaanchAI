import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { OpportunityDomain, Channel, INPUT_LIMITS, routeFields } from "shared";
import { InputTabs, InputMode } from "../components/analyze/InputTabs";
import { ImageUploadPanel } from "../components/analyze/ImageUploadPanel";
import { PdfUploadPanel } from "../components/analyze/PdfUploadPanel";
import { ExtractedTextEditor } from "../components/analyze/ExtractedTextEditor";
import { DomainSelect } from "../components/analyze/DomainSelect";
import { ChannelSelect } from "../components/analyze/ChannelSelect";
import { ClaimedOrgInput } from "../components/analyze/ClaimedOrgInput";
import { DetectedLinksList } from "../components/analyze/DetectedLinksList";
import { ConsentToggles } from "../components/analyze/ConsentToggles";
import { useAuth } from "../hooks/useAuth";
import { useAnalyze } from "../hooks/useAnalyze";
import { DemoSample } from "../demo/samples";
import { ShieldCheck, Loader2, AlertCircle, Info } from "lucide-react";

import { SenderDetailsSection, SenderDetailsState } from "../components/analyze/SenderDetailsSection";

export function Analyze() {
  const { isAuthenticated } = useAuth();
  const analyzeMutation = useAnalyze();

  const [activeTab, setActiveTab] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [domain, setDomain] = useState<OpportunityDomain>("internship");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [claimedOrg, setClaimedOrg] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [saveToHistory, setSaveToHistory] = useState(isAuthenticated);
  const [storeRawText, setStoreRawText] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [inputNotices, setInputNotices] = useState<string[]>([]);

  const [senderDetails, setSenderDetails] = useState<SenderDetailsState>({
    email: "",
    recruiterName: "",
    phone: "",
    upiId: "",
    socialHandle: "",
    websiteUrl: "",
    emailHeaders: "",
    organizationId: undefined,
    officialListingUrl: "",
    officialListingText: "",
    runThirdPartyChecks: false,
  });

  const location = useLocation();

  useEffect(() => {
    let prefill: { text?: string; domain?: OpportunityDomain } | null = null;
    const state = location.state as { prefill?: { text?: string; domain?: OpportunityDomain }; tab?: InputMode } | null;

    if (state?.tab) {
      setActiveTab(state.tab);
    }

    if (state?.prefill) {
      prefill = state.prefill;
    } else {
      try {
        const stored = sessionStorage.getItem("jaanch_prefill_offer");
        if (stored) {
          prefill = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Could not read prefill from sessionStorage:", e);
      }
    }

    if (prefill?.text) {
      setText(prefill.text);
      if (prefill.domain) {
        setDomain(prefill.domain);
      }
    }

    // Clear stored value after reading (§4.1)
    try {
      sessionStorage.removeItem("jaanch_prefill_offer");
    } catch (e) {}
  }, [location.state]);

  const handleSelectSample = (sample: DemoSample) => {
    setText(sample.text);
    setDomain(sample.domain);
    setChannel(sample.channel);
    setClaimedOrg(sample.claimedOrg || "");
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = text.trim();
    if (trimmed.length < INPUT_LIMITS.textMin) {
      setFormError(`Please enter at least ${INPUT_LIMITS.textMin} characters to analyze.`);
      return;
    }
    if (trimmed.length > INPUT_LIMITS.textMax) {
      setFormError(`Text exceeds maximum allowed length of ${INPUT_LIMITS.textMax} characters.`);
      return;
    }

    const hasSenderInfo =
      senderDetails.email ||
      senderDetails.recruiterName ||
      senderDetails.phone ||
      senderDetails.upiId ||
      senderDetails.socialHandle ||
      senderDetails.websiteUrl;

    const senderPayload = hasSenderInfo
      ? {
          email: senderDetails.email.trim() || undefined,
          recruiterName: senderDetails.recruiterName.trim() || undefined,
          phone: senderDetails.phone.trim() || undefined,
          upiId: senderDetails.upiId.trim() || undefined,
          socialHandle: senderDetails.socialHandle.trim() || undefined,
          websiteUrl: senderDetails.websiteUrl.trim() || undefined,
        }
      : undefined;

    const hasListing =
      senderDetails.officialListingUrl || senderDetails.officialListingText;
    const officialListingPayload = hasListing
      ? {
          url: senderDetails.officialListingUrl.trim() || undefined,
          text: senderDetails.officialListingText.trim() || undefined,
        }
      : undefined;

    try {
      const routed = routeFields({
        text: trimmed,
        domain,
        channel,
        claimedOrg: claimedOrg.trim() || undefined,
        sender: senderPayload,
        emailHeaders: senderDetails.emailHeaders.trim() || undefined,
        organizationId: senderDetails.organizationId,
        officialListing: officialListingPayload,
        runThirdPartyChecks: senderDetails.runThirdPartyChecks,
        useAi,
        saveToHistory: isAuthenticated ? saveToHistory : false,
        storeRawText,
      });

      if (routed.notices.length > 0) {
        setInputNotices(routed.notices);
        if (routed.request.claimedOrg !== undefined) {
          setClaimedOrg(routed.request.claimedOrg || "");
        }
        if (routed.request.sender) {
          setSenderDetails((prev) => ({
            ...prev,
            email: routed.request.sender?.email || prev.email,
            phone: routed.request.sender?.phone || prev.phone,
            upiId: routed.request.sender?.upiId || prev.upiId,
            websiteUrl: routed.request.sender?.websiteUrl || prev.websiteUrl,
          }));
        }
      }

      await analyzeMutation.mutateAsync(routed.request);
    } catch (err: any) {
      setFormError(err.message || "Analysis request failed. Please check your connection and try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 sm:pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Verify an Offer or Communication
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste the message text or upload an offer screenshot to run our deterministic rule engine.
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-elevation-1 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Form Error Summary */}
          {formError && (
            <div
              role="alert"
              className="p-4 rounded-md bg-status-high-risk-bg text-status-high-risk-fg border border-status-high-risk-border flex items-start gap-3 shadow-xs"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-status-high-risk-icon mt-0.5" strokeWidth={2} aria-hidden="true" />
              <div className="space-y-1 text-sm">
                <span className="font-bold block">Please address the following error:</span>
                <a
                  href="#input-message-text"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("input-message-text")?.focus();
                  }}
                  className="underline hover:no-underline font-medium block"
                >
                  {formError}
                </a>
              </div>
            </div>
          )}

          {/* Input Method Tabs */}
          <InputTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab content */}
          {activeTab === "screenshot" && (
            <ImageUploadPanel
              onTextExtracted={(extracted) => {
                setText(extracted);
                setActiveTab("text");
              }}
            />
          )}

          {activeTab === "pdf" && (
            <PdfUploadPanel
              onTextExtracted={(extracted) => {
                setText(extracted);
                setActiveTab("text");
              }}
            />
          )}

          {/* Editable text editor always accessible */}
          <ExtractedTextEditor
            value={text}
            onChange={(val) => {
              setText(val);
              if (formError) setFormError(null);
            }}
            onSelectSample={handleSelectSample}
          />

          {/* Links auto-detection list */}
          <DetectedLinksList text={text} />

          {/* Domain & metadata selectors */}
          <div className="pt-4 border-t border-border space-y-5">
            <DomainSelect value={domain} onChange={setDomain} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChannelSelect value={channel} onChange={setChannel} />
              <ClaimedOrgInput value={claimedOrg} onChange={setClaimedOrg} />
            </div>
          </div>

          {/* Verification details: Sender email, headers, registry org, listing */}
          <div className="pt-2">
            <SenderDetailsSection
              claimedOrg={claimedOrg}
              onChangeClaimedOrg={setClaimedOrg}
              senderDetails={senderDetails}
              onChangeSenderDetails={(patch) =>
                setSenderDetails((prev) => ({ ...prev, ...patch }))
              }
            />
          </div>

          {/* Consent Toggles */}
          <div className="border-t border-border">
            <ConsentToggles
              useAi={useAi}
              onUseAiChange={setUseAi}
              saveToHistory={saveToHistory}
              onSaveToHistoryChange={setSaveToHistory}
              storeRawText={storeRawText}
              onStoreRawTextChange={setStoreRawText}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Input adjustment notice */}
          {inputNotices.length > 0 && (
            <div
              data-testid="input-adjusted-notice"
              className="flex items-start gap-3 p-4 rounded-md bg-surface text-foreground text-xs sm:text-sm border border-warning/40 shadow-xs transition-colors"
            >
              <Info className="w-4 h-4 text-warning shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
              <div className="space-y-1.5">
                <span className="font-bold text-warning">Input adjusted for verification:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-medium">
                  {inputNotices.map((notice, i) => (
                    <li key={i}>{notice}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Submit Button (Desktop + Tablet) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-mono" aria-live="polite">
              {analyzeMutation.isPending
                ? "Running deterministic rules and extracting signals..."
                : "Deterministic rule check runs in ~100ms"}
            </span>

            <button
              type="submit"
              disabled={analyzeMutation.isPending || text.trim().length < INPUT_LIMITS.textMin}
              className="hidden sm:inline-flex items-center justify-center gap-2 min-h-[44px] px-8 py-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" />
                  Analyzing Offer...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  Analyze Opportunity
                </>
              )}
            </button>
          </div>

          {/* Sticky Bottom CTA Bar on Mobile */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-sm border-t border-border z-30 shadow-elevation-2">
            <button
              type="submit"
              disabled={analyzeMutation.isPending || text.trim().length < INPUT_LIMITS.textMin}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" />
                  Analyzing Offer...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  Analyze Opportunity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
