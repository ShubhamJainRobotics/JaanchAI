import { useState } from "react";
import { Check, ThumbsUp, ThumbsDown } from "lucide-react";

export function FeedbackPill() {
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);

  const handleFeedback = (type: "up" | "down") => {
    setFeedbackGiven(type);
    try {
      localStorage.setItem("jaanch_feedback", JSON.stringify({ type, timestamp: Date.now() }));
    } catch {}
  };

  return (
    <aside
      aria-label="User feedback widget"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto print:hidden"
    >
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg border border-border-highlight text-xs sm:text-sm font-medium flex items-center gap-3 transition-all duration-200">
        {feedbackGiven ? (
          <div className="flex items-center gap-1.5 text-xs text-primary-foreground/90 py-0.5 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-success" strokeWidth={2.5} aria-hidden="true" />
            <span>Thank you for your feedback!</span>
          </div>
        ) : (
          <>
            <span className="text-primary-foreground/90 select-none">Was this helpful?</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleFeedback("up")}
                className="p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer text-primary-foreground/80 hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                title="Helpful"
                aria-label="Yes, this was helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleFeedback("down")}
                className="p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer text-primary-foreground/80 hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                title="Not helpful"
                aria-label="No, this was not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
