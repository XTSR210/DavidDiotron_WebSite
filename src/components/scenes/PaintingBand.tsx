"use client";

import { useRef } from "react";
import type { Artwork } from "@/lib/types";
import { canvasSize } from "@/lib/ratio";
import { useScrollProgress } from "@/lib/use-scroll-progress";

const WORDS = ["Pop art", "Affiches déchirées", "Couleur jetée", "Collages", "Peint à la main"];

function Row({ items, className }: { items: Artwork[]; className: string }) {
  return (
    <div className={`band-row ${className}`}>
      {items.map((a, i) => (
        <picture key={`${a.id}-${i}`}>
          {a.thumb ? <source media="(max-width: 640px)" srcSet={a.thumb} type="image/webp" /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.image} alt="" {...canvasSize(a)} loading="lazy" decoding="async" draggable={false} />
        </picture>
      ))}
    </div>
  );
}

/**
 * Bande diagonale décorative : deux rangées de toiles et une ligne de mots
 * qui glissent en sens contraires pendant que la section traverse l'écran.
 */
export default function PaintingBand({ artworks }: { artworks: Artwork[] }) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, "pass");

  const n = artworks.length;
  const pick = (start: number, step: number) =>
    Array.from({ length: 12 }, (_, i) => artworks[(start + i * step) % n]);

  return (
    <section ref={ref} className="band" aria-hidden="true">
      <div className="band-tilt">
        <Row items={pick(2, 5)} className="band-row-a" />
        <p className="band-words poster">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </p>
        <Row items={pick(9, 7)} className="band-row-b" />
      </div>
    </section>
  );
}
