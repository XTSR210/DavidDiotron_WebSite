import Link from "next/link";
import { FloatingArtwork } from "@/components/FloatingArtwork";
import { assetPath } from "@/lib/site";
import { readArtworks } from "@/lib/artworks";

const marqueeItems = [
  "Pop art",
  "Street art",
  "Collages d'affiches",
  "Barjols · Var · PACA",
  "Prix Univers des Arts 2017",
  "Peint à la main",
];

export default async function HomePage() {
  const artworks = (await readArtworks()).slice(0, 6);

  // One of David's own paintings as the page backdrop, darkened so the text
  // stays readable. Picked outside the hero collage (art-01…art-05).
  const backgroundArt = assetPath("/artworks/art-07.jpg");

  // Deterministic floating-mosaic config: each painting gets its own tilt,
  // float/drift flavor and duration. Every painting is tilted differently.
  const hero = [
    { variant: "float" as const, duration: 6, tilt: -6, delay: 0 },
    { variant: "drift" as const, duration: 9, tilt: 4, delay: 0.15 },
    { variant: "float" as const, duration: 7, tilt: -3.5, delay: 0.3 },
    { variant: "drift" as const, duration: 10, tilt: 6, delay: 0.45 },
    { variant: "float" as const, duration: 8, tilt: -5, delay: 0.6 },
    { variant: "drift" as const, duration: 9.5, tilt: 3.5, delay: 0.75 },
  ];

  // Brick-style offsets so the mosaic fills the full width, edge to edge,
  // with no holes left or right (2 columns mobile / 3 columns desktop).
  const offsets = [
    "",
    "mt-12 sm:mt-10",
    "sm:mt-14",
    "mt-12 sm:mt-0",
    "sm:mt-8",
    "mt-12 sm:mt-4",
  ];

  return (
    <div className="relative z-10">
      {/* Full-page backdrop: one of David's paintings, darkened for contrast */}
      <div className="fixed inset-0 -z-10" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundArt}
          alt=""
          className="bg-zoom h-full w-full scale-105 object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-[var(--ink)]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/85 via-[var(--ink)]/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/25 to-transparent" />
      </div>

      {/* Hero: animated collage of the artist's own works */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16">
          <p className="mb-4 text-base uppercase tracking-[0.25em] accent-amber">
            Artiste peintre · Provence
          </p>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.05] sm:text-6xl">
            David Drioton — <span className="accent-text">pop art</span> né dans
            l'atelier, à Barjols.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Couleurs qui jaillissent, affiches déchirées, personnages peints à
            la main. Chaque toile est unique, peinte à l'atelier dans le Var.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gallery" className="btn-accent rounded-lg px-6 py-3 font-semibold">
              Voir la galerie
            </Link>
            <Link
              href="/order"
              className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
            >
              Commander une pièce
            </Link>
          </div>

          {/* Floating mosaic — his own paintings, each tilted differently,
              filling the width edge to edge (2 cols mobile / 3 cols desktop) */}
          <div className="pointer-events-none relative mt-12 select-none">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8">
              {artworks.map((artwork, i) => {
                const cfg = hero[i % hero.length];
                return (
                  <div key={artwork.id} className={offsets[i % offsets.length]}>
                    <FloatingArtwork
                      artwork={artwork}
                      variant={cfg.variant}
                      duration={cfg.duration}
                      tilt={cfg.tilt}
                      delay={cfg.delay}
                      priority={i < 2}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Marquee strip — seamless loop, items duplicated so the ticker is
            always wider than the viewport on large monitors */}
        <div className="overflow-hidden border-y border-white/10 bg-white/[0.03] py-4">
          <div className="marquee-track text-base uppercase tracking-widest text-white/50">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex gap-10 pr-10" aria-hidden={copy === 1}>
                {[...marqueeItems, ...marqueeItems].map((item, j) => (
                  <span key={`${copy}-${j}`} className="whitespace-nowrap">
                    {item} <span className="accent-text">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="card-glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            L'atelier, au cœur de la <span className="accent-amber">Provence</span>
          </h2>
          <p className="mt-3 max-w-3xl text-white/70">
            Après sa rencontre avec la peintre Nadine Foster et la découverte de
            Jackson Pollock, David Drioton développe un pop art de vitalité
            flamboyante : personnages dessinés et peints à la main, fragments
            d'affiches déchirées du métro parisien, super-héros et stars des
            années 50 à aujourd'hui. Prix Univers des Arts 2017. Ses œuvres ont
            voyagé de Paris à Miami, Lisbonne, Berlin, Hong Kong et Singapour.
          </p>
          <Link
            href="/artiste"
            className="mt-4 inline-block text-sm font-semibold accent-amber transition hover:brightness-110"
          >
            Découvrir l'artiste →
          </Link>
        </div>
      </section>
    </div>
  );
}
