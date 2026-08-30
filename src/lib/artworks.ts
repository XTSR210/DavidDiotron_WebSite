import { promises as fs } from "node:fs";
import path from "node:path";
import type { Artwork } from "./types";
import { assetPath } from "./site";
import { seedArtworks } from "./seed-artworks";

/**
 * Single source of truth for the gallery: `data/artworks.json` in the project
 * root. Sur GitHub Pages (build statique), les chemins d'images sont préfixés
 * avec le basePath pour pointer au bon endroit ; en local, ils restent tels
 * quels.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "artworks.json");

export async function readArtworks(): Promise<Artwork[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : seedArtworks;
    return (list as Artwork[]).map((a) => ({ ...a, image: assetPath(a.image) }));
  } catch {
    return seedArtworks.map((a) => ({ ...a, image: assetPath(a.image) }));
  }
}

export async function writeArtworks(artworks: Artwork[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(artworks, null, 2)}\n`, "utf8");
}
