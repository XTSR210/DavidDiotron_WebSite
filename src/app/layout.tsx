import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BackToTop } from "@/components/BackToTop";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { assetPath, site } from "@/lib/site";
import "./globals.css";

// Une seule famille pour tout le site : étroite et grasse pour les titres
// (axe de largeur), normale pour le texte courant.
const brico = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-brico",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0a0c",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "David Drioton — Artiste peintre · Provence (PACA)",
    template: "%s — David Drioton",
  },
  description:
    "Atelier de David Drioton, artiste peintre pop art et contemporain à Barjols (Var, PACA). Découvrez ses œuvres et commandez une pièce sur mesure.",
  icons: {
    icon: assetPath("/icon.svg"),
    apple: assetPath("/apple-touch-icon.png"),
  },
  manifest: assetPath("/manifest.webmanifest"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "David Drioton — Artiste peintre",
    title: "David Drioton — Artiste peintre pop art · Provence",
    description:
      "Pop art peint à la main à Barjols (Var). Œuvres uniques, collages d'affiches, commandes sur mesure au centimètre près.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "David Drioton — Artiste peintre pop art · Barjols, Provence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "David Drioton — Artiste peintre pop art · Provence",
    description:
      "Pop art peint à la main à Barjols (Var). Œuvres uniques et commandes sur mesure.",
    images: ["/og-image.jpg"],
  },
};

// Posé avant le premier affichage : le CSS n'anime les scènes que sous
// <html data-anim>, c'est-à-dire avec JavaScript et sans « mouvement réduit ».
const ANIM_SCRIPT =
  "try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches)document.documentElement.setAttribute('data-anim','')}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={brico.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANIM_SCRIPT }} />
      </head>
      <body>
        <a href="#contenu" className="skip">
          Aller au contenu
        </a>
        {/* Données structurées JSON-LD (SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ArtGallery",
              name: "Atelier David Drioton",
              description:
                "Artiste peintre pop art à Barjols (Var, PACA). Œuvres uniques peintes à la main, commandes sur mesure.",
              url: site.url,
              image: `${site.url}/artworks/art-01.jpg`,
              address: {
                "@type": "PostalAddress",
                streetAddress: "12 rue Pierre Curie",
                addressLocality: "Barjols",
                postalCode: "83670",
                addressRegion: "Var (PACA)",
                addressCountry: "FR",
              },
              sameAs: site.social.map((s) => s.href),
            }),
          }}
        />
        <SiteHeader />
        <main id="contenu" className="site-main">
          {children}
        </main>
        <SiteFooter />
        <BackToTop />
        <MobileCtaBar />
      </body>
    </html>
  );
}
