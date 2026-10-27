import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnalysisResult, getSafeReplyQuestions } from "shared";
import { apiClient } from "../lib/apiClient";
import { StatusBanner } from "../components/results/StatusBanner";
import { PatternInsightCard } from "../components/results/PatternInsightCard";
import { NextStepsPanel } from "../components/results/NextStepsPanel";
import { SignalList } from "../components/results/SignalList";
import { EvidenceReport } from "../components/results/EvidenceReport";
import { LinkInspectorCard } from "../components/results/LinkInspectorCard";
import { ChallengeEmailPanel } from "../components/results/ChallengeEmailPanel";
import { CompactSafetySummary } from "../components/results/CompactSafetySummary";
import { FeedbackWidget } from "../components/results/FeedbackWidget";
import { PageSkeleton } from "../components/common/PageSkeleton";
import { ArrowLeft, Clock, Link2, AlertTriangle, HelpCircle } from "lucide-react";

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
    const el = document.getElementById("evidence-report-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
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

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || (!isLocal && !analysis)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analysis Not Found</h2>
        <p className="text-sm text-slate-600">
          The requested analysis could not be retrieved, or you do not have permission to view it.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Check another offer
        </Link>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">No active result in session</h2>
        <p className="text-sm text-slate-600">
          Please submit a message or offer to run an analysis.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold"
        >
          Go to Analyzer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Check another opportunity
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Analyzed in {analysis.durationMs}ms</span>
          </div>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {isLocal && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between print:hidden">
          <span>
            <strong>Guest Mode:</strong> This result is held in your temporary browser session.{" "}
            <Link to="/signup" className="underline font-bold">
              Sign up
            </Link>{" "}
            to save your verification history.
          </span>
        </div>
      )}

      {/* Section 1: StatusBanner + Verification Coverage Meter */}
      <StatusBanner
        status={analysis.status}
        ruleScore={analysis.ruleScore}
        summary={analysis.summary}
        aiUsed={analysis.aiUsed}
        aiStatus={analysis.aiStatus}
        checks={analysis.checks}
      />

      {/* Section 2: Why This Status — Top 3 reasons in plain language */}
      {analysis.reasons && analysis.reasons.length > 0 && (
        <section
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3"
          aria-label="Why this status explanation"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <HelpCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Why this status: Key Evidence Rationale
            </h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {analysis.reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-2" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {r.checkKey.replace(/_/g, " ")}:
                  </span>{" "}
                  <span>{r.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 3: "What usually happens next" Insight Card (Change F) */}
      {analysis.patternInsight && (
        <PatternInsightCard insight={analysis.patternInsight} />
      )}

      {/* Section 4: Next Steps Panel (Part 1, 2, 3) */}
      <NextStepsPanel
        result={analysis}
        onUpdateResult={handleUpdateResult}
        isSavedAnalysis={!isLocal && !!analysis.id}
        onTriggerInput={handleTriggerInput}
        onOpenSafeReply={handleOpenSafeReply}
      />

      {/* Section 5: Signals ("What we observed") */}
      <SignalList signals={analysis.signals} />

      {/* Section 6: Evidence Report (with grouped not-run inputs & expandable drill-downs) */}
      <EvidenceReport
        result={analysis}
        onUpdateResult={handleUpdateResult}
        targetInput={targetEvidenceInput}
      />

      {/* Section 7: Link Inspector, Challenge Email / Safe Reply, Feedback */}
      <div className="space-y-6">
        {analysis.links.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
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

        <ChallengeEmailPanel
          key={`challenge-${challengeTriggerCount}`}
          domain={analysis.domain}
          claimedOrg={(analysis as any).claimedOrg || analysis.matchedOrganization?.name}
          initialKind={activeChallengeKind}
          initialQuestions={getSafeReplyQuestions(analysis)}
          autoGenerateOnMount={challengeTriggerCount > 0}
        />

        <div className="print:hidden">
          <FeedbackWidget analysisId={analysis.id} />
        </div>
      </div>

      {/* Section 8: Compact Safety Summary (E6) & Disclaimer */}
      <div className="space-y-6">
        <CompactSafetySummary status={analysis.status} />

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-center">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 italic">
            {analysis.disclaimer}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Report generated on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
