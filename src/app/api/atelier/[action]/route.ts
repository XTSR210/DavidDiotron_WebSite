import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type { Artwork } from "@/lib/types";
import { ARTWORKS_TAG, hang, readArtworks } from "@/lib/artworks";
import { change, closeSession, configured, isSignedIn, login, reset, setup } from "@/lib/server/auth";
import { hasStore, storeImage, writeStoredArtworks } from "@/lib/server/store";

/**
 * API de l'espace Atelier (fonctions Vercel).
 *   GET  status     → { configured, signedIn }
 *   POST setup      → première installation (code + mot de passe) → clé de secours
 *   POST login | logout | reset (clé de secours) | password (changement)
 *   GET  artworks   → la galerie (connecté)
 *   PUT  artworks   → enregistre la galerie et met le site à jour (connecté)
 *   POST upload     → enregistre une photo (connecté)
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ok = (data: object = {}) => NextResponse.json({ ok: true, ...data }, { headers: { "Cache-Control": "no-store" } });
const fail = (error: string, status = 400) =>
  NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });

/** Refuse les appels venant d'un autre site (le cookie est déjà SameSite=Strict). */
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return !origin || origin === new URL(req.url).origin;
}

type Params = { params: Promise<{ action: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { action } = await params;
  try {
    if (action === "status") {
      return ok({ configured: await configured(), signedIn: await isSignedIn(), storage: hasStore() });
    }
    if (action === "artworks") {
      if (!(await isSignedIn())) return fail("Session expirée : reconnectez-vous.", 401);
      return ok({ artworks: await readArtworks() });
    }
    return fail("Route inconnue.", 404);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Erreur du serveur.", 500);
  }
}

export async function POST(req: Request, { params }: Params) {
  const { action } = await params;
  if (!sameOrigin(req)) return fail("Origine non autorisée.", 403);
  try {
    const body = await req.json().catch(() => ({}));

    if (action === "setup") return ok({ recoveryKey: await setup(body.code, body.password) });
    if (action === "login") {
      await login(body.password);
      return ok();
    }
    if (action === "reset") return ok({ recoveryKey: await reset(body.recoveryKey, body.password) });
    if (action === "logout") {
      await closeSession();
      return ok();
    }

    if (!(await isSignedIn())) return fail("Session expirée : reconnectez-vous.", 401);

    if (action === "password") return ok({ recoveryKey: await change(body.current, body.password) });

    if (action === "upload") {
      const { name, full, medium } = body as { name?: string; full?: string; medium?: string };
      if (!name || !full || !medium) return fail("Photo incomplète.");
      const safe = name.replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "toile";
      const [image, mediumUrl] = await Promise.all([
        storeImage(`${safe}.jpg`, Buffer.from(full, "base64")),
        storeImage(`${safe}-600.jpg`, Buffer.from(medium, "base64")),
      ]);
      return ok({ image, medium: mediumUrl });
    }

    return fail("Route inconnue.", 404);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Erreur du serveur.", 400);
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { action } = await params;
  if (!sameOrigin(req)) return fail("Origine non autorisée.", 403);
  if (action !== "artworks") return fail("Route inconnue.", 404);
  if (!(await isSignedIn())) return fail("Session expirée : reconnectez-vous.", 401);
  try {
    const { artworks } = (await req.json()) as { artworks?: Artwork[] };
    if (!Array.isArray(artworks) || artworks.some((a) => !a?.id || !a?.title || !a?.image)) {
      return fail("Liste de toiles invalide.");
    }
    // On garde le format et la vignette de chaque toile : le site n'a plus à les recalculer.
    const list = await hang(artworks);
    await writeStoredArtworks(list);
    revalidateTag(ARTWORKS_TAG);
    revalidatePath("/", "layout");
    return ok({ artworks: list });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Enregistrement impossible.", 500);
  }
}
