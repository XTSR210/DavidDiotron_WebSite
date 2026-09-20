"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Artwork } from "@/lib/types";
import { WhatsAppIcon } from "@/components/icons";
import { waLink } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Contexte : n'importe quelle carte peut « ouvrir » la lightbox.      */
/* ------------------------------------------------------------------ */

const LightboxContext = createContext<{
  open: (index: number) => void;
} | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  return ctx ?? { open: () => {} };
}

/** Vue plein écran d'une œuvre : zoom, légende, navigation clavier. */
export function GalleryLightbox({
  artworks,
  children,
}: {
  artworks: Artwork[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback((i: number) => setIndex(i), []);
  const close = useCallback(() => setIndex(null), []);

  const prev = useCallback(
    () => setIndex((i) => (i === null ? null : (i - 1 + artworks.length) % artworks.length)),
    [artworks.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % artworks.length)),
    [artworks.length]
  );

  // Navigation clavier + verrouillage du scroll quand ouverte.
  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, close, prev, next]);

  const value = useMemo(() => ({ open }), [open]);
  const artwork = index === null ? null : artworks[index];

  return (
    <LightboxContext.Provider value={value}>
      {children}

      {artwork ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={artwork.title}
          className="fixed inset-0 z-[120] flex flex-col bg-[var(--ink)]/95 backdrop-blur-md"
          onClick={close}
        >
          {/* Barre haute : compteur + fermer */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/60">
            <span className="tabular-nums">
              {(index ?? 0) + 1} / {artworks.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-[var(--magenta)] hover:text-[var(--magenta)]"
            >
              Fermer ✕
            </button>
          </div>

          {/* Œuvre */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={artwork.id}
              src={artwork.image}
              alt={artwork.title}
              className="pop-in max-h-full max-w-full rounded-xl object-contain shadow-[0_32px_90px_rgba(0,0,0,0.7)]"
            />

            {/* Flèches (masquées sur petit écran) */}
            {artworks.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Œuvre précédente"
                  className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-xl text-white/80 transition hover:border-[var(--amber)] hover:text-[var(--amber)] sm:flex"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Œuvre suivante"
                  className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-xl text-white/80 transition hover:border-[var(--amber)] hover:text-[var(--amber)] sm:flex"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          {/* Légende */}
          <div className="px-4 pb-6 pt-4 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-bold">{artwork.title}</p>
            <p className="mt-1 text-xs text-white/50">
              {[
                artwork.technique,
                artwork.widthCm && artwork.heightCm
                  ? `L. ${artwork.widthCm} × H. ${artwork.heightCm} cm`
                  : undefined,
              ]
                .filter(Boolean)
                .join(" · ") || "Œuvre originale, peinte à la main"}
            </p>
            {artwork.sold ? (
              <p className="mt-2 inline-block rounded-md bg-[var(--magenta)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                Vendue — cette pièce a trouvé sa maison
              </p>
            ) : null}
            <a
              href={artwork.sold ? "/order" : `/order?ref=${artwork.id}`}
              className="btn-accent mt-4 inline-block rounded-lg px-5 py-2 text-sm font-bold"
            >
              Commander une pièce dans cet esprit
            </a>
            {artwork.priceEur && !artwork.priceOnRequest ? (
              <p className="mt-2 text-sm font-semibold accent-amber">
                Prix fixe : {artwork.priceEur.toLocaleString("fr-FR")} €
              </p>
            ) : null}
            <p className="mt-2">
              <a
                href={waLink(
                  `Bonjour David, je discute avec vous au sujet de « ${artwork.title} » (vue sur votre site).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--teal)] transition hover:underline"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                Discuter de cette œuvre directement avec David
              </a>
            </p>
            <p className="mt-2 text-[11px] text-white/40">
              Pièce unique peinte à la main · certificat d'authenticité · livraison
              protégée — ou création sur mesure à vos dimensions.
            </p>
            <p className="mt-1.5 text-[11px] text-white/35">
              Échap pour fermer · ← → pour naviguer
            </p>
          </div>
        </div>
      ) : null}
    </LightboxContext.Provider>
  );
}
