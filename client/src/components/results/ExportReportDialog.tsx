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
      setTimeout(() => {
        downloadButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs print:hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      ref={dialogRef}
    >
      <div className="bg-surface rounded-md border border-border shadow-elevation-2 max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-md">
              <Download className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <h3
                id="export-dialog-title"
                className="text-base font-bold text-foreground"
              >
                Download Evidence Report (PDF)
              </h3>
              <p className="text-xs text-muted-foreground">
                Compact, deterministic audit document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="min-h-[44px] flex items-start gap-3 p-3 rounded-md border border-border bg-surface-raised/40 hover:bg-surface-raised cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={includeNextSteps}
              onChange={(e) => setIncludeNextSteps(e.target.checked)}
              disabled={isGenerating}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground block">
                Include next steps checklist
              </span>
              <span className="text-muted-foreground">
                Adds prioritized verification tasks and student safety rules.
              </span>
            </div>
          </label>

          <label className="min-h-[44px] flex items-start gap-3 p-3 rounded-md border border-border bg-surface-raised/40 hover:bg-surface-raised cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={includeMessageText}
              onChange={(e) => setIncludeMessageText(e.target.checked)}
              disabled={isGenerating}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <div className="text-xs">
              <span className="font-semibold text-foreground block">
                Include message text (appendix)
              </span>
              <span className="text-muted-foreground">
                May contain personal details. Automatically redacted for phone numbers, emails, and IDs.
              </span>
            </div>
          </label>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 p-3 bg-status-verified-bg border border-status-verified-border rounded-md text-xs text-status-verified-fg">
          <ShieldCheck className="w-4 h-4 shrink-0 text-status-verified-icon" strokeWidth={1.75} aria-hidden="true" />
          <span>The PDF is created in your browser; nothing is uploaded.</span>
        </div>

        {/* Live Status Announcements */}
        <div aria-live="polite" className="text-xs">
          {isGenerating && (
            <div className="flex items-center gap-2 text-primary font-medium py-1">
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" />
              <span>{statusMessage || "Building document..."}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3.5 bg-status-high-risk-bg border border-status-high-risk-border rounded-md text-xs text-status-high-risk-fg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handlePrintFallback}
                  className="mt-2 min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 bg-status-high-risk-fg/10 text-status-high-risk-fg rounded-md font-semibold text-xs hover:bg-status-high-risk-fg/20 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Print / Save as PDF instead
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>

          <button
            ref={downloadButtonRef}
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} aria-hidden="true" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
