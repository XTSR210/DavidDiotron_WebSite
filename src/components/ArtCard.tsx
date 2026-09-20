"use client";

import { useCallback, useState } from "react";
import type { Artwork } from "@/lib/types";
import { useTilt } from "@/components/useTilt";
import { useLightbox } from "@/components/GalleryLightbox";
import { WhatsAppIcon } from "@/components/icons";
import { waLink } from "@/lib/site";

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
          {/* Rarity badge — every piece is a one-off */}
          <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--amber)] backdrop-blur">
            Pièce unique
          </span>
          {/* Sold badge — proof of success, kept visible as a showcase */}
          {artwork.sold ? (
            <span className="absolute right-2 top-2 rounded-md bg-[var(--magenta)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(224,33,138,0.45)]">
              Vendue
            </span>
          ) : null}
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
          <div className="mt-3 flex items-center justify-between gap-2">
            {artwork.sold ? (
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--magenta)]">
                Trouvé sa maison
              </span>
            ) : artwork.priceEur && !artwork.priceOnRequest ? (
              <span className="text-sm">
                <span className="font-semibold accent-amber">
                  {artwork.priceEur.toLocaleString("fr-FR")} €
                </span>{" "}
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  prix fixe
                </span>
              </span>
            ) : (
              <span className="text-xs text-white/40">Sur devis — parlons-en</span>
            )}
            <div className="flex items-center gap-1.5">
              <a
                href={waLink(
                  `Bonjour David, je suis intéressé(e) par « ${artwork.title} » vue sur votre site. Quel est le prix fixe et le délai ?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                title="Discuter directement avec l'atelier sur WhatsApp"
                aria-label={`Discuter de « ${artwork.title} » sur WhatsApp`}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--teal)]/50 text-[var(--teal)] transition hover:bg-[var(--teal)]/10"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
              </a>
              {artwork.sold ? (
                <a
                  href="/order"
                  className="rounded-md border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white/80 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
                >
                  Similaire sur mesure
                </a>
              ) : (
                <a
                  href={`/order?ref=${artwork.id}`}
                  className="btn-accent rounded-md px-3.5 py-1.5 text-xs font-bold"
                >
                  Commander
                </a>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-white/40">
            Une seule pièce existe — ou une création sur mesure dans le même
            esprit, à la taille de votre choix. Devis ferme = tarif fixe.
          </p>
        </div>
      </div>
    </article>
  );
}
