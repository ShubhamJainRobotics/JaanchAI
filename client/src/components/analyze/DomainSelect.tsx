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
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
        Opportunity Category
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? "border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-xs ring-1 ring-brand-600"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-brand-600" : "text-slate-500"}`} />
              <span className="text-xs">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
