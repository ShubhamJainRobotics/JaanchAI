import { useState } from "react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pb-2">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 id="report-dialog-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Report Fraudulent Identifier
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contribute to Jaanch&apos;s community scam database (identifiers are hashed)
            </p>
          </div>
        </div>

        {!user ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
            Authentication required to submit reports. Please log in to prevent abuse and protect student peers.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Identifier Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Identifier Value
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. hr-scam@gmail.com, 9876543210, fraud@upi"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Context / Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe how this identifier was used (e.g. demanded ₹1,500 security deposit for online test)..."
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
