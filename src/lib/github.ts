/**
 * Accès à GitHub depuis le navigateur via l'API Contents (sans serveur).
 * Utilisé par le panneau Atelier pour lire et modifier `data/artworks.json`
 * directement dans le dépôt : chaque écriture crée un commit qui déclenche
 * le redéploiement automatique du site.
 */

/** Dépôt cible par défaut. */
export const DEFAULT_REPO = "XTSR210/DavidDiotron_WebSite";

const API = "https://api.github.com";
const BRANCH = "main";

function headers(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/\s/g, ""));
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

/** Décode un contenu base64 GitHub en texte UTF-8. */
export function decodeText(base64: string): string {
  return new TextDecoder().decode(b64ToBytes(base64));
}

/** Récupère le contenu texte d'un fichier du dépôt, ou null s'il n'existe pas. */
export async function getFileText(
  token: string,
  repo: string,
  path: string
): Promise<{ text: string; sha: string } | null> {
  const res = await fetch(`${API}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
    headers: headers(token),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `GitHub ${res.status}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  return { text: decodeText(data.content), sha: data.sha };
}

/**
 * Crée ou met à jour un fichier du dépôt (commit sur main).
 * `content` est un base64 (voir toBase64 pour le texte, ou un fichier image).
 * Renvoie le nouveau SHA du fichier.
 */
export async function putFile(
  token: string,
  repo: string,
  path: string,
  contentBase64: string,
  message: string,
  sha?: string
): Promise<string | undefined> {
  const body: Record<string, unknown> = {
    message,
    content: contentBase64,
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${API}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { message?: string; content?: { sha?: string } };
  if (!res.ok || (data && (data as { message?: string }).message)) {
    throw new Error((data as { message?: string }).message || `GitHub ${res.status}`);
  }
  return data.content?.sha;
}

/** Encode une chaîne de texte en base64 UTF-8 (pour data/artworks.json). */
export function toBase64(text: string): string {
  return bytesToB64(new TextEncoder().encode(text));
}