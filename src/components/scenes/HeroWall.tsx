"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Artwork } from "@/lib/types";
import { canvasSize } from "@/lib/ratio";
import { useScrollProgress } from "@/lib/use-scroll-progress";

const COLUMNS = 7;
const PER_COLUMN = 6;
/** Durée d'une boucle par colonne (s) : jamais deux voisines à la même vitesse. */
const DURATIONS = [58, 44, 66, 50, 72, 46, 62];

/**
 * Le mur : sept colonnes de toiles qui défilent sans fin, en sens alternés.
 * Couché et incliné à l'ouverture, le mur se redresse face au visiteur quand
 * il fait défiler la page, puis laisse place à l'entrée de la galerie.
 * Le script n'écrit que la progression (--p) ; tout le mouvement est en CSS.
 * Sans JavaScript ou en mouvement réduit : mur fixe, titre lisible.
 */
export default function HeroWall({ artworks }: { artworks: Artwork[] }) {
  const ref = useRef<HTMLElement>(null);

  useScrollProgress(ref, "pin", (p) => {
    // À la fin de la scène, les boutons du titre (devenus invisibles) cèdent le clic.
    ref.current?.classList.toggle("is-end", p > 0.5);
  });

  const n = artworks.length;
  const columns = Array.from({ length: COLUMNS }, (_, c) =>
    Array.from({ length: PER_COLUMN }, (_, k) => artworks[(c * 5 + k * 7) % n])
  );

  return (
    <section ref={ref} className="hw" aria-labelledby="hw-title">
      <div className="hw-pin">
        <div className="hw-stage" aria-hidden="true">
          <div className="hw-plane">
            {columns.map((col, c) => (
              <div key={c} className="hw-col">
                <div className="hw-track" style={{ "--dur": `${DURATIONS[c]}s` } as React.CSSProperties}>
                  {/* Liste doublée : la boucle repart sans couture à mi-hauteur. */}
                  {[...col, ...col].map((a, i) => (
                    <picture key={`${a.id}-${i}`}>
                      {/* Téléphone : vignette légère, suffisante pour des colonnes étroites. */}
                      {a.thumb ? <source media="(max-width: 640px)" srcSet={a.thumb} type="image/webp" /> : null}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.medium ?? a.image}
                        alt=""
                        {...canvasSize(a)}
                        // Chargement immédiat : le différé se déclenche mal sur un plan en 3D.
                        loading="eager"
                        // Les premières toiles visibles passent avant le reste de la page.
                        fetchPriority={i < 2 && c < 5 ? "high" : "auto"}
                        decoding="async"
                        draggable={false}
                      />
                    </picture>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hw-veil" aria-hidden="true" />

        <div className="hw-copy">
          <h1 id="hw-title" className="poster t-hero hw-title">
            <span>David</span>
            <span>Drioton</span>
          </h1>
          <p className="hw-sub">
            Pop art peint à la main, affiches déchirées et couleur jetée. Des toiles uniques,
            nées à l'atelier de Barjols, en Provence.
          </p>
          <div className="hw-actions">
            <Link href="/gallery" className="btn">
              Voir les toiles
            </Link>
            <Link href="/order" className="btn btn-ghost">
              Commander une toile
            </Link>
          </div>
        </div>

        <div className="hw-end">
          <p className="poster t-md">
            {n} toiles. Une seule de chaque.
          </p>
          <Link href="/gallery" className="btn btn-sm">
            Entrer dans la galerie
          </Link>
        </div>

        <p className="hw-cue" aria-hidden="true">
          Faites défiler <i />
        </p>
      </div>
    </section>
  );
}
