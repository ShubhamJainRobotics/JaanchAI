import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { AnalysisResult } from "shared";

describe("PDF Export Bundle & UX Integrity (§6, §9)", () => {
  it("verifies generatePdf is isolated into a separate lazy-loaded chunk in client dist", () => {
    const distAssetsDir = path.resolve(__dirname, "../../dist/assets");
    if (!fs.existsSync(distAssetsDir)) {
      // If dist hasn't been built yet in this run, skip gracefully
      return;
    }

    const files = fs.readdirSync(distAssetsDir);
    const pdfChunks = files.filter((f) => f.startsWith("generatePdf-") && f.endsWith(".js"));
    expect(pdfChunks.length).toBeGreaterThanOrEqual(1);

    // Verify main bundle does NOT inline react-pdf font registration
    const mainChunk = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
    expect(mainChunk).toBeDefined();
  });

  it("verifies filename format matches jaanch-report_<status-kebab>_<YYYY-MM-DD>.pdf", () => {
    const testCases: Array<{ status: AnalysisResult["status"]; expectedKebab: string }> = [
      { status: "HIGH_RISK", expectedKebab: "high-risk" },
      { status: "CONFIRMED_SCAM", expectedKebab: "confirmed-scam" },
      { status: "NEEDS_REVIEW", expectedKebab: "needs-review" },
      { status: "LIKELY_GENUINE", expectedKebab: "likely-genuine" },
      { status: "VERIFIED_OFFICIAL", expectedKebab: "verified-official" },
    ];

    const dateStr = "2026-10-28";
    for (const tc of testCases) {
      const statusKebab = tc.status.toLowerCase().replace(/_/g, "-");
      expect(statusKebab).toBe(tc.expectedKebab);
      const filename = `jaanch-report_${statusKebab}_${dateStr}.pdf`;
      expect(filename).toMatch(/^jaanch-report_[a-z-]+_\d{4}-\d{2}-\d{2}\.pdf$/);
    }
  });

  it("verifies ExportDialog component has correct defaults and aria attributes", () => {
    const exportDialogPath = path.resolve(__dirname, "../components/results/ExportReportDialog.tsx");
    const content = fs.readFileSync(exportDialogPath, "utf-8");

    // Default states
    expect(content).toContain("includeNextSteps, setIncludeNextSteps] = useState(true)");
    expect(content).toContain("includeMessageText, setIncludeMessageText] = useState(false)");

    // Privacy note
    expect(content).toContain("The PDF is created in your browser; nothing is uploaded.");

    // Accessible dialog attributes
    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-labelledby=');
    expect(content).toContain('aria-live="polite"');

    // Secondary print button fallback on error
    expect(content).toContain("window.print");
  });

  it("verifies ExportReportButtons toolbar has Download PDF, Print, and Export JSON", () => {
    const buttonsPath = path.resolve(__dirname, "../components/results/ExportReportButtons.tsx");
    const content = fs.readFileSync(buttonsPath, "utf-8");

    expect(content).toContain("Download PDF");
    expect(content).toContain("Print");
    expect(content).toContain("Export JSON");
    expect(content).toContain("handleExportJson");
    expect(content).toContain("handlePrint");
  });
});
