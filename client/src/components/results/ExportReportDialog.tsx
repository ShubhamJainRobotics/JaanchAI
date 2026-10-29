import { useState, useEffect, useRef } from "react";
import { AnalysisResult } from "shared";
import { Download, Printer, X, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface ExportReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
}

export function ExportReportDialog({
  isOpen,
  onClose,
  result,
}: ExportReportDialogProps) {
  const [includeNextSteps, setIncludeNextSteps] = useState(true);
  const [includeMessageText, setIncludeMessageText] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setStatusMessage(null);
      // Focus download button on modal open
      setTimeout(() => {
        downloadButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isGenerating) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isGenerating, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage("Generating deterministic PDF in browser...");

    try {
      // Dynamically lazy-load PDF generation chunk on demand (§3)
      const { generateAndDownloadPdf } = await import("../../pdf/generatePdf");

      const filename = await generateAndDownloadPdf(result, {
        includeNextSteps,
        includeMessageText,
      });

      setStatusMessage(`Report downloaded as ${filename}`);
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setIsGenerating(false);
      setErrorMessage(
        "Failed to create PDF in browser. You can use the standard Print option as a fallback."
      );
      setStatusMessage(null);
    }
  };

  const handlePrintFallback = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs print:hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      ref={dialogRef}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-xl">
              <Download className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="export-dialog-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                Download Evidence Report (PDF)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compact, deterministic audit document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={includeNextSteps}
              onChange={(e) => setIncludeNextSteps(e.target.checked)}
              disabled={isGenerating}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Include next steps checklist
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Adds prioritized verification tasks and student safety rules.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={includeMessageText}
              onChange={(e) => setIncludeMessageText(e.target.checked)}
              disabled={isGenerating}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Include message text (appendix)
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                May contain personal details. Automatically redacted for phone numbers, emails, and IDs.
              </span>
            </div>
          </label>
        </div>

        {/* Privacy Note (§6) */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>The PDF is created in your browser; nothing is uploaded.</span>
        </div>

        {/* Live Status Announcements */}
        <div aria-live="polite" className="text-xs">
          {isGenerating && (
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium py-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage || "Building document..."}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handlePrintFallback}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-md font-semibold text-xs hover:bg-red-200 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF instead
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            ref={downloadButtonRef}
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
