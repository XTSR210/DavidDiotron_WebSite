"use client";

import { useEffect, useState } from "react";

/**
 * Bouton « retour en haut » : apparaît après un écran de défilement,
 * remonte en douceur. Discret, n'apparaît jamais par-dessus le contenu
 * utile (coin bas droite, sous le footer il reste accessible).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    function check() {
      setVisible(window.scrollY > window.innerHeight);
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    }
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Revenir en haut de la page"
      className="pop-in fixed bottom-5 right-5 z-[90] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[var(--ink-soft)]/90 text-lg text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--amber)] hover:text-[var(--amber)]"
    >
      ↑
    </button>
  );
}
