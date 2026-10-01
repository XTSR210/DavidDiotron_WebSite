import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Requis pour l'export statique.
export const dynamic = "force-static";

/** Sitemap pour les moteurs de recherche. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { path: "", priority: 1 },
    { path: "gallery", priority: 0.9 },
    { path: "artiste", priority: 0.8 },
    { path: "order", priority: 0.8 },
    { path: "rendez-vous", priority: 0.7 },
    { path: "mentions-legales", priority: 0.2 },
    { path: "cgu", priority: 0.2 },
    { path: "cgv", priority: 0.2 },
  ];
  return pages.map((p) => ({
    url: p.path ? `${site.url}/${p.path}/` : `${site.url}/`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p.priority,
  }));
}
