import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OpportunityDomain, VerificationStatus, STATUS_COPY } from "shared";
import { apiClient } from "../lib/apiClient";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { PageSkeleton } from "../components/common/PageSkeleton";
import {
  History as HistoryIcon,
  Trash2,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Ban,
} from "lucide-react";

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
    let badgeClass = "bg-status-review-bg text-status-review-fg border-status-review-border";
    let Icon = AlertTriangle;

    if (status === "VERIFIED_OFFICIAL") {
      badgeClass = "bg-status-verified-bg text-status-verified-fg border-status-verified-border";
      Icon = CheckCircle2;
    } else if (status === "LIKELY_GENUINE") {
      badgeClass = "bg-status-likely-bg text-status-likely-fg border-status-likely-border";
      Icon = ShieldCheck;
    } else if (status === "HIGH_RISK") {
      badgeClass = "bg-status-high-risk-bg text-status-high-risk-fg border-status-high-risk-border";
      Icon = ShieldAlert;
    } else if (status === "CONFIRMED_SCAM") {
      badgeClass = "bg-status-confirmed-scam-bg text-status-confirmed-scam-fg border-status-confirmed-scam-border";
      Icon = Ban;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-sm border font-semibold ${badgeClass}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span>{copy.label}</span>
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
            Verification History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Past analyzed opportunities saved to your secure profile.
          </p>
        </div>

        {data && data.items.length > 0 && (
          <button
            type="button"
            onClick={() => setShowDeleteAllDialog(true)}
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 rounded-md transition-colors self-start sm:self-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            Clear All History
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-md border border-border shadow-xs flex flex-wrap items-center gap-4 text-xs font-medium">
        <span className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          Filter by:
        </span>

        {/* Verification Status Filter */}
        <select
          value={selectedStatus || ""}
          onChange={(e) => {
            setSelectedStatus((e.target.value as VerificationStatus) || undefined);
            setPage(1);
          }}
          className="min-h-[44px] p-2 bg-surface-raised border border-border rounded-md text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="min-h-[44px] p-2 bg-surface-raised border border-border rounded-md text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <div className="bg-surface rounded-md border border-border p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-surface-raised text-muted-foreground flex items-center justify-center mx-auto">
            <HistoryIcon className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-foreground">No analyses found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t saved any analyses matching this filter yet. Check a new offer from the analyzer.
          </p>
          <Link
            to="/analyze"
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="bg-surface border border-border hover:border-primary/40 rounded-md p-5 shadow-xs transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(currentStatus)}
                    <span className="text-xs uppercase font-bold text-muted-foreground font-mono">
                      {item.domain}
                    </span>
                    {item.claimed_org && (
                      <span className="text-xs font-semibold text-foreground">
                        • {item.claimed_org}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {item.summary}
                  </p>

                  <span className="text-[11px] text-muted-foreground font-mono block">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(item.id)}
                    className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title="Delete this analysis"
                    aria-label="Delete this analysis"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  </button>

                  <Link
                    to={`/results/${item.id}`}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface-raised hover:bg-primary/10 text-foreground hover:text-primary text-xs font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    View Report
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
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
                className="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-foreground bg-surface hover:bg-surface-raised disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                Previous
              </button>
              <span className="text-xs text-muted-foreground font-medium font-mono tabular-nums">
                Page {page} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-xs font-semibold text-foreground bg-surface hover:bg-surface-raised disabled:opacity-50 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
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
