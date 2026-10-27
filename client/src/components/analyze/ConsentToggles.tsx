import { AI_CONSENT_TEXT } from "shared";
import { Sparkles, Shield, Database } from "lucide-react";

interface ConsentTogglesProps {
  useAi: boolean;
  onUseAiChange: (val: boolean) => void;
  saveToHistory: boolean;
  onSaveToHistoryChange: (val: boolean) => void;
  storeRawText: boolean;
  onStoreRawTextChange: (val: boolean) => void;
  isAuthenticated: boolean;
}

export function ConsentToggles({
  useAi,
  onUseAiChange,
  saveToHistory,
  onSaveToHistoryChange,
  storeRawText,
  onStoreRawTextChange,
  isAuthenticated,
}: ConsentTogglesProps) {
  return (
    <div className="space-y-4 pt-2">
      {/* 1. Optional AI Context Consent */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useAi}
            onChange={(e) => onUseAiChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Use Google Gemini AI for contextual analysis (Optional)
            </span>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {AI_CONSENT_TEXT}
            </p>
          </div>
        </label>
      </div>

      {/* 2. Privacy & History Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Save History */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              disabled={!isAuthenticated}
              checked={isAuthenticated ? saveToHistory : false}
              onChange={(e) => onSaveToHistoryChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
            />
            <div>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                Save to my private history
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {isAuthenticated
                  ? "Saves this analysis to review later."
                  : "Guest mode active — results are held in session only and never saved to a database."}
              </p>
            </div>
          </label>
        </div>

        {/* Store Raw Text */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              disabled={!isAuthenticated || !saveToHistory}
              checked={storeRawText}
              onChange={(e) => onStoreRawTextChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
            />
            <div>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                Store raw input text
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Uncheck to store only cryptographic hash and structured findings without your message text.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
