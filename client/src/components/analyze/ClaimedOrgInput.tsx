import { useState } from "react";
import { Building2 } from "lucide-react";
import { KNOWN_ORGS } from "shared";

interface ClaimedOrgInputProps {
  value: string;
  onChange: (org: string) => void;
}

export function ClaimedOrgInput({ value, onChange }: ClaimedOrgInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredOrgs = value.trim()
    ? KNOWN_ORGS.filter((org) =>
        org.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="space-y-1.5 relative">
      <label htmlFor="claimed-org-input" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
        Claimed Organization (Optional)
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Building2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <input
          id="claimed-org-input"
          type="text"
          value={value}
          maxLength={120}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. AICTE, TCS, Infosys, National Scholarship..."
          className="w-full min-h-[44px] pl-9 pr-4 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        />
      </div>

      {showSuggestions && filteredOrgs.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-elevation-2 overflow-hidden py-1">
          {filteredOrgs.map((org) => (
            <button
              key={org.name}
              type="button"
              onMouseDown={() => {
                onChange(org.name);
                setShowSuggestions(false);
              }}
              className="w-full min-h-[44px] text-left px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-raised transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{org.name}</span>
              <span className="text-muted-foreground text-[10px]">
                {org.officialDomains[0]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
