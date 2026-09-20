import Link from "next/link";
import { FloatingArtwork } from "@/components/FloatingArtwork";
import { PriceCalculator } from "@/components/PriceCalculator";
import { Reveal } from "@/components/Reveal";
import {
  CtaBanner,
  Faq,
  Guarantees,
  Testimonials,
} from "@/components/commercial";
import {
  AwardIcon,
  HandIcon,
  InstagramIcon,
  PackageIcon,
} from "@/components/icons";
import { assetPath, site } from "@/lib/site";
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
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-20">
          <Reveal>
            <p className="eyebrow">Artiste peintre · Provence</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display-1 mt-5 max-w-2xl">
              David Drioton — <span className="accent-text">pop art</span> né dans
              l'atelier, à Barjols.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Couleurs qui jaillissent, affiches déchirées, personnages peints à
              la main. Chaque toile est unique, peinte à l'atelier dans le Var.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/order" className="btn-accent rounded-lg px-7 py-3.5 font-semibold">
                Commander une pièce
              </Link>
              <Link
                href="/gallery"
                className="rounded-lg border border-white/20 px-7 py-3.5 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Voir la galerie
              </Link>
              <a
                href={site.social[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-3.5 text-sm font-semibold text-white/70 transition hover:text-[var(--magenta)]"
              >
                <InstagramIcon className="h-5 w-5" aria-hidden />
                Être prévenu des nouveautés
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-medium tracking-wide text-white/55">
              <span className="flex items-center gap-1.5">
                <AwardIcon className="h-4 w-4 text-[var(--amber)]" aria-hidden /> Coté
                i-CAC · Prix Univers des Arts 2017
              </span>
              <span className="flex items-center gap-1.5">
                <HandIcon className="h-4 w-4 text-[var(--teal)]" aria-hidden /> Pièces
                uniques, peintes à la main
              </span>
              <span className="flex items-center gap-1.5">
                <PackageIcon className="h-4 w-4 text-[var(--magenta)]" aria-hidden />{
                  " "
                }
                Livraison soignée, France & international
              </span>
            </p>
          </Reveal>

          {/* Floating mosaic — his own paintings, each tilted differently,
              filling the width edge to edge (2 cols mobile / 3 cols desktop) */}
          <div className="pointer-events-none relative mt-16 select-none">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8">
              {artworks.map((artwork, i) => {
                const cfg = hero[i % hero.length];
                return (
                  <Reveal key={artwork.id} delay={0.1 + i * 0.08} className={offsets[i % offsets.length]}>
                    <FloatingArtwork
                      artwork={artwork}
                      variant={cfg.variant}
                      duration={cfg.duration}
                      tilt={cfg.tilt}
                      delay={cfg.delay}
                      priority={i < 2}
                    />
                  </Reveal>
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

      {/* About teaser — two columns : text left, key figures right */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="card-glass h-full rounded-2xl p-6 sm:p-9">
              <p className="eyebrow">L'atelier</p>
              <h2 className="display-2 mt-4">
                Au cœur de la <span className="accent-amber">Provence</span>
              </h2>
              <p className="mt-5 max-w-3xl leading-relaxed text-white/70">
                Après sa rencontre avec la peintre Nadine Foster et la découverte de
                Jackson Pollock, David Drioton développe un pop art de vitalité
                flamboyante : personnages dessinés et peints à la main, fragments
                d'affiches déchirées du métro parisien, super-héros et stars des
                années 50 à aujourd'hui.
              </p>
              <p className="mt-4 max-w-3xl leading-relaxed text-white/70">
                Chaque pièce naît à l'atelier de Barjols : une toile, un geste, une
                signature — et un seul collectionneur.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href="/artiste"
                  className="text-sm font-semibold accent-amber transition hover:brightness-110"
                >
                  Découvrir l'artiste →
                </Link>
                <Link
                  href="/rendez-vous"
                  className="text-sm font-semibold accent-amber transition hover:brightness-110"
                >
                  Visiter l'atelier à Barjols →
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Key figures — the artist's credibility at a glance */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {[
              { k: "2017", v: "Prix Univers des Arts" },
              { k: "8 pays", v: "exposés — Paris, Miami, Berlin, Hong Kong, Singapour…" },
              { k: "2 musées", v: "collections — Paul Bédu (2020) · Aups (2023)" },
              { k: "i-CAC", v: "cotation officielle · ventes aux enchères Artprice" },
            ].map((f, i) => (
              <Reveal key={f.k} delay={0.1 + i * 0.08} className="card-glass rounded-2xl p-5">
                <p className="accent-text text-3xl font-black tracking-tight">{f.k}</p>
                <p className="mt-1 text-sm leading-snug text-white/60">{f.v}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram — la vie d'atelier en continu */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <p className="eyebrow">Vie d'atelier</p>
              <h2 className="display-2 mt-4">
                Suivez l'atelier sur <span className="accent-text">Instagram</span>
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-white/60">
                Toiles en cours, couches de couleur, collages en train de se
                faire — l'atelier de Barjols se raconte au fil des posts.
                <span className="mt-2 block font-medium text-white/80">
                  Suivez l'atelier : nouveautés et pièces disponibles y sont
                  montrées en premier, avant la galerie.
                </span>
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <a
                href={site.social[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-5 transition hover:border-[var(--magenta)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--magenta)] via-[#f0559a] to-[var(--amber)] text-white transition group-hover:scale-105">
                  <InstagramIcon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-bold">{site.social[0].handle}</span>
                  <span className="block text-sm text-white/55">
                    Œuvres en cours, coulisses, nouveautés
                  </span>
                </span>
                <span aria-hidden className="accent-amber ml-2 font-black transition group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Social proof — collector voices */}
      <Testimonials />

      {/* Live price calculator — priced per the i-CAC grid */}
      <Reveal>
        <PriceCalculator />
      </Reveal>

      {/* Purchase guarantees — remove buying hesitations */}
      <Guarantees />

      {/* FAQ — answer objections before they become blockers */}
      <Faq />

      {/* Final conversion banner */}
      <CtaBanner />
    </div>
  );
}
