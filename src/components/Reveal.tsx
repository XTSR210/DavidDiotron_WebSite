"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type RevealTag = "div" | "section" | "article" | "figure" | "header" | "li" | "span";

/* ------------------------------------------------------------------ */
/* Shared reveal ticker — one rAF loop for every Reveal on the page.   */
/* Event-free by design: programmatic jumps, anchors and flick scrolls */
/* all behave the same, whatever the browser fires (or not).           */
/* The loop runs only while elements remain hidden, then stops.        */
/* ------------------------------------------------------------------ */

type Pending = { el: HTMLElement; reveal: () => void };

const pending = new Set<Pending>();
let rafId: number | null = null;

function checkAll() {
  const vh = window.innerHeight;
  for (const item of [...pending]) {
    // Reveal as soon as the top edge is above the fold — covers content
    // entering the viewport AND content already scrolled past.
    if (item.el.getBoundingClientRect().top < vh - 24) {
      pending.delete(item);
      item.reveal();
    }
  }
  rafId = pending.size > 0 ? requestAnimationFrame(checkAll) : null;
}

function subscribe(item: Pending) {
  pending.add(item);
  if (rafId === null) rafId = requestAnimationFrame(checkAll);
}

function unsubscribe(item: Pending) {
  pending.delete(item);
  if (pending.size === 0 && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Scroll-reveal wrapper: its content starts slightly shifted + transparent,
 * then rises into place the first time it enters the viewport. `delay`
 * staggers siblings for a choreographed cascade. Respects
 * prefers-reduced-motion (handled in CSS).
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

    const item: Pending = {
      el,
      reveal: () => el.classList.add("is-visible"),
    };

    subscribe(item);
    return () => unsubscribe(item);
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
