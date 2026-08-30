import type { Metadata } from "next";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import {
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: "David Drioton — Artiste peintre · Provence (PACA)",
  description:
    "Atelier de David Drioton, artiste peintre pop art et contemporain à Barjols (Var, PACA). Découvrez ses œuvres et commandez une pièce sur mesure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="atelier-bg min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--ink)]/85 backdrop-blur">
            {/* Pop-art stripe accent */}
            <div
              aria-hidden
              className="h-1 w-full bg-gradient-to-r from-[var(--magenta)] via-[var(--amber)] to-[var(--teal)]"
            />
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-2 py-2.5 sm:px-4 sm:py-4">
              <Link href="/" className="shrink-0 leading-none">
                <span className="block text-sm font-black uppercase tracking-tight sm:text-2xl">
                  David <span className="accent-text">Drioton</span>
                </span>
                <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.3em] text-white/50 sm:block">
                  Artiste peintre · Provence
                </span>
              </Link>
              <NavLinks />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="relative z-20 border-t border-white/10 bg-[var(--ink)]/90 backdrop-blur">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <p className="text-xl font-black uppercase tracking-tight">
                  David <span className="accent-text">Drioton</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
                  Artiste peintre · Provence
                </p>
                <p className="mt-4 flex items-start gap-2 text-sm text-white/60">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" />
                  <span>{site.address}</span>
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Portes ouvertes des artistes de Barjols — pièces uniques, peintes à la main.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                  Contact
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>
                    <a
                      href={`tel:${site.phone.replace(/\./g, "")}`}
                      className="flex items-center gap-2 text-white/75 transition hover:text-white"
                    >
                      <PhoneIcon className="h-4 w-4 shrink-0 text-[var(--magenta)]" />
                      {site.phone}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${site.email}`}
                      className="flex items-center gap-2 break-all text-white/75 transition hover:text-white"
                    >
                      <MailIcon className="h-4 w-4 shrink-0 text-[var(--magenta)]" />
                      {site.email}
                    </a>
                  </li>
                  <li>
                    <a
                      href={site.social[0].href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white/75 transition hover:text-white"
                    >
                      <InstagramIcon className="h-4 w-4 shrink-0 text-[var(--magenta)]" />
                      {site.social[0].handle}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Socials */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                  Réseaux sociaux
                </h3>
                <div className="mt-4 flex gap-3">
                  {site.social.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                      aria-label={s.name}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white/70 transition hover:scale-105 hover:border-[var(--magenta)] hover:text-[var(--magenta)]"
                    >
                      <InstagramIcon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                  Navigation
                </h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    { href: "/", label: "Accueil" },
                    { href: "/artiste", label: "L'Artiste" },
                    { href: "/gallery", label: "Galerie" },
                    { href: "/order", label: "Commander" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-white/70 transition hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal bar */}
            <div className="border-t border-white/10">
              <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-white/40 sm:flex-row sm:text-left">
                <p>
                  © {new Date().getFullYear()} David Drioton — Tous droits réservés
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <Link href="/mentions-legales" className="transition hover:text-white">
                    Mentions légales
                  </Link>
                  <Link href="/cgu" className="transition hover:text-white">
                    CGU
                  </Link>
                  <Link href="/cgv" className="transition hover:text-white">
                    CGV
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
