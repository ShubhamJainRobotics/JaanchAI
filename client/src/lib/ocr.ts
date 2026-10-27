import { createWorker } from "tesseract.js";

export interface OcrProgress {
  status: string;
  progress: number;
}

export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  const worker = await createWorker("eng");

  if (onProgress) {
    onProgress({ status: "Initializing OCR engine...", progress: 0.1 });
  }

  try {
    const ret = await worker.recognize(imageFile);
    if (onProgress) {
      onProgress({ status: "Completed text recognition", progress: 1.0 });
    }
    return ret.data.text.trim();
  } finally {
    await worker.terminate();
  }
}
