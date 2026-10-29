import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnalysisResult, getSafeReplyQuestions, humanizeReason } from "shared";
import { apiClient } from "../lib/apiClient";
import { StatusBanner } from "../components/results/StatusBanner";
import { StopAndProtectBlock } from "../components/results/StopAndProtectBlock";
import { PatternInsightCard } from "../components/results/PatternInsightCard";
import { NextStepsPanel } from "../components/results/NextStepsPanel";
import { SignalList } from "../components/results/SignalList";
import { EvidenceReport } from "../components/results/EvidenceReport";
import { LinkInspectorCard } from "../components/results/LinkInspectorCard";
import { ChallengeEmailPanel } from "../components/results/ChallengeEmailPanel";
import { CompactSafetySummary } from "../components/results/CompactSafetySummary";
import { FeedbackWidget } from "../components/results/FeedbackWidget";
import { ExportReportButtons } from "../components/results/ExportReportButtons";
import { SectionJumpNav } from "../components/results/SectionJumpNav";
import { ResultsSidebar } from "../components/results/ResultsSidebar";
import { PageSkeleton } from "../components/common/PageSkeleton";
import {
  ArrowLeft,
  Clock,
  Link2,
  AlertTriangle,
  HelpCircle,
  Info,
  ArrowDown,
} from "lucide-react";

const SECTIONS = [
  { id: "next-steps-section", label: "Next steps" },
  { id: "signals-section", label: "Signals" },
  { id: "evidence-section", label: "Evidence" },
  { id: "details-section", label: "Details" },
];

