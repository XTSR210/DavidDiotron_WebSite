import type { Metadata } from "next";
import Link from "next/link";

// Espace privé : jamais dans les moteurs de recherche.
export const metadata: Metadata = {
  title: "Atelier",
  robots: { index: false, follow: false },
};

/** Habillage de l'espace Atelier : une barre sobre, sans la navigation du site. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bloc bloc-noir border-b border-[var(--line)]">
        <div className="wrap flex h-16 items-center justify-between gap-6">
          <Link href="/" className="brand" aria-label="David Drioton, retour au site">
            David <span>Drioton</span>
          </Link>
          <span className="flex items-center gap-6">
            <span className="poster t-sm hidden text-[var(--fg-soft)] sm:inline">Atelier</span>
            <a href="/" target="_blank" rel="noopener" className="link small">
              Voir le site
            </a>
          </span>
        </div>
      </header>
      <main id="contenu" className="bg-[var(--papier)]">
        {children}
      </main>
    </>
  );
}
