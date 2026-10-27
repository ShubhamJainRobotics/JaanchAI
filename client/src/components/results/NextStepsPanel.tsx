import { useState, useEffect } from "react";
import {
  AnalysisResult,
  buildNextSteps,
  computeStatus,
} from "shared";
import { apiClient } from "../../lib/apiClient";
import { ListChecks } from "lucide-react";
import { AlreadyCheckedList } from "./AlreadyCheckedList";
import { YourTurnList } from "./YourTurnList";
import { ProtectYourselfList } from "./ProtectYourselfList";
import { ProtectionBanner } from "./ProtectionBanner";

interface NextStepsPanelProps {
  analysisId?: string;
  result: AnalysisResult;
  onUpdateResult?: (updated: AnalysisResult) => void;
  isSavedAnalysis: boolean;
  onTriggerInput?: (type: "email" | "headers" | "listing" | "org") => void;
  onOpenSafeReply?: () => void;
}

const GUEST_STORAGE_KEY = "jaanch_guest_steps";

export function NextStepsPanel({
  analysisId,
  result,
  onUpdateResult,
  isSavedAnalysis,
  onTriggerInput,
  onOpenSafeReply,
}: NextStepsPanelProps) {
  // 1. "I already paid" toggle state (auto-enabled if payment signals fired)
  const hasPaymentSignal = Boolean(
    result.signals?.some((s) => s.category === "payment")
  );
  const [alreadyPaid, setAlreadyPaid] = useState<boolean>(hasPaymentSignal);

  // 2. Step completions state (sessionStorage for guest, checklist_items for saved)
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    if (!isSavedAnalysis) {
      try {
        const stored = sessionStorage.getItem(GUEST_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // Fallback to empty
      }
    }

    const initial: Record<string, boolean> = {};
    if (result.checklist) {
      result.checklist.forEach((item) => {
        if (item.stepKey && item.completed) {
          initial[item.stepKey] = true;
        }
      });
    }
    return initial;
  });

  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());

  // Save guest completions to sessionStorage
  useEffect(() => {
    if (!isSavedAnalysis) {
      try {
        sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(completedMap));
      } catch {
        // Ignore storage errors
      }
    }
  }, [completedMap, isSavedAnalysis]);

  // 3. Compute 3-part model via pure shared function buildNextSteps
  const nextSteps = buildNextSteps(result, {
    alreadyPaid,
    checklistCompletions: completedMap,
  });

  // 4. Handle plain step toggle (does NOT alter verification coverage meter)
  const handleToggleStep = async (stepKey: string) => {
    const currentCompleted = Boolean(completedMap[stepKey]);
    const nextCompleted = !currentCompleted;

    // Optimistic local state update
    setCompletedMap((prev) => ({
      ...prev,
      [stepKey]: nextCompleted,
    }));

    if (isSavedAnalysis && analysisId) {
      const stepItem =
        nextSteps.yourTurn.find((s) => s.stepKey === stepKey) ||
        nextSteps.more.find((s) => s.stepKey === stepKey);
      const targetId = stepItem?.id || stepKey;

      try {
        await apiClient.patchChecklist(targetId, {
          completed: nextCompleted,
        });
      } catch (err) {
        // Rollback on failure
        setCompletedMap((prev) => ({
          ...prev,
          [stepKey]: currentCompleted,
        }));
        console.error("Failed to patch checklist item:", err);
      }
    }
  };

  // 5. Handle sub-check attestation toggle (updates coverage meter immediately)
  const handleToggleSubCheck = async (
    attestationKey: string,
    currentCompleted: boolean
  ) => {
    if (busyKeys.has(attestationKey)) return;
    setBusyKeys((prev) => new Set(prev).add(attestationKey));

    const newOutcome = currentCompleted ? "unknown" : "user_attested";

    try {
      if (isSavedAnalysis && analysisId) {
        const res = await apiClient.saveAttestation(analysisId, {
          checkKey: attestationKey as any,
          outcome: newOutcome,
        });
        if (res?.result && onUpdateResult) {
          onUpdateResult(res.result);
        }
      } else if (result && onUpdateResult) {
        // Guest mode: update local checks and recompute status
        const updatedChecks = (result.checks || []).map((c) =>
          c.checkKey === attestationKey ? { ...c, outcome: newOutcome as any } : c
        );
        if (!updatedChecks.some((c) => c.checkKey === attestationKey)) {
          updatedChecks.push({
            checkKey: attestationKey,
            label: "User-attested confirmation",
            outcome: newOutcome as any,
            detail: "Confirmed by you, not by Jaanch.",
            source: "user_attested",
          });
        }

        const recomputed = computeStatus({
          signals: result.signals,
          ruleScore: result.ruleScore,
          textLength: (result as any).rawText?.length || 500,
          reportedMatches: result.reportedMatches,
          matchedOrganization: result.matchedOrganization,
          senderIdentity: result.senderIdentity,
          headerAnalysis: result.headerAnalysis,
          listingComparison: result.listingComparison,
          completeness: result.completeness,
          checks: updatedChecks,
        });

        onUpdateResult({
          ...result,
          status: recomputed.status,
          reasons: recomputed.reasons,
          checks: updatedChecks,
        });
      }
    } catch (err) {
      console.error("Attestation update failed:", err);
    } finally {
      setBusyKeys((prev) => {
        const next = new Set(prev);
        next.delete(attestationKey);
        return next;
      });
    }
  };

  const handleOpenSafeReplyTrigger = () => {
    if (onOpenSafeReply) {
      onOpenSafeReply();
    } else {
      const panel = document.getElementById("challenge-panel");
      if (panel) {
        panel.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-6"
      role="region"
      aria-label="Do these next verification steps"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
            <ListChecks className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Recommended Next Steps
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear distinction between automated evidence, manual steps, and standing student rules
            </p>
          </div>
        </div>
      </div>

      {/* Part 1 — Jaanch already checked (Read-Only) */}
      <AlreadyCheckedList
        checks={nextSteps.alreadyChecked}
        onTriggerInput={onTriggerInput}
      />

      {/* Part 2 — Your Turn (Standard) OR Protect Yourself (High Risk) */}
      {nextSteps.variant === "protect" ? (
        <ProtectYourselfList
          steps={nextSteps.yourTurn}
          completedMap={completedMap}
          onToggleStep={handleToggleStep}
          alreadyPaid={alreadyPaid}
          onAlreadyPaidChange={setAlreadyPaid}
        />
      ) : (
        <YourTurnList
          yourTurn={nextSteps.yourTurn}
          more={nextSteps.more}
          completedMap={completedMap}
          onToggleStep={handleToggleStep}
          onToggleSubCheck={handleToggleSubCheck}
          onOpenSafeReply={handleOpenSafeReplyTrigger}
          busyKey={busyKeys.values().next().value}
        />
      )}

      {/* Part 3 — Stay safe banner (Fixed standing rules, no checkboxes) */}
      <ProtectionBanner banner={nextSteps.banner} />
    </section>
  );
}
