import type { NextConfig } from "next";

// GitHub Pages sert le site sous https://<user>.github.io/<repo>/.
// Le chemin de base n'est appliqué que lors du build de déploiement
// (variable GITHUB_PAGES définie dans le workflow GitHub Actions) ;
// en local (npm run dev), tout fonctionne normalement à la racine.
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/DavidDiotron_WebSite" : "";

const nextConfig: NextConfig = {
  // Export 100 % statique — compatible GitHub Pages (pas de serveur).
  output: "export",
  basePath,
  assetPrefix: isGithubPages ? "/DavidDiotron_WebSite/" : undefined,
  images: {
    // GitHub Pages ne peut pas optimiser les images à la volée.
    unoptimized: true,
  },
  // Cache le widget de développement Next.js qui flottait sur le coin
  // bas gauche et masquait les mentions légales du footer sur mobile.
  devIndicators: false,
};

export default nextConfig;
