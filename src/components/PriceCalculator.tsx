"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MIN_CM, formatEur, quoteCommission } from "@/lib/pricing";

/** Fiche officielle de cotation i-CAC de l'artiste. */
const I_CAC_URL = "https://www.i-cac.fr/artiste/drioton-david/cotation.html";

export function PriceCalculator() {
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(80);

  const quote = useMemo(() => quoteCommission(width, height), [width, height]);

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[var(--ink-soft)] px-3 py-2.5 text-center text-lg font-bold outline-none focus:border-[var(--magenta)]";

  const clamp = (v: number, set: (n: number) => void) => {
    set(Number.isFinite(v) ? Math.max(0, v) : 0);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="card-glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-black sm:text-3xl">
          Combien coûte une toile <span className="accent-text">sur mesure</span> ?
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Indiquez la taille de votre pièce : le prix est estimé en direct selon la
          cote officielle <span className="font-semibold text-white/80">i-CAC</span>{" "}
          de l'artiste.
        </p>

        <div className="mt-7 grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto_1.2fr]">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/50">
              Largeur (cm)
            </label>
            <input
              type="number"
              min={MIN_CM}
              step={1}
              value={width}
              onChange={(e) => clamp(Number(e.target.value), setWidth)}
              onBlur={() => setWidth((s) => Math.max(MIN_CM, Math.floor(s) || MIN_CM))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/50">
              Hauteur (cm)
            </label>
            <input
              type="number"
              min={MIN_CM}
              step={1}
              value={height}
              onChange={(e) => clamp(Number(e.target.value), setHeight)}
              onBlur={() => setHeight((s) => Math.max(MIN_CM, Math.floor(s) || MIN_CM))}
              className={inputCls}
            />
          </div>
          <span className="hidden pb-2 text-center text-2xl text-white/40 sm:block">×</span>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center sm:text-left">
            <p className="text-xs uppercase tracking-widest text-white/50">Estimation</p>
            <p className="accent-amber mt-1 text-3xl font-black">
              {formatEur(quote.priceEur)}
            </p>
            <p className="mt-1 text-xs text-white/50">
              {quote.areaCm2.toLocaleString("fr-FR")} cm² · format {quote.widthCm} ×{" "}
              {quote.heightCm} cm
            </p>
            <p className="mt-0.5 text-[11px] text-white/40">
              Repère i-CAC : {quote.refLabel} ≈ {formatEur(quote.refPriceEur)}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/40">
          Minimum réalisable à l'atelier : {MIN_CM} × {MIN_CM} cm.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/order?ref=&w=${quote.widthCm}&h=${quote.heightCm}`}
            className="btn-accent rounded-lg px-6 py-3 font-semibold"
          >
            Commander cette pièce
          </Link>
          <a
            href={I_CAC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
          >
            Voir la fiche de cotation i-CAC ↗
          </a>
        </div>
      </div>
    </div>
  );
}