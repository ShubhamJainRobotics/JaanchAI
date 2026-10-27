import { useState } from "react";
import { ListingComparison, AnalysisResult } from "shared";
import { apiClient } from "../../lib/apiClient";
import { FileCheck, CheckCircle2, XCircle, HelpCircle, Send, AlertCircle } from "lucide-react";

interface ListingMatchPanelProps {
  analysisId?: string;
  listingComparison?: ListingComparison | null;
  onUpdateResult?: (updated: AnalysisResult) => void;
}

export function ListingMatchPanel({
  analysisId,
  listingComparison,
  onUpdateResult,
}: ListingMatchPanelProps) {
  const [listingUrl, setListingUrl] = useState("");
  const [listingText, setListingText] = useState("");
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisId) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload =
        activeTab === "url"
          ? { url: listingUrl.trim() }
          : { text: listingText.trim() };

      const res = await apiClient.attachOfficialListing(analysisId, payload);
      if (res?.result && onUpdateResult) {
        onUpdateResult(res.result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to attach official listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldChip = (status: "match" | "mismatch" | "unknown") => {
    switch (status) {
      case "match":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Match
          </span>
        );
      case "mismatch":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Mismatch
          </span>
        );
      case "unknown":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
          <FileCheck className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Official Source Listing Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated cross-check against official career portals
          </p>
        </div>
      </div>

      {listingComparison && listingComparison.comparedFields.length > 0 ? (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Field</th>
                  <th className="py-2.5 px-3">Offer Value</th>
                  <th className="py-2.5 px-3">Official Listing Value</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {listingComparison.comparedFields.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {f.field}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {f.offerValue || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {f.listingValue || "—"}
                    </td>
                    <td className="py-2.5 px-3">{renderFieldChip(f.outcome)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {listingComparison.notes && (
            <p className="text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              {listingComparison.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
            No official listing cross-referenced yet.
          </span>
          <p>
            Supply the official job URL on the organization&apos;s primary domain or paste the official posting text below to verify offer parameters.
          </p>
        </div>
      )}

      {/* Attach Listing Form (if analysis is saved) */}
      {analysisId && (
        <form
          onSubmit={handleSubmit}
          className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3"
        >
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Compare Against Official Opportunity Listing
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "url"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Official URL (Platform Fetched)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === "text"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Paste Listing Text (User Attested)
            </button>
          </div>

          {activeTab === "url" ? (
            <div className="space-y-1">
              <input
                type="url"
                value={listingUrl}
                onChange={(e) => setListingUrl(e.target.value)}
                placeholder="https://company.com/careers/job-123"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                The platform securely fetches and verifies listings only from registry-approved official domains.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <textarea
                value={listingText}
                onChange={(e) => setListingText(e.target.value)}
                rows={3}
                placeholder="Paste the official listing requirements, stipend, and role description..."
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Pasted text is treated as user-attested and cannot satisfy top-level Verified status outside demo mode.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || (activeTab === "url" ? !listingUrl : !listingText)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Cross-Checking..." : "Fetch & Compare Listing"}
          </button>
        </form>
      )}
    </div>
  );
}