export function Results() {
  const { id } = useParams<{ id: string }>();
  const isLocal = !id || id === "local";

  const { data: remoteData, isLoading, error } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => apiClient.getAnalysis(id!),
    enabled: !isLocal,
  });

  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [targetEvidenceInput, setTargetEvidenceInput] = useState<string | null>(null);
  const [activeChallengeKind, setActiveChallengeKind] = useState<"safe_reply" | "challenge">("safe_reply");
  const [challengeTriggerCount, setChallengeTriggerCount] = useState(0);

  useEffect(() => {
    if (isLocal) {
      const stored = apiClient.getLocalResult();
      setActiveAnalysis(stored);
    } else if (remoteData) {
      setActiveAnalysis(remoteData);
    }
  }, [isLocal, remoteData]);

  const analysis: AnalysisResult | null = activeAnalysis;

  const handleUpdateResult = (updated: AnalysisResult) => {
    setActiveAnalysis(updated);
    if (isLocal) {
      apiClient.saveLocalResult(updated);
    }
  };

  const handleTriggerInput = (inputKey: string) => {
    setTargetEvidenceInput(inputKey);
    const el = document.getElementById("evidence-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  };

  const handleOpenSafeReply = () => {
    setActiveChallengeKind("safe_reply");
    setChallengeTriggerCount((c) => c + 1);
    const panel = document.getElementById("challenge-panel");
    if (panel) {
      panel.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToNextSteps = () => {
    const el = document.getElementById("next-steps-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || (!isLocal && !analysis)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-status-high-risk-bg text-status-high-risk-icon border border-status-high-risk-border flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Analysis Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested analysis could not be retrieved, or you do not have permission to view it.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Check another offer
        </Link>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">No active result in session</h2>
        <p className="text-sm text-muted-foreground">
          Please submit a message or offer to run an analysis.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Analyzer
        </Link>
      </div>
    );
  }

  const isHighRisk = analysis.status === "HIGH_RISK" || analysis.status === "CONFIRMED_SCAM";

  return (
    <div className="min-h-screen text-left">
      {/* Mobile Sticky Section Chips (§6.2) */}
      <SectionJumpNav sections={SECTIONS} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors min-h-[36px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Check another offer</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ExportReportButtons result={analysis} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Analyzed in {analysis.durationMs}ms</span>
            </div>
          </div>
        </div>

        {/* Guest Mode Notice */}
        {isLocal && (
          <div className="p-3 bg-surface border border-border rounded-md text-xs text-foreground flex items-center justify-between print:hidden">
            <span>
              <strong>Guest Mode:</strong> This result is held in your temporary browser session.{" "}
              <Link to="/signup" className="underline font-bold text-primary">
                Sign up
              </Link>{" "}
              to save your verification history.
            </span>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABOVE-THE-FOLD HERO CONTRACT (§6.1)                      */}
        {/* ======================================================== */}
        <div id="above-the-fold-summary" className="space-y-4">
          {/* High-Risk Variant: Stop and Protect Block (§6.3) */}
          {isHighRisk && <StopAndProtectBlock />}

          {/* StatusBanner with icon + label + one-line meaning + meter */}
          <StatusBanner
            status={analysis.status}
            ruleScore={analysis.ruleScore}
            summary={analysis.summary}
            aiUsed={analysis.aiUsed}
            aiStatus={analysis.aiStatus}
            checks={analysis.checks}
          />

          {/* Payment Alert Notice (§6.1 / §5) */}
          {analysis.paymentAlert && (
            <aside
              role="alert"
              data-testid="payment-alert"
              className="rounded-lg border-2 border-status-high-risk-border bg-status-high-risk-bg p-4 sm:p-5 shadow-xs text-status-high-risk-fg space-y-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-status-high-risk-icon shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
                <div className="space-y-1">
                  <h2 className="text-sm font-extrabold tracking-tight uppercase">
                    Payment Warning Notice
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    A payment is being requested. Do not pay, and do not share Aadhaar, PAN, bank details or OTPs, until you have independently verified the sender.
                  </p>
                  {isHighRisk && (
                    <p className="text-xs font-medium pt-1 opacity-90">
                      If you have already paid or shared credentials, report immediately to National Cyber Crime Helpline{" "}
                      <a href="tel:1930" className="underline font-bold hover:opacity-100">1930</a> or visit{" "}
                      <a
                        href="https://cybercrime.gov.in"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline font-bold hover:opacity-100"
                      >
                        cybercrime.gov.in
                      </a>.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Input Adjusted Notice */}
          {analysis.inputNotices && analysis.inputNotices.length > 0 && (
            <aside
              role="note"
              data-testid="input-adjusted-notice"
              className="rounded-lg border border-warning/40 bg-surface p-4 text-foreground text-xs sm:text-sm space-y-2 shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-warning">
                <Info className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>Input adjusted for optimal verification</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-muted-foreground font-medium">
                {analysis.inputNotices.map((notice, i) => (
                  <li key={i}>{notice}</li>
                ))}
              </ul>
            </aside>
          )}

          {/* Why This Status (First 2-3 bullets per §6.1) */}
          {analysis.reasons && analysis.reasons.length > 0 && (
            <section
              data-testid="why-this-status"
              className="bg-surface border border-border rounded-lg p-4 sm:p-5 space-y-2.5 shadow-xs transition-colors"
              aria-label="Why this status explanation"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <HelpCircle className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  Why this status: Key Evidence Rationale
                </h2>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-foreground font-medium">
                {analysis.reasons.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" aria-hidden="true" />
                    <span>{humanizeReason(r)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Above-the-fold Quick Actions: Anchor to Next Steps + Export */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
            <button
              id="see-what-to-do-next-btn"
              type="button"
              onClick={scrollToNextSteps}
              className="min-h-[44px] px-5 py-2.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>See what to do next</span>
              <ArrowDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </button>

            <div className="sm:hidden">
              <ExportReportButtons result={analysis} />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TWO-COLUMN LAYOUT (≥ 1024px) (§6.2)                      */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-border">
          {/* MAIN COLUMN (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Pattern Insight (if present) */}
            {analysis.patternInsight && (
              <PatternInsightCard insight={analysis.patternInsight} />
            )}

            {/* Next Steps Panel (§6.2 / #next-steps-section) */}
            <div id="next-steps-section" tabIndex={-1} className="focus:outline-none">
              <NextStepsPanel
                result={analysis}
                onUpdateResult={handleUpdateResult}
                isSavedAnalysis={!isLocal && !!analysis.id}
                onTriggerInput={handleTriggerInput}
                onOpenSafeReply={handleOpenSafeReply}
              />
            </div>

            {/* Signals Section (§6.2 / #signals-section) */}
            <div id="signals-section" tabIndex={-1} className="focus:outline-none">
              <SignalList signals={analysis.signals} />
            </div>

            {/* Evidence Report (§6.2 / #evidence-section) */}
            <div id="evidence-section" tabIndex={-1} className="focus:outline-none">
              <EvidenceReport
                result={analysis}
                onUpdateResult={handleUpdateResult}
                targetInput={targetEvidenceInput}
              />
            </div>

            {/* Details Section (§6.2 / #details-section) */}
            <div id="details-section" tabIndex={-1} className="space-y-6 focus:outline-none">
              {analysis.links.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-primary" aria-hidden="true" />
                    <h3 className="text-base font-bold text-foreground tracking-tight">
                      Inspect Links ({analysis.links.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.links.map((link, idx) => (
                      <LinkInspectorCard key={idx} initialLink={link} />
                    ))}
                  </div>
                </div>
              )}

              {/* Hide Safe Reply Draft for HIGH_RISK / CONFIRMED_SCAM */}
              {!isHighRisk && (
                <ChallengeEmailPanel
                  key={`challenge-${challengeTriggerCount}`}
                  domain={analysis.domain}
                  claimedOrg={(analysis as any).claimedOrg || analysis.matchedOrganization?.name}
                  initialKind={activeChallengeKind}
                  initialQuestions={getSafeReplyQuestions(analysis)}
                  autoGenerateOnMount={challengeTriggerCount > 0}
                  status={analysis.status}
                />
              )}

              <div className="print:hidden">
                <FeedbackWidget analysisId={analysis.id} />
              </div>

              <CompactSafetySummary status={analysis.status} />

              {/* Standing Disclaimer */}
              <div className="pt-4 border-t border-border space-y-3 text-center">
                <div className="p-4 bg-surface-raised border border-border rounded-lg text-xs text-muted-foreground italic">
                  {analysis.disclaimer}
                </div>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  Report generated on {new Date(analysis.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* STICKY RIGHT SIDEBAR (4 cols on desktop ≥ 1024px) (§6.2) */}
          <div className="hidden lg:block lg:col-span-4">
            <ResultsSidebar result={analysis} sections={SECTIONS} />
          </div>
        </div>
      </div>
    </div>
  );
}
