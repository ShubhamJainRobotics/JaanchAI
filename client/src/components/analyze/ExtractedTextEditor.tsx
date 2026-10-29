import { Sparkles, Trash2 } from "lucide-react";
import { INPUT_LIMITS } from "shared";
import { DEMO_SAMPLES, DemoSample } from "../../demo/samples";

interface ExtractedTextEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSelectSample: (sample: DemoSample) => void;
}

export function ExtractedTextEditor({
  value,
  onChange,
  onSelectSample,
}: ExtractedTextEditorProps) {
  const charCount = value.length;
  const isTooShort = charCount > 0 && charCount < INPUT_LIMITS.textMin;
  const isTooLong = charCount > INPUT_LIMITS.textMax;

  return (
    <div className="space-y-3">
      {/* Sample presets bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="input-message-text"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Message / Offer Text
        </label>

        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-xs font-medium text-muted-foreground">
            Load Test Sample:
          </span>
          <select
            onChange={(e) => {
              const sample = DEMO_SAMPLES.find((s) => s.id === e.target.value);
              if (sample) onSelectSample(sample);
            }}
            defaultValue=""
            className="text-xs min-h-[38px] py-1.5 px-3 bg-surface hover:bg-surface-raised border border-border rounded-md text-foreground font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Load demo sample text"
          >
            <option value="" disabled>
              Select an illustrative case...
            </option>
            {DEMO_SAMPLES.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="input-message-text"
          rows={7}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the suspicious WhatsApp message, email, offer letter text, or website snippet here (min 20 characters)..."
          className={`w-full p-4 rounded-md text-sm font-mono border transition-colors resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isTooShort || isTooLong
              ? "border-status-high-risk-border focus-visible:ring-status-high-risk-border bg-status-high-risk-bg/10 text-foreground"
              : "border-border focus-visible:ring-ring bg-surface text-foreground"
          }`}
          aria-invalid={isTooShort || isTooLong}
          aria-describedby="char-count-msg"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Clear text"
            aria-label="Clear text input"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Counter bar */}
      <div
        id="char-count-msg"
        className="flex items-center justify-between text-xs text-muted-foreground"
      >
        <span>
          {isTooShort && (
            <span className="text-destructive font-sans font-medium">
              Minimum {INPUT_LIMITS.textMin} characters required.
            </span>
          )}
          {isTooLong && (
            <span className="text-destructive font-sans font-medium">
              Exceeds maximum {INPUT_LIMITS.textMax} character limit.
            </span>
          )}
          {!isTooShort && !isTooLong && (
            <span>Ready for deterministic rule-engine analysis</span>
          )}
        </span>
        <span
          className={`tabular-nums ${
            isTooShort || isTooLong ? "text-destructive font-bold" : "text-muted-foreground"
          }`}
        >
          {charCount} / {INPUT_LIMITS.textMax}
        </span>
      </div>
    </div>
  );
}
