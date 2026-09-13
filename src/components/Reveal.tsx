"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealTag = "div" | "section" | "article" | "figure" | "header" | "li" | "span";

/**
 * Scroll-reveal wrapper: its content starts slightly shifted + transparent,
 * then rises into place the first time it enters the viewport. `delay`
 * staggers siblings for a choreographed cascade. Respects
 * prefers-reduced-motion (handled in CSS).
 *
 * Two complementary triggers so nothing can stay hidden:
 *  1. IntersectionObserver — efficient, catches normal scrolling ;
 *  2. a passive scroll check — catches instant jumps (keyboard End, anchor
 *     links, fast flicks) where an element goes from below to above the
 *     viewport between two frames and never "intersects".
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  as = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Where the content slides in from. */
  direction?: "up" | "left" | "right";
  as?: RevealTag;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Progressive enhancement: without IntersectionObserver, show content.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    let revealed = false;

    function reveal() {
      if (revealed || !el) return;
      revealed = true;
      el.classList.add("is-visible");
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            reveal();
            return;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    // Fallback for jump-scrolls: any element whose top edge sits above the
    // viewport fold is revealed, even if IO never saw it intersect.
    let ticking = false;
    function onScroll() {
      if (revealed || ticking || !el) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (revealed || !el) return;
        if (el.getBoundingClientRect().top < window.innerHeight) reveal();
      });
    }

    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Safety net (resize-triggered layout shifts, print, etc.)
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const dirClass =
    direction === "left" ? "reveal-left" : direction === "right" ? "reveal-right" : "";

  const Tag = as as "div";

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${dirClass} ${className}`}
      style={{ ...style, "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
