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
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
        <span>Claimed Organization / Entity</span>
        <span className="text-[11px] font-normal text-slate-500">Official registry lookup</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Building2 className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleCustomChange}
          onFocus={() => setIsOpen(true)}
          placeholder="e.g. Tata Consultancy Services, Infosys, AICTE"
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || loading) && (
        <div className="absolute z-30 w-full mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {loading && suggestions.length === 0 && (
            <div className="p-3 text-slate-400 text-center">Searching registry...</div>
          )}

          {suggestions.map((org) => {
            const isSelected = selectedOrgId === org.id;
            return (
              <div
                key={org.id}
                onClick={() => handleSelect(org)}
                className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected ? "bg-brand-50/50 dark:bg-brand-950/20" : ""
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {org.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {org.kind}
                    </span>
                    {org.isDemo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Official: {org.officialDomains.join(", ")}
                  </p>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
