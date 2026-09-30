import Link from "next/link";
import {
  AwardIcon,
  ExpandIcon,
  HandIcon,
  InstagramIcon,
  PackageIcon,
  ScrollIcon,
  WalletIcon,
  WhatsAppIcon,
} from "@/components/icons";
import CanvasFan from "@/components/scenes/CanvasFan";
import { TornEdge } from "@/components/TornEdge";
import { readArtworks } from "@/lib/artworks";
import { site, waLink } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

/* ------------------------------------------------------------------ */
/* APPEL FINAL — aplat magenta et éventail de toiles, en bas de page.  */
/* ------------------------------------------------------------------ */

export async function CtaBanner({
  title = "Une toile qui vous ressemble, peinte pour vous.",
  text = "Décrivez votre projet en deux minutes. David vous répond en personne, avec un devis ferme et sans engagement.",
  primary = { href: "/order", label: "Commander une toile" },
  secondary = { href: "/gallery", label: "Voir la galerie" },
}: {
  title?: string;
  text?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  const artworks = await readArtworks();
  // Cinq toiles prises à intervalles réguliers, pour un éventail varié.
  const fan = [0, 4, 8, 12, 16].map((i) => artworks[i % artworks.length]);

  return (
    <section className="bloc bloc-magenta halftone [clip-path:inset(-4rem_0_0_0)] pt-[clamp(4.5rem,11vw,9rem)]">
      <TornEdge seed={11} />
      <div className="wrap relative text-center">
        <h2 className="poster t-xl mx-auto max-w-5xl">{title}</h2>
        <p className="lead mx-auto mt-6 max-w-xl">{text}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-4">
          <Link href={primary.href} className="btn">
            {primary.label}
          </Link>
          <Link href={secondary.href} className="btn btn-ghost">
            {secondary.label}
          </Link>
        </div>
        <p className="small mt-6">Réponse sous 48 h. Devis gratuit. Prix fixe une fois le devis validé.</p>
        <CanvasFan artworks={fan} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* GARANTIES — six raisons d'acheter l'esprit tranquille.              */
/* ------------------------------------------------------------------ */

const guarantees = [
  {
    icon: HandIcon,
    title: "Peint à la main",
    text: "Chaque toile est peinte à l'atelier de Barjols. Pièce unique, jamais reproduite.",
  },
  {
    icon: ScrollIcon,
    title: "Certificat d'authenticité",
    text: "Chaque œuvre est signée et livrée avec son certificat.",
  },
  {
    icon: ExpandIcon,
    title: "Sur mesure, au centimètre",
    text: "Vous choisissez les dimensions exactes pour votre salon, votre bureau, votre hôtel.",
  },
  {
    icon: PackageIcon,
    title: "Emballage et livraison suivie",
    text: "Toile protégée, coins renforcés, suivi. En France et à l'international.",
  },
  {
    icon: WalletIcon,
    title: "Paiement en confiance",
    text: "Virement ou chèque, après validation du devis par l'atelier. Acompte possible.",
  },
  {
    icon: AwardIcon,
    title: "Artiste coté i-CAC",
    text: "Cotation officielle et prix Univers des Arts 2017 : une valeur reconnue.",
  },
];

export function Guarantees() {
  return (
    <>
      <h2 className="poster t-lg max-w-3xl">Acheter une œuvre, l'esprit tranquille.</h2>
      <ul className="grid-points mt-12">
        {guarantees.map((g) => (
          <li key={g.title} className="point">
            <g.icon className="point-icon" />
            <h3 className="poster t-sm mt-4">{g.title}</h3>
            <p className="soft mt-2">{g.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* AVIS — paroles de collectionneurs (lib/testimonials.ts).            */
/* Liste vide : rien n'est affiché.                                    */
/* ------------------------------------------------------------------ */

export const hasTestimonials = testimonials.length > 0;

export function Testimonials() {
  if (!hasTestimonials) return null;
  return (
    <>
      <h2 className="poster t-lg max-w-3xl">Ils vivent avec une toile de David.</h2>
      <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.author} className="point">
            <blockquote className="lead">« {t.quote} »</blockquote>
            <figcaption className="small mt-5">
              <span className="font-bold">{t.author}</span>
              <span className="soft">, {t.place}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* QUESTIONS — lever les freins à l'achat (accordéon natif <details>). */
/* ------------------------------------------------------------------ */

const faq = [
  {
    q: "Comment se passe une commande sur mesure ?",
    a: "Vous choisissez une référence (ou une idée libre), donnez les dimensions au centimètre, puis envoyez votre demande de devis — par email ou sur WhatsApp. David vous répond sous 48 h avec un croquis d'intention et un devis ferme. Après validation et acompte, la toile entre à l'atelier.",
  },
  {
    q: "Le prix peut-il changer après le devis ?",
    a: "Non. Une fois le devis validé, le tarif est fixe et garanti : ni frais cachés, ni surprise. Seule une modification de votre demande (taille, technique, finition) peut donner lieu à un nouveau devis — toujours validé ensemble avant de démarrer.",
  },
  {
    q: "Peut-on discuter directement avec l'artiste ?",
    a: "Oui — c'est le principe de l'atelier. Sur WhatsApp ou par email, c'est David en personne qui répond : il vous conseille sur le format et les couleurs, envoie des photos d'avancement, et ajuste le devis avec vous jusqu'à un prix fixe qui convient aux deux parties.",
  },
  {
    q: "Quel est le délai de réalisation ?",
    a: "Comptez en général 3 à 6 semaines selon la taille et la technique — les grandes pièces (120 cm et plus) demandent davantage de couches et de séchage. Le délai exact est fixé dans le devis. En période de salons, l'atelier vous indique le prochain créneau disponible.",
  },
  {
    q: "Quels sont les moyens de paiement ?",
    a: "Virement bancaire ou chèque, avec un acompte au lancement de la toile et le solde à la livraison. Pour les pièces visibles à l'atelier (portes ouvertes de Barjols), le paiement et le retrait sur place sont possibles.",
  },
  {
    q: "Comment l'œuvre est-elle livrée ?",
    a: "Toile protégée par un emballage de type musée : film, coins renforcés, caisse ou tube selon le format. Livraison suivie en France et à l'international, remise en main propre possible autour de Barjols et lors des expositions.",
  },
  {
    q: "Puis-je visiter l'atelier avant de décider ?",
    a: "Oui — c'est même conseillé : les toiles gagnent à être vues en vrai. L'atelier de Barjols (Var) reçoit sur rendez-vous pour choisir une pièce, discuter un projet ou retirer une commande. Demandez votre créneau sur la page « Rendez-vous » (par WhatsApp, email ou téléphone) — David confirme sous 48 h.",
  },
  {
    q: "Les œuvres prennent-elles de la valeur ?",
    a: "David Drioton est un artiste coté (grille officielle i-CAC) et primé (Univers des Arts 2017), exposé en France, aux États-Unis et à Singapour. Chaque pièce unique est signée et livrée avec son certificat d'authenticité — les bases d'une valeur qui se soutient dans le temps.",
  },
];

export function Faq() {
  return (
    <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div>
        <h2 className="poster t-lg">Avant de commander</h2>
        <p className="soft mt-5 max-w-sm">
          Une autre question ?{" "}
          <a
            href={waLink("Bonjour David, j'ai une question avant de commander.")}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            Écrivez à David
          </a>
          , il répond en personne. Pour voir les toiles en vrai,{" "}
          <Link href="/rendez-vous" className="link">
            prenez rendez-vous à l'atelier
          </Link>
          .
        </p>
      </div>
      <div>
        {faq.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>
              {item.q}
              <span className="faq-plus" aria-hidden="true" />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CONTACT DIRECT — trois canaux, David répond en personne.            */
/* ------------------------------------------------------------------ */

export function ProjectStrip() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
      <p className="poster t-md max-w-xl">Un projet, une question ? David répond en personne, sous 48 h.</p>
      <div className="flex flex-wrap gap-x-4 gap-y-4">
        <a
          href={waLink("Bonjour David, j'ai un projet de toile à vous proposer.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wa"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </a>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent("Projet de commande")}`}
          className="btn btn-ghost"
        >
          Écrire à l'atelier
        </a>
        <a href={site.social[0].href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          <InstagramIcon className="h-5 w-5" />
          Instagram
        </a>
      </div>
    </div>
  );
}
