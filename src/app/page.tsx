import Image from "next/image";
import Link from "next/link";
import HeroWall from "@/components/scenes/HeroWall";
import PaintingBand from "@/components/scenes/PaintingBand";
import Hanging from "@/components/scenes/Hanging";
import { PriceCalculator } from "@/components/PriceCalculator";
import { Section } from "@/components/Section";
import { CtaBanner, Faq, Guarantees, Testimonials, hasTestimonials } from "@/components/commercial";
import { InstagramIcon } from "@/components/icons";
import { site } from "@/lib/site";
import { readArtworks } from "@/lib/artworks";

const figures = [
  { k: "2017", v: "Prix Univers des Arts" },
  { k: "8 pays", v: "d'exposition : Paris, Miami, Berlin, Hong Kong, Singapour…" },
  { k: "2 musées", v: "Espace Paul Bédu (2020) et musée Simon Sigal, Aups (2023)" },
  { k: "i-CAC", v: "Cotation officielle, ventes aux enchères suivies par Artprice" },
];

/** Nombre de toiles suspendues dans l'accrochage de l'accueil. */
const HANGING_COUNT = 9;

export default async function HomePage() {
  const artworks = await readArtworks();

  return (
    <>
      {/* 1. Le mur : les toiles défilent, puis se redressent face au visiteur */}
      <HeroWall artworks={artworks} />

      {/* 2. Qui, quoi, d'où */}
      <Section tone="papier" torn={2}>
        <div className="grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <h2 className="poster t-xl">La rue entre dans l'atelier.</h2>
          <div className="prose-block lg:pt-3">
            <p className="lead">
              Après sa rencontre avec la peintre Nadine Foster et la découverte de Jackson Pollock,
              David Drioton développe un pop art de vitalité flamboyante : personnages dessinés et
              peints à la main, fragments d'affiches déchirées du métro parisien, super-héros et
              stars des années 50 à aujourd'hui.
            </p>
            <p className="soft">
              Chaque pièce naît à l'atelier de Barjols : une toile, un geste, une signature, et un
              seul collectionneur.
            </p>
            <p className="flex flex-wrap gap-x-8 gap-y-3">
              <Link href="/artiste" className="link">
                Découvrir l'artiste
              </Link>
              <Link href="/rendez-vous" className="link">
                Visiter l'atelier à Barjols
              </Link>
            </p>
          </div>
        </div>

        <dl className="figures mt-[clamp(3.5rem,8vw,6rem)]">
          {figures.map((f) => (
            <div key={f.k}>
              <dt className="poster figure-k">{f.k}</dt>
              <dd className="soft small mt-3 max-w-[16rem]">{f.v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* 3. La bande : deux rangées de toiles en sens contraires */}
      <PaintingBand artworks={artworks} />

      {/* 4. L'accrochage : la cimaise avance avec le défilement */}
      <Hanging artworks={artworks.slice(0, HANGING_COUNT)} total={artworks.length} />

      {/* 5. L'artiste */}
      <Section tone="jaune" torn={4} halftone>
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div className="duotone mx-auto w-full max-w-sm lg:max-w-none">
            <Image
              src="/artist/david-drioton.jpg"
              alt="Portrait de David Drioton"
              width={700}
              height={700}
              sizes="(max-width: 1024px) 384px, 30vw"
            />
          </div>
          <figure>
            <blockquote className="quote">
              « Je veux que la couleur saute, que l'affiche se déchire et que le personnage prenne
              vie. Je peins chaque toile à la main, une seule fois. »
            </blockquote>
            <figcaption className="mt-7 max-w-xl">
              <p className="poster t-sm">David Drioton</p>
              <p className="soft mt-3">
                Né en 1966, cadre en entreprise, il quitte tout à 50 ans pour peindre. Installé en
                Provence, il expose de Paris à Singapour et reçoit le prix Univers des Arts en
                2017.
              </p>
              <p className="mt-6">
                <Link href="/artiste" className="btn">
                  Lire son parcours
                </Link>
              </p>
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* 6. Le simulateur */}
      <Section tone="noir" torn={6} id="estimation">
        <PriceCalculator image={artworks[0]?.image} />
      </Section>

      {/* 7. Les garanties */}
      <Section tone="papier" torn={7}>
        <Guarantees />
      </Section>

      {/* 8. Instagram : la vie d'atelier */}
      <section className="bloc bloc-cyan py-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-6">
          <p className="poster t-md max-w-2xl">
            Les toiles en cours se montrent d'abord sur Instagram.
          </p>
          <a href={site.social[0].href} target="_blank" rel="noopener noreferrer" className="btn">
            <InstagramIcon className="h-5 w-5" />
            Suivre {site.social[0].handle}
          </a>
        </div>
      </section>

      {/* 9. Avis et questions */}
      <Section tone="noir" torn={9}>
        {hasTestimonials ? (
          <div className="mb-[clamp(4.5rem,10vw,8rem)]">
            <Testimonials />
          </div>
        ) : null}
        <Faq />
      </Section>

      {/* 10. Appel final */}
      <CtaBanner />
    </>
  );
}
