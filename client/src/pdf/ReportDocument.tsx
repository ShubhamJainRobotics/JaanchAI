import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { ReportViewModel } from "shared";
import { containsDevanagari, registerReportFonts } from "./fonts";

// Ensure fonts are registered prior to rendering
registerReportFonts();

const STATUS_COLORS: Record<
  string,
  { border: string; bg: string; text: string; badgeBg: string }
> = {
  VERIFIED_OFFICIAL: {
    border: "#10B981",
    bg: "#F0FDF4",
    text: "#065F46",
    badgeBg: "#DCFCE7",
  },
  LIKELY_GENUINE: {
    border: "#0D9488",
    bg: "#F0FDFA",
    text: "#115E59",
    badgeBg: "#CCFBF1",
  },
  NEEDS_REVIEW: {
    border: "#F59E0B",
    bg: "#FFFBEB",
    text: "#92400E",
    badgeBg: "#FEF3C7",
  },
  HIGH_RISK: {
    border: "#EF4444",
    bg: "#FEF2F2",
    text: "#991B1B",
    badgeBg: "#FEE2E2",
  },
  CONFIRMED_SCAM: {
    border: "#BE123C",
    bg: "#FFF1F2",
    text: "#881337",
    badgeBg: "#FFE4E6",
  },
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: "#FEE2E2", text: "#991B1B" },
  high: { bg: "#FFEDD5", text: "#C2410C" },
  medium: { bg: "#FEF3C7", text: "#B45309" },
  low: { bg: "#F1F5F9", text: "#475569" },
  info: { bg: "#F8FAFC", text: "#64748B" },
};

const OUTCOME_COLORS: Record<string, string> = {
  pass: "#059669",
  fail: "#DC2626",
  unknown: "#D97706",
  none_found: "#64748B",
  user_attested: "#0D9488",
};

