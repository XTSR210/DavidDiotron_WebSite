import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Faq } from "@/components/commercial";
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { site, waLink } from "@/lib/site";
import { events } from "@/lib/events";

export const metadata = {
  title: "Rendez-vous à l'atelier",
  description:
    "Visitez l'atelier de David Drioton à Barjols (Var) sur rendez-vous : voir les toiles en vrai, discuter votre projet, retirer une commande.",
};

const reasons = [
  {
    title: "Voir les toiles en vrai",
    text: "Les photos aplatissent. À l'atelier, on voit le geste, les épaisseurs, les affiches déchirées en relief.",
  },
  {
    title: "Discuter votre projet",
    text: "David vous conseille sur le format, l'emplacement et les couleurs, et vous remet un devis ferme.",
  },
  {
    title: "Retirer une commande",
    text: "Remise en main propre à l'atelier, avec le certificat d'authenticité signé.",
  },
];

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

  const channels = [
    {
      Icon: WhatsAppIcon,
      label: "Réserver par WhatsApp",
      detail: "Le plus rapide",
      href: waLink("Bonjour David, je souhaite prendre rendez-vous pour visiter l'atelier de Barjols."),
      external: true,
    },
    {
      Icon: MailIcon,
      label: "Réserver par email",
      detail: site.email,
      href: `mailto:${site.email}?subject=${encodeURIComponent(visitSubject)}&body=${encodeURIComponent(visitBody)}`,
      external: false,
    },
    {
      Icon: PhoneIcon,
      label: "Appeler l'atelier",
      detail: site.phone,
      href: `tel:${site.phone.replace(/[^+\d]/g, "")}`,
      external: false,
    },
  ];

  return (
    <>
      <PageHero title="Venez à l'atelier">
        <p className="lead">
          Les toiles gagnent à être vues en vrai : matière, relief des collages, profondeur des
          couleurs. L'atelier de Barjols reçoit sur rendez-vous, pour choisir votre pièce, suivre
          une commande ou simplement rencontrer l'artiste.
        </p>
      </PageHero>

      {/* Prendre rendez-vous + infos pratiques */}
      <Section tone="papier" torn={19}>
        <div className="grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <h2 className="poster t-lg">Prendre rendez-vous</h2>
            <p className="soft mt-5 max-w-xl">
              Choisissez le canal qui vous convient. David confirme le créneau en personne, sous
              48 h au plus tard.
            </p>
            <div className="mt-8">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="row-link"
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span className="flex items-center gap-4 text-lg font-bold">
                    <c.Icon className="h-6 w-6 shrink-0" />
                    {c.label}
                  </span>
                  <span className="soft small break-all">{c.detail}</span>
                </a>
              ))}
            </div>
            <p className="soft small mt-6 max-w-xl">
              L'atelier est un lieu de travail : il ne reçoit que sur rendez-vous, en journée ou en
              fin de journée, selon l'avancement des toiles en cours.
            </p>
          </div>

          <div>
            <h2 className="poster t-lg">S'y rendre</h2>
            <address className="lead mt-5 not-italic">
              12 rue Pierre Curie
              <br />
              83670 Barjols, Var
            </address>
            <p className="soft mt-4">
              Œuvres exposées et en cours, discussion du projet, devis ferme sur place. La Provence
              verte fait une belle excursion : combinez la visite avec un déjeuner à Barjols.
            </p>
            <p className="mt-7">
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn">
                <MapPinIcon className="h-5 w-5" />
                Ouvrir dans Google Maps
              </a>
            </p>
          </div>
        </div>

        <ul className="grid-points mt-[clamp(4rem,9vw,7rem)]">
          {reasons.map((r) => (
            <li key={r.title} className="point">
              <h3 className="poster t-sm">{r.title}</h3>
              <p className="soft mt-2">{r.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Agenda : expositions et Portes Ouvertes */}
      <Section tone="jaune" torn={20} halftone>
        <h2 className="poster t-lg">Où voir les toiles prochainement</h2>
        {events.length > 0 ? (
          <div className="mt-10">
            {events.map((ev) => (
              <div key={ev.title + ev.dates} className="timeline-row">
                <p className="poster timeline-year">{ev.dates}</p>
                <div className="max-w-2xl">
                  <h3 className="text-xl font-bold leading-tight">{ev.title}</h3>
                  <p className="soft mt-2">
                    {ev.place}
                    {ev.note ? ` — ${ev.note}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose-block mt-8">
            <p className="lead">
              Chaque été, les artistes de Barjols ouvrent leurs ateliers le temps d'un week-end de
              mi-août : de 17 h à 21 h, accès libre, rue des Tanneurs et rue Pierre Curie.
              L'édition 2026 (15 et 16 août) s'est achevée par une démonstration de peinture en
              direct de David.
            </p>
            <p>
              Les prochaines dates (Portes Ouvertes 2027, salons, expositions) sont annoncées en
              premier sur{" "}
              <a href={site.social[0].href} target="_blank" rel="noopener noreferrer" className="link">
                Instagram {site.social[0].handle}
              </a>
              . Pour être sûr d'une visite, prenez rendez-vous.
            </p>
          </div>
        )}
      </Section>

      <Section tone="noir" torn={21}>
        <Faq />
      </Section>
    </>
  );
}
