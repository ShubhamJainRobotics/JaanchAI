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
      <div className="p-4 bg-status-verified-bg border border-status-verified-border rounded-md text-center flex items-center justify-center gap-2 text-xs font-semibold text-status-verified-fg">
        <CheckCircle2 className="w-4 h-4 text-status-verified-icon" strokeWidth={2} aria-hidden="true" />
        Thank you for your feedback! It helps improve Jaanch's safety guidance.
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface border border-border rounded-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
      <div>
        <span className="font-bold text-foreground block">
          Was this verification breakdown helpful?
        </span>
        <span className="text-muted-foreground text-[11px]">
          Your feedback sharpens our rule engine and guidance clarity.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit(true)}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border hover:bg-surface-raised text-foreground font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-status-verified-icon" strokeWidth={1.75} aria-hidden="true" />
          Yes
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit(false)}
          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border hover:bg-surface-raised text-foreground font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ThumbsDown className="w-3.5 h-3.5 text-status-high-risk-icon" strokeWidth={1.75} aria-hidden="true" />
          No
        </button>
      </div>
    </div>
  );
}