const styles = StyleSheet.create({
  page: {
    height: 841.89,
    fontFamily: "Noto Sans",
    fontSize: 9,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 40,
  },

  // Fixed Header (every page)
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.75,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 5,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#334155",
    letterSpacing: 0.3,
  },
  headerDate: {
    fontSize: 8,
    color: "#64748B",
  },

  // Fixed Footer (every page)
  footerContainer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    height: 24,
    borderTopWidth: 0.75,
    borderTopColor: "#E2E8F0",
    paddingTop: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerDisclaimer: {
    fontSize: 7,
    color: "#64748B",
    maxWidth: "58%",
    lineHeight: 1.2,
  },
  footerReportId: {
    fontSize: 7,
    color: "#94A3B8",
    fontFamily: "Noto Sans",
  },
  footerPageNum: {
    fontSize: 7,
    color: "#475569",
    fontWeight: "bold",
    textAlign: "right",
    lineHeight: 1,
  },

  // Section Typography
  sectionContainer: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0F172A",
    borderBottomWidth: 0.75,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 2,
    marginBottom: 4,
    letterSpacing: 0.2,
  },

  // Summary Card
  summaryCard: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 6.5,
    marginBottom: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2.5,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
  statusLabelText: {
    fontSize: 9.5,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  statusMeaningText: {
    fontSize: 8,
    color: "#334155",
    marginTop: 2,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
    paddingTop: 3.5,
    marginTop: 1,
  },
  metaItem: {
    width: "50%",
    marginBottom: 1.5,
    flexDirection: "row",
  },
  metaKey: {
    fontSize: 7.5,
    color: "#64748B",
    width: "42%",
  },
  metaVal: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0F172A",
    width: "58%",
  },

  // Why this status
  bulletList: {
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 9,
    fontSize: 8,
    color: "#0284C7",
    fontWeight: "bold",
  },
  bulletText: {
    fontSize: 8,
    color: "#334155",
    flex: 1,
    lineHeight: 1.25,
  },

  // Alert Box
  alertBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 5,
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    marginBottom: 1,
  },
  alertBody: {
    fontSize: 7.5,
    lineHeight: 1.3,
  },

  // Tables
  table: {
    width: "100%",
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 0.75,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 3.5,
    paddingHorizontal: 5,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    alignItems: "flex-start",
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA",
  },

  // Signals Table Columns
  colSignalSev: { width: "13%" },
  colSignalTitle: { width: "27%", paddingRight: 4 },
  colSignalQuote: { width: "32%", paddingRight: 4 },
  colSignalWhy: { width: "28%" },

  badgePill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2.5,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 6.5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  signalTitleText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0F172A",
  },
  sourceTagText: {
    fontSize: 6.5,
    color: "#64748B",
    marginTop: 1,
  },
  quoteText: {
    fontSize: 7.5,
    fontStyle: "italic",
    color: "#334155",
    lineHeight: 1.25,
  },
  whyMattersText: {
    fontSize: 7.5,
    color: "#475569",
    lineHeight: 1.25,
  },

  // Evidence Checks Table Columns
  colCheckLabel: { width: "32%", paddingRight: 4 },
  colCheckOutcome: { width: "20%", paddingRight: 4 },
  colCheckDetail: { width: "48%" },

  checkLabelText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0F172A",
  },
  outcomeText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  checkDetailText: {
    fontSize: 7.5,
    color: "#334155",
    lineHeight: 1.25,
  },
  notRunText: {
    fontSize: 7,
    color: "#64748B",
    fontStyle: "italic",
    marginTop: 3,
    paddingHorizontal: 3,
  },

  // 10 Offer Details Grid
  detailsGrid: {
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2.5,
  },
  detailCard: {
    width: "49%",
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 3.5,
    padding: 3.5,
    backgroundColor: "#FFFFFF",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  detailLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0F172A",
  },
  detailStatusBadge: {
    paddingHorizontal: 3.5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  detailStatusText: {
    fontSize: 6.5,
    fontWeight: "bold",
  },
  detailContent: {
    fontSize: 7,
    color: "#334155",
    lineHeight: 1.15,
  },

  // Next Steps
  stepCard: {
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 3.5,
    padding: 3.5,
    marginBottom: 2.5,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
  },
  stepCheckbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 2,
    marginRight: 5,
    marginTop: 1,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 1,
  },
  stepInstruction: {
    fontSize: 7,
    color: "#475569",
    lineHeight: 1.25,
  },

  // Standing Rules Strip
  standingRulesBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    padding: 5,
    marginTop: 3,
    marginBottom: 6,
  },
  standingRulesTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
  },
  standingRuleLine: {
    fontSize: 7,
    color: "#64748B",
    marginBottom: 1,
    lineHeight: 1.2,
  },

  // Draft Reply
  draftBox: {
    borderWidth: 0.5,
    borderColor: "#CBD5E1",
    borderRadius: 4,
    padding: 6,
    backgroundColor: "#F8FAFC",
    marginBottom: 6,
  },
  draftSubject: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 2,
  },
  draftBody: {
    fontSize: 7,
    color: "#334155",
    lineHeight: 1.3,
  },

  // Appendix: Message Analysed
  appendixBox: {
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    padding: 5,
    backgroundColor: "#F8FAFC",
    marginBottom: 6,
  },
  appendixText: {
    fontSize: 7,
    color: "#475569",
    lineHeight: 1.25,
  },

  // Helpline Strip
  helplineBanner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 4,
    padding: 4.5,
    marginTop: 3,
  },
  helplineText: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#991B1B",
  },
});

