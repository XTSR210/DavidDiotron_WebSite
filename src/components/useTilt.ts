"use client";

import { useRef } from "react";

/**
 * 3D tilt-on-hover for artwork cards (progressive enhancement):
 * the card leans toward the pointer like a canvas catching gallery light.
 * Disabled automatically on touch devices and via prefers-reduced-motion.
 */
export function useTilt(maxDeg = 7) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Ignore touch drags (pointer events surface as touch on mobile).
    const pointerType =
      (e as unknown as { pointerType?: string }).pointerType ??
      (window.matchMedia("(hover: none)").matches ? "touch" : "mouse");
    if (pointerType === "touch") return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(
      px * maxDeg
    ).toFixed(2)}deg) translateZ(6px)`;
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  }

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}
