import { useState, useEffect } from "react";
import { EntityType } from "shared";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../hooks/useAuth";
import { X, Send, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ReportEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: EntityType;
  defaultValue?: string;
}

export function ReportEntityDialog({
  isOpen,
  onClose,
  defaultType = "email",
  defaultValue = "",
}: ReportEntityDialogProps) {
  const { user } = useAuth();
  const [entityType, setEntityType] = useState<EntityType>(defaultType);
  const [value, setValue] = useState(defaultValue);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("Please sign in to submit a scam report.");
      return;
    }
    if (!value.trim()) {
      setErrorMsg("Please provide the identifier value.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.submitScamReport({
        type: entityType,
        value: value.trim(),
        description: description.trim() || undefined,
      });

      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
    >
      <div className="relative w-full max-w-lg rounded-md bg-surface border border-border p-6 shadow-elevation-2 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 pb-2">
          <div className="p-2 rounded-md bg-status-high-risk-bg text-status-high-risk-icon border border-status-high-risk-border">
            <ShieldAlert className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3 id="report-dialog-title" className="text-base font-bold text-foreground">
              Report Fraudulent Identifier
            </h3>
            <p className="text-xs text-muted-foreground">
              Contribute to Jaanch&apos;s community scam database (identifiers are hashed)
            </p>
          </div>
        </div>

        {!user ? (
          <div className="p-4 rounded-md bg-warning/10 border border-warning/30 text-xs sm:text-sm text-foreground">
            Authentication required to submit reports. Please log in to prevent abuse and protect student peers.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Identifier Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="w-full min-h-[44px] text-xs sm:text-sm px-3 py-2 rounded-md border border-border bg-surface text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="email">Sender Email</option>
                <option value="phone">Phone Number (WhatsApp / Call)</option>
                <option value="upi">UPI ID</option>
                <option value="domain">Website Domain</option>
                <option value="url">Phishing / Payment URL</option>
                <option value="social_handle">Telegram / Instagram Handle</option>
                <option value="bank_account">Bank Account Number</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Identifier Value
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. hr-scam@gmail.com, 9876543210, fraud@upi"
                className="w-full min-h-[44px] text-xs sm:text-sm px-3 py-2 rounded-md border border-border bg-surface text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">
                Incident Context / Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe how this identifier was used (e.g. demanded ₹1,500 security deposit for online test)..."
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-md border border-border bg-surface text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-destructive font-medium">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <div className="flex items-center gap-1.5 text-xs text-status-verified-fg font-semibold">
                <CheckCircle2 className="w-4 h-4 text-status-verified-icon" strokeWidth={2} aria-hidden="true" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-md text-xs font-semibold text-muted-foreground hover:bg-surface-raised cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
