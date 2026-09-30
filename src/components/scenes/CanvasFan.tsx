"use client";

import { useRef } from "react";
import type { Artwork } from "@/lib/types";
import { canvasSize } from "@/lib/ratio";
import { useScrollProgress } from "@/lib/use-scroll-progress";

/** Position de chaque toile dans l'éventail, de gauche à droite. */
const SLOTS = [-2, -1, 0, 1, 2];

/**
 * L'éventail : cinq toiles empilées qui s'ouvrent quand la section entre à l'écran.
 * Décoratif. Sans script ou en mouvement réduit, l'éventail est déjà ouvert.
 */
export default function CanvasFan({ artworks }: { artworks: Artwork[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "pass");

  return (
    <div ref={ref} className="fan" aria-hidden="true">
      {SLOTS.map((slot, k) => {
        const a = artworks[k % artworks.length];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slot}
            src={a.image}
            alt=""
            {...canvasSize(a)}
            loading="lazy"
            decoding="async"
            draggable={false}
            // La toile du centre passe devant.
            style={{ "--i": slot, zIndex: 3 - Math.abs(slot) } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
