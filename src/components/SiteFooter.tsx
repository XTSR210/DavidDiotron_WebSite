import Link from "next/link";
import { ProjectStrip } from "@/components/commercial";
import { BrushIcon } from "@/components/icons";
import { TornEdge } from "@/components/TornEdge";
import { site } from "@/lib/site";

const PAGES = [
  { href: "/", label: "Accueil" },
  { href: "/artiste", label: "L'artiste" },
  { href: "/gallery", label: "Galerie" },
  { href: "/rendez-vous", label: "Rendez-vous à l'atelier" },
  { href: "/order", label: "Commander une toile" },
];

const LEGAL = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/cgv", label: "CGV" },
];

export function SiteFooter() {
  return (
    <footer className="bloc bloc-noir overflow-x-clip pb-24 pt-[clamp(3.5rem,8vw,6rem)] min-[900px]:pb-10">
      <TornEdge seed={23} />
      <div className="wrap">
        <ProjectStrip />

        <div className="mt-[clamp(3rem,7vw,5rem)] grid grid-cols-1 gap-x-10 gap-y-10 border-t-2 border-[var(--fg)] pt-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h2 className="poster t-sm">L'atelier</h2>
            <address className="soft mt-4 not-italic">
              12 rue Pierre Curie
              <br />
              83670 Barjols, Var
            </address>
            <p className="mt-3">
              <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="link">
                Ouvrir le plan
              </a>
            </p>
            <p className="soft small mt-4">Visites sur rendez-vous : c'est un lieu de travail.</p>
          </div>

          <div>
            <h2 className="poster t-sm">Contact</h2>
            <ul className="mt-4 space-y-2">
              <li>
                <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="hover:text-[var(--jaune)]">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="break-all hover:text-[var(--jaune)]">
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.social[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--jaune)]"
                >
                  Instagram {site.social[0].handle}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Pied de page">
            <h2 className="poster t-sm">Le site</h2>
            <ul className="mt-4 space-y-2">
              {PAGES.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[var(--jaune)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <p className="poster footer-mark mt-[clamp(3rem,7vw,5rem)]" aria-hidden="true">
        David Drioton
      </p>

      <div className="wrap small soft mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 min-[900px]:pr-20">
        <p>© {new Date().getFullYear()} David Drioton. Tous droits réservés.</p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LEGAL.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-[var(--fg)]">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            {/* Entrée discrète de l'artiste vers son panneau privé. */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 hover:text-[var(--fg)]"
              title="Atelier (privé)"
            >
              <BrushIcon className="h-4 w-4" />
              Atelier
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
