import { HEADER_COPY_HELP } from "shared";
import { X, Mail } from "lucide-react";

interface HeadersHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HeadersHelpDialog({ isOpen, onClose }: HeadersHelpDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="headers-help-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 id="headers-help-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              How to Copy Raw Email Headers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Headers allow cryptographic verification of SPF, DKIM, and DMARC
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Gmail (Web)
            </h4>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
              {HEADER_COPY_HELP.gmail.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Outlook (Web & App)
            </h4>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
              {HEADER_COPY_HELP.outlook.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Apple Mail (macOS & iOS)
            </h4>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
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
            className="w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Got it, close help
          </button>
        </div>
      </div>
    </div>
  );
}
