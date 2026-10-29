import { useState, useEffect } from "react";
import { OpportunityDomain, ChallengeOutput } from "shared";
import { Mail, Copy, Check, Send, Sparkles, Loader2, ShieldCheck, HelpCircle } from "lucide-react";
import { useChallengeEmail } from "../../hooks/useChallengeEmail";

const QUESTION_LABELS: Record<string, string> = {
  registration_meaning_and_fee: "Registration fee & conditions clarification",
  selection_process: "Official selection & interview process steps",
  more_time: "Time extension to verify opportunity independently",
  official_domain_and_letterhead: "Formal letterhead & official domain confirmation",
  data_minimization: "Data minimization requirements & timeline",
};

interface ChallengeEmailPanelProps {
  domain: OpportunityDomain;
  claimedOrg?: string;
  initialChallenge?: ChallengeOutput;
  initialKind?: "safe_reply" | "challenge";
  initialQuestions?: string[];
  autoGenerateOnMount?: boolean;
  status?: string;
}

export function ChallengeEmailPanel({
  domain,
  claimedOrg,
  initialChallenge,
  initialKind = "safe_reply",
  initialQuestions,
  autoGenerateOnMount,
  status,
}: ChallengeEmailPanelProps) {
  const [kind, setKind] = useState<"safe_reply" | "challenge">(initialKind);
  const [tone, setTone] = useState<"polite" | "firm">("polite");
  const [senderName, setSenderName] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailData, setEmailData] = useState<ChallengeOutput | null>(
    initialChallenge || null
  );
  const [questions, setQuestions] = useState<string[]>(initialQuestions || []);

  const challengeMutation = useChallengeEmail();

  useEffect(() => {
    if (initialKind) {
      setKind(initialKind);
    }
  }, [initialKind]);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  const handleGenerate = async (
    targetKind: "safe_reply" | "challenge" = kind,
    overrideQuestions?: string[]
  ) => {
    try {
      const qToInclude = targetKind === "safe_reply"
        ? (overrideQuestions || (questions.length > 0 ? questions : undefined))
        : undefined;

      const res = await challengeMutation.mutateAsync({
        domain,
        claimedOrg,
        tone,
        kind: targetKind,
        senderName: senderName.trim() || undefined,
        includeQuestions: qToInclude,
        useAi: true,
      });
      setEmailData(res);
    } catch (err) {
      console.error("Email draft generation failed:", err);
    }
  };

  useEffect(() => {
    if (autoGenerateOnMount && !emailData) {
      handleGenerate(initialKind, initialQuestions);
    }
  }, [autoGenerateOnMount]);

  const handleTabChange = (newKind: "safe_reply" | "challenge") => {
    setKind(newKind);
    setEmailData(null);
    handleGenerate(newKind);
  };

  const handleCopy = () => {
    if (!emailData) return;
    const textToCopy = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoUrl = emailData
    ? `mailto:?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
    : "#";

  const isHighRisk = status === "HIGH_RISK" || status === "CONFIRMED_SCAM";
  const hideInPrint = !emailData || isHighRisk;

  return (
    <div
      id="challenge-panel"
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 ${
        hideInPrint ? "print:hidden" : ""
      }`}
    >
      {/* Tab Switcher: Safe Reply vs Challenge Email */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {kind === "safe_reply" ? (
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          ) : (
            <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          )}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {kind === "safe_reply" ? "Safe Reply Draft" : "Challenge the Recruiter"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {kind === "safe_reply"
                ? "Confirms interest without sharing sensitive data, asks for process details & fee confirmation"
                : "Professional inquiry requesting CIN, official domain, and formal offer on company letterhead"}
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-800/60 self-start sm:self-auto text-xs font-semibold print:hidden">
          <button
            type="button"
            onClick={() => handleTabChange("safe_reply")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              kind === "safe_reply"
                ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-2xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Safe reply
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("challenge")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              kind === "challenge"
                ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-2xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Challenge email
          </button>
        </div>
      </div>

      {/* Safe Reply Preselected Questions */}
      {kind === "safe_reply" && questions.length > 0 && (
        <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/50 rounded-xl space-y-1.5 print:hidden">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 dark:text-brand-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions included in this safe reply ({questions.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q) => (
              <span
                key={q}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
              >
                {QUESTION_LABELS[q] || q.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Tone
          </label>
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTone("polite")}
              className={`flex-1 py-1.5 transition-colors ${
                tone === "polite"
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              Polite
            </button>
            <button
              type="button"
              onClick={() => setTone("firm")}
              className={`flex-1 py-1.5 border-l border-slate-300 dark:border-slate-700 transition-colors ${
                tone === "firm"
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              Firm
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Your First Name (Optional)
          </label>
          <input
            type="text"
            value={senderName}
            maxLength={40}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. Rahul"
            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            disabled={challengeMutation.isPending}
            onClick={() => handleGenerate()}
            className="w-full py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {challengeMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Drafting response...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate {kind === "safe_reply" ? "Safe Reply" : "Challenge"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Email Content */}
      {emailData ? (
        <div className="space-y-3 pt-2">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-medium">
                Subject
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {emailData.subject}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1 font-medium">
                Body
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                {emailData.body}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 print:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>

              <a
                href={mailtoUrl}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-brand-200"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Email Client</span>
              </a>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Professional, respectful tone adhering to trust & safety guidelines.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2 print:hidden">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {kind === "safe_reply"
              ? "Generate a safe reply draft to reply safely without sharing personal data, requiring fee-free confirmation and interview steps."
              : "Generate a professional challenge template asking for company identification, registration proofs, and verifiable contact details."}
          </p>
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={challengeMutation.isPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate draft now
          </button>
        </div>
      )}
    </div>
  );
}
