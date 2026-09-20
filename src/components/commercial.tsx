import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import {
  AwardIcon,
  CalendarIcon,
  ChatIcon,
  ExpandIcon,
  HandIcon,
  HandshakeIcon,
  HeartIcon,
  PackageIcon,
  ScrollIcon,
  StarIcon,
  WalletIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { site, waLink } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* BANDEAU CTA — rappel à l'action répété en bas de chaque page.       */
/* ------------------------------------------------------------------ */

export function CtaBanner({
  title = "Une toile qui vous ressemble, peinte pour vous.",
  text = "Décrivez votre projet en deux minutes — David vous répond avec un devis ferme, sans engagement.",
  primary = { href: "/order", label: "Lancer mon projet" },
  secondary = { href: "/gallery", label: "Voir les œuvres" },
}: {
  title?: string;
  text?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <Reveal>
        <div className="cta-banner relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-10">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.14]">
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[var(--magenta)] blur-3xl" />
            <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-[var(--amber)] blur-3xl" />
          </div>
          <p className="eyebrow justify-center">Commande sur mesure</p>
          <h2 className="display-2 mx-auto mt-4 max-w-2xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/70">{text}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={primary.href} className="btn-accent rounded-lg px-8 py-3.5 font-bold">
              {primary.label}
            </Link>
            <Link
              href={secondary.href}
              className="rounded-lg border border-white/25 px-7 py-3.5 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
            >
              {secondary.label}
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/45">
            Réponse sous 48 h · devis gratuit · tarif fixe une fois le devis validé
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* GARANTIES — les six raisons d'acheter l'esprit tranquille.          */
/* ------------------------------------------------------------------ */

const guarantees = [
  {
    icon: HandIcon,
    title: "100 % fait main",
    text: "Chaque toile est peinte à l'atelier de Barjols. Pièce unique, jamais reproduite.",
  },
  {
    icon: ScrollIcon,
    title: "Certificat d'authenticité",
    text: "Chaque œuvre est signée et accompagnée de son certificat — valeur sûre à la revente.",
  },
  {
    icon: ExpandIcon,
    title: "Sur mesure au cm près",
    text: "Vous choisissez les dimensions exactes pour votre salon, votre bureau, votre hôtel.",
  },
  {
    icon: PackageIcon,
    title: "Emballage musée & livraison",
    text: "Toile protégée, coin renforcé, suivi — en France et à l'international.",
  },
  {
    icon: WalletIcon,
    title: "Paiement en confiance",
    text: "Virement ou chèque, après validation du devis par l'atelier. Acompte possible.",
  },
  {
    icon: AwardIcon,
    title: "Artiste coté i-CAC",
    text: "Cotation officielle et prix Univers des Arts 2017 : vous achetez une valeur reconnue.",
  },
];

export function Guarantees() {
  return (
    <section className="border-y border-white/10 bg-white/[0.03]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <Reveal>
          <p className="eyebrow">Pourquoi acheter ici</p>
          <h2 className="display-2 mt-4 max-w-2xl">
            Acheter une œuvre, <span className="accent-text">l'esprit tranquille</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guarantees.map((g, i) => (
            <Reveal
              key={g.title}
              delay={0.06 * (i % 3)}
              className="card-glass group rounded-2xl p-6 transition hover:border-[var(--magenta)]/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-[var(--amber)] transition group-hover:scale-110 group-hover:text-[var(--magenta)]">
                <g.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold">{g.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{g.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PREUVE SOCIALE — avis collectionneurs (visuals + étoiles).          */
/* ------------------------------------------------------------------ */

const testimonials = [
  {
    stars: 5,
    quote:
      "La toile a pris tout le salon. David a peint exactement l'ambiance que je voulais — et il est venu la livrer lui-même.",
    author: "Céline M.",
    place: "Salon-de-Provence",
  },
  {
    stars: 5,
    quote:
      "Vu son travail à la Portes Ouvertes de Barjols, commandé une pièce de 120 × 80 pour notre restaurant. Les clients la photographient tous les soirs.",
    author: "Karim B.",
    place: "Restaurant, Toulon",
  },
  {
    stars: 5,
    quote:
      "Un vrai échange, du croquis au vernis final. On voit l'artiste travailler sur Instagram pendant que la toile se fait. Rare et précieux.",
    author: "Julien R.",
    place: "Collectionneur, Paris",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Ils ont acquis une pièce</p>
            <h2 className="display-2 mt-4 max-w-xl">
              Des collectionneurs, <span className="accent-amber">de la Provence au monde</span>
            </h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-white/55">
            <span className="flex text-[var(--amber)]" aria-hidden>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-4 w-4" />
              ))}
            </span>
            5 / 5 — avis clients de l'atelier
          </p>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.author} delay={0.08 * i} className="card-glass relative rounded-2xl p-6">
            <HeartIcon
              className="absolute right-5 top-5 h-5 w-5 text-[var(--magenta)]/40"
              aria-hidden
            />
            <span className="flex text-[var(--amber)]" aria-label={`${t.stars} étoiles sur 5`}>
              {[...Array(t.stars)].map((_, j) => (
                <StarIcon key={j} className="h-4 w-4" />
              ))}
            </span>
            <blockquote className="mt-4 text-sm leading-relaxed text-white/80">
              « {t.quote} »
            </blockquote>
            <figcaption className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
              <span className="font-bold text-white/85">{t.author}</span> · {t.place}
            </figcaption>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <p className="mt-6 text-xs text-white/40">
          Avis recueillis auprès des collectionneurs de l'atelier — commandes, salons et
          portes ouvertes de Barjols.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ — lever les freins à l'achat (accordéon natif <details>).       */
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
    a: "Oui — l'atelier de Barjols (Var) ouvre ses portes lors des Portes Ouvertes des artistes, et sur rendez-vous pour les projets de commande. Écrivez par email ou Instagram pour convenir d'un moment.",
  },
  {
    q: "Les œuvres prennent-elles de la valeur ?",
    a: "David Drioton est un artiste coté (grille officielle i-CAC) et primé (Univers des Arts 2017), exposé en France, aux États-Unis et à Singapour. Chaque pièce unique est signée et livrée avec son certificat d'authenticité — les bases d'une valeur qui se soutient dans le temps.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <Reveal>
        <p className="eyebrow">Questions fréquentes</p>
        <h2 className="display-2 mt-4">
          Tout ce qu'on nous demande <span className="accent-text">avant de commander</span>
        </h2>
      </Reveal>
      <div className="mt-8 space-y-3">
        {faq.map((item, i) => (
          <Reveal key={item.q} delay={0.05 * i}>
            <details className="card-glass group rounded-2xl px-5 transition open:border-[var(--magenta)]/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="accent-amber shrink-0 text-xl leading-none transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-white/65">{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <p className="mt-6 text-sm text-white/55">
          Une autre question ?{" "}
          <a
            href={site.social[0].href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--amber)] hover:underline"
          >
            Écrivez à l'atelier
          </a>{" "}
          — David répond en personne.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* BANDEAU « un projet ? » — contact direct (footer + pages légales).  */
/* ------------------------------------------------------------------ */

export function ProjectStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] ${
        compact ? "px-5 py-4" : "px-6 py-6"
      }`}
    >
      <p className="flex items-center gap-3 text-sm leading-snug text-white/75">
        <ChatIcon className="h-5 w-5 shrink-0 text-[var(--teal)]" aria-hidden />
        <span>
          <span className="font-semibold text-white">Un projet, une question ?</span>{" "}
          David répond en personne — sous 48 h.
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={waLink("Bonjour David, j'ai un projet de toile à vous proposer.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-[var(--teal)]/60 px-4 py-2 text-sm font-semibold text-[var(--teal)] transition hover:bg-[var(--teal)]/10"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </a>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent("Projet de commande")}`}
          className="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Écrire à l'atelier
        </a>
        <a
          href={site.social[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-[var(--magenta)] hover:text-[var(--magenta)]"
        >
          Instagram
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AVIS DE DÉLAI — réassurance sur la page commande.                   */
/* ------------------------------------------------------------------ */

export function LeadTimeNote() {
  return (
    <p className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/60">
      <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" aria-hidden />
      <span>
        Délai habituel : <span className="font-semibold text-white/85">3 à 6 semaines</span>{" "}
        après validation du devis. Accord d'acompte, paiement solde à la livraison —{" "}
        <HandshakeIcon className="inline h-3.5 w-3.5 text-[var(--amber)]" aria-hidden /> en
        toute confiance, échanges directs avec l'artiste.
      </span>
    </p>
  );
}
