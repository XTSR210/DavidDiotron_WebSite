import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Requis pour l'export statique (GitHub Pages).
export const dynamic = "force-static";

/** Sitemap pour les moteurs de recherche (GitHub Pages inclus). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { path: "", priority: 1 },
    { path: "gallery", priority: 0.9 },
    { path: "artiste", priority: 0.8 },
    { path: "order", priority: 0.8 },
    { path: "mentions-legales", priority: 0.2 },
    { path: "cgu", priority: 0.2 },
    { path: "cgv", priority: 0.2 },
  ];
  return pages.map((p) => ({
    url: `${site.url}/${p.path}`.replace(/\/$/, ""),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p.priority,
  }));
}
