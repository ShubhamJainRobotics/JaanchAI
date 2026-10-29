import { useEffect, useRef } from "react";
import { HEADER_COPY_HELP } from "shared";
import { X, Mail } from "lucide-react";

interface HeadersHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeadersHelpDialog({ isOpen, onClose }: HeadersHelpDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="headers-help-title"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg rounded-md bg-surface border border-border p-6 shadow-elevation-2 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 pb-2 border-b border-border">
          <div className="p-2 rounded-md bg-info/10 text-info">
            <Mail className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3 id="headers-help-title" className="text-base font-bold text-foreground">
              How to Copy Raw Email Headers
            </h3>
            <p className="text-xs text-muted-foreground">
              Headers allow cryptographic verification of SPF, DKIM, and DMARC
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="p-3.5 rounded-md bg-surface-raised border border-border space-y-1.5">
            <h4 className="font-bold text-foreground">
              Gmail (Web)
            </h4>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              {HEADER_COPY_HELP.gmail.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="p-3.5 rounded-md bg-surface-raised border border-border space-y-1.5">
            <h4 className="font-bold text-foreground">
              Outlook (Web & App)
            </h4>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              {HEADER_COPY_HELP.outlook.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="p-3.5 rounded-md bg-surface-raised border border-border space-y-1.5">
            <h4 className="font-bold text-foreground">
              Apple Mail (macOS & iOS)
            </h4>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              {HEADER_COPY_HELP.appleMail.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 rounded-md bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Got it, close help
          </button>
        </div>
      </div>
    </div>
  );
}
