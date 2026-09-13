"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Barre d'action fixe (mobile uniquement) : le chemin de conversion reste
 * toujours à portée de pouce — apparaît après un écran de défilement pour
 * ne pas gêner la découverte du hero.
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);

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
  }, []);

  return (
    <div
      className={`mobile-cta-bar ${visible ? "mobile-cta-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-md items-center gap-2 px-3 pb-3">
        <Link
          href="/order"
          tabIndex={visible ? 0 : -1}
          className="btn-accent flex-1 rounded-xl py-3 text-center text-sm font-bold shadow-[0_12px_34px_rgba(0,0,0,0.55)]"
        >
          Commander ma toile
        </Link>
        <Link
          href="/gallery"
          tabIndex={visible ? 0 : -1}
          className="rounded-xl border border-white/20 bg-[var(--ink-soft)]/95 py-3 text-center text-sm font-semibold text-white/85 shadow-[0_12px_34px_rgba(0,0,0,0.55)] backdrop-blur transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
          style={{ width: "6.5rem" }}
        >
          Galerie
        </Link>
      </div>
    </div>
  );
}
