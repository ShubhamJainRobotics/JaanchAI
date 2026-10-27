import { PhoneCall, ShieldAlert, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ReportGuidance } from "shared";

interface ReportItPanelProps {
  reportGuidance: ReportGuidance;
}

export function ReportItPanel({ reportGuidance }: ReportItPanelProps) {
  const [collapsed, setCollapsed] = useState(!reportGuidance.show);

  return (
    <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950 tracking-tight">
              Reporting Guide & Cybercrime Helpline
            </h3>
            <p className="text-xs text-red-800">
              National cybercrime assistance for online fraud or financial extortion attempts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
          aria-label={collapsed ? "Expand reporting guide" : "Collapse reporting guide"}
        >
          {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-4 pt-2 border-t border-red-200/60 text-xs sm:text-sm">
          {/* Helpline actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-white rounded-xl border border-red-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  National Cyber Crime Helpline
                </span>
                <a
                  href={`tel:${reportGuidance.helpline}`}
                  className="text-lg font-black text-red-700 hover:underline"
                >
                  Dial {reportGuidance.helpline}
                </a>
                <span className="block text-[11px] text-slate-500">Toll-free 24x7 India helpline</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-red-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Official Reporting Portal
                </span>
                <a
                  href={reportGuidance.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-red-700 hover:underline flex items-center gap-1"
                >
                  cybercrime.gov.in
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="block text-[11px] text-slate-500">File online complaint with police</span>
              </div>
            </div>
          </div>

          {/* Evidence Checklist */}
          <div className="p-4 bg-white rounded-xl border border-red-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Critical Evidence to Keep Before Reporting:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {reportGuidance.keepAsEvidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
