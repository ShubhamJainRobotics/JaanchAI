import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "../../lib/apiClient";
import { Building2, Check, ChevronDown } from "lucide-react";

interface OrgItem {
  id: string;
  name: string;
  aliases: string[];
  kind: string;
  officialDomains: string[];
  isGovernment: boolean;
  isDemo: boolean;
  needsTeamReview: boolean;
}

interface OrganizationAutocompleteProps {
  value: string;
  selectedOrgId?: string;
  onChange: (name: string, orgId?: string) => void;
}

export function OrganizationAutocomplete({
  value,
  selectedOrgId,
  onChange,
}: OrganizationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<OrgItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.getOrganizations(query.trim());
        if (active && res?.items) {
          setSuggestions(res.items);
        }
      } catch {
        if (active) setSuggestions([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (org: OrgItem) => {
    setQuery(org.name);
    onChange(org.name, org.id);
    setIsOpen(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    onChange(newVal, undefined);
    setIsOpen(true);
  };

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      <label className="text-xs font-bold text-foreground flex items-center justify-between">
        <span>Claimed Organization / Entity</span>
        <span className="text-[11px] font-normal text-muted-foreground">Official registry lookup</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <Building2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleCustomChange}
          onFocus={() => setIsOpen(true)}
          placeholder="e.g. Tata Consultancy Services, Infosys, AICTE"
          className="w-full min-h-[44px] pl-9 pr-8 py-2 rounded-md border border-border bg-surface text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
          <ChevronDown className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || loading) && (
        <div className="absolute z-30 w-full mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-surface shadow-elevation-2 divide-y divide-border text-xs">
          {loading && suggestions.length === 0 && (
            <div className="p-3 text-muted-foreground text-center">Searching registry...</div>
          )}

          {suggestions.map((org) => {
            const isSelected = selectedOrgId === org.id;
            return (
              <div
                key={org.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(org)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(org);
                  }
                }}
                className={`min-h-[44px] p-3 hover:bg-surface-raised cursor-pointer flex items-center justify-between gap-2 focus:outline-none focus-visible:bg-surface-raised ${
                  isSelected ? "bg-primary/10" : ""
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground truncate">
                      {org.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-surface-raised text-muted-foreground">
                      {org.kind}
                    </span>
                    {org.isDemo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-status-review-bg text-status-review-fg border border-status-review-border">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Official: {org.officialDomains.join(", ")}
                  </p>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2} aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
