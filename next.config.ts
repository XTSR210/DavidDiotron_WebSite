import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages du site générées à l'avance et régénérées dès que l'atelier
  // enregistre (étiquette de cache « artworks ») ; l'API de l'atelier tourne
  // en fonctions Vercel.
  trailingSlash: true,
  images: {
    // Les toiles sont déjà préparées à la bonne taille : pas d'optimisation à la volée.
    unoptimized: true,
  },
  // Cache le widget de développement Next.js qui flottait sur le coin
  // bas gauche et masquait les mentions légales du footer sur mobile.
  devIndicators: false,
};

export default nextConfig;
