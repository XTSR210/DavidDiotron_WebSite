import { NextResponse } from "next/server";
import { readArtworks, writeArtworks } from "@/lib/artworks";
import { secretMatches } from "@/lib/admin";
import type { Artwork } from "@/lib/types";

function unauthorized() {
  return NextResponse.json({ error: "Secret atelier invalide." }, { status: 401 });
}

function numOrUndefined(value: unknown): number | undefined {
  return Number.isFinite(Number(value)) && value !== "" ? Number(value) : undefined;
}

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secretMatches(secret)) return unauthorized();
  const artworks = await readArtworks();
  return NextResponse.json({ artworks });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }
  if (!secretMatches(typeof body.secret === "string" ? (body.secret as string) : null)) {
    return unauthorized();
  }

  const str = (key: string): string => (typeof body[key] === "string" ? (body[key] as string).trim() : "");
  const title = str("title");
  const image = str("image");
  if (!title || !image) {
    return NextResponse.json({ error: "Titre et image requis." }, { status: 400 });
  }

  const artwork: Artwork = {
    id: `art-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    technique: str("technique") || undefined,
    image,
    source: str("source") || undefined,
    note: str("note") || undefined,
    year: Number.isFinite(Number(body.year)) && body.year !== "" ? Number(body.year) : undefined,
    widthCm: Number.isFinite(Number(body.widthCm)) && body.widthCm !== "" ? Number(body.widthCm) : undefined,
    heightCm: Number.isFinite(Number(body.heightCm)) && body.heightCm !== "" ? Number(body.heightCm) : undefined,
    priceEur: Number.isFinite(Number(body.priceEur)) && body.priceEur !== "" ? Number(body.priceEur) : undefined,
    priceOnRequest: body.priceOnRequest === true || str("priceOnRequest") === "true",
  };

  const artworks = await readArtworks();
  artworks.unshift(artwork);
  await writeArtworks(artworks);
  return NextResponse.json({ ok: true, artwork });
}

export async function PATCH(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }
  if (!secretMatches(typeof body.secret === "string" ? (body.secret as string) : null)) {
    return unauthorized();
  }

  const str = (key: string): string => (typeof body[key] === "string" ? (body[key] as string).trim() : "");
  const id = str("id");
  const title = str("title");
  const image = str("image");
  if (!id) {
    return NextResponse.json({ error: "id requis." }, { status: 400 });
  }
  if (!title || !image) {
    return NextResponse.json({ error: "Titre et image requis." }, { status: 400 });
  }

  const artworks = await readArtworks();
  const index = artworks.findIndex((a) => a.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Œuvre introuvable." }, { status: 404 });
  }

  const updated: Artwork = {
    ...artworks[index],
    title,
    image,
    technique: str("technique") || undefined,
    source: str("source") || undefined,
    note: str("note") || undefined,
    year: numOrUndefined(body.year),
    widthCm: numOrUndefined(body.widthCm),
    heightCm: numOrUndefined(body.heightCm),
    priceEur: numOrUndefined(body.priceEur),
    priceOnRequest: body.priceOnRequest === true || str("priceOnRequest") === "true",
  };

  artworks[index] = updated;
  await writeArtworks(artworks);
  return NextResponse.json({ ok: true, artwork: updated });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  if (!secretMatches(url.searchParams.get("secret"))) return unauthorized();
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });
  const artworks = await readArtworks();
  const next = artworks.filter((a) => a.id !== id);
  if (next.length === artworks.length) {
    return NextResponse.json({ error: "Œuvre introuvable." }, { status: 404 });
  }
  await writeArtworks(next);
  return NextResponse.json({ ok: true });
}
