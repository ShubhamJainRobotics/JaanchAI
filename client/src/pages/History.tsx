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
  Calendar,
  Building2,
} from "lucide-react";

const STATUS_FILTERS: { label: string; value: VerificationStatus | undefined }[] = [
  { label: "All Statuses", value: undefined },
  { label: "Verified", value: "VERIFIED_OFFICIAL" },
  { label: "Likely Genuine", value: "LIKELY_GENUINE" },
  { label: "Needs Review", value: "NEEDS_REVIEW" },
  { label: "High Risk", value: "HIGH_RISK" },
  { label: "Confirmed Scam", value: "CONFIRMED_SCAM" },
];

const DOMAIN_FILTERS: { label: string; value: OpportunityDomain | undefined }[] = [
  { label: "All Categories", value: undefined },
  { label: "Internship", value: "internship" },
  { label: "Scholarship", value: "scholarship" },
  { label: "Job", value: "job" },
  { label: "Freelance", value: "freelance" },
  { label: "Competition", value: "competition" },
  { label: "Website", value: "website" },
  { label: "Other", value: "message_other" },
];

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
      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-sm border font-semibold whitespace-nowrap ${badgeClass}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span>{copy.label}</span>
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
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

      {/* Filter Chips Bar */}
      <div className="bg-surface p-4 sm:p-5 rounded-md border border-border shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
          <span>Filters</span>
        </div>

        {/* Status filter chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground block">Verification Status:</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by verification status">
            {STATUS_FILTERS.map((filter) => {
              const active = selectedStatus === filter.value;
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(filter.value);
                    setPage(1);
                  }}
                  className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-surface-raised text-muted-foreground hover:text-foreground border-border hover:bg-surface"
                  }`}
                  aria-pressed={active}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filter chips */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <span className="text-[11px] font-semibold text-muted-foreground block">Offer Category:</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            {DOMAIN_FILTERS.map((filter) => {
              const active = selectedDomain === filter.value;
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setSelectedDomain(filter.value);
                    setPage(1);
                  }}
                  className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-surface-raised text-muted-foreground hover:text-foreground border-border hover:bg-surface"
                  }`}
                  aria-pressed={active}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* List Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : !data || data.items.length === 0 ? (
        <div className="bg-surface rounded-md border border-border p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-surface-raised text-muted-foreground flex items-center justify-center mx-auto">
            <HistoryIcon className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-foreground">No analyses found</h2>
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
        <div className="space-y-4">
          {/* Desktop/Tablet Table Layout (>= 768px) */}
          <div className="hidden md:block overflow-hidden rounded-md border border-border bg-surface shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="p-3.5">Status</th>
                  <th scope="col" className="p-3.5">Category &amp; Org</th>
                  <th scope="col" className="p-3.5">Summary</th>
                  <th scope="col" className="p-3.5">Date</th>
                  <th scope="col" className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {data.items.map((item) => {
                  const currentStatus =
                    (item.verification_status || item.verificationStatus || "NEEDS_REVIEW") as VerificationStatus;
                  return (
                    <tr key={item.id} className="hover:bg-surface-raised/60 transition-colors">
                      <td className="p-3.5 align-middle">
                        {getStatusBadge(currentStatus)}
                      </td>
                      <td className="p-3.5 align-middle">
                        <div className="space-y-0.5">
                          <span className="font-mono uppercase font-bold text-[11px] text-muted-foreground block">
                            {item.domain}
                          </span>
                          {item.claimed_org && (
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                              {item.claimed_org}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 align-middle max-w-xs">
                        <p className="font-medium text-foreground line-clamp-2">
                          {item.summary}
                        </p>
                      </td>
                      <td className="p-3.5 align-middle whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(item.id)}
                            className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            title="Delete this analysis"
                            aria-label={`Delete analysis for ${item.claimed_org || item.summary}`}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                          </button>
                          <Link
                            to={`/results/${item.id}`}
                            className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface-raised hover:bg-primary/10 text-foreground hover:text-primary text-xs font-bold transition-colors cursor-pointer border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (< 768px) */}
          <div className="md:hidden space-y-3">
            {data.items.map((item) => {
              const currentStatus =
                (item.verification_status || item.verificationStatus || "NEEDS_REVIEW") as VerificationStatus;
              return (
                <div
                  key={item.id}
                  className="bg-surface border border-border hover:border-primary/40 rounded-md p-4 shadow-xs transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {getStatusBadge(currentStatus)}
                    <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="uppercase font-bold font-mono">{item.domain}</span>
                      {item.claimed_org && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-foreground">{item.claimed_org}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(item.id)}
                      className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-muted-foreground hover:text-destructive rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="Delete this analysis"
                      aria-label="Delete this analysis"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                    </button>

                    <Link
                      to={`/results/${item.id}`}
                      className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface-raised hover:bg-primary/10 text-foreground hover:text-primary text-xs font-bold transition-colors cursor-pointer border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View Report
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

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
