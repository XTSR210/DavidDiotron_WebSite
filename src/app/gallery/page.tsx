import { ArtCard } from "@/components/ArtCard";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CtaBanner, Guarantees } from "@/components/commercial";
import { readArtworks } from "@/lib/artworks";

export const metadata = {
  title: "Galerie",
  description: "Les œuvres de David Drioton, peintes à l'atelier de Barjols (Var).",
};

export default async function GalleryPage() {
  const artworks = await readArtworks();

  return (
    <>
      <PageHero title="La galerie">
        <p className="lead">
          {artworks.length} toiles peintes à la main à l'atelier de Barjols : collages d'affiches,
          éclats de couleur, personnages. Chaque pièce est unique ; quand elle trouve sa maison,
          elle ne revient pas.
        </p>
        <p className="soft">
          Touchez une toile pour la voir en grand. Chacune peut aussi servir de point de départ à
          une création sur mesure, à vos dimensions.
        </p>
      </PageHero>

      {/* Le mur : chaque toile à son vrai format, sur papier */}
      <Section tone="papier" torn={15}>
        <GalleryLightbox artworks={artworks}>
          <div className="mur">
            {artworks.map((artwork, i) => (
              <ArtCard key={artwork.id} artwork={artwork} index={i} />
            ))}
          </div>
        </GalleryLightbox>
      </Section>

      <Section tone="noir" torn={16}>
        <Guarantees />
      </Section>

      <CtaBanner
        title="Une idée en tête ? David la peint pour vous."
        text="Choisissez une toile de référence ou partez d'une page blanche. L'estimation s'affiche en direct, le devis est gratuit."
      />
    </>
  );
}
