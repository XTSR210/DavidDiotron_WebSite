import type { Artwork } from "./types";

/**
 * Client de l'API de l'atelier (src/app/api/atelier), hébergée sur Vercel avec
 * le site. La session est un cookie httpOnly : le navigateur ne garde ni le
 * mot de passe ni la session lisible par un script.
 */

export class SessionExpired extends Error {}

async function call<T>(method: "GET" | "POST" | "PUT", action: string, body?: unknown): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`/api/atelier/${action}/`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Connexion internet interrompue. Réessayez.");
  }
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) throw new SessionExpired(d.error || "Session expirée : reconnectez-vous.");
  if (r.status === 413) throw new Error("Photo trop lourde pour l'envoi.");
  if (!r.ok || !d.ok) throw new Error(d.error || `Erreur ${r.status}`);
  return d as T;
}

export const status = () => call<{ configured: boolean; signedIn: boolean; storage: boolean }>("GET", "status");
export const setup = (code: string, password: string) =>
  call<{ recoveryKey: string }>("POST", "setup", { code, password }).then((d) => d.recoveryKey);
export const login = (password: string) => call("POST", "login", { password });
export const logout = () => call("POST", "logout").catch(() => {});
export const reset = (recoveryKey: string, password: string) =>
  call<{ recoveryKey: string }>("POST", "reset", { recoveryKey, password }).then((d) => d.recoveryKey);
export const changePassword = (current: string, password: string) =>
  call<{ recoveryKey: string }>("POST", "password", { current, password }).then((d) => d.recoveryKey);

export const readGallery = () => call<{ artworks: Artwork[] }>("GET", "artworks").then((d) => d.artworks);
export const saveGallery = (artworks: Artwork[]) =>
  call<{ artworks: Artwork[] }>("PUT", "artworks", { artworks }).then((d) => d.artworks);
export const uploadPhoto = (name: string, full: string, medium: string) =>
  call<{ image: string; medium: string }>("POST", "upload", { name, full, medium });
