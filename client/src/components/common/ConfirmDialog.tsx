import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
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
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className="bg-surface rounded-md max-w-md w-full p-6 shadow-elevation-2 border border-border"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 border ${
              isDestructive
                ? "bg-status-high-risk-bg text-status-high-risk-icon border-status-high-risk-border"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            <AlertTriangle className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3
              id="dialog-title"
              className="text-lg font-bold text-foreground mb-1"
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[44px] px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-surface hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`min-h-[44px] px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isDestructive
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-xs"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
