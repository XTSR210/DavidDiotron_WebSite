import type { ReactNode } from "react";
import { TornEdge } from "@/components/TornEdge";

export type Tone = "noir" | "papier" | "jaune" | "magenta" | "cyan";

/**
 * Bloc de page : un aplat de couleur pleine largeur. `torn` pose un bord de
 * papier déchiré au-dessus du bloc (le numéro fait varier le tracé) ; à
 * utiliser quand la couleur change par rapport au bloc précédent.
 */
export function Section({
  tone = "noir",
  torn,
  halftone = false,
  wide = true,
  className = "",
  id,
  children,
}: {
  tone?: Tone;
  torn?: number;
  halftone?: boolean;
  /** false : colonne de lecture étroite. */
  wide?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`bloc bloc-${tone} bloc-pad ${halftone ? "halftone" : ""} ${className}`}>
      {torn ? <TornEdge seed={torn} /> : null}
      <div className={`relative ${wide ? "wrap" : "wrap-text"}`}>{children}</div>
    </section>
  );
}
