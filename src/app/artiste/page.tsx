import Link from "next/link";
import Image from "next/image";
import { FloatingArtwork } from "@/components/FloatingArtwork";
import { BrushIcon, HandIcon, PaletteIcon, ScissorsIcon } from "@/components/icons";
import { assetPath } from "@/lib/site";
import { readArtworks } from "@/lib/artworks";


export const metadata = {
  title: "L'Artiste — David Drioton",
  description:
    "David Drioton, artiste peintre pop art à Barjols (Var, PACA) : affiches déchirées, couleurs flamboyantes, pièces uniques peintes à la main. Prix Univers des Arts 2017.",
};

const pillars = [
  {
    Icon: PaletteIcon,
    accent: "text-[var(--magenta)]",
    title: "Pop art flamboyant",
    text: "Des couleurs qui jaillissent, des personnages dessinés et peints à la main. Une énergie directe, héritée de la pop culture des années 50 à aujourd'hui.",
  },
  {
    Icon: ScissorsIcon,
    accent: "text-[var(--amber)]",
    title: "Collages d'affiches",
    text: "Fragments d'affiches déchirées du métro parisien réassemblés sur la toile : la rue entre dans l'atelier, la matière raconte une histoire.",
  },
  {
    Icon: HandIcon,
    accent: "text-[var(--teal)]",
    title: "Peint à la main",
    text: "Chaque toile est unique, réalisée à l'atelier de Barjols. Pas de série, pas d'impression : une pièce originale, signée, pour un seul collectionneur.",
  },
];

const milestones = [
  {
    year: "La rencontre",
    title: "Nadine Foster & Jackson Pollock",
    text: "Sa rencontre avec la peintre Nadine Foster et la découverte de Jackson Pollock déclenchent une bascule décisive vers un pop art de vitalité flamboyante.",
  },
  {
    year: "2017",
    title: "Prix Univers des Arts",
    text: "Son travail est distingué par le Prix Univers des Arts, un repère important dans son parcours d'artiste reconnu.",
  },
  {
    year: "Le monde",
    title: "De Paris à Singapour",
    text: "Ses œuvres voyagent : Paris, Miami, Lisbonne, Berlin, Hong Kong, Singapour. Une cote qui s'installe, une signature qui traverse les frontières.",
  },
  {
    year: "Aujourd'hui",
    title: "L'atelier de Barjols",
    text: "Enraciné dans le Var (PACA), il continue d'explorer le geste, la matière et la couleur — et ouvre son atelier à ceux qui veulent une pièce sur mesure.",
  },
];

export default async function ArtistPage() {
  const artworks = await readArtworks();
  const featured = artworks.slice(0, 6);

  return (
    <div>
      {/* Hero — portrait of the artist through his own works */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-base uppercase tracking-[0.25em] accent-amber">
              L'artiste · Barjols, Var (PACA)
            </p>
            <h1 className="text-5xl font-black leading-[1.05] sm:text-6xl">
              David Drioton, une <span className="accent-text">vision pop</span> née en
              Provence.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/70">
              Artiste peintre reconnu dans sa région, David puise dans la rue, la
              publicité et les affiches déchirées du métro pour composer des toiles
              uniques, pleines de couleurs et de personnages. Son atelier est à
              Barjols, dans le Var. Ses œuvres, elles, voyagent à travers le monde.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/gallery" className="btn-accent rounded-lg px-5 py-2.5 font-semibold">
                Voir ses œuvres
              </Link>
              <Link
                href="/order"
                className="rounded-lg border border-white/20 px-5 py-2.5 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
              >
                Commander une pièce
              </Link>
            </div>
          </div>

          {/* Floating collage — his own works, scattered without overlap */}
          <div className="pointer-events-none relative h-[520px] select-none sm:h-[620px]">
            {featured.slice(0, 4).map((artwork, i) => {
              const cfg = [
                { variant: "float" as const, duration: 7, tilt: -4, delay: 0 },
                { variant: "drift" as const, duration: 10, tilt: 3, delay: 0.15 },
                { variant: "float" as const, duration: 8, tilt: 2, delay: 0.3 },
                { variant: "drift" as const, duration: 11, tilt: -2, delay: 0.45 },
              ][i];
              const pos = [
                "left-[0%] top-[4%] w-40 sm:w-52 z-20",
                "left-[52%] top-[6%] w-40 sm:w-52 z-20",
                "left-[6%] top-[52%] w-40 sm:w-52 z-10",
                "left-[52%] top-[54%] w-40 sm:w-52 z-10",
              ][i];
              return (
                <div key={artwork.id} className={`absolute ${pos}`}>
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
      </section>

      {/* Portrait — the man behind the canvases */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[380px_1fr]">
          <div className="relative mx-auto w-64 sm:w-72">
            <div
              className="absolute -inset-3 -rotate-2 rounded-2xl border-2 border-[var(--magenta)]/40"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <Image
                src={assetPath("/artist/david-drioton.jpg")}
                alt="David Drioton, artiste peintre, dans son atelier"
                width={700}
                height={700}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
            <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-white/50">
              David Drioton · l'atelier, Provence
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.25em] accent-amber">
              L'homme derrière la toile
            </p>
            <h2 className="text-3xl font-black">
              Un peintre, un <span className="accent-text">geste</span>, une signature.
            </h2>
            <div className="mt-4 space-y-3 text-white/70">
              <p>
                Élève appliqué, David commence par les natures mortes, les portraits
                et les nus, perfectionnant sa technique auprès de la peintre Nadine
                Foster. Puis vient la découverte de Jackson Pollock — une révélation
                qui libère son geste et l'oriente vers un art de la couleur pure et de
                la matière.
              </p>
              <p>
                En 2010, il revient s'installer sous le soleil de Provence, entre
                Saint-Maximin-la-Sainte-Baume et Barjols (Var). Inspiré par les
                affiches déchirées du métro parisien, il fait entrer dans ses toiles
                les icônes de la pop culture — super-héros, stars, bandes dessinées —
                découpées, superposées, peintes à la main.
              </p>
              <p>
                Prix Univers des Arts 2017, ses œuvres exposent de Paris à Miami,
                Berlin, Hong Kong et Singapour. Aujourd'hui, il continue de peindre à
                l'atelier : chaque toile est unique, signée, et attend son
                collectionneur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <BrushIcon className="mx-auto h-12 w-12 text-[var(--magenta)]" />
          <blockquote className="mt-4 text-xl font-semibold leading-relaxed sm:text-2xl">
            « Je veux que la couleur saute, que l'affiche se déchire et que le
            personnage prenne vie. Chaque toile est une histoire que je laisse
            parler — et je la peins à la main, une seule fois, pour vous. »
          </blockquote>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] accent-amber">— David Drioton</p>
        </div>
      </section>

      {/* His universe — three pillars */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-black">
          Son <span className="accent-text">univers</span>
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="card-glass rounded-2xl p-6">
              <p.Icon className={`h-10 w-10 ${p.accent}`} />
              <h3 className="mt-3 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-white/70">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parcours */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl font-black">
            Le <span className="accent-amber">parcours</span>
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {milestones.map((m) => (
              <div key={m.title} className="card-glass rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] accent-text">{m.year}</p>
                <h3 className="mt-2 text-lg font-bold">{m.title}</h3>
                <p className="mt-2 text-sm text-white/70">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A window on the works */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">
              Un aperçu de <span className="accent-text">l'atelier</span>
            </h2>
            <p className="mt-2 max-w-xl text-white/60">
              Une sélection d'œuvres récentes, peintes à la main à Barjols. La
              galerie complète est à un clic.
            </p>
          </div>
          <Link href="/gallery" className="text-sm font-semibold accent-amber transition hover:brightness-110">
            Toute la galerie →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {featured.map((a) => (
            <Link
              key={a.id}
              href={`/order?ref=${a.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.image}
                alt={a.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-sm font-semibold">{a.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA — commission */}
      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h2 className="text-3xl font-black">
            Une pièce <span className="accent-text">sur mesure</span> ?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/70">
            David peint aussi pour vous : choisissez un style, donnez la taille au
            centimètre, et l'atelier s'occupe du reste. Peint à la main, signé,
            livré de Barjols.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/order" className="btn-accent rounded-lg px-6 py-3 font-bold">
              Commander une pièce
            </Link>
            <a
              href="https://www.instagram.com/daviddrioton/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white/85 transition hover:border-[var(--magenta)] hover:text-[var(--magenta)]"
            >
              Suivre sur Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
