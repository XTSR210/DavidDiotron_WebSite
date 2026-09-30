import type { ReactNode } from "react";

/**
 * Tête de page des pages intérieures : un grand titre d'affiche sur fond
 * noir, puis le texte d'introduction (et d'éventuelles actions) en `children`.
 * `aside` occupe la colonne de droite sur grand écran (portrait, visuel).
 */
export function PageHero({
  title,
  size = "xl",
  aside,
  children,
}: {
  title: ReactNode;
  size?: "xl" | "lg";
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bloc bloc-noir halftone pb-[clamp(3.5rem,8vw,6.5rem)] pt-[clamp(2.5rem,7vw,5.5rem)]">
      <div
        className={`wrap relative ${aside ? "grid grid-cols-1 items-end gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]" : ""}`}
      >
        <div>
          <h1 className={`poster ${size === "xl" ? "t-page" : "t-lg"}`}>{title}</h1>
          {children ? <div className="mt-7 max-w-2xl space-y-6">{children}</div> : null}
        </div>
        {aside}
      </div>
    </section>
  );
}
