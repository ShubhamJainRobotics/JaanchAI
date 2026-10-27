import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../hooks/useAuth";

interface FeedbackWidgetProps {
  analysisId?: string | null;
}

export function FeedbackWidget({ analysisId }: FeedbackWidgetProps) {
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (isHelpful: boolean) => {
    if (!isAuthenticated) {
      setSubmitted(true);
      return;
    }

    setLoading(true);
    try {
      await apiClient.sendFeedback({
        analysisId: analysisId || undefined,
        helpful: isHelpful,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submission error:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        Thank you for your feedback! It helps improve Jaanch's safety guidance.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div>
        <span className="font-bold text-slate-900 block">
          Was this verification breakdown helpful?
        </span>
        <span className="text-slate-500 text-[11px]">
          Your feedback sharpens our rule engine and guidance clarity.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
          Yes
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
        >
          <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
          No
        </button>
      </div>
    </div>
  );
}
