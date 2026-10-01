import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BackToTop } from "@/components/BackToTop";
import { MobileCtaBar } from "@/components/MobileCtaBar";

/** Habillage des pages publiques (l'espace Atelier a le sien). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="site-main">
        {children}
      </main>
      <SiteFooter />
      <BackToTop />
      <MobileCtaBar />
    </>
  );
}
