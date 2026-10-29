import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

/**
 * Register Noto Sans and Noto Sans Devanagari fonts with @react-pdf/renderer.
 * Runs idempotently once.
 * Supports both browser environment (/fonts/...) and Node test environment (local fs paths).
 */
export function registerReportFonts(basePath?: string): void {
  if (fontsRegistered) {
    return;
  }

  const isNode = typeof window === "undefined";

  const resolvePath = (filename: string): string => {
    if (basePath) {
      return `${basePath}/${filename}`;
    }
    if (isNode) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require("node:path");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require("node:fs");
        const candidate1 = path.resolve(process.cwd(), "public/fonts", filename);
        if (fs.existsSync(candidate1)) return candidate1;
        const candidate2 = path.resolve(process.cwd(), "client/public/fonts", filename);
        if (fs.existsSync(candidate2)) return candidate2;
        return candidate1;
      } catch {
        return `./public/fonts/${filename}`;
      }
    }
    return `/fonts/${filename}`;
  };

  try {
    // Disable automatic mid-word hyphenation so words wrap cleanly
    Font.registerHyphenationCallback((word) => [word]);

    Font.register({
      family: "Noto Sans",
      fonts: [
        {
          src: resolvePath("NotoSans-Regular.ttf"),
          fontWeight: "normal",
          fontStyle: "normal",
        },
        {
          src: resolvePath("NotoSans-Medium.ttf"),
          fontWeight: 500,
          fontStyle: "normal",
        },
        {
          src: resolvePath("NotoSans-Bold.ttf"),
          fontWeight: "bold",
          fontStyle: "normal",
        },
        {
          src: resolvePath("NotoSans-Italic.ttf"),
          fontWeight: "normal",
          fontStyle: "italic",
        },
      ],
    });

    Font.register({
      family: "Noto Sans Devanagari",
      fonts: [
        {
          src: resolvePath("NotoSansDevanagari-Regular.ttf"),
          fontWeight: "normal",
        },
        {
          src: resolvePath("NotoSansDevanagari-Bold.ttf"),
          fontWeight: "bold",
        },
      ],
    });

    fontsRegistered = true;
  } catch (err) {
    console.warn("Could not register custom Noto fonts for PDF:", err);
  }
}

/**
 * Helper to determine whether text contains Hindi / Devanagari Unicode characters.
 */
export function containsDevanagari(text?: string | null): boolean {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}
