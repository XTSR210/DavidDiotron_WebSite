"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { site, waLink } from "@/lib/site";

const NAV = [
  { href: "/artiste", label: "L'artiste" },
  { href: "/gallery", label: "Galerie" },
  { href: "/rendez-vous", label: "Rendez-vous" },
];

/**
 * En-tête fixe : transparent au-dessus du mur d'accueil, plein dès qu'on
 * défile. Sous 900 px, la navigation passe dans un menu plein écran.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le menu se referme à chaque changement de page.
  useEffect(() => setOpen(false), [pathname]);

  // Menu ouvert : page figée derrière, Échap pour fermer, fermeture si l'écran s'élargit.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 900px)");
    const onWide = () => wide.matches && setOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const current = (href: string) => (pathname.startsWith(href) ? "page" : undefined);

  return (
    <>
      <header className={`site-header ${solid ? "is-solid" : ""} ${open ? "is-open" : ""}`}>
        <div className="site-header-in">
          <Link href="/" className="brand" aria-label="David Drioton, accueil">
            David <span>Drioton</span>
          </Link>

          <nav className="nav-desktop" aria-label="Navigation principale">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link" aria-current={current(item.href)}>
                {item.label}
              </Link>
            ))}
            <Link href="/order" className="btn btn-sm">
              Commander une toile
            </Link>
          </nav>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="menu-panel"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Fermer" : "Menu"}
            <span className="menu-bars" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div id="menu-panel" className={`menu-panel ${open ? "is-open" : ""}`} inert={!open}>
        <nav aria-label="Menu">
          {[{ href: "/", label: "Accueil" }, ...NAV, { href: "/order", label: "Commander" }].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="menu-big"
              style={{ "--i": i } as React.CSSProperties}
              aria-current={item.href === "/" ? (pathname === "/" ? "page" : undefined) : current(item.href)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-3">
          <a
            href={waLink("Bonjour David, j'aimerais discuter d'une toile.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-wa"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <a href={site.social[0].href} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">
            <InstagramIcon className="h-4 w-4" />
            {site.social[0].handle}
          </a>
        </div>
      </div>
    </>
  );
}
