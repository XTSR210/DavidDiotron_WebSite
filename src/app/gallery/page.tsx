import { ArtCard } from "@/components/ArtCard";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { CtaBanner, Guarantees } from "@/components/commercial";
import { Reveal } from "@/components/Reveal";
import { readArtworks } from "@/lib/artworks";

export const metadata = {
  title: "Galerie",
  description: "Les œuvres de David Drioton, peintes à l'atelier de Barjols (Var).",
};

export default async function GalleryPage() {
  const artworks = await readArtworks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
      <header className="max-w-2xl">
        <Reveal>
          <p className="eyebrow">Les œuvres</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="display-1 mt-4">
            La <span className="accent-text">galerie</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 leading-relaxed text-white/60">
            {artworks.length}            œuvres peintes à la main à l'atelier de Barjols —
            collages d'affiches, éclats de couleur, personnages. Chaque pièce
            est unique : quand elle trouve sa maison, elle ne revient pas.
            Cliquez sur une toile pour l'admirer en grand, ou sur « Commander »
            pour l'acquérir et lancer une création sur mesure dans le même
            esprit.
          </p>
        </Reveal>
      </header>

      {/* Staggered wall + fullscreen lightbox */}
      <GalleryLightbox artworks={artworks}>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork, i) => (
            <div key={artwork.id} className={i % 3 === 1 ? "lg:mt-10" : ""}>
              <Reveal delay={Math.min((i % 3) * 0.07, 0.2)}>
                <ArtCard artwork={artwork} index={i} />
              </Reveal>
            </div>
          ))}
        </div>
      </GalleryLightbox>

      <Guarantees />
      <CtaBanner
        title="Une idée en tête ? David la peint pour vous."
        text="Choisissez une référence dans la galerie ou partez d'une page blanche — l'estimation s'affiche en direct, le devis est gratuit."
      />
    </div>
  );
}
