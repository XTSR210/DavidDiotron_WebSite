import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Page introuvable",
};

/** 404 maison : même affiche que le reste du site, avec deux sorties. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="site-main">
        <section className="bloc bloc-jaune halftone flex min-h-[78svh] items-center py-20">
          <div className="wrap relative">
            <p className="poster t-hero" aria-hidden="true">
              404
            </p>
            <h1 className="poster t-lg mt-4">Cette toile est hors cadre.</h1>
            <p className="lead mt-5 max-w-xl">
              La page que vous cherchez n'existe pas, ou plus. Les toiles, elles, sont toujours au
              mur.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-4">
              <Link href="/gallery" className="btn">
                Voir la galerie
              </Link>
              <Link href="/" className="btn btn-ghost">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
