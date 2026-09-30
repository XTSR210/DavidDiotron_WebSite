/**
 * Vignettes légères des toiles pour les scènes de l'accueil sur téléphone.
 *
 * Pour chaque image de public/artworks/, écrit public/artworks/wall/<nom>.webp
 * (280 px de large). Lancé automatiquement avant `npm run dev` et
 * `npm run build` : une toile ajoutée depuis /admin reçoit donc sa vignette au
 * déploiement suivant. Si `sharp` est absent, le script ne fait rien et le
 * site utilise les images d'origine.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "artworks");
const OUT = path.join(SRC, "wall");
const WIDTH = 280;
const QUALITY = 66;

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.log("[vignettes] sharp absent : étape ignorée, images d'origine utilisées.");
  process.exit(0);
}

await fs.mkdir(OUT, { recursive: true });
let made = 0;
for (const name of await fs.readdir(SRC)) {
  if (!/\.(jpe?g|png|webp|avif)$/i.test(name)) continue;
  const from = path.join(SRC, name);
  const to = path.join(OUT, `${path.parse(name).name}.webp`);
  const [a, b] = await Promise.all([fs.stat(from), fs.stat(to).catch(() => null)]);
  if (b && b.mtimeMs >= a.mtimeMs) continue;
  try {
    await sharp(from).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(to);
    made++;
  } catch (e) {
    console.warn(`[vignettes] ${name} ignorée : ${e.message}`);
  }
}
console.log(`[vignettes] ${made} vignette(s) créée(s).`);
