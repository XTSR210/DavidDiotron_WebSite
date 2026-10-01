import "server-only";
import crypto from "node:crypto";
import { get, put } from "@vercel/blob";
import type { Artwork } from "@/lib/types";

/**
 * Stockage de l'atelier sur Vercel Blob (magasin « david-drioton-atelier »).
 *
 * - atelier/artworks.json : la galerie (contenu public, comme le site).
 * - atelier/auth.json     : empreinte du mot de passe et de la clé de secours,
 *                           CHIFFRÉE (AES-256-GCM, clé tirée de ATELIER_SECRET),
 *                           car le magasin est public.
 * - toiles/…              : photos envoyées depuis l'atelier.
 *
 * Sans BLOB_READ_WRITE_TOKEN (build local), la galerie retombe sur
 * data/artworks.json du dépôt.
 */

// Préfixe modifiable uniquement pour tester sans toucher aux vraies données.
const PREFIX = process.env.ATELIER_STORE_PREFIX || "atelier";
const ARTWORKS = `${PREFIX}/artworks.json`;
const AUTH = `${PREFIX}/auth.json`;

export const hasStore = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readText(pathname: string): Promise<string | null> {
  if (!hasStore()) return null;
  const blob = await get(pathname, { access: "public", useCache: false }).catch(() => null);
  if (!blob || blob.statusCode !== 200 || !blob.stream) return null;
  return await new Response(blob.stream).text();
}

async function writeText(pathname: string, text: string) {
  await put(pathname, text, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });
}

/* ---------------------------------------------------------- galerie ---- */

export async function readStoredArtworks(): Promise<Artwork[] | null> {
  const text = await readText(ARTWORKS);
  if (!text) return null;
  const list = JSON.parse(text);
  return Array.isArray(list) ? (list as Artwork[]) : null;
}

export async function writeStoredArtworks(list: Artwork[]) {
  await writeText(ARTWORKS, `${JSON.stringify(list, null, 2)}\n`);
}

/** Enregistre une photo et renvoie son adresse publique. */
export async function storeImage(name: string, data: Buffer): Promise<string> {
  const blob = await put(`${PREFIX === "atelier" ? "toiles" : `${PREFIX}/toiles`}/${name}`, data, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/jpeg",
    cacheControlMaxAge: 31536000,
  });
  return blob.url;
}

/* ------------------------------------------------- connexion (chiffrée) ---- */

export interface AuthRecord {
  /** Empreinte scrypt du mot de passe. */
  password: { salt: string; hash: string };
  /** Empreinte scrypt de la clé de secours (mot de passe oublié). */
  recovery: { salt: string; hash: string };
  /** Change à chaque nouveau mot de passe : invalide les anciennes sessions. */
  version: string;
}

function key(): Buffer {
  const secret = process.env.ATELIER_SECRET;
  if (!secret) throw new Error("ATELIER_SECRET manquant dans la configuration Vercel.");
  return crypto.createHash("sha256").update(`atelier-auth:${secret}`).digest();
}

export async function readAuth(): Promise<AuthRecord | null> {
  const text = await readText(AUTH);
  if (!text) return null;
  const { iv, tag, data } = JSON.parse(text) as { iv: string; tag: string; data: string };
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  const plain = Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]);
  return JSON.parse(plain.toString("utf8")) as AuthRecord;
}

export async function writeAuth(record: AuthRecord) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(record), "utf8"), cipher.final()]);
  await writeText(
    AUTH,
    JSON.stringify({
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      data: data.toString("base64"),
    })
  );
}
