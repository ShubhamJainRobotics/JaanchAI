import { useState, useRef } from "react";
import { FileCheck, Loader2, AlertCircle } from "lucide-react";
import { extractTextFromPdf } from "../../lib/pdf";

interface PdfUploadPanelProps {
  onTextExtracted: (text: string) => void;
}

export function PdfUploadPanel({ onTextExtracted }: PdfUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<{ status: string; progress: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setError("Please select a valid PDF document.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setError(null);
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const extracted = await extractTextFromPdf(selectedFile, 5, (p) => {
        setProgress(p);
      });

      if (!extracted || extracted.length < 5) {
        setError("Could not extract readable text from this PDF. Try entering text directly.");
      } else {
        onTextExtracted(extracted);
      }
    } catch (err: any) {
      console.error("PDF extraction error:", err);
      setError("Failed to parse PDF. Please ensure the document is not password-protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          file
            ? "border-brand-300 bg-brand-50/20"
            : "border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {file ? file.name : "Click or drag & drop offer letter PDF"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF up to 5MB (max 5 pages parsed). If scanned, client-side OCR is automatically activated.
            </p>
          </div>
        </div>
      </div>

      {isProcessing && progress && (
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-200" aria-live="polite">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-900 mb-1.5">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              {progress.status}
            </span>
            <span>{(progress.progress * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-brand-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
