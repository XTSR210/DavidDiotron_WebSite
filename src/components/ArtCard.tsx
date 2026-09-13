"use client";

import { useCallback, useState } from "react";
import type { Artwork } from "@/lib/types";
import { useTilt } from "@/components/useTilt";
import { useLightbox } from "@/components/GalleryLightbox";

/**
 * Gallery artwork card with 3D pointer tilt, painterly sheen sweep and a
 * slow image zoom. Clicking the image opens the fullscreen lightbox.
 * Server pages stay static — the interaction is client-side progressive
 * enhancement only.
 */
export function ArtCard({ artwork, index = 0 }: { artwork: Artwork; index?: number }) {
  const tilt = useTilt(6);
  const { open } = useLightbox();
  const [loaded, setLoaded] = useState(false);

  // Les images en cache déclenchent « load » avant l'hydratation : on
  // vérifie aussi `complete` au moment où le ref s'attache.
  const imgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

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
        <button
          type="button"
          onClick={() => open(index)}
          aria-label={`Agrandir « ${artwork.title} »`}
          className="relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={artwork.image}
            alt={artwork.title}
            loading={index < 3 ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            className={`img-fade h-full w-full object-cover ${loaded ? "img-loaded" : ""}`}
          />
          <div className="art-sheen" aria-hidden />
          {/* Zoom hint */}
          <span
            aria-hidden
            className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 opacity-0 transition group-hover:opacity-100"
          >
            Agrandir ⤢
          </span>
        </button>
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
