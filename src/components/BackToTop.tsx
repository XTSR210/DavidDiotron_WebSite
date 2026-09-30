"use client";

import { useEffect, useState } from "react";

/**
 * Bouton « retour en haut » (ordinateur) : apparaît après deux écrans de
 * défilement. Sur téléphone, la barre d'action occupe déjà le bas de l'écran.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => setVisible(window.scrollY > window.innerHeight * 2);
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
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Revenir en haut de la page"
      className={`to-top ${visible ? "is-visible" : ""}`}
    >
      ↑
    </button>
  );
}
