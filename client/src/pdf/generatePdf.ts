import { pdf } from "@react-pdf/renderer";
import React from "react";
import { AnalysisResult, buildReportViewModel } from "shared";
import { ReportDocument } from "./ReportDocument";

export interface GeneratePdfOptions {
  includeNextSteps?: boolean;
  includeMessageText?: boolean;
  draftReply?: { subject: string; body: string } | null;
  alreadyPaid?: boolean;
}

/**
 * Lazy-loaded PDF generator. Generates a client-side Blob from the pure ReportViewModel
 * and triggers deterministic browser file download.
 * Zero user data leaves the browser (no server route, no uploads).
 */
export async function generateAndDownloadPdf(
  result: AnalysisResult,
  options?: GeneratePdfOptions
): Promise<string> {
  const viewModel = buildReportViewModel(result, {
    includeNextSteps: options?.includeNextSteps !== false,
    includeMessageText: options?.includeMessageText ?? false,
    draftReply: options?.draftReply,
    alreadyPaid: options?.alreadyPaid,
  });

  const docElement = React.createElement(ReportDocument, { viewModel });
  const blob = await pdf(docElement as any).toBlob();

  // Filename format: jaanch-report_<status-kebab>_<YYYY-MM-DD>.pdf
  const statusKebab = result.status.toLowerCase().replace(/_/g, "-");
  const dateStr = new Date(result.createdAt || Date.now())
    .toISOString()
    .slice(0, 10);
  const filename = `jaanch-report_${statusKebab}_${dateStr}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after slight delay to ensure browser download starts
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return filename;
}
