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

describe("Design Tokens & WCAG Contrast Verification (§4, §8)", () => {
  it("verifies Light Theme body text contrast >= 4.5:1", () => {
    // foreground (#0f172a) on surface (#ffffff) and background (#f8fafc)
    expect(getContrastRatio("#0f172a", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#0f172a", "#f8fafc")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Light Theme muted text contrast >= 4.5:1", () => {
    // muted-foreground (#475569) on surface and background
    expect(getContrastRatio("#475569", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#475569", "#f8fafc")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Light Theme Primary button text contrast >= 4.5:1", () => {
    // white text on #0369a1
    expect(getContrastRatio("#ffffff", "#0369a1")).toBeGreaterThanOrEqual(4.5);
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
    // foreground (#f8fafc) on surface (#111827) and background (#0b0f19)
    expect(getContrastRatio("#f8fafc", "#111827")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#f8fafc", "#0b0f19")).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies Dark Theme muted text contrast >= 4.5:1", () => {
    // muted-foreground (#94a3b8) on surface and background
    expect(getContrastRatio("#94a3b8", "#111827")).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio("#94a3b8", "#0b0f19")).toBeGreaterThanOrEqual(4.5);
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
    // Light ring (#0284c7) against #f8fafc and #ffffff
    expect(getContrastRatio("#0284c7", "#f8fafc")).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio("#0284c7", "#ffffff")).toBeGreaterThanOrEqual(3.0);
    // Dark ring (#38bdf8) against #0b0f19 and #111827
    expect(getContrastRatio("#38bdf8", "#0b0f19")).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio("#38bdf8", "#111827")).toBeGreaterThanOrEqual(3.0);
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
});
