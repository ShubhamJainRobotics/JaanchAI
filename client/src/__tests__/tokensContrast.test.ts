import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const lum1 = getRelativeLuminance(r1, g1, b1);
  const lum2 = getRelativeLuminance(r2, g2, b2);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

function getHue(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return h * 360;
}

function getHueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

describe("Design Tokens & WCAG Contrast Verification (§4, §7, §8)", () => {
  it("verifies Light Theme body text contrast >= 4.5:1", () => {
    // foreground (#12102b) on surface (#ffffff) and background (#fafaff)
    expect(getContrastRatio("#12102b", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#12102b", "#fafaff")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Light Theme muted text contrast >= 4.5:1", () => {
    // muted-foreground (#5b5878) on surface and background
    expect(getContrastRatio("#5b5878", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#5b5878", "#fafaff")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Light Theme Primary button text contrast >= 4.5:1", () => {
    // white text on Electric Indigo (#5b3df5)
    expect(getContrastRatio("#ffffff", "#5b3df5")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Light Theme Status Banner text contrast >= 7:1", () => {
    // verified
    expect(getContrastRatio("#065f46", "#ecfdf5")).toBeGreaterThanOrEqual(7.0);
    // likely genuine
    expect(getContrastRatio("#115e59", "#f0fdfa")).toBeGreaterThanOrEqual(7.0);
    // review
    expect(getContrastRatio("#78350f", "#fffbeb")).toBeGreaterThanOrEqual(7.0);
    // high risk
    expect(getContrastRatio("#7f1d1d", "#fef2f2")).toBeGreaterThanOrEqual(7.0);
    // confirmed scam
    expect(getContrastRatio("#881337", "#fff1f2")).toBeGreaterThanOrEqual(7.0);
  });

  it("verifies Dark Theme body text contrast >= 4.5:1", () => {
    // foreground (#f3f1ff) on surface (#17143a) and background (#0f0d24)
    expect(getContrastRatio("#f3f1ff", "#17143a")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#f3f1ff", "#0f0d24")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Dark Theme muted text contrast >= 4.5:1", () => {
    // muted-foreground (#b9b4de) on surface and background
    expect(getContrastRatio("#b9b4de", "#17143a")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#b9b4de", "#0f0d24")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Dark Theme Primary button text contrast >= 4.5:1", () => {
    // #0f0d24 text on #8f7bff
    expect(getContrastRatio("#0f0d24", "#8f7bff")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Dark Theme Status Banner text contrast >= 7:1", () => {
    // verified
    expect(getContrastRatio("#6ee7b7", "#06281e")).toBeGreaterThanOrEqual(7.0);
    // likely genuine
    expect(getContrastRatio("#5eead4", "#042727")).toBeGreaterThanOrEqual(7.0);
    // review
    expect(getContrastRatio("#fcd34d", "#2b1b04")).toBeGreaterThanOrEqual(7.0);
    // high risk
    expect(getContrastRatio("#fca5a5", "#2d0b0b")).toBeGreaterThanOrEqual(7.0);
    // confirmed scam
    expect(getContrastRatio("#fda4af", "#2e0b16")).toBeGreaterThanOrEqual(7.0);
  });

  it("verifies Focus Ring contrast >= 3:1 against background in both themes", () => {
    // Light ring (#8f7bff) against #fafaff and #ffffff
    expect(getContrastRatio("#8f7bff", "#fafaff")).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio("#8f7bff", "#ffffff")).toBeGreaterThanOrEqual(3.0);
    // Dark ring (#b7a8ff) against #0f0d24 and #17143a
    expect(getContrastRatio("#b7a8ff", "#0f0d24")).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio("#b7a8ff", "#17143a")).toBeGreaterThanOrEqual(3.0);
  });

  it("verifies Brand Primary has minimum 30 degree hue separation from all 5 status colors (§4)", () => {
    const brandHue = getHue("#5b3df5");
    const statusColors = {
      verified: "#047857",
      likelyGenuine: "#008299",
      needsReview: "#b45309",
      highRisk: "#b91c1c",
      confirmedScam: "#9f1239",
    };

    for (const [, hex] of Object.entries(statusColors)) {
      const statusHue = getHue(hex);
      const distance = getHueDistance(brandHue, statusHue);
      expect(distance).toBeGreaterThanOrEqual(30);
    }
  });

  it("verifies Marketing Highlight contrast against dark foreground >= 4.5:1 (§4)", () => {
    // highlight #ffd43b with foreground #12102b
    expect(getContrastRatio("#12102b", "#ffd43b")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("Content Authenticity & Anti-Pattern Verification (§8.6)", () => {
  it("ensures no numeric risk percentages or banned marketing claims exist in client code", () => {
    const clientSrc = path.resolve(__dirname, "..");
    const files: string[] = [];

    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && entry.name !== "dist") {
            walk(full);
          }
        } else if (/\.(tsx?|jsx?|html)$/.test(entry.name)) {
          files.push(full);
        }
      }
    }
    walk(clientSrc);

    const bannedRiskPct = /\b\d{1,3}\s*%\s*(?:risk|chance|probability)\b/i;
    const bannedAccuracy = /\b\d{1,3}\s*%\s*accurate\b/i;
    const bannedPartners = /(?:trusted by \d+|over \d+ students verified)/i;

    for (const f of files) {
      if (f.includes("__tests__")) continue;
      const content = fs.readFileSync(f, "utf-8");
      expect(content).not.toMatch(bannedRiskPct);
      expect(content).not.toMatch(bannedAccuracy);
      expect(content).not.toMatch(bannedPartners);
    }
  });

  it("ensures font-mono is strictly contained and not leaked into UI labels or headers (§3.4, §6)", () => {
    const clientSrc = path.resolve(__dirname, "..");
    const files: string[] = [];

    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && entry.name !== "dist") {
            walk(full);
          }
        } else if (/\.tsx$/.test(entry.name)) {
          files.push(full);
        }
      }
    }
    walk(clientSrc);

    // Banned places for font-mono: headers, buttons, UI labels, channel strings, fictional offer banners
    const bannedMonoPatterns = [
      /<h[1-6][^>]*font-mono/i,
      /<button[^>]*font-mono/i,
      /WhatsApp \/ Telegram \/ Email[^>]*font-mono/i,
      /font-mono[^>]*>WhatsApp \/ Telegram \/ Email/i,
      /Example\s*[-—]\s*fictional offer[^>]*font-mono/i,
      /Sample Preview[^>]*font-mono/i,
    ];

    for (const f of files) {
      if (f.includes("__tests__")) continue;
      const content = fs.readFileSync(f, "utf-8");
      for (const pattern of bannedMonoPatterns) {
        expect(content).not.toMatch(pattern);
      }
    }
  });
});
