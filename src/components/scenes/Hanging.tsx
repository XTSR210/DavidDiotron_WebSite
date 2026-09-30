"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Artwork } from "@/lib/types";
import { canvasSize } from "@/lib/ratio";
import { MOTION_OK, useScrollProgress } from "@/lib/use-scroll-progress";

/** L'épinglage demande de la place, une souris et l'accord du visiteur pour le mouvement. */
const PIN_OK = `(min-width: 900px) and (min-height: 560px) and (hover: hover) and ${MOTION_OK}`;

function cartelMeta(a: Artwork): string {
  return [
    a.technique,
    a.widthCm && a.heightCm ? `${a.widthCm} × ${a.heightCm} cm` : undefined,
    a.year ? String(a.year) : undefined,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * L'accrochage : une cimaise de toiles suspendues, avec leur cartel.
 * Au doigt (téléphone, tablette), la rangée se fait glisser. Sur ordinateur,
 * la scène s'épingle et le défilement vertical fait avancer la cimaise.
 */
export default function Hanging({ artworks, total }: { artworks: Artwork[]; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useScrollProgress(ref, "pin");

  useEffect(() => {
    const el = ref.current;
    const view = viewRef.current;
    const track = trackRef.current;
    if (!el || !view || !track) return;

    const pinOk = window.matchMedia(PIN_OK);
    const layout = () => {
      const travel = track.scrollWidth - view.clientWidth;
      const pinned = pinOk.matches && travel > 0;
      el.classList.toggle("is-pinned", pinned);
      if (pinned) {
        view.scrollLeft = 0;
        el.style.setProperty("--travel", `${travel}px`);
      } else {
        el.style.removeProperty("--travel");
      }
    };

    layout();
    // Les images fixent la largeur de la cimaise : on remesure à leur arrivée.
    const observer = new ResizeObserver(layout);
    observer.observe(track);
    window.addEventListener("resize", layout);
    pinOk.addEventListener("change", layout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", layout);
      pinOk.removeEventListener("change", layout);
    };
  }, []);

  return (
    <section ref={ref} className="hang bloc bloc-noir" aria-labelledby="hang-title">
      <div className="hang-pin">
        <div className="hang-head">
          <h2 id="hang-title" className="poster t-lg">
            L'accrochage du moment
          </h2>
          <Link href="/gallery" className="link">
            Voir les {total} toiles
          </Link>
        </div>

        <div ref={viewRef} className="hang-view">
          <ul ref={trackRef} className="hang-track">
            {artworks.map((a) => (
              <li key={a.id} className="hang-item">
                <Link
                  href={{ pathname: "/order", query: { ref: a.id } }}
                  className="hang-link"
                  aria-label={`Commander une toile dans l'esprit de « ${a.title} »`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="hang-canvas"
                    src={a.image}
                    alt={a.title}
                    {...canvasSize(a)}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </Link>
                <p className="cartel">
                  <span className="cartel-title">{a.title}</span>
                  <span className="soft">{cartelMeta(a) || "Pièce unique, peinte à la main"}</span>
                </p>
              </li>
            ))}
            <li className="hang-last">
              <p className="poster t-md">Et {Math.max(0, total - artworks.length)} autres toiles sur le mur de la galerie.</p>
              <div>
                <Link href="/gallery" className="btn">
                  Entrer dans la galerie
                </Link>
              </div>
            </li>
          </ul>
        </div>

        <p className="hang-hint small faint">Faites glisser la rangée pour voir la suite.</p>
        <div className="hang-meter" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
