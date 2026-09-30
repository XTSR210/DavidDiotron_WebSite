"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Artwork } from "@/lib/types";
import { WhatsAppIcon } from "@/components/icons";
import { DEFAULT_RATIO } from "@/lib/ratio";
import { waLink } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Contexte : n'importe quelle carte peut « ouvrir » la visionneuse.   */
/* ------------------------------------------------------------------ */

const LightboxContext = createContext<{
  open: (index: number) => void;
} | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  return ctx ?? { open: () => {} };
}

/** Distance minimale (px) pour qu'un glissement du doigt change de toile. */
const SWIPE_PX = 48;

/** Vue plein écran d'une œuvre : légende, clavier, flèches et glissement du doigt. */
export function GalleryLightbox({
  artworks,
  children,
}: {
  artworks: Artwork[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const opener = useRef<Element | null>(null);

  const open = useCallback((i: number) => {
    opener.current = document.activeElement;
    setIndex(i);
  }, []);
  const close = useCallback(() => {
    setIndex(null);
    // Le focus revient sur la toile qui a ouvert la visionneuse.
    if (opener.current instanceof HTMLElement) opener.current.focus();
  }, []);

  const prev = useCallback(
    () => setIndex((i) => (i === null ? null : (i - 1 + artworks.length) % artworks.length)),
    [artworks.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % artworks.length)),
    [artworks.length]
  );

  const isOpen = index !== null;

  // Navigation clavier + verrouillage du défilement quand elle est ouverte.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, prev, next]);

  const value = useMemo(() => ({ open }), [open]);
  const artwork = index === null ? null : artworks[index];

  return (
    <LightboxContext.Provider value={value}>
      {children}

      {artwork ? (
        <div role="dialog" aria-modal="true" aria-label={artwork.title} className="lb bloc-noir">
          <div className="lb-bar">
            <span>
              {(index ?? 0) + 1} / {artworks.length}
            </span>
            <button ref={closeRef} type="button" onClick={close} className="btn btn-sm btn-ghost">
              Fermer
            </button>
          </div>

          <div
            className="lb-stage"
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (dx > SWIPE_PX) prev();
              else if (dx < -SWIPE_PX) next();
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={artwork.id}
              src={artwork.image}
              alt={artwork.title}
              className="lb-img"
              style={{ "--r": artwork.ratio ?? DEFAULT_RATIO } as React.CSSProperties}
            />

            {artworks.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Œuvre précédente"
                  className="lb-nav left-0"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Œuvre suivante"
                  className="lb-nav right-0"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          <div className="lb-info">
            <div>
              <p className="poster t-sm">{artwork.title}</p>
              <p className="soft small mt-1">
                {[
                  artwork.technique,
                  artwork.widthCm && artwork.heightCm
                    ? `${artwork.widthCm} × ${artwork.heightCm} cm`
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(", ") || "Œuvre originale, peinte à la main"}
                {artwork.sold ? (
                  <span className="dot-sold ml-3 text-[var(--fg)]">Vendue</span>
                ) : artwork.priceEur && !artwork.priceOnRequest ? (
                  <span className="ml-3 font-bold text-[var(--jaune)]">
                    {artwork.priceEur.toLocaleString("fr-FR")} €
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={waLink(
                  `Bonjour David, je vous écris au sujet de « ${artwork.title} », vue sur votre site.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost"
              >
                <WhatsAppIcon className="h-4 w-4" />
                En parler à David
              </a>
              <Link
                href={artwork.sold ? "/order" : { pathname: "/order", query: { ref: artwork.id } }}
                className="btn btn-sm"
              >
                {artwork.sold ? "Une toile dans cet esprit" : "Commander"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </LightboxContext.Provider>
  );
}
