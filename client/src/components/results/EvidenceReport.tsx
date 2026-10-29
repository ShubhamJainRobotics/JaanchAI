import { useState, useEffect } from "react";
import { AnalysisResult, CheckRow as CheckRowType, AnalyzeRequest } from "shared";
import { CheckRow } from "./CheckRow";
import { ExportReportButtons } from "./ExportReportButtons";
import { apiClient } from "../../lib/apiClient";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Building2,
  Mail,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface EvidenceReportProps {
  result: AnalysisResult;
  onUpdateResult?: (updated: AnalysisResult) => void;
  targetInput?: string | null;
}

export function EvidenceReport({ result, onUpdateResult, targetInput }: EvidenceReportProps) {
  // Expandable row state for drill-downs
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    completeness: false,
    sender_domain: false,
    organization: false,
    reported: false,
  });

  // Grouped not-run inline input state
  const [inlineEmail, setInlineEmail] = useState("");
  const [inlineHeaders, setInlineHeaders] = useState("");
  const [inlineListing, setInlineListing] = useState("");
  const [inlineOrg, setInlineOrg] = useState("");
  const [activeInput, setActiveInput] = useState<string | null>(targetInput || null);
  const [isRerunning, setIsRerunning] = useState(false);

  useEffect(() => {
    if (targetInput) {
      setActiveInput(targetInput);
    }
  }, [targetInput]);

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const findCheck = (key: string): CheckRowType | undefined =>
    result.checks?.find((c) => c.checkKey === key);

  // Checks mapping
  const orgCheck = findCheck("organization_registry_match");
  const senderDomainCheck = findCheck("sender_domain_match");
  const domainAgeCheck = findCheck("domain_age");
  const listingCheck = findCheck("official_listing");
  const payCheck = findCheck("payment_request");
  const dataCheck = findCheck("sensitive_data_request");
  const urgCheck = findCheck("urgency_language");
  const guaranteeCheck = findCheck("guarantee_unrealistic");
  const reportedCheck = findCheck("reported_records");

  const missingSenderEmail = !result.senderIdentity?.rawEmail;
  const missingHeaders = !result.headerAnalysis;
  const missingListing =
    !result.listingComparison || result.listingComparison.status === "not_checked";
  const missingOrg = !result.matchedOrganization && !result.extractedFields?.organization?.value;

  const notRunCount = [
    missingSenderEmail,
    missingHeaders,
    missingListing,
    missingOrg,
  ].filter(Boolean).length;

  const handleAddDetail = async (patch: {
    senderEmail?: string;
    emailHeaders?: string;
    officialListing?: { url?: string; text?: string };
    claimedOrg?: string;
  }) => {
    setIsRerunning(true);
    try {
      const existingReq = apiClient.getLocalRequest();

      const newReq: AnalyzeRequest = {
        text: (result as any).input_text || (result as any).rawText || existingReq?.text || "Opportunity analysis text",
        domain: result.domain,
        channel: existingReq?.channel || "email",
        inputType: existingReq?.inputType || "text",
        claimedOrg: patch.claimedOrg ?? existingReq?.claimedOrg ?? (result as any).claimedOrg ?? result.matchedOrganization?.name,
        sender: {
          email: patch.senderEmail ?? existingReq?.sender?.email ?? result.senderIdentity?.rawEmail ?? undefined,
        },
        emailHeaders: patch.emailHeaders ?? existingReq?.emailHeaders ?? undefined,
        officialListing: patch.officialListing ?? existingReq?.officialListing ?? undefined,
        runThirdPartyChecks: false,
        useAi: false,
        saveToHistory: Boolean(result.id),
        storeRawText: true,
      };

      const updated = await apiClient.analyze(newReq);
      apiClient.saveLocalRequest(newReq);
      if (onUpdateResult) {
        onUpdateResult(updated);
      }
      setActiveInput(null);
    } catch (err) {
      console.error("Re-analysis failed:", err);
    } finally {
      setIsRerunning(false);
    }
  };

  const isOrgExtracted = Boolean(
    result.extractedFields?.organization?.value &&
    !(result as any).claimedOrg
  );
  const isEmailExtracted = (result.senderIdentity as any)?.candidateSource === "extracted_from_text";

  return (
    <section
      id="evidence-report-section"
      data-testid="evidence-report"
      className="surface-card overflow-hidden print:border-none print:shadow-none transition-colors"
      role="region"
      aria-label="Comprehensive offer evidence report"
    >
      {/* Evidence Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-border bg-surface-raised">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-primary text-primary-foreground shadow-xs">
            <FileText className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Offer Verification Evidence Report
            </h2>
            <p className="text-xs text-muted-foreground">
              Evidence-gated audit trail with expandable details and missing checks
            </p>
          </div>
        </div>

        <div className="print:hidden">
          <ExportReportButtons result={result} />
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4 font-sans">
        {/* Row 1: Organization Registry Verification */}
        <div className="space-y-2">
          <div
            onClick={() => toggleRow("organization")}
            className="cursor-pointer group focus:outline-hidden"
            role="button"
            tabIndex={0}
            aria-expanded={expandedRows.organization}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRow("organization")}
          >
            <div className="relative">
              <CheckRow
                label="Organization Registry Verification"
                outcome={orgCheck?.outcome || (result.matchedOrganization ? "pass" : "unknown")}
                detail={
                  orgCheck?.detail ||
                  (result.matchedOrganization
                    ? `Matched registry organization: ${result.matchedOrganization.name}`
                    : result.extractedFields?.organization?.value
                    ? `Claimed organization: '${result.extractedFields.organization.value}' (Not in official registry)`
                    : "No organization claimed or matched.")
                }
                source="registry"
              />
              <span className="absolute right-3.5 top-3.5 text-muted-foreground group-hover:text-foreground transition-colors print:hidden">
                {expandedRows.organization ? (
                  <ChevronUp className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                )}
              </span>
            </div>
          </div>

          {/* Drill-down Drawer: Organization Details */}
          {(expandedRows.organization || true) && (
            <div className={`${expandedRows.organization ? "block" : "hidden print:block"} p-4 bg-surface-raised rounded-md border border-border text-xs space-y-2.5 ml-1 sm:ml-2`}>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Building2 className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Organization Identity Details</span>
              </div>
              {isOrgExtracted && (
                <div className="p-2.5 rounded-md bg-severity-medium-bg border border-severity-medium-border text-severity-medium-fg font-medium">
                  <strong>Notice:</strong> Organization name <em>"{result.extractedFields?.organization?.value}"</em> was taken from the message text — confirm if this is the real sender's organization.
                </div>
              )}
              {result.matchedOrganization ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground font-medium">
                  <div><strong className="text-foreground">Official Name:</strong> {result.matchedOrganization.name}</div>
                  <div><strong className="text-foreground">Kind:</strong> {result.matchedOrganization.kind}</div>
                  <div className="sm:col-span-2">
                    <strong className="text-foreground">Official Domains:</strong> {result.matchedOrganization.officialDomains.join(", ")}
                  </div>
                  {result.matchedOrganization.careersUrl && (
                    <div className="sm:col-span-2">
                      <strong className="text-foreground">Careers Portal:</strong> {result.matchedOrganization.careersUrl}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground font-medium">
                  This organization was not found in our statutory registry database (MCA / AICTE / UGC / verified employers).
                </p>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Sender Domain & Identity */}
        <div className="space-y-2">
          <div
            onClick={() => toggleRow("sender_domain")}
            className="cursor-pointer group focus:outline-hidden"
            role="button"
            tabIndex={0}
            aria-expanded={expandedRows.sender_domain}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRow("sender_domain")}
          >
            <div className="relative">
              <CheckRow
                label="Sender Domain Legitimacy"
                outcome={senderDomainCheck?.outcome || "not_run"}
                detail={senderDomainCheck?.detail || "Sender email address not supplied."}
                source="rule"
              />
              <span className="absolute right-3.5 top-3.5 text-muted-foreground group-hover:text-foreground transition-colors print:hidden">
                {expandedRows.sender_domain ? (
                  <ChevronUp className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                )}
              </span>
            </div>
          </div>

          {/* Drill-down Drawer: Sender & Channel Identity */}
          {(expandedRows.sender_domain || true) && (
            <div className={`${expandedRows.sender_domain ? "block" : "hidden print:block"} p-4 bg-surface-raised rounded-md border border-border text-xs space-y-2.5 ml-1 sm:ml-2`}>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Mail className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Sender & Contact Channels Audit</span>
              </div>
              {isEmailExtracted && (
                <div className="p-2.5 rounded-md bg-severity-medium-bg border border-severity-medium-border text-severity-medium-fg font-medium">
                  <strong>Notice:</strong> Sender email <em>"{result.senderIdentity?.rawEmail}"</em> was taken from the message text — confirm if this is the real sender address.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground font-medium">
                <div><strong className="text-foreground">Email:</strong> {result.senderIdentity?.rawEmail || "Not provided"}</div>
                <div><strong className="text-foreground">Domain:</strong> {result.senderIdentity?.domain || "Not provided"}</div>
                <div><strong className="text-foreground">Recruiter Name:</strong> {result.senderIdentity?.recruiterName || "Not stated"}</div>
                <div><strong className="text-foreground">Phone / Contact:</strong> {result.senderIdentity?.phone || "Not provided"}</div>
                {result.senderIdentity?.upiId && (
                  <div><strong className="text-foreground">UPI ID:</strong> {result.senderIdentity.upiId}</div>
                )}
                {result.senderIdentity?.websiteUrl && (
                  <div className="sm:col-span-2"><strong className="text-foreground">Website:</strong> {result.senderIdentity.websiteUrl}</div>
                )}
              </div>
              {result.headerAnalysis && (
                <div className="pt-2 border-t border-border text-muted-foreground font-medium">
                  <strong className="text-foreground">Email Cryptographic Auth:</strong> SPF: {result.headerAnalysis.authResults.spf}, DKIM: {result.headerAnalysis.authResults.dkim}, DMARC: {result.headerAnalysis.authResults.dmarc}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Domain Age / RDAP */}
        {domainAgeCheck && (
          <CheckRow
            label="Domain Age & RDAP History"
            outcome={domainAgeCheck.outcome}
            detail={domainAgeCheck.detail}
            source={domainAgeCheck.source}
          />
        )}

        {/* Row 4: Official Listing Check */}
        {listingCheck && (
          <CheckRow
            label="Official Opportunity Listing"
            outcome={listingCheck.outcome}
            detail={listingCheck.detail}
            source={listingCheck.source}
          />
        )}

        {/* Row 5: Payment Request */}
        {payCheck && (
          <CheckRow
            label="Payment Request Detection"
            outcome={payCheck.outcome}
            detail={payCheck.detail}
            source={payCheck.source}
          />
        )}

        {/* Row 6: Sensitive Data Request */}
        {dataCheck && (
          <CheckRow
            label="Sensitive Data Request Check"
            outcome={dataCheck.outcome}
            detail={dataCheck.detail}
            source={dataCheck.source}
          />
        )}

        {/* Row 7: Urgency Language */}
        {urgCheck && (
          <CheckRow
            label="Urgency & Pressure Language"
            outcome={urgCheck.outcome}
            detail={urgCheck.detail}
            source={urgCheck.source}
          />
        )}

        {/* Row 8: Guarantee / Unrealistic Claims */}
        {guaranteeCheck && (
          <CheckRow
            label="Guaranteed Selection & Unrealistic Claims"
            outcome={guaranteeCheck.outcome}
            detail={guaranteeCheck.detail}
            source={guaranteeCheck.source}
          />
        )}

        {/* Row 9: Reported Fraud Records */}
        <div className="space-y-2">
          <div
            onClick={() => toggleRow("reported")}
            className="cursor-pointer group focus:outline-hidden"
            role="button"
            tabIndex={0}
            aria-expanded={expandedRows.reported}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRow("reported")}
          >
            <div className="relative">
              <CheckRow
                label="Reported Fraud Database Check"
                outcome={reportedCheck?.outcome || "none_found"}
                detail={reportedCheck?.detail || "No match found in community fraud database. This does not confirm the offer is genuine."}
                source="reported_db"
              />
              <span className="absolute right-3.5 top-3.5 text-muted-foreground group-hover:text-foreground transition-colors print:hidden">
                {expandedRows.reported ? (
                  <ChevronUp className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                )}
              </span>
            </div>
          </div>

          {/* Drill-down Drawer: Reported Matches */}
          {(expandedRows.reported || true) && (
            <div className={`${expandedRows.reported ? "block" : "hidden print:block"} p-4 bg-surface-raised rounded-md border border-border text-xs space-y-2 ml-1 sm:ml-2`}>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>Community Fraud Records Database Details</span>
              </div>
              {result.reportedMatches && result.reportedMatches.length > 0 ? (
                <div className="space-y-2">
                  {result.reportedMatches.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-md bg-status-high-risk-bg border border-status-high-risk-border text-status-high-risk-fg font-medium">
                      <strong>{m.entityType}:</strong> {m.status === "confirmed" ? "Moderator-confirmed scam" : `Reported by ${m.reportCount} user(s)`}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground font-medium">
                  Sender email, phone, domain, and links were checked against community records. No previous reports were found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Row 10: Offer Content Completeness */}
        {result.completeness && (
          <div className="space-y-2">
            <div
              onClick={() => toggleRow("completeness")}
              className="cursor-pointer group focus:outline-hidden"
              role="button"
              tabIndex={0}
              aria-expanded={expandedRows.completeness}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleRow("completeness")}
            >
              <div className="relative">
                <CheckRow
                  label="Offer Content Completeness"
                  outcome={
                    result.completeness.missing.length === 0
                      ? "pass"
                      : "unknown"
                  }
                  outcomeLabel={
                    result.completeness.missing.length === 0
                      ? undefined
                      : "Incomplete"
                  }
                  detail={`${result.completeness.present.length} of 10 essential details present. ${
                    result.completeness.missing.length > 0
                      ? `Missing: ${result.completeness.missing.join(", ")}.`
                      : "All essential details accounted for."
                  }`}
                  source="rule"
                />
                <span className="absolute right-3.5 top-3.5 text-muted-foreground group-hover:text-foreground transition-colors print:hidden">
                  {expandedRows.completeness ? (
                    <ChevronUp className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  )}
                </span>
              </div>
            </div>

            {/* Drill-down Drawer: 10-Detail Completeness Grid */}
            {(expandedRows.completeness || true) && (
              <div className={`${expandedRows.completeness ? "block" : "hidden print:block"} p-4 bg-surface-raised rounded-md border border-border text-xs space-y-3 ml-1 sm:ml-2`}>
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <FileCheck className="w-4 h-4 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  <span>10-Detail Completeness Audit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.completeness.details ? (
                    result.completeness.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-md border ${
                          detail.present
                            ? "bg-surface border-status-verified-border text-foreground"
                            : "bg-surface border-status-review-border text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          {detail.present ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-status-verified-icon shrink-0" strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-status-review-icon shrink-0" strokeWidth={2} aria-hidden="true" />
                          )}
                          <span className={detail.present ? "text-status-verified-fg capitalize" : "text-status-review-fg capitalize"}>
                            {detail.label || detail.key.replace(/([A-Z])/g, " $1")}
                          </span>
                        </div>
                        {detail.present ? (
                          <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                            "{detail.evidenceQuote}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                            {detail.reason || "Not specified in offer text."}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    result.completeness.present.map((p, idx) => (
                      <div key={idx} className="p-2 bg-surface rounded-md border border-status-verified-border text-status-verified-fg font-medium">
                        ✓ {p}
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  Genuine offers occasionally omit details; missing details are never proof of fraud, but they require review.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Grouped Not-Run Block with Inline Inputs */}
        {notRunCount > 0 && (
          <div className="mt-6 p-5 rounded-md border border-primary/25 bg-surface-raised space-y-3.5 print:hidden">
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-5 h-5 text-primary shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Add these details to run more checks ({notRunCount} missing)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Providing additional evidence increases verification coverage and eliminates unknowns.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Add sender email */}
              {missingSenderEmail && (
                <div className="p-3 bg-surface rounded-md border border-border space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Sender Email Address
                  </span>
                  {activeInput === "email" ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="e.g. hr@company.com"
                        value={inlineEmail}
                        onChange={(e) => setInlineEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded-md border border-border bg-surface text-foreground"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddDetail({ senderEmail: inlineEmail.trim() })}
                          disabled={!inlineEmail.trim() || isRerunning}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 min-h-[36px]"
                        >
                          {isRerunning ? "Checking..." : "Add & Re-check"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInput(null)}
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground text-xs min-h-[36px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveInput("email")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover min-h-[36px]"
                    >
                      + Add sender email
                    </button>
                  )}
                </div>
              )}

              {/* Paste email headers */}
              {missingHeaders && (
                <div className="p-3 bg-surface rounded-md border border-border space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Email Headers (DKIM / SPF)
                  </span>
                  {activeInput === "headers" ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        placeholder="Paste raw email headers from your email client..."
                        value={inlineHeaders}
                        onChange={(e) => setInlineHeaders(e.target.value)}
                        className="w-full text-xs p-2 rounded-md border border-border bg-surface text-foreground font-mono"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddDetail({ emailHeaders: inlineHeaders.trim() })}
                          disabled={!inlineHeaders.trim() || isRerunning}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 min-h-[36px]"
                        >
                          {isRerunning ? "Checking..." : "Verify Headers"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInput(null)}
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground text-xs min-h-[36px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveInput("headers")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover min-h-[36px]"
                    >
                      + Paste email headers
                    </button>
                  )}
                </div>
              )}

              {/* Add official listing */}
              {missingListing && (
                <div className="p-3 bg-surface rounded-md border border-border space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Official Opportunity Listing
                  </span>
                  {activeInput === "listing" ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Paste careers URL or listing text..."
                        value={inlineListing}
                        onChange={(e) => setInlineListing(e.target.value)}
                        className="w-full text-xs p-2 rounded-md border border-border bg-surface text-foreground"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAddDetail({
                              officialListing: inlineListing.startsWith("http")
                                ? { url: inlineListing.trim() }
                                : { text: inlineListing.trim() },
                            })
                          }
                          disabled={!inlineListing.trim() || isRerunning}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 min-h-[36px]"
                        >
                          {isRerunning ? "Checking..." : "Compare Listing"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInput(null)}
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground text-xs min-h-[36px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveInput("listing")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover min-h-[36px]"
                    >
                      + Add official listing
                    </button>
                  )}
                </div>
              )}

              {/* Search organization registry */}
              {missingOrg && (
                <div className="p-3 bg-surface rounded-md border border-border space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Organization Name
                  </span>
                  {activeInput === "org" ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="e.g. Tata Consultancy Services"
                        value={inlineOrg}
                        onChange={(e) => setInlineOrg(e.target.value)}
                        className="w-full text-xs p-2 rounded-md border border-border bg-surface text-foreground"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddDetail({ claimedOrg: inlineOrg.trim() })}
                          disabled={!inlineOrg.trim() || isRerunning}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 min-h-[36px]"
                        >
                          {isRerunning ? "Checking..." : "Search Registry"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInput(null)}
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground text-xs min-h-[36px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveInput("org")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover min-h-[36px]"
                    >
                      + Search organization registry
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
