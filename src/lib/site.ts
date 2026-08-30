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
  location: "Barjols, Var (PACA)",
  address: "Atelier de Barjols — 83670 Barjols, Var (PACA), France",

  // ── À compléter ───────────────────────────────────────────────
  phone: "+33 6 00 00 00 00", // TODO: vrai numéro de l'atelier
  email: "contact@daviddrioton.fr", // TODO: vraie adresse email
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