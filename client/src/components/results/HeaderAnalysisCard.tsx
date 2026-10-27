import { HeaderAnalysis } from "shared";
import { Shield, CheckCircle, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface HeaderAnalysisCardProps {
  headerAnalysis?: HeaderAnalysis | null;
}

export function HeaderAnalysisCard({ headerAnalysis }: HeaderAnalysisCardProps) {
  if (!headerAnalysis) return null;

  const renderBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Pass
          </span>
        );
      case "fail":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Fail
          </span>
        );
      case "softfail":
      case "neutral":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Email Header Authentication
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              As reported in the email headers you supplied
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* SPF */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
              SPF
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Sender IP Auth
            </span>
          </div>
          {renderBadge(headerAnalysis.authResults.spf)}
        </div>

        {/* DKIM */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
              DKIM
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Cryptographic Sig
            </span>
          </div>
          {renderBadge(headerAnalysis.authResults.dkim)}
        </div>

        {/* DMARC */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
              DMARC
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Domain Alignment
            </span>
          </div>
          {renderBadge(headerAnalysis.authResults.dmarc)}
        </div>
      </div>

      {/* DNS Policy */}
      {headerAnalysis.dnsPolicy && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 block">
            Domain DNS Policy:
          </span>
          <p className="text-slate-600 dark:text-slate-400">
            SPF record:{" "}
            {headerAnalysis.dnsPolicy.spfRecordFound
              ? "Found on authoritative nameserver"
              : "No SPF record found"}
            {" • "}
            DMARC policy:{" "}
            {headerAnalysis.dnsPolicy.dmarcPolicy
              ? `p=${headerAnalysis.dnsPolicy.dmarcPolicy}`
              : "No DMARC policy published"}
          </p>
        </div>
      )}

      {/* Mismatches if any */}
      {headerAnalysis.mismatches && headerAnalysis.mismatches.length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-red-900 dark:text-red-300 space-y-1">
          <span className="font-bold flex items-center gap-1.5 text-red-800 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Address / Return-Path Mismatches Detected:
          </span>
          <ul className="list-disc list-inside space-y-0.5">
            {headerAnalysis.mismatches.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
