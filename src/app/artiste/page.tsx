import Image from "next/image";
import Link from "next/link";
import PaintingBand from "@/components/scenes/PaintingBand";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { CtaBanner, Faq } from "@/components/commercial";
import { HandIcon, PaletteIcon, ScissorsIcon } from "@/components/icons";
import { canvasSize } from "@/lib/ratio";
import { readArtworks } from "@/lib/artworks";

export const metadata = {
  title: "L'artiste",
  description:
    "David Drioton, artiste peintre pop art à Barjols (Var, PACA) : affiches déchirées, couleurs flamboyantes, pièces uniques peintes à la main. Prix Univers des Arts 2017.",
};

const pillars = [
  {
    Icon: PaletteIcon,
    title: "Pop art flamboyant",
    text: "Des couleurs qui jaillissent, des personnages dessinés et peints à la main. Une énergie directe, héritée de la pop culture des années 50 à aujourd'hui.",
  },
  {
    Icon: ScissorsIcon,
    title: "Collages d'affiches",
    text: "Fragments d'affiches déchirées du métro parisien réassemblés sur la toile : la rue entre dans l'atelier, la matière raconte une histoire.",
  },
  {
    Icon: HandIcon,
    title: "Peint à la main",
    text: "Chaque toile est unique, réalisée à l'atelier de Barjols. Pas de série, pas d'impression : une pièce originale, signée, pour un seul collectionneur.",
  },
];

const milestones = [
  {
    year: "La rencontre",
    title: "Nadine Foster et Jackson Pollock",
    text: "Sa rencontre avec la peintre Nadine Foster affine sa technique ; la découverte de Jackson Pollock libère son geste. Une bascule décisive.",
  },
  {
    year: "2011",
    title: "Premières expositions parisiennes",
    text: "Galerie Estade, place des Vosges, et galerie Next à Toulouse : le travail sort de l'atelier. Il remporte la même année un important concours d'affiches.",
  },
  {
    year: "2012",
    title: "Figaro Magazine et salons du Sud",
    text: "Le Figaro Magazine lui consacre un article (novembre 2012). Salons S'MART d'Aix-en-Provence, Valbonne, Elan d'Arts de Montpellier, galerie du Crescendo à Mougins, galerie d'As à Cavalaire.",
  },
  {
    year: "2013",
    title: "Univers des Arts",
    text: "Article dans la revue Univers des Arts (mai 2013) ; salon S'MART d'Aix à nouveau. La reconnaissance s'installe.",
  },
  {
    year: "2014",
    title: "Salon de Lourmarin et Carré d'artistes",
    text: "Salon international d'art contemporain de Lourmarin (juillet 2014), entrée dans le réseau des galeries Carré d'artistes (Miami, Lisbonne, Chine).",
  },
  {
    year: "2017",
    title: "Prix Univers des Arts et Berlin",
    text: "Prix Univers des Arts (mai 2017) et galerie Carré d'artistes à Berlin. Deux consécrations la même année.",
  },
  {
    year: "2019",
    title: "Hong Kong et retour en Provence",
    text: "Galerie Carré à Hong Kong, exposition au pôle culturel de Saint-Maximin-la-Sainte-Baume (septembre 2019), et Paris, Cours Saint-Émilion.",
  },
  {
    year: "2020",
    title: "Entrée au musée Paul Bédu",
    text: "Exposition à l'Espace Paul Bédu de Milly-la-Forêt (septembre à novembre 2020) : son travail entre dans la collection du musée. Galerie Calçada à Lisbonne la même année.",
  },
  {
    year: "2022",
    title: "Singapour et Malaisie",
    text: "Galerie Carré d'artistes en Malaisie et à Singapour ; Art et Vin au domaine Saint-Ferréol. Artprice enregistre ses ventes aux enchères (11 résultats en peinture).",
  },
  {
    year: "2023",
    title: "Musée Simon Sigal, Aups",
    text: "Galerie Carré d'artistes à Metz et exposition au musée Simon Sigal d'Aups (Haut-Var) : la Provence reconnaît le sien.",
  },
  {
    year: "Aujourd'hui",
    title: "L'atelier de Barjols",
    text: "Enraciné dans le Var, il peint à l'atelier du 12 rue Pierre Curie, ouvre ses portes chaque été avec les artistes barjolais, et réalise des pièces sur mesure pour les collectionneurs d'ici et d'ailleurs.",
  },
];

const press = [
  { k: "Figaro Magazine", d: "Article, novembre 2012", href: null },
  { k: "Univers des Arts", d: "Revue d'art, mai 2013", href: null },
  {
    k: "Reportage vidéo",
    d: "« Tout quitter pour devenir artiste à 50 ans »",
    href: "https://www.youtube.com/watch?v=A9T8cVTbFG8",
  },
  {
    k: "Carré d'artistes",
    d: "Visite filmée de son atelier",
    href: "https://www.carredartistes.com/fr-be/visite-atelier-drioton",
  },
  {
    k: "Cotation i-CAC",
    d: "Cotation officielle de l'artiste",
    href: "https://www.i-cac.fr/artiste/drioton-david/cotation.html",
  },
  {
    k: "Artprice",
    d: "11 résultats en ventes publiques",
    href: "https://fr.artprice.com/artiste/592681/david-drioton",
  },
];

