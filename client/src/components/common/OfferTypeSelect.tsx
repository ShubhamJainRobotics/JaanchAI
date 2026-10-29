import { OpportunityDomain } from "shared";
import { Check } from "lucide-react";

interface OfferTypeOption {
  value: OpportunityDomain;
  label: string;
}

export const OFFER_TYPE_OPTIONS: OfferTypeOption[] = [
  { value: "internship", label: "Internship" },
  { value: "scholarship", label: "Scholarship" },
  { value: "job", label: "Job" },
  { value: "freelance", label: "Freelance" },
  { value: "competition", label: "Competition" },
  { value: "website", label: "Website" },
  { value: "message_other", label: "Other" },
];

interface OfferTypeSelectProps {
  value: OpportunityDomain;
  onChange: (value: OpportunityDomain) => void;
  layout?: "chips" | "select";
  className?: string;
  id?: string;
}

export function OfferTypeSelect({
  value,
  onChange,
  layout = "chips",
  className = "",
  id = "offer-type-select",
}: OfferTypeSelectProps) {
  if (layout === "select") {
    return (
      <div className={`relative ${className}`}>
        <label htmlFor={id} className="block text-xs font-semibold text-foreground mb-1">
          Opportunity type
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as OpportunityDomain)}
          className="w-full min-h-[44px] px-3 py-2 bg-surface border border-border rounded-md text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
        >
          {OFFER_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <span id={`${id}-label`} className="block text-xs font-semibold text-foreground">
        What kind of offer is it?
      </span>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap sm:justify-start"
      >
        {OFFER_TYPE_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              className={`min-h-[44px] px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer border flex items-center justify-center shrink-0 whitespace-nowrap ${
                isSelected
                  ? "bg-primary-tint text-primary border-primary font-bold shadow-xs ring-1 ring-primary"
                  : "bg-surface text-foreground border-border hover:bg-surface-raised hover:text-foreground"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            >
              {isSelected && (
                <Check className="w-3.5 h-3.5 mr-1 text-primary shrink-0" strokeWidth={2.5} aria-hidden="true" />
              )}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
