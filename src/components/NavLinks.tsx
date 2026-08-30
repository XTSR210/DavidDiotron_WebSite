"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Accueil" },
  { href: "/artiste", label: "L'Artiste" },
  { href: "/gallery", label: "Galerie" },
  { href: "/order", label: "Commander" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1.5">
      {nav.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "group relative rounded-lg px-1 py-1.5 text-xs font-semibold tracking-wide transition sm:px-4 sm:py-2 sm:text-lg " +
              (active
                ? "text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white")
            }
          >
            {item.label}
            <span
              className={
                "absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full transition sm:inset-x-4 " +
                (active
                  ? "bg-gradient-to-r from-[var(--magenta)] to-[var(--amber)]"
                  : "bg-transparent group-hover:bg-white/40")
              }
            />
          </Link>
        );
      })}
    </nav>
  );
}
