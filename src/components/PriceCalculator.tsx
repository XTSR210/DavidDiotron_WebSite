"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { MIN_CM, formatEur, quoteCommission } from "@/lib/pricing";
import { WallPreview } from "@/components/WallPreview";

/** Fiche officielle de cotation i-CAC de l'artiste. */
const I_CAC_URL = "https://www.i-cac.fr/artiste/drioton-david/cotation.html";

/** Au-delà, la saisie au clavier reste possible (jusqu'à 3 m). */
const SLIDER_MAX = 200;
const MAX_CM = 300;

const PRESETS: [number, number][] = [
  [50, 50],
  [60, 80],
  [100, 100],
  [120, 80],
  [150, 100],
];

function Dimension({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const settle = () => onChange(Math.min(MAX_CM, Math.max(MIN_CM, Math.floor(value) || MIN_CM)));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="field-label mb-0">
          {label}
        </label>
        <span className="flex items-baseline gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            min={MIN_CM}
            max={MAX_CM}
            step={1}
            value={value || ""}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            onBlur={settle}
            aria-label={`${label} en centimètres`}
            className="field w-24 text-center font-bold tabular-nums"
          />
          <span className="soft small">cm</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="range mt-1"
        min={MIN_CM}
        max={SLIDER_MAX}
        step={1}
        value={Math.min(SLIDER_MAX, Math.max(MIN_CM, value))}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/**
 * Simulateur : le visiteur règle largeur et hauteur, voit la toile à l'échelle
 * sur un mur et lit l'estimation, calculée sur la grille i-CAC de l'artiste.
 */
export function PriceCalculator({ image }: { image?: string }) {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  const quote = useMemo(() => quoteCommission(width, height), [width, height]);

  const preview = (
    <>
      <WallPreview widthCm={quote.widthCm} heightCm={quote.heightCm} image={image} />
      <p className="faint small mt-3">
        Aperçu à l'échelle : canapé de 2 m, silhouette d'1,72 m. Minimum réalisable à
        l'atelier : {MIN_CM} × {MIN_CM} cm.
      </p>
    </>
  );

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <div>
        <h2 className="poster t-lg">Votre mur, votre format.</h2>
        <p className="lead soft mt-5 max-w-xl">
          Réglez la taille : la toile se met à l'échelle et le prix s'estime en direct, d'après
          la cote officielle i-CAC de l'artiste.
        </p>

        {/* Téléphone et tablette : l'aperçu reste au-dessus des réglages. */}
        <div className="mt-8 lg:hidden">{preview}</div>

        <div className="mt-8 flex flex-wrap gap-2">
          {PRESETS.map(([w, h]) => (
            <button
              key={`${w}x${h}`}
              type="button"
              className="chip"
              aria-pressed={quote.widthCm === w && quote.heightCm === h}
              onClick={() => {
                setWidth(w);
                setHeight(h);
              }}
            >
              {w} × {h}
            </button>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Dimension label="Largeur" value={width} onChange={setWidth} />
          <Dimension label="Hauteur" value={height} onChange={setHeight} />
        </div>

        <div className="mt-8 border-t-2 border-[var(--fg)] pt-5">
          <p className="soft small">Estimation pour {quote.widthCm} × {quote.heightCm} cm</p>
          <p className="poster price mt-1" aria-live="polite">
            {formatEur(quote.priceEur).replace(",00", "")}
          </p>
          <p className="soft small mt-2 max-w-md">
            Prix indicatif. Le devis ferme, gratuit, vous est envoyé sous 48 h ; il tient compte
            de la technique et de la livraison. Format i-CAC le plus proche : {quote.refLabel},{" "}
            {formatEur(quote.refPriceEur).replace(",00", "")}.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            href={{ pathname: "/order", query: { w: quote.widthCm, h: quote.heightCm } }}
            className="btn"
          >
            Demander mon devis
          </Link>
          <a href={I_CAC_URL} target="_blank" rel="noopener noreferrer" className="link small">
            Voir la cotation i-CAC
          </a>
        </div>
      </div>

      <div className="hidden lg:sticky lg:top-28 lg:block">{preview}</div>
    </div>
  );
}
