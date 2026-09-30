import { promises as fs } from "node:fs";
import path from "node:path";

import { DEFAULT_RATIO } from "./ratio";

function jpegSize(buf: Buffer): [number, number] | null {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const length = buf.readUInt16BE(i + 2);
    // SOF0…SOF15, hors DHT (C4), JPG (C8) et DAC (CC) : l'en-tête qui porte la taille.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    }
    i += 2 + length;
  }
  return null;
}

function pngSize(buf: Buffer): [number, number] | null {
  if (buf.length < 24 || buf.toString("latin1", 1, 4) !== "PNG") return null;
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

/**
 * Rapport largeur / hauteur d'une image de `public/` (chemin « /artworks/… »),
 * lu dans l'en-tête du fichier au moment du build. Sert à réserver la bonne
 * place à chaque toile avant son chargement (aucun saut de mise en page).
 * URL externe, format non géré ou fichier absent : format portrait par défaut.
 */
export async function imageRatio(publicPath: string): Promise<number> {
  if (!publicPath.startsWith("/")) return DEFAULT_RATIO;
  try {
    const file = path.join(process.cwd(), "public", publicPath);
    const handle = await fs.open(file, "r");
    const buf = Buffer.alloc(256 * 1024);
    const { bytesRead } = await handle.read(buf, 0, buf.length, 0);
    await handle.close();
    const head = buf.subarray(0, bytesRead);
    const size = head[0] === 0xff && head[1] === 0xd8 ? jpegSize(head) : pngSize(head);
    if (!size || !size[0] || !size[1]) return DEFAULT_RATIO;
    return size[0] / size[1];
  } catch {
    return DEFAULT_RATIO;
  }
}
