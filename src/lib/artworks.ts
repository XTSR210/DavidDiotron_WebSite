import { promises as fs } from "node:fs";
import path from "node:path";
import type { Artwork } from "./types";
import { seedArtworks } from "./seed-artworks";
import { imageRatio } from "./image-size";

/**
 * Single source of truth for the gallery: `data/artworks.json` in the project
 * root. Chaque œuvre reçoit aussi son `ratio` (largeur / hauteur), lu dans
 * le fichier image au moment du build, et sa vignette quand elle existe.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "artworks.json");

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

async function hang(list: Artwork[]): Promise<Artwork[]> {
  return Promise.all(
    list.map(async (a) => ({
      ...a,
      ratio: await imageRatio(a.image),
      thumb: await thumbFor(a.image),
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
  // `ratio` et `thumb` sont recalculés à chaque build : on ne les enregistre pas.
  const stored = artworks.map(({ ratio: _ratio, thumb: _thumb, ...a }) => a);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
}
