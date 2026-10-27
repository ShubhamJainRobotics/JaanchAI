import { useState } from "react";
import { OpportunityDomain, Channel, INPUT_LIMITS } from "shared";
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
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

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
      await analyzeMutation.mutateAsync({
        text: trimmed,
        inputType: activeTab,
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
    } catch (err: any) {
      setFormError(err.message || "Analysis request failed. Please check your connection and try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify an Offer or Communication
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste the message text or upload an offer screenshot to run our deterministic rule engine.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="pt-4 border-t border-slate-100 space-y-5">
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
          <div className="border-t border-slate-100">
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

          {/* Error notice */}
          {formError && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-mono" aria-live="polite">
              {analyzeMutation.isPending
                ? "Running deterministic rules and extracting signals..."
                : "Deterministic rule check runs in ~100ms"}
            </span>

            <button
              type="submit"
              disabled={analyzeMutation.isPending || text.trim().length < INPUT_LIMITS.textMin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Offer...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
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
