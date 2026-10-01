import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Requis pour l'export statique.
export const dynamic = "force-static";

/** Laisse les robots explorer le site, sauf l'espace Atelier. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
