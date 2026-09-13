"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Page-transition system for static hosting:
 *  - on navigation start, a three-panel pop-art curtain sweeps across the
 *    viewport (pure CSS animation, no routing hacks) ;
 *  - the new page mounts with a soft rise-in.
 *
 * The App Router gives no "navigation started" event, so we listen for link
 * clicks (and form-less popstate) and play the curtain *in parallel with*
 * the client-side navigation — the visual result is a cover/uncover wipe.
 */
export function PageTransition() {
  const pathname = usePathname();
  const [curtainPlay, setCurtainPlay] = useState(false);
  const firstRender = useRef(true);

  // Curtain sweep when a navigation leaves the current page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // Any pathname change means a page swap: play the uncover half of the
    // curtain over the freshly mounted page.
    setCurtainPlay(true);
    const t = setTimeout(() => setCurtainPlay(false), 750);
    return () => clearTimeout(t);
  }, [pathname]);

  // Listen for internal link clicks to play the "cover" half immediately.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:"))
        return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname) setCurtainPlay(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <>
      <div className={`page-enter ${curtainPlay ? "" : ""}`} key={pathname} aria-hidden />
      {curtainPlay ? (
        <div className="transition-curtain play" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      ) : null}
    </>
  );
}
