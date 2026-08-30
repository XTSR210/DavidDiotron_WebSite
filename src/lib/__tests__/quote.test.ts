import { describe, it, expect } from "vitest";
import { quoteCommission, formatEur, formatDimensions, MIN_CM } from "../quote";

describe("quoteCommission (grille i-CAC David DRIOTON)", () => {
  it("matches the i-CAC price at a standard format", () => {
    const q = quoteCommission(50, 65); // ≈ 50 × 65 cm → 1170 € selon i-CAC
    expect(q.areaCm2).toBe(3250);
    expect(q.priceEur).toBe(1170);
  });

  it("matches the i-CAC price at a carré format", () => {
    const q = quoteCommission(60, 60); // carré 60 × 60 → 1230 €
    expect(q.areaCm2).toBe(3600);
    expect(q.priceEur).toBe(1230);
  });

  it("clamps to the minimum paintable size (36 cm)", () => {
    const q = quoteCommission(1, 5);
    expect(q.widthCm).toBe(MIN_CM);
    expect(q.heightCm).toBe(MIN_CM);
    expect(q.areaCm2).toBe(1296);
    // 1 296 cm² situé entre le triple carré 60×20 (610 €) et le 33×46 (710 €)
    const t = (1296 - 1200) / (1503 - 1200);
    expect(q.priceEur).toBe(Math.round(610 + (710 - 610) * t)); // 642
  });

  it("exactly matches a carré format", () => {
    const q = quoteCommission(40, 40); // carré 40 × 40 → 730 €
    expect(q.areaCm2).toBe(1600);
    expect(q.priceEur).toBe(730);
    expect(q.refLabel).toBe("40 × 40 cm");
  });

  it("brackets a sur-mesure size between two i-CAC formats", () => {
    const q = quoteCommission(41, 40); // 1 640 cm², entre 40×40 (730 €) et 60×30 (830 €)
    expect(q.priceEur).toBeGreaterThan(730);
    expect(q.priceEur).toBeLessThan(830);
  });
});

describe("formatting", () => {
  it("formats euros with two decimals", () => {
    expect(formatEur(540)).toBe("540,00 €");
  });

  it("formats dimensions", () => {
    expect(formatDimensions(50, 60)).toBe("L. 50 × H. 60 cm");
  });
});