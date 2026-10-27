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
          className="text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Message / Offer Text
        </label>

        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-xs font-semibold text-slate-600">
            Load Test Sample:
          </span>
          <select
            onChange={(e) => {
              const sample = DEMO_SAMPLES.find((s) => s.id === e.target.value);
              if (sample) onSelectSample(sample);
            }}
            defaultValue=""
            className="text-xs py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 font-medium cursor-pointer focus:ring-1 focus:ring-brand-500"
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
          className={`w-full p-4 rounded-xl text-sm font-mono border transition-colors resize-y focus:outline-none focus:ring-2 ${
            isTooShort || isTooLong
              ? "border-red-300 focus:ring-red-400 bg-red-50/10"
              : "border-slate-300 focus:ring-brand-500 bg-white"
          }`}
          aria-invalid={isTooShort || isTooLong}
          aria-describedby="char-count-msg"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Clear text"
            aria-label="Clear text input"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Counter bar */}
      <div
        id="char-count-msg"
        className="flex items-center justify-between text-xs text-slate-500 font-mono"
      >
        <span>
          {isTooShort && (
            <span className="text-red-600 font-sans font-medium">
              Minimum {INPUT_LIMITS.textMin} characters required.
            </span>
          )}
          {isTooLong && (
            <span className="text-red-600 font-sans font-medium">
              Exceeds maximum {INPUT_LIMITS.textMax} character limit.
            </span>
          )}
          {!isTooShort && !isTooLong && (
            <span>Ready for deterministic rule-engine analysis</span>
          )}
        </span>
        <span
          className={
            isTooShort || isTooLong ? "text-red-600 font-bold" : "text-slate-500"
          }
        >
          {charCount} / {INPUT_LIMITS.textMax}
        </span>
      </div>
    </div>
  );
}
