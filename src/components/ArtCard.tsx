"use client";

import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { canvasSize } from "@/lib/ratio";
import { useLightbox } from "@/components/GalleryLightbox";

/** Technique, dimensions et année, comme sur un cartel de galerie. */
export function cartelMeta(a: Artwork): string {
  return [
    a.technique,
    a.widthCm && a.heightCm ? `${a.widthCm} × ${a.heightCm} cm` : undefined,
    a.year ? String(a.year) : undefined,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Une toile sur le mur de la galerie : l'image à son vrai format, son cartel,
 * et le chemin vers la commande. Cliquer la toile l'ouvre en grand.
 */
export function ArtCard({ artwork, index = 0 }: { artwork: Artwork; index?: number }) {
  const { open } = useLightbox();
  const priced = artwork.priceEur && !artwork.priceOnRequest;

  return (
    <article className="oeuvre">
      <button
        type="button"
        onClick={() => open(index)}
        aria-label={`Agrandir « ${artwork.title} »`}
        className="oeuvre-open"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="oeuvre-img"
          src={artwork.image}
          alt={artwork.title}
          {...canvasSize(artwork)}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
        />
      </button>

      <div className="cartel max-w-none">
        <h2 className="cartel-title">{artwork.title}</h2>
        <p className="soft">{cartelMeta(artwork) || "Pièce unique, peinte à la main"}</p>
        <div className="oeuvre-actions">
          {artwork.sold ? (
            <span className="dot-sold">Vendue</span>
          ) : (
            <span className="font-bold">
              {priced ? `${artwork.priceEur!.toLocaleString("fr-FR")} €` : "Sur devis"}
            </span>
          )}
          <Link
            href={artwork.sold ? "/order" : { pathname: "/order", query: { ref: artwork.id } }}
            className="link"
          >
            {artwork.sold ? "Une toile dans cet esprit" : "Commander"}
          </Link>
        </div>
      </div>
    </article>
  );
}
