import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { extractTextFromImage, OcrProgress } from "../../lib/ocr";

interface ImageUploadPanelProps {
  onTextExtracted: (text: string) => void;
}

export function ImageUploadPanel({ onTextExtracted }: ImageUploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, or WEBP).");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setError(null);
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setIsProcessing(true);

    try {
      const extracted = await extractTextFromImage(selectedFile, (p) => {
        setOcrProgress(p);
      });

      if (!extracted || extracted.length < 5) {
        setError("Could not detect legible text in this image. Try another screenshot or enter text directly.");
      } else {
        onTextExtracted(extracted);
      }
    } catch (err: any) {
      console.error("OCR error:", err);
      setError("Text extraction failed. Please ensure the screenshot is clear and try again.");
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
    <div
      role="tabpanel"
      id="tabpanel-screenshot"
      aria-labelledby="tab-screenshot"
      className="space-y-4"
    >
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        aria-label="Upload WhatsApp screenshot"
        className={`border-2 border-dashed rounded-md p-6 sm:p-8 text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          file
            ? "border-primary/40 bg-primary/5"
            : "border-border hover:border-primary/50 bg-surface hover:bg-surface-raised"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {previewUrl ? (
          <div className="max-w-xs mx-auto space-y-3">
            <img
              src={previewUrl}
              alt="Screenshot preview"
              className="max-h-48 rounded-md shadow-xs mx-auto object-contain border border-border"
            />
            <p className="text-xs text-muted-foreground font-mono">
              {file?.name} ({(file?.size! / 1024).toFixed(0)} KB)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Click or drag & drop WhatsApp screenshot
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, or WEBP up to 5MB. Optical Character Recognition runs 100% in your browser.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress status */}
      {isProcessing && ocrProgress && (
        <div
          className="p-4 rounded-md bg-surface-raised border border-border"
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5 font-mono">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" strokeWidth={2} aria-hidden="true" />
              {ocrProgress.status}
            </span>
            <span className="tabular-nums">{(ocrProgress.progress * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${ocrProgress.progress * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-md bg-status-high-risk-bg text-status-high-risk-fg text-xs border border-status-high-risk-border">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
