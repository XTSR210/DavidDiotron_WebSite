/** Base studio rate per square centimetre, in euros. */
export const RATE_EUR_PER_CM2 = 0.18;

/** A priced commission request. */
export interface CommissionQuote {
  widthCm: number;
  heightCm: number;
  areaCm2: number;
  priceEur: number;
}

/** Price a commission from its painted area in cm². */
export function quoteCommission(widthCm: number, heightCm: number): CommissionQuote {
  const width = Math.max(1, Math.floor(widthCm));
  const height = Math.max(1, Math.floor(heightCm));
  const areaCm2 = width * height;
  const priceEur = Math.round(areaCm2 * RATE_EUR_PER_CM2 * 100) / 100;
  return { widthCm: width, heightCm: height, areaCm2, priceEur };
}

/** Format a euro amount the French way (1 234,56 €). */
export function formatEur(value: number): string {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Format dimensions as "L. 50 × H. 60 cm". */
export function formatDimensions(widthCm: number, heightCm: number): string {
  return `L. ${widthCm} × H. ${heightCm} cm`;
}