export default async function ArtistPage() {
  const artworks = await readArtworks();
  const featured = artworks.slice(0, 6);

  return (
    <>
      <PageHero
        title={
          <>
            Une vision pop,
            <br />
            née en Provence.
          </>
        }
        aside={
          <div className="bloc-jaune duotone mx-auto w-full max-w-sm lg:max-w-none">
            <Image
              src="/artist/david-drioton.jpg"
              alt="Portrait de David Drioton"
              width={700}
              height={700}
              priority
              sizes="(max-width: 1024px) 384px, 30vw"
            />
          </div>
        }
      >
        <p className="lead">
          David Drioton puise dans la rue, la publicité et les affiches déchirées du métro pour
          composer des toiles uniques, pleines de couleurs et de personnages. Son atelier est à
          Barjols, dans le Var. Ses œuvres, elles, voyagent à travers le monde.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-4">
          <Link href="/gallery" className="btn">
            Voir ses toiles
          </Link>
          <Link href="/order" className="btn btn-ghost">
            Commander une toile
          </Link>
        </div>
      </PageHero>

      {/* L'homme derrière la toile */}
      <Section tone="papier" torn={3}>
        <div className="grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <h2 className="poster t-lg">Un peintre, un geste, une signature.</h2>
          <div className="prose-block">
            <p className="lead">
              Né en 1966, David a d'abord mené une autre vie — cadre en entreprise, marié, trois
              enfants — avant de tout quitter à 50 ans pour se consacrer entièrement à la peinture,
              un choix raconté dans un reportage qui lui est consacré.
            </p>
            <p>
              Élève appliqué, il commence par les natures mortes, les portraits et les nus,
              perfectionnant sa technique auprès de la peintre Nadine Foster. Puis vient la
              découverte de Jackson Pollock — une révélation qui libère son geste et l'oriente vers
              un art de la couleur pure et de la matière.
            </p>
            <p>
              En 2010, il revient s'installer sous le soleil de Provence, entre
              Saint-Maximin-la-Sainte-Baume et Barjols (Var). Inspiré par les affiches déchirées du
              métro parisien, il fait entrer dans ses toiles les icônes de la pop culture —
              super-héros, stars, bandes dessinées — découpées, superposées, peintes à la main,
              avec, plus récemment, des vinyles et des affiches d'avant-guerre.
            </p>
            <p>
              Prix Univers des Arts 2017, exposé de Paris à Miami, Berlin, Hong Kong et Singapour,
              présent dans les collections des musées Paul Bédu (Milly-la-Forêt) et Simon Sigal
              (Aups). Aujourd'hui, il continue de peindre à l'atelier : chaque toile est unique,
              signée, et attend son collectionneur.
            </p>
          </div>
        </div>
      </Section>

      {/* Manifeste */}
      <Section tone="magenta" torn={8} halftone>
        <figure className="mx-auto max-w-5xl">
          <blockquote className="quote">
            « Je veux que la couleur saute, que l'affiche se déchire et que le personnage prenne
            vie. Chaque toile est une histoire que je laisse parler — et je la peins à la main, une
            seule fois, pour vous. »
          </blockquote>
          <figcaption className="poster t-sm mt-8">David Drioton</figcaption>
        </figure>
      </Section>

      {/* Son univers */}
      <Section tone="noir" torn={10}>
        <h2 className="poster t-lg">Son univers</h2>
        <ul className="grid-points mt-12">
          {pillars.map((p) => (
            <li key={p.title} className="point">
              <p.Icon className="point-icon" />
              <h3 className="poster t-sm mt-4">{p.title}</h3>
              <p className="soft mt-2">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <PaintingBand artworks={artworks} />

      {/* Parcours */}
      <Section tone="papier" torn={12}>
        <h2 className="poster t-lg">Le parcours</h2>
        <ol className="mt-12">
          {milestones.map((m) => (
            <li key={m.title} className="timeline-row">
              <p className="poster timeline-year">{m.year}</p>
              <div className="max-w-2xl">
                <h3 className="text-xl font-bold leading-tight">{m.title}</h3>
                <p className="soft mt-2">{m.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Presse et reconnaissance */}
      <Section tone="noir" torn={13}>
        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <h2 className="poster t-lg">Ils parlent de lui</h2>
          <div>
            {press.map((p) => {
              const inner = (
                <>
                  <span>
                    <span className="block text-lg font-bold">{p.k}</span>
                    <span className="soft small block">{p.d}</span>
                  </span>
                  {p.href ? <span className="small shrink-0 font-bold">Voir la source</span> : null}
                </>
              );
              return p.href ? (
                <a key={p.k} href={p.href} target="_blank" rel="noopener noreferrer" className="row-link">
                  {inner}
                </a>
              ) : (
                <div key={p.k} className="row-link">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        {/* Un aperçu de l'atelier */}
        <div className="mt-[clamp(4.5rem,10vw,8rem)] flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="poster t-lg">Un aperçu de l'atelier</h2>
          <Link href="/gallery" className="link">
            Toute la galerie
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-[clamp(0.9rem,2.4vw,2.2rem)] gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((a) => (
            <li key={a.id}>
              <Link href={{ pathname: "/order", query: { ref: a.id } }} className="hang-link">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.image}
                  alt={a.title}
                  {...canvasSize(a)}
                  loading="lazy"
                  decoding="async"
                  className="hang-canvas !h-auto w-full"
                />
                <span className="cartel block">
                  <span className="cartel-title">{a.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="papier" torn={14}>
        <Faq />
      </Section>

      <CtaBanner
        title="Faites entrer l'atelier chez vous."
        text="Décrivez le mur, l'ambiance, la taille. David propose une composition sur mesure et vous répond avec un devis ferme."
      />
    </>
  );
}
