import Link from "next/link";
import { Faq, Testimonials } from "@/components/commercial";
import { Reveal } from "@/components/Reveal";
import {
  CalendarIcon,
  ChatIcon,
  ClockIcon,
  HandshakeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { site, waLink } from "@/lib/site";
import { events } from "@/lib/events";

export const metadata = {
  title: "Rendez-vous à l'atelier",
  description:
    "Visitez l'atelier de David Drioton à Barjols (Var) sur rendez-vous : voir les toiles en vrai, discuter votre projet, retirer une commande.",
};

export default function RendezVousPage() {
  const visitSubject = "Demande de rendez-vous à l'atelier";
  const visitBody = [
    "Bonjour David,",
    "",
    "Je souhaite venir visiter l'atelier de Barjols :",
    "- Date souhaitée : ",
    "- Motif : voir les œuvres / discuter un projet de commande / autre",
    "",
    "Nom : ",
    "Email : ",
    "Téléphone : ",
  ].join("\n");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
      <header className="max-w-2xl">
        <Reveal>
          <p className="eyebrow">Barjols · Var · Provence</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="display-1 mt-4">
            Venez à <span className="accent-text">l'atelier</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 leading-relaxed text-white/65">
            Les toiles gagnent à être vues en vrai : matière, relief des
            collages, profondeur des couleurs. L'atelier de Barjols reçoit sur
            rendez-vous — pour choisir votre pièce, suivre l'avancement d'une
            commande ou simplement rencontrer l'artiste.
          </p>
        </Reveal>
      </header>

      {/* Trois raisons de venir */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: MapPinIcon,
            title: "Voir les œuvres en vrai",
            text: "Les photos aplatissent : en atelier, on voit le geste, les épaisseurs, les affiches déchirées en relief.",
          },
          {
            icon: ChatIcon,
            title: "Discuter votre projet",
            text: "Devis ferme en main propre : David vous conseille sur le format, l'emplacement et les couleurs de votre pièce.",
          },
          {
            icon: HandshakeIcon,
            title: "Retirer une commande",
            text: "Livraison remise en main propre à l'atelier, avec le certificat d'authenticité signé.",
          },
        ].map((c, i) => (
          <Reveal key={c.title} delay={0.08 * i} className="card-glass rounded-2xl p-6">
            <c.icon className="h-6 w-6 text-[var(--amber)]" />
            <h2 className="mt-3 font-bold">{c.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">{c.text}</p>
          </Reveal>
        ))}
      </section>

      {/* Prise de rendez-vous */}
      <section className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Reveal className="card-glass rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <CalendarIcon className="h-6 w-6 text-[var(--magenta)]" />
            Prendre rendez-vous
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Choisissez le canal qui vous convient — David vous confirme le
            créneau en personne, sous 48 h au plus tard.
          </p>

          <div className="mt-6 space-y-3">
            <a
              href={waLink("Bonjour David, je souhaite prendre rendez-vous pour visiter l'atelier de Barjols.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--teal)]/60 px-5 py-4 font-semibold text-[var(--teal)] transition hover:bg-[var(--teal)]/10"
            >
              <span className="flex items-center gap-3">
                <WhatsAppIcon className="h-5 w-5" />
                Réserver par WhatsApp
              </span>
              <span aria-hidden className="text-sm">le plus rapide →</span>
            </a>

            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(visitSubject)}&body=${encodeURIComponent(visitBody)}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/20 px-5 py-4 font-semibold text-white/85 transition hover:border-[var(--magenta)] hover:text-[var(--magenta)]"
            >
              <span className="flex items-center gap-3">
                <MailIcon className="h-5 w-5" />
                Réserver par email
              </span>
              <span aria-hidden className="text-sm text-white/40">→</span>
            </a>

            <a
              href={`tel:${site.phone.replace(/\s|\./g, "")}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/20 px-5 py-4 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
            >
              <span className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5" />
                Appeler l'atelier
              </span>
              <span aria-hidden className="text-sm text-white/40">{site.phone} →</span>
            </a>
          </div>

          <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/55">
            <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" aria-hidden />
            <span>
              L'atelier ne reçoit que sur rendez-vous (c'est un lieu de
              travail). Créneaux en journée et fin de journée — convenus
              ensemble, selon l'avancement des toiles en cours.
            </span>
          </p>
        </Reveal>

        {/* Infos pratiques */}
        <Reveal delay={0.1} className="card-glass rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <MapPinIcon className="h-6 w-6 text-[var(--amber)]" />
            Infos pratiques
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Adresse</dt>
              <dd className="mt-1 leading-relaxed text-white/80">{site.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Sur place</dt>
              <dd className="mt-1 leading-relaxed text-white/70">
                Œuvres exposées et en cours, discussion du projet, devis ferme
                sur place. La Provence verte fait une belle excursion —
                combinez avec un déjeuner à Barjols.
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Contact</dt>
              <dd className="mt-2 space-y-1.5">
                <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-white/75 hover:text-white">
                  <MailIcon className="h-4 w-4 text-[var(--magenta)]" /> {site.email}
                </a>
                <a
                  href={site.social[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/75 hover:text-white"
                >
                  <InstagramIcon className="h-4 w-4 text-[var(--magenta)]" /> {site.social[0].handle}
                </a>
              </dd>
            </div>
          </dl>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Barjols%2083670%20Var%20France"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold"
          >
            <MapPinIcon className="h-4 w-4" />
            Ouvrir dans Google Maps
          </a>
        </Reveal>
      </section>

      {/* Agenda — expositions & Portes Ouvertes */}
      <section className="mt-14">
        <Reveal>
          <p className="eyebrow">Agenda</p>
          <h2 className="display-2 mt-4">
            Où voir les toiles <span className="accent-amber">prochainement</span>
          </h2>
        </Reveal>
        {events.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev, i) => (
              <Reveal key={ev.title + ev.dates} delay={0.06 * i} className="card-glass rounded-2xl p-6">
                <p className="accent-text text-lg font-black">{ev.dates}</p>
                <h3 className="mt-1.5 font-bold">{ev.title}</h3>
                <p className="mt-1 text-sm text-white/60">{ev.place}</p>
                {ev.note ? <p className="mt-2 text-xs text-white/45">{ev.note}</p> : null}
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={0.08}>
            <p className="mt-5 max-w-xl leading-relaxed text-white/55">
              Les prochaines dates (Portes Ouvertes des artistes de Barjols,
              salons, expositions) sont annoncées en premier sur{" "}
              <a
                href={site.social[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--magenta)] hover:underline"
              >
                Instagram {site.social[0].handle}
              </a>
              . Pour être sûr d'une visite, prenez rendez-vous ci-dessus.
            </p>
          </Reveal>
        )}
      </section>

      <Testimonials />
      <Faq />
    </div>
  );
}