interface ReportDocumentProps {
  viewModel: ReportViewModel;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ viewModel: vm }) => {
  const statusTheme = STATUS_COLORS[vm.status] || STATUS_COLORS.NEEDS_REVIEW;
  const docTitle = `Jaanch Report – ${vm.statusLabel} – ${vm.generatedAt}`;

  // Group offer details into pairs of 2 so each row breaks cleanly across pages
  const detailRows: Array<[typeof vm.offerDetails[0], typeof vm.offerDetails[0] | undefined]> = [];
  if (vm.offerDetails && vm.offerDetails.length > 0) {
    for (let i = 0; i < vm.offerDetails.length; i += 2) {
      detailRows.push([vm.offerDetails[i], vm.offerDetails[i + 1]]);
    }
  }

  const renderDetailRow = (
    [left, right]: [typeof vm.offerDetails[0], typeof vm.offerDetails[0] | undefined],
    rowIdx: number
  ) => {
    const leftFound = left.status === "Found";
    const leftDevanagari = containsDevanagari(left.quoteOrReason);
    const rightFound = right?.status === "Found";
    const rightDevanagari = right ? containsDevanagari(right.quoteOrReason) : false;

    return (
      <View key={rowIdx} style={styles.detailRow} wrap={false}>
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailLabel}>{left.label}</Text>
            <View
              style={[
                styles.detailStatusBadge,
                { backgroundColor: leftFound ? "#DCFCE7" : "#F1F5F9" },
              ]}
            >
              <Text
                style={[
                  styles.detailStatusText,
                  { color: leftFound ? "#15803D" : "#64748B" },
                ]}
              >
                {left.status}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.detailContent,
              leftDevanagari ? { fontFamily: "Noto Sans Devanagari" } : {},
            ]}
          >
            {left.quoteOrReason}
          </Text>
        </View>

        {right ? (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailLabel}>{right.label}</Text>
              <View
                style={[
                  styles.detailStatusBadge,
                  { backgroundColor: rightFound ? "#DCFCE7" : "#F1F5F9" },
                ]}
              >
                <Text
                  style={[
                    styles.detailStatusText,
                    { color: rightFound ? "#15803D" : "#64748B" },
                  ]}
                >
                  {right.status}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.detailContent,
                rightDevanagari ? { fontFamily: "Noto Sans Devanagari" } : {},
              ]}
            >
              {right.quoteOrReason}
            </Text>
          </View>
        ) : (
          <View style={[styles.detailCard, { borderWidth: 0, backgroundColor: "transparent" }]} />
        )}
      </View>
    );
  };

  const renderNextStep = (step: typeof vm.nextSteps[0], idx: number) => (
    <View key={idx} style={styles.stepCard} wrap={false}>
      <View style={styles.stepCheckbox} />
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        {step.instruction ? (
          <Text style={styles.stepInstruction}>{step.instruction}</Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <Document
      title={docTitle}
      author="Jaanch"
      subject="Offer Verification Evidence Report"
      keywords="Jaanch, verification, evidence report, scam detection, internship, job"
      language="en"
    >
      <Page size="A4" style={styles.page}>
        {/* ============================================================== */}
        {/* FIXED HEADER (Every Page)                                      */}
        {/* ============================================================== */}
        <View style={styles.headerContainer} fixed>
          <Text style={styles.headerTitle}>Jaanch · Offer Verification Report</Text>
          <Text style={styles.headerDate}>{vm.generatedAt}</Text>
        </View>

        {/* ============================================================== */}
        {/* FIXED FOOTER (Every Page)                                      */}
        {/* ============================================================== */}
        <View style={styles.footerContainer} fixed>
          <Text style={styles.footerDisclaimer}>
            Jaanch supports informed decisions. It does not prove that an opportunity is genuine or fraudulent.
          </Text>
          <Text style={styles.footerReportId}>#{vm.reportId}</Text>
          <View
            render={({ pageNumber, totalPages }: any) => (
              <Text style={styles.footerPageNum}>
                Page {pageNumber} of {totalPages}
              </Text>
            )}
            fixed
          />
        </View>

        {/* ============================================================== */}
        {/* SECTION 1: Summary Block                                        */}
        {/* ============================================================== */}
        <View
          style={[
            styles.summaryCard,
            { borderColor: statusTheme.border, backgroundColor: statusTheme.bg },
          ]}
          wrap={false}
        >
          <View style={styles.summaryHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusTheme.badgeBg }]}>
              <Text style={[styles.statusLabelText, { color: statusTheme.text }]}>
                {vm.statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.statusMeaningText}>{vm.statusMeaning}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>Opportunity Type:</Text>
              <Text style={styles.metaVal}>{vm.domainLabel}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>Claimed Organization:</Text>
              <Text style={styles.metaVal}>{vm.claimedOrg || "Not stated"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>AI Context:</Text>
              <Text style={styles.metaVal}>{vm.aiUsed ? "Used" : "Not used"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>Verified On:</Text>
              <Text style={styles.metaVal}>{vm.generatedAt}</Text>
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* SECTION 2: Why This Status                                      */}
        {/* ============================================================== */}
        {vm.reasons && vm.reasons.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} minPresenceAhead={80}>
              Why This Status: Key Evidence
            </Text>
            <View style={styles.bulletList}>
              {vm.reasons.map((reason, idx) => (
                <View key={idx} style={styles.bulletItem} wrap={false}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: Alert Box / Standing Rules                           */}
        {/* ============================================================== */}
        {vm.alert && (
          <View
            style={[
              styles.alertBox,
              vm.alert.type === "critical"
                ? { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }
                : { borderColor: "#CBD5E1", backgroundColor: "#F8FAFC" },
            ]}
            wrap={false}
          >
            <Text
              style={[
                styles.alertTitle,
                { color: vm.alert.type === "critical" ? "#991B1B" : "#1E293B" },
              ]}
            >
              {vm.alert.title}
            </Text>
            <Text
              style={[
                styles.alertBody,
                { color: vm.alert.type === "critical" ? "#B91C1C" : "#475569" },
              ]}
            >
              {vm.alert.body}
            </Text>
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 4: What We Observed (Signals Table)                     */}
        {/* ============================================================== */}
        {vm.signals && vm.signals.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} minPresenceAhead={80}>
              What We Observed ({vm.signals.length})
            </Text>

            <View style={styles.table}>
              {/* Header row repeats on page split */}
              <View style={styles.tableHeaderRow} fixed>
                <Text style={[styles.tableHeaderCell, styles.colSignalSev]}>Severity</Text>
                <Text style={[styles.tableHeaderCell, styles.colSignalTitle]}>Signal</Text>
                <Text style={[styles.tableHeaderCell, styles.colSignalQuote]}>Evidence Quote</Text>
                <Text style={[styles.tableHeaderCell, styles.colSignalWhy]}>Why It Matters</Text>
              </View>

              {/* Data rows never split across pages */}
              {vm.signals.map((signal, idx) => {
                const sevColor = SEVERITY_COLORS[signal.severity] || SEVERITY_COLORS.info;
                const quoteHasDevanagari = containsDevanagari(signal.evidenceQuote);

                return (
                  <View
                    key={idx}
                    style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                    wrap={false}
                  >
                    <View style={styles.colSignalSev}>
                      <View style={[styles.badgePill, { backgroundColor: sevColor.bg }]}>
                        <Text style={[styles.badgeText, { color: sevColor.text }]}>
                          {signal.severity}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.colSignalTitle}>
                      <Text style={styles.signalTitleText}>{signal.title}</Text>
                      <Text style={styles.sourceTagText}>{signal.sourceLabel}</Text>
                    </View>

                    <View style={styles.colSignalQuote}>
                      <Text
                        style={[
                          styles.quoteText,
                          quoteHasDevanagari ? { fontFamily: "Noto Sans Devanagari" } : {},
                        ]}
                      >
                        {signal.evidenceQuote ? `"${signal.evidenceQuote}"` : "—"}
                      </Text>
                    </View>

                    <View style={styles.colSignalWhy}>
                      <Text style={styles.whyMattersText}>{signal.whyItMatters}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 5: Evidence Checks Table & Collapsed Not-Run            */}
        {/* ============================================================== */}
        {(vm.checks.length > 0 || vm.notRunSummary) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} minPresenceAhead={80}>
              Offer Verification Evidence Checks
            </Text>

            {vm.checks.length > 0 && (
              <View style={styles.table}>
                {/* Header row repeats on page split */}
                <View style={styles.tableHeaderRow} fixed>
                  <Text style={[styles.tableHeaderCell, styles.colCheckLabel]}>Verification Check</Text>
                  <Text style={[styles.tableHeaderCell, styles.colCheckOutcome]}>Outcome</Text>
                  <Text style={[styles.tableHeaderCell, styles.colCheckDetail]}>Detail</Text>
                </View>

                {/* Data rows */}
                {vm.checks.map((check, idx) => {
                  const outcomeColor = OUTCOME_COLORS[check.outcome] || "#334155";
                  const detailHasDevanagari = containsDevanagari(check.detail);

                  return (
                    <View
                      key={idx}
                      style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                      wrap={false}
                    >
                      <View style={styles.colCheckLabel}>
                        <Text style={styles.checkLabelText}>{check.label}</Text>
                      </View>

                      <View style={styles.colCheckOutcome}>
                        <Text style={[styles.outcomeText, { color: outcomeColor }]}>
                          {check.outcomeLabel}
                        </Text>
                      </View>

                      <View style={styles.colCheckDetail}>
                        <Text
                          style={[
                            styles.checkDetailText,
                            detailHasDevanagari ? { fontFamily: "Noto Sans Devanagari" } : {},
                          ]}
                        >
                          {check.detail}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Single collapsed line for not-run checks (§4.2) */}
            {vm.notRunSummary ? (
              <Text style={styles.notRunText} wrap={false}>
                • {vm.notRunSummary}
              </Text>
            ) : null}
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 6: Offer Details Found (10 attributes)                 */}
        {/* ============================================================== */}
        {detailRows.length > 0 && (
          <View style={styles.sectionContainer}>
            <View wrap={false}>
              <Text style={styles.sectionTitle} minPresenceAhead={60}>
                Offer Details Found & Completeness
              </Text>
              {renderDetailRow(detailRows[0], 0)}
            </View>

            {detailRows.slice(1).map((pair, rowIdx) => renderDetailRow(pair, rowIdx + 1))}
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 7: Next Steps Checklist                                 */}
        {/* ============================================================== */}
        {vm.nextSteps && vm.nextSteps.length > 0 && (
          <View style={styles.sectionContainer}>
            <View wrap={false}>
              <Text style={styles.sectionTitle} minPresenceAhead={60}>
                {vm.status === "HIGH_RISK" || vm.status === "CONFIRMED_SCAM"
                  ? "Immediate Protective Steps"
                  : "Your Turn: Verification Steps"}
              </Text>
              {renderNextStep(vm.nextSteps[0], 0)}
            </View>

            {vm.nextSteps.slice(1).map((step, idx) => renderNextStep(step, idx + 1))}

            {/* Standing rules below next steps */}
            {vm.standingRules && vm.standingRules.length > 0 && (
              <View style={styles.standingRulesBox} wrap={false}>
                <Text style={styles.standingRulesTitle}>Standing Student Safety Rules</Text>
                {vm.standingRules.map((rule, idx) => (
                  <Text key={idx} style={styles.standingRuleLine}>
                    • {rule}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 8: Draft Reply (Only if generated & not high-risk)     */}
        {/* ============================================================== */}
        {vm.draftReply && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} minPresenceAhead={80}>
              Safe Reply Draft
            </Text>
            <View style={styles.draftBox} wrap={false}>
              <Text style={styles.draftSubject}>Subject: {vm.draftReply.subject}</Text>
              <Text style={styles.draftBody}>{vm.draftReply.body}</Text>
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 9: Message Analysed (Appendix, only if opted in)       */}
        {/* ============================================================== */}
        {vm.messageExcerpt && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} minPresenceAhead={80}>
              Appendix: Message Analysed (PII Redacted)
            </Text>
            <View style={styles.appendixBox} wrap={false}>
              <Text style={styles.appendixText}>{vm.messageExcerpt}</Text>
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* SECTION 10: Helpline Strip for High Risk                       */}
        {/* ============================================================== */}
        {vm.helplineStrip && (
          <View style={styles.helplineBanner} wrap={false}>
            <Text style={styles.helplineText}>
              National Cybercrime Helpline: Call 1930 · cybercrime.gov.in
            </Text>
          </View>
        )}

      </Page>
    </Document>
  );
};
