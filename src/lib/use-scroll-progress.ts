import { useEffect, type RefObject } from "react";

/** Les scènes ne s'animent que si le visiteur n'a pas demandé moins de mouvement. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Écrit la progression de défilement d'une scène dans la variable CSS --p (0 à 1).
 * Tout le mouvement est ensuite décrit en CSS à partir de --p (voir globals.css).
 *
 * - "pin"  : scène épinglée (sticky). 0 quand elle se fige, 1 quand elle se libère.
 * - "pass" : scène qui traverse l'écran. 0 quand elle entre par le bas, 1 quand elle sort par le haut.
 *
 * `onProgress` reçoit la valeur lissée, pour les rares états qui ne s'expriment pas en CSS.
 * En mouvement réduit, rien n'est écrit : le CSS affiche alors un état fixe.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  mode: "pin" | "pass",
  onProgress?: (p: number) => void
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const motion = window.matchMedia(MOTION_OK);
    const root = document.documentElement;
    let current = -1;
    let target = 0;
    let raf = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw =
        mode === "pin"
          ? -rect.top / Math.max(1, rect.height - vh)
          : (vh - rect.top) / (vh + rect.height);
      target = Math.min(1, Math.max(0, raw));
    };
    const tick = () => {
      // Lissage : la valeur rattrape la cible, pour un mouvement souple à la molette.
      current = current < 0 ? target : current + (target - current) * 0.16;
      if (Math.abs(target - current) < 0.0005) current = target;
      el.style.setProperty("--p", current.toFixed(4));
      onProgress?.(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!motion.matches) return;
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onModeChange = () => {
      // Le CSS n'anime que sous <html data-anim> (posé avant le premier affichage par le layout).
      root.toggleAttribute("data-anim", motion.matches);
      if (motion.matches) {
        onScroll();
      } else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        current = -1;
        el.style.removeProperty("--p");
      }
    };

    onModeChange();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    motion.addEventListener("change", onModeChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", onModeChange);
      if (raf) cancelAnimationFrame(raf);
    };
    // `onProgress` est volontairement lu à chaque image, sans relancer l'effet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, mode]);
}
