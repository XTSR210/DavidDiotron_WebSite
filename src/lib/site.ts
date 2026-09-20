/**
 * Coordonnées & réseaux du site — tout se modifie ici, au même endroit.
 *
 * ⚠️ À PERSONNALISER par l'artiste :
 *   - remplacez `phone` et `email` par les vraies coordonnées,
 *   - ajoutez d'autres réseaux dans `social` (Facebook, Pinterest, …).
 */
export const site = {
  name: "David Drioton",
  tagline: "Artiste peintre · Provence",
  /** URL publique du site (utilisée pour le SEO / Open Graph). */
  url: "https://xtsr210.github.io/DavidDiotron_WebSite",
  location: "Barjols, Var (PACA)",
  /** Adresse réelle de l'atelier (bio Instagram + Saatchi Art). */
  address: "12 rue Pierre Curie — 83670 Barjols, Var (PACA)",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=12+rue+Pierre+Curie+83670+Barjols",

  // ── À compléter ───────────────────────────────────────────────
  phone: "+33 6 00 00 00 00", // TODO: vrai numéro de l'atelier
  email: "contact@daviddrioton.fr", // TODO: vraie adresse email
  /** Numéro WhatsApp (format international) — discussion directe client ↔ atelier. */
  whatsapp: "+33600000000", // TODO: même numéro, format international
  // ──────────────────────────────────────────────────────────────

  social: [
    {
      name: "Instagram",
      href: "https://www.instagram.com/daviddrioton/",
      handle: "@daviddrioton",
    },
  ],
};

/** Année courante pour le copyright. */
export const currentYear = () => new Date().getFullYear();

/**
 * Lien WhatsApp « clic-to-chat » avec message pré-rempli — le canal de
 * discussion directe entre le client et l'atelier (site 100 % statique).
 */
export function waLink(text: string): string {
  const num = site.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/**
 * Préfixe un chemin d'image (ex. "/artworks/art-01.jpg") avec le basePath
 * de GitHub Pages lors du build de déploiement, pour que les images se
 * retrouvent au bon endroit : https://<user>.github.io/DavidDiotron_WebSite/…
 */
export function assetPath(p: string): string {
  if (process.env.GITHUB_PAGES === "true" && p.startsWith("/")) {
    return "/DavidDiotron_WebSite" + p;
  }
  return p;
}