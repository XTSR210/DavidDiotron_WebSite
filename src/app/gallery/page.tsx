import { readArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galerie — David Drioton",
  description: "Les œuvres de David Drioton, peintes à l'atelier de Barjols (Var).",
};

export default async function GalleryPage() {
  const artworks = await readArtworks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black">
        La <span className="accent-text">galerie</span>
      </h1>
      <p className="mt-2 text-white/60">
        {artworks.length} œuvres peintes à la main à l'atelier de Barjols.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((artwork, i) => (
          <article
            key={artwork.id}
            className="pop-in card-glass group overflow-hidden rounded-2xl"
            style={{ animationDelay: `${Math.min(i * 0.05, 0.6)}s` }}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artwork.image}
                alt={artwork.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="p-4">
              <h2 className="font-bold">{artwork.title}</h2>
              <p className="mt-1 text-xs text-white/50">
                {[
                  artwork.technique,
                  artwork.widthCm && artwork.heightCm
                    ? `L. ${artwork.widthCm} × H. ${artwork.heightCm} cm`
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {artwork.note ? (
                <p className="mt-2 text-sm text-white/70">{artwork.note}</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                {artwork.priceEur && !artwork.priceOnRequest ? (
                  <span className="font-semibold accent-amber">
                    {artwork.priceEur.toLocaleString("fr-FR")} €
                  </span>
                ) : (
                  <span className="text-xs text-white/40">Prix sur demande</span>
                )}
                <a
                  href={`/order?ref=${artwork.id}`}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--magenta)] hover:text-[var(--magenta)]"
                >
                  Commander
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
