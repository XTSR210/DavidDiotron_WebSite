import type { Artwork } from "./types";

/** Format retenu quand les dimensions d'une image sont illisibles (toile portrait 2:3). */
export const DEFAULT_RATIO = 2 / 3;

/**
 * Attributs width / height d'une toile affichée à `width` px : le navigateur
 * réserve ainsi la bonne place avant le chargement (aucun saut de page).
 */
export function canvasSize(artwork: Artwork, width = 400): { width: number; height: number } {
  return { width, height: Math.round(width / (artwork.ratio ?? DEFAULT_RATIO)) };
}
