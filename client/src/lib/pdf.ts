import * as pdfjsLib from "pdfjs-dist";
import { extractTextFromImage } from "./ocr";

// Configure local pdf.js worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export async function extractTextFromPdf(
  file: File,
  maxPages = 5,
  onProgress?: (p: { status: string; progress: number }) => void
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = Math.min(pdf.numPages, maxPages);

  let fullText = "";

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress({
        status: `Processing page ${pageNum} of ${numPages}...`,
        progress: (pageNum - 1) / numPages,
      });
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ")
      .trim();

    if (pageText.length > 20) {
      fullText += pageText + "\n\n";
    } else {
      // Fallback: scanned page without text layer -> render to canvas and OCR
      if (onProgress) {
        onProgress({
          status: `Page ${pageNum} is scanned; running OCR...`,
          progress: (pageNum - 0.5) / numPages,
        });
      }

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          const imageFile = new File([blob], `page_${pageNum}.png`, {
            type: "image/png",
          });
          const ocrText = await extractTextFromImage(imageFile);
          fullText += ocrText + "\n\n";
        }
      }
    }
  }

  if (onProgress) {
    onProgress({ status: "PDF extraction complete", progress: 1.0 });
  }

  return fullText.trim();
}
