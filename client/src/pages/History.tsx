import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OpportunityDomain, VerificationStatus, STATUS_COPY } from "shared";
import { apiClient } from "../lib/apiClient";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { PageSkeleton } from "../components/common/PageSkeleton";
import { History as HistoryIcon, Trash2, ArrowRight, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export function History() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | undefined>();
  const [selectedDomain, setSelectedDomain] = useState<OpportunityDomain | undefined>();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["analyses", page, selectedStatus, selectedDomain],
    queryFn: () =>
      apiClient.getAnalyses({
        page,
        pageSize: 10,
        status: selectedStatus,
        domain: selectedDomain,
      }),
  });

  const deleteOneMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      setDeleteTargetId(null);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => apiClient.deleteAllAnalyses(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      setShowDeleteAllDialog(false);
    },
  });

  const getStatusBadge = (status: VerificationStatus) => {
    const copy = STATUS_COPY[status] || STATUS_COPY.NEEDS_REVIEW;
    let badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    if (status === "VERIFIED_OFFICIAL") badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    if (status === "LIKELY_GENUINE") badgeClass = "bg-teal-100 text-teal-900 border-teal-300";
    if (status === "HIGH_RISK") badgeClass = "bg-red-100 text-red-900 border-red-300";
    if (status === "CONFIRMED_SCAM") badgeClass = "bg-rose-900 text-white border-rose-950";

    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeClass}`}>
        {copy.label}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-brand-600" />
            Verification History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Past analyzed opportunities saved to your secure profile.
          </p>
        </div>

        {data && data.items.length > 0 && (
          <button
            type="button"
            onClick={() => setShowDeleteAllDialog(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear All History
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs font-medium">
        <span className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          Filter by:
        </span>

        {/* Verification Status Filter */}
        <select
          value={selectedStatus || ""}
          onChange={(e) => {
            setSelectedStatus((e.target.value as VerificationStatus) || undefined);
            setPage(1);
          }}
          className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
        >
          <option value="">All Verification Statuses</option>
          <option value="VERIFIED_OFFICIAL">Verified / Official</option>
          <option value="LIKELY_GENUINE">Likely Genuine</option>
          <option value="NEEDS_REVIEW">Needs Review</option>
          <option value="HIGH_RISK">High Risk</option>
          <option value="CONFIRMED_SCAM">Confirmed Scam</option>
        </select>

        {/* Domain Filter */}
        <select
          value={selectedDomain || ""}
          onChange={(e) => {
            setSelectedDomain((e.target.value as OpportunityDomain) || undefined);
            setPage(1);
          }}
          className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
        >
          <option value="">All Categories</option>
          <option value="internship">Internship</option>
          <option value="scholarship">Scholarship</option>
          <option value="job">Job Offer</option>
          <option value="freelance">Freelance</option>
          <option value="competition">Competition</option>
          <option value="website">Website</option>
          <option value="message_other">Other</option>
        </select>
      </div>

      {/* List Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No analyses found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t saved any analyses matching this filter yet. Check a new offer from the analyzer.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Check an Offer
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => {
            const currentStatus =
              (item.verification_status || item.verificationStatus || "NEEDS_REVIEW") as VerificationStatus;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(currentStatus)}
                    <span className="text-xs uppercase font-bold text-slate-400 font-mono">
                      {item.domain}
                    </span>
                    {item.claimed_org && (
                      <span className="text-xs font-semibold text-slate-700">
                        • {item.claimed_org}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {item.summary}
                  </p>

                  <span className="text-[11px] text-slate-400 font-mono block">
                    {new Date(item.created_at).toLocaleString()} • Score: {item.rule_score}/100
                  </span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete this analysis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/results/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-800 hover:text-brand-700 text-xs font-bold transition-colors"
                  >
                    View Report
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-xs text-slate-600 font-medium">
                Page {page} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Single Item Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Saved Analysis"
        message="Are you sure you want to delete this analysis report? This action cannot be undone."
        confirmLabel="Delete Analysis"
        isDestructive={true}
        onConfirm={() => deleteTargetId && deleteOneMutation.mutate(deleteTargetId)}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Delete All History Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllDialog}
        title="Delete All Verification History"
        message="This will permanently delete all your saved analyses, link checks, and checklist records from the database."
        confirmLabel="Clear All Data"
        isDestructive={true}
        onConfirm={() => deleteAllMutation.mutate()}
        onCancel={() => setShowDeleteAllDialog(false)}
      />
    </div>
  );
}
