"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Pages où la barre gênerait : on y commande déjà, ou c'est l'espace privé. */
const HIDDEN_ON = ["/order", "/admin"];

/**
 * Barre d'action fixe (téléphone et tablette en portrait) : commander reste à
 * portée de pouce. Elle n'apparaît qu'après un écran de défilement, pour
 * laisser le mur d'accueil respirer.
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const hidden = HIDDEN_ON.some((p) => pathname.startsWith(p));

  useEffect(() => {
    let raf = 0;
    const check = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (hidden) return null;

  return (
    <div className={`mobile-cta-bar ${visible ? "is-visible" : ""}`} inert={!visible}>
      <Link href="/order" className="btn btn-sm flex-1">
        Commander une toile
      </Link>
      <Link href="/gallery" className="btn btn-sm btn-ghost">
        Galerie
      </Link>
    </div>
  );
}
