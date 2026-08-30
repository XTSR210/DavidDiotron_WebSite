import type { Artwork } from "./types";

/**
 * Tarification des commandes sur mesure basée sur la cotation officielle
 * i-CAC (Indice de Cotation des Artistes Certifiés) de David DRIOTON.
 *
 * Source : https://www.i-cac.fr/artiste/drioton-david/cotation.html
 * La valeur d'un format (estimation moyenne) est celle de la grille i-CAC.
 * Pour un format « sur mesure », on interpole linéairement par surface entre
 * les deux formats i-CAC encadrants : le prix colle donc exactement à la cote
 * i-CAC sur chaque format standard, et varie en douceur entre eux.
 */

/** Minimum side length (cm) — the smallest canvas made at the atelier. */
export const MIN_CM = 36;

/** Prix d'une œuvre existante, ou null si sur demande. */
export function artworkPrice(artwork: Artwork): number | null {
  return artwork.priceOnRequest ? null : (artwork.priceEur ?? null);
}

/* ------------------------------------------------------------------ */
/* Grille i-CAC David DRIOTON : (surface cm², prix €, libellé).        */
/* Les points standards regroupent Marine/Paysage/Figure (surface =     */
/* moyenne des trois orientations). Les carrés / doubles / triples      */
/* sont listés tels quels.                                              */
/* ------------------------------------------------------------------ */
interface CacEntry {
  /** Surface en cm². */
  area: number;
  /** Prix d'estimation i-CAC en euros. */
  price: number;
  /** Libellé du format (ex. « 50 × 65 cm »). */
  label: string;
}

const CAC: CacEntry[] = [
  // Formats standards (est. moyenne, surface moyenne des 3 orientations)
  { area: 216, price: 180, label: "12 × 18 cm" },
  { area: 308, price: 230, label: "14 × 22 cm" },
  { area: 392, price: 280, label: "16 × 24 cm" },
  { area: 513, price: 350, label: "19 × 27 cm" },
  { area: 715, price: 420, label: "22 × 33 cm" },
  { area: 852, price: 460, label: "24 × 35 cm" },
  { area: 1148, price: 600, label: "27 × 41 cm" },
  { area: 1503, price: 710, label: "33 × 46 cm" },
  { area: 2145, price: 890, label: "38 × 55 cm" },
  { area: 2725, price: 1040, label: "46 × 61 cm" },
  { area: 3250, price: 1170, label: "50 × 65 cm" },
  { area: 3991, price: 1340, label: "54 × 73 cm" },
  { area: 4833, price: 1580, label: "60 × 81 cm" },
  { area: 6072, price: 1960, label: "65 × 92 cm" },
  { area: 7300, price: 2290, label: "73 × 100 cm" },
  { area: 9396, price: 2910, label: "81 × 116 cm" },
  { area: 11570, price: 3540, label: "89 × 130 cm" },
  { area: 14582, price: 4360, label: "97 × 146 cm" },
  { area: 18414, price: 5330, label: "114 × 162 cm" },
  { area: 22165, price: 6340, label: "114 × 195 cm" },
  // Carrés
  { area: 400, price: 290, label: "20 × 20 cm" },
  { area: 900, price: 470, label: "30 × 30 cm" },
  { area: 1600, price: 730, label: "40 × 40 cm" },
  { area: 2500, price: 950, label: "50 × 50 cm" },
  { area: 3600, price: 1230, label: "60 × 60 cm" },
  { area: 4900, price: 1510, label: "70 × 70 cm" },
  { area: 6400, price: 2020, label: "80 × 80 cm" },
  { area: 8100, price: 2430, label: "90 × 90 cm" },
  { area: 10000, price: 3020, label: "100 × 100 cm" },
  { area: 14400, price: 4050, label: "120 × 120 cm" },
  { area: 22500, price: 5780, label: "150 × 150 cm" },
  { area: 40000, price: 9220, label: "200 × 200 cm" },
  // Doubles carrés
  { area: 800, price: 430, label: "40 × 20 cm" },
  { area: 1800, price: 830, label: "60 × 30 cm" },
  { area: 3200, price: 1160, label: "80 × 40 cm" },
  { area: 5000, price: 1530, label: "100 × 50 cm" },
  { area: 7200, price: 2160, label: "120 × 60 cm" },
  // Triples carrés
  { area: 1200, price: 610, label: "60 × 20 cm" },
  { area: 2700, price: 1070, label: "90 × 30 cm" },
  { area: 4800, price: 1580, label: "120 × 40 cm" },
  { area: 7500, price: 2210, label: "150 × 50 cm" },
].sort((a, b) => a.area - b.area);

/** Interpolation linéaire entre deux points. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** A priced commission request. */
export interface CommissionQuote {
  widthCm: number;
  heightCm: number;
  areaCm2: number;
  priceEur: number;
  /** Format i-CAC le plus proche, pour affichage. */
  refLabel: string;
  /** Prix i-CAC exact du format de référence. */
  refPriceEur: number;
}

/** Price a commission from its painted area in cm², per the i-CAC grid. */
export function quoteCommission(widthCm: number, heightCm: number): CommissionQuote {
  const width = Math.max(MIN_CM, Math.floor(widthCm));
  const height = Math.max(MIN_CM, Math.floor(heightCm));
  const area = width * height;

  const first = CAC[0];
  const last = CAC[CAC.length - 1];

  // Format i-CAC encadrant (le plus proche) pour l'affichage.
  const nearest = CAC.reduce((best, e) =>
    Math.abs(e.area - area) < Math.abs(best.area - area) ? e : best
  );

  let priceEur: number;
  if (area <= first.area) {
    priceEur = first.price;
  } else if (area >= last.area) {
    // Extrapolation linéaire au-delà du plus grand format i-CAC.
    const a = CAC[CAC.length - 2];
    const t = (area - a.area) / (last.area - a.area);
    priceEur = lerp(a.price, last.price, t);
  } else {
    let i = 1;
    while (CAC[i].area < area) i++;
    const lo = CAC[i - 1];
    const hi = CAC[i];
    const t = (area - lo.area) / (hi.area - lo.area);
    priceEur = lerp(lo.price, hi.price, t);
  }

  return {
    widthCm: width,
    heightCm: height,
    areaCm2: area,
    priceEur: Math.round(priceEur),
    refLabel: nearest.label,
    refPriceEur: nearest.price,
  };
}

/** Format a euro amount the French way (1 234,56 €). */
export function formatEur(value: number): string {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Format dimensions as "L. 50 × H. 60 cm". */
export function formatDimensions(widthCm: number, heightCm: number): string {
  return `L. ${widthCm} × H. ${heightCm} cm`;
}