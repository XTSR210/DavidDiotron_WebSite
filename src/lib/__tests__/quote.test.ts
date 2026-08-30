import { describe, it, expect } from "vitest";
import { quoteCommission, formatEur, formatDimensions } from "../quote";

describe("quoteCommission", () => {
  it("prices by area in cm²", () => {
    const q = quoteCommission(50, 60);
    expect(q.areaCm2).toBe(3000);
    expect(q.priceEur).toBe(540);
  });

  it("rounds to cents", () => {
    const q = quoteCommission(37, 41);
    expect(q.areaCm2).toBe(1517);
    expect(q.priceEur).toBe(Math.round(1517 * 0.18 * 100) / 100);
  });

  it("clamps to minimum 1 cm", () => {
    const q = quoteCommission(0, -5);
    expect(q.widthCm).toBe(1);
    expect(q.heightCm).toBe(1);
    expect(q.areaCm2).toBe(1);
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
