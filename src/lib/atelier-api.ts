import type { Artwork } from "./types";

/**
 * Client de la base de l'atelier (local-server.mjs, sur l'ordinateur de
 * l'artiste). Toutes les écritures passent par une session ouverte avec le
 * mot de passe ; le mot de passe lui-même n'est jamais gardé par le navigateur.
 */

export const ATELIER_URL = "http://localhost:3311";
const SESSION_KEY = "drioton-atelier-session";

export class SessionExpired extends Error {}

export type BaseState =
  | { kind: "checking" }
  | { kind: "off" }
  | { kind: "on"; configured: boolean };

/** La base répond-elle, et un mot de passe a-t-il déjà été créé ? */
export async function probeBase(): Promise<BaseState> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(`${ATELIER_URL}/health`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(timer);
    const d = await r.json();
    return d?.ok ? { kind: "on", configured: Boolean(d.configured) } : { kind: "off" };
  } catch {
    return { kind: "off" };
  }
}

export function savedSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function keepSession(token: string | null) {
  try {
    if (token) sessionStorage.setItem(SESSION_KEY, token);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* navigation privée : la session vit le temps de la page */
  }
}

async function call<T>(route: string, body: unknown, token?: string | null): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${ATELIER_URL}${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new Error("La base de l'atelier ne répond plus. Vérifiez qu'elle tourne toujours sur l'ordinateur.");
  }
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && token) {
    keepSession(null);
    throw new SessionExpired(d.error || "Session expirée : reconnectez-vous.");
  }
  if (!r.ok || !d.ok) throw new Error(d.error || `Erreur ${r.status}`);
  return d as T;
}

/** Ouvre une session (connexion, création ou réinitialisation) et la retient. */
async function open(route: string, body: unknown): Promise<string> {
  const { token } = await call<{ token: string }>(route, body);
  keepSession(token);
  return token;
}

export const login = (password: string) => open("/api/login", { password });
export const setup = (password: string) => open("/api/setup", { password });
export const finishReset = (code: string, password: string) =>
  open("/api/reset/finish", { code, password });
export const startReset = () => call("/api/reset/start", {});

export async function logout(token: string) {
  keepSession(null);
  await call("/api/logout", {}, token).catch(() => {});
}

export async function readArtworksPc(token: string): Promise<Artwork[]> {
  return (await call<{ artworks: Artwork[] }>("/api/read", {}, token)).artworks;
}

export async function saveArtworksPc(token: string, artworks: Artwork[], images: Record<string, string> = {}) {
  await call("/api/save", { artworks, images }, token);
}

export async function publishPc(token: string): Promise<string> {
  return (await call<{ message: string }>("/api/publish", {}, token)).message;
}
