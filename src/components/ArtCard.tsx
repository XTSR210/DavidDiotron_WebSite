"use client";

import type { Artwork } from "@/lib/types";
import { useTilt } from "@/components/useTilt";

/**
 * Gallery artwork card with 3D pointer tilt, painterly sheen sweep and a
 * slow image zoom. Server pages stay static — the interaction is client-side
 * progressive enhancement only.
 */
export function ArtCard({ artwork, index = 0 }: { artwork: Artwork; index?: number }) {
  const tilt = useTilt(6);

  return (
    <article
      className="pop-in"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.7)}s` }}
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="art-tilt card-glass group overflow-hidden rounded-2xl"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artwork.image}
            alt={artwork.title}
            loading={index < 3 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
          <div className="art-sheen" aria-hidden />
        </div>
        <div className="p-4">
          <h2 className="font-bold">{artwork.title}</h2>
          <p className="mt-1 text-xs text-white/50">
            {[
              artwork.technique,
              artwork.widthCm && artwork.heightCm
                ? `L. ${artwork.widthCm} × H. ${artwork.heightCm} cm`
                : undefined,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {artwork.note ? <p className="mt-2 text-sm text-white/70">{artwork.note}</p> : null}
          <div className="mt-3 flex items-center justify-between">
            {artwork.priceEur && !artwork.priceOnRequest ? (
              <span className="font-semibold accent-amber">
                {artwork.priceEur.toLocaleString("fr-FR")} €
              </span>
            ) : (
              <span className="text-xs text-white/40">Prix sur demande</span>
            )}
            <a
              href={`/order?ref=${artwork.id}`}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--magenta)] hover:text-[var(--magenta)]"
            >
              Commander
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
