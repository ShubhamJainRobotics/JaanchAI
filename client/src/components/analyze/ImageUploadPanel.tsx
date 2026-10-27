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
              className="max-h-48 rounded-lg shadow-sm mx-auto object-contain border border-slate-200"
            />
            <p className="text-xs text-slate-500">{file?.name} ({(file?.size! / 1024).toFixed(0)} KB)</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click or drag & drop WhatsApp screenshot
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, or WEBP up to 5MB. Optical Character Recognition runs 100% in your browser.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress status */}
      {isProcessing && ocrProgress && (
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-200" aria-live="polite">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-900 mb-1.5">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              {ocrProgress.status}
            </span>
            <span>{(ocrProgress.progress * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-brand-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${ocrProgress.progress * 100}%` }}
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
