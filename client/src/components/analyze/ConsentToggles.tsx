import { useState } from "react";
import { AI_CONSENT_TEXT } from "shared";
import { Sparkles, Shield, Database, ChevronDown, ChevronUp, Globe2, Lock } from "lucide-react";

interface ConsentTogglesProps {
  useAi: boolean;
  onUseAiChange: (val: boolean) => void;
  saveToHistory: boolean;
  onSaveToHistoryChange: (val: boolean) => void;
  storeRawText: boolean;
  onStoreRawTextChange: (val: boolean) => void;
  isAuthenticated: boolean;
  runThirdPartyChecks?: boolean;
  onRunThirdPartyChecksChange?: (val: boolean) => void;
}

export function ConsentToggles({
  useAi,
  onUseAiChange,
  saveToHistory,
  onSaveToHistoryChange,
  storeRawText,
  onStoreRawTextChange,
  isAuthenticated,
  runThirdPartyChecks = false,
  onRunThirdPartyChecksChange,
}: ConsentTogglesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const summaryText = `AI context: ${useAi ? "on" : "off"} · Third-party checks: ${
    runThirdPartyChecks ? "on" : "off"
  } · Saved to history: ${isAuthenticated && saveToHistory ? "on" : "off"}`;

  return (
    <div className="rounded-md border border-border bg-surface shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[52px] flex items-center justify-between p-4 sm:p-5 text-left bg-surface-raised/60 hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Lock className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Privacy options
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {summaryText}
            </p>
          </div>
        </div>

        <div className="text-muted-foreground shrink-0 ml-2">
          {isOpen ? (
            <ChevronUp className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4 border-t border-border text-xs sm:text-sm">
          {/* 1. Optional AI Context Consent */}
          <div className="p-3.5 rounded-md border border-border bg-surface-raised/40 space-y-2">
            <label className="min-h-[44px] flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => onUseAiChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              <div>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  Use Google Gemini AI for contextual analysis (Optional)
                </span>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {AI_CONSENT_TEXT}
                </p>
              </div>
            </label>
          </div>

          {/* 2. Optional Third-Party Checks Toggle */}
          {onRunThirdPartyChecksChange && (
            <div className="p-3.5 rounded-md border border-border bg-surface-raised/40">
              <label className="min-h-[44px] flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={runThirdPartyChecks}
                  onChange={(e) => onRunThirdPartyChecksChange(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-ring"
                />
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                    Query external domain registries (RDAP & DNS lookups)
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Looks up domain creation age and official DNS mail records. Only sender domains and links are queried.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* 3. Privacy & History Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Save History */}
            <div className="p-3.5 rounded-md border border-border bg-surface-raised/40">
              <label className="min-h-[44px] flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAuthenticated}
                  checked={isAuthenticated ? saveToHistory : false}
                  onChange={(e) => onSaveToHistoryChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring disabled:opacity-50"
                />
                <div>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                    Save to my private history
                  </span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {isAuthenticated
                      ? "Saves this analysis to review later in your account."
                      : "Guest mode active — results are held in session only and never saved to a database."}
                  </p>
                </div>
              </label>
            </div>

            {/* Store Raw Text */}
            <div className="p-3.5 rounded-md border border-border bg-surface-raised/40">
              <label className="min-h-[44px] flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAuthenticated || !saveToHistory}
                  checked={storeRawText}
                  onChange={(e) => onStoreRawTextChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring disabled:opacity-50"
                />
                <div>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                    Store raw input text
                  </span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Uncheck to store only cryptographic hash and structured findings without your message text.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
