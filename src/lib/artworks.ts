import { promises as fs } from "node:fs";
import path from "node:path";
import type { Artwork } from "./types";
import { seedArtworks } from "./seed-artworks";

/**
 * Single source of truth for the gallery: `data/artworks.json` in the project
 * root. The admin API rewrites this file when David adds works; reads fall
 * back to the bundled seed list when the file does not exist yet.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "artworks.json");

export async function readArtworks(): Promise<Artwork[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? (parsed as Artwork[])
      : seedArtworks;
  } catch {
    return seedArtworks;
  }
}

export async function writeArtworks(artworks: Artwork[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(artworks, null, 2)}\n`, "utf8");
}
