import { promises as fs } from "node:fs";
import path from "node:path";
import type { Artwork } from "./types";
import { assetPath } from "./site";
import { seedArtworks } from "./seed-artworks";
import { imageRatio } from "./image-size";

/**
 * Single source of truth for the gallery: `data/artworks.json` in the project
 * root. Sur GitHub Pages (build statique), les chemins d'images sont préfixés
 * avec le basePath pour pointer au bon endroit ; en local, ils restent tels
 * quels. Chaque œuvre reçoit aussi son `ratio` (largeur / hauteur), lu dans
 * le fichier image au moment du build.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "artworks.json");

async function hang(list: Artwork[]): Promise<Artwork[]> {
  return Promise.all(
    list.map(async (a) => ({
      ...a,
      ratio: await imageRatio(a.image),
      image: assetPath(a.image),
    }))
  );
}

export async function readArtworks(): Promise<Artwork[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : seedArtworks;
    return hang(list as Artwork[]);
  } catch {
    return hang(seedArtworks);
  }
}

export async function writeArtworks(artworks: Artwork[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // `ratio` est recalculé à chaque build : on ne l'enregistre pas.
  const stored = artworks.map(({ ratio: _ratio, ...a }) => a);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
}
