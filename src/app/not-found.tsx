import Link from "next/link";
import { BrushIcon } from "@/components/icons";

export const metadata = {
  title: "Page introuvable",
};

/** 404 maison : même style que le reste du site, avec les bons réflexes. */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <BrushIcon className="h-12 w-12 text-[var(--magenta)]" />
      <p className="accent-text display-1 mt-6">404</p>
      <h1 className="display-2 mt-2">Cette toile est hors cadre.</h1>
      <p className="mt-4 max-w-md leading-relaxed text-white/60">
        La page que vous cherchez n'existe pas (ou plus). Retournez à
        l'accueil pour retrouver les œuvres de l'atelier — ou passez directement
        à la galerie.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-accent rounded-lg px-6 py-3 font-semibold">
          Retour à l'accueil
        </Link>
        <Link
          href="/gallery"
          className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
        >
          Voir la galerie
        </Link>
      </div>
    </div>
  );
}
