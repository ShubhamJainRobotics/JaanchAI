import { OpportunityDomain } from "shared";
import { Briefcase, GraduationCap, Award, Globe, MessageSquare, Laptop, UserCheck } from "lucide-react";

interface DomainSelectProps {
  value: OpportunityDomain;
  onChange: (domain: OpportunityDomain) => void;
}

export function DomainSelect({ value, onChange }: DomainSelectProps) {
  const options: { id: OpportunityDomain; label: string; icon: any }[] = [
    { id: "internship", label: "Internship", icon: Briefcase },
    { id: "scholarship", label: "Scholarship", icon: GraduationCap },
    { id: "job", label: "Job Offer", icon: UserCheck },
    { id: "freelance", label: "Freelance", icon: Laptop },
    { id: "competition", label: "Competition", icon: Award },
    { id: "website", label: "Website", icon: Globe },
    { id: "message_other", label: "Other Message", icon: MessageSquare },
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
        Opportunity Category
      </label>
      <div
        role="radiogroup"
        aria-label="Opportunity Category"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.id)}
              className={`min-h-[64px] flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? "border-primary bg-primary-tint text-primary font-bold shadow-xs ring-1 ring-primary"
                  : "border-border bg-surface hover:bg-surface-raised text-foreground font-medium"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-1.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="text-xs leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
