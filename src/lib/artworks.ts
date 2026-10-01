import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { Artwork } from "./types";
import repoArtworks from "../../data/artworks.json";
import { imageRatio } from "./image-size";
import { readStoredArtworks } from "./server/store";

/**
 * Source de la galerie :
 * 1. la galerie enregistrée depuis l'atelier (Vercel Blob) ;
 * 2. à défaut, `data/artworks.json` du dépôt (toiles d'origine).
 *
 * Mise en cache sous l'étiquette « artworks » : l'atelier la vide à chaque
 * enregistrement, et les pages du site se régénèrent aussitôt.
 */
export const ARTWORKS_TAG = "artworks";

const loadList = unstable_cache(
  async (): Promise<Artwork[]> => (await readStoredArtworks().catch(() => null)) ?? (repoArtworks as Artwork[]),
  ["artworks-list"],
  { tags: [ARTWORKS_TAG] }
);

/** Vignette produite par scripts/make-thumbs.mjs, si elle existe pour cette image. */
async function thumbFor(image: string): Promise<string | undefined> {
  if (!image.startsWith("/artworks/")) return undefined;
  const thumb = `/artworks/wall/${path.parse(image).name}.webp`;
  try {
    await fs.access(path.join(process.cwd(), "public", thumb));
    return thumb;
  } catch {
    return undefined;
  }
}

/** Complète chaque toile : format (ratio) et vignette, s'ils ne sont pas déjà connus. */
export async function hang(list: Artwork[]): Promise<Artwork[]> {
  return Promise.all(
    list.map(async (a) => ({
      ...a,
      ratio: a.ratio ?? (await imageRatio(a.image)),
      thumb: a.thumb ?? a.medium ?? (await thumbFor(a.image)),
    }))
  );
}

export async function readArtworks(): Promise<Artwork[]> {
  return hang(await loadList());
}
