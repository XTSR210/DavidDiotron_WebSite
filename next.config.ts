import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export 100 % statique, servi par Vercel (aucun serveur nécessaire).
  output: "export",
  // Chaque page devient <page>/index.html : adresses propres en /galerie/.
  trailingSlash: true,
  images: {
    // Les toiles sont déjà légères (400 px) : pas d'optimisation à la volée.
    unoptimized: true,
  },
  // Cache le widget de développement Next.js qui flottait sur le coin
  // bas gauche et masquait les mentions légales du footer sur mobile.
  devIndicators: false,
};

export default nextConfig;
