import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Cache le widget de développement Next.js qui flottait sur le coin
  // bas gauche et masquait les mentions légales du footer sur mobile.
  devIndicators: false,
};

export default nextConfig;
