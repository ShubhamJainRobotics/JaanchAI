import { Printer, Download } from "lucide-react";
import { AnalysisResult } from "shared";

interface ExportReportButtonsProps {
  result: AnalysisResult;
}

export function ExportReportButtons({ result }: ExportReportButtonsProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      jaanchVersion: "2.0",
      exportTimestamp: new Date().toISOString(),
      analysisId: result.id,
      status: result.status,
      reasons: result.reasons,
      ruleScore: result.ruleScore,
      claimedOrganization: result.matchedOrganization?.name || "Not stated",
      senderIdentity: result.senderIdentity,
      headerAnalysis: result.headerAnalysis,
      listingComparison: result.listingComparison,
      completeness: result.completeness,
      checks: result.checks,
      signals: result.signals,
      unknowns: result.unknowns,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jaanch-evidence-report-${result.id || "export"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer"
        title="Print or save as PDF"
      >
        <Printer className="w-3.5 h-3.5" aria-hidden="true" />
        Print / PDF
      </button>

      <button
        type="button"
        onClick={handleExportJson}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer"
        title="Download complete evidence report in JSON format"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        Export JSON
      </button>
    </div>
  );
}
