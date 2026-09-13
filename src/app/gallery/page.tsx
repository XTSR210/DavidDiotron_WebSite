import { ArtCard } from "@/components/ArtCard";
import { Reveal } from "@/components/Reveal";
import { readArtworks } from "@/lib/artworks";

export const metadata = {
  title: "Galerie — David Drioton",
  description: "Les œuvres de David Drioton, peintes à l'atelier de Barjols (Var).",
};

export default async function GalleryPage() {
  const artworks = await readArtworks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Reveal>
        <h1 className="text-3xl font-black">
          La <span className="accent-text">galerie</span>
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-2 text-white/60">
          {artworks.length} œuvres peintes à la main à l'atelier de Barjols.
        </p>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((artwork, i) => (
          <Reveal key={artwork.id} delay={Math.min(i * 0.05, 0.45)}>
            <ArtCard artwork={artwork} index={i} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
