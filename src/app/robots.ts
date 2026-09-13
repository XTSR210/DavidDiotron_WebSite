import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Requis pour l'export statique (GitHub Pages).
export const dynamic = "force-static";

/** Laisse les robots explorer tout le site. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
