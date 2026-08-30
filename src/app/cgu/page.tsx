import type { Metadata } from "next";
import { LegalH2, LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "CGU — David Drioton",
  description:
    "Conditions générales d'utilisation du site de David Drioton.",
};

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation (CGU)" updated="1 septembre 2026">
      <LegalH2>Objet</LegalH2>
      <p>
        Les présentes conditions générales d'utilisation définissent les
        modalités de navigation et d'utilisation du site de David Drioton,
        artiste peintre à Barjols. En accédant au site, vous acceptez sans
        réserve les présentes CGU.
      </p>

      <LegalH2>Contenu</LegalH2>
      <p>
        Le site présente les œuvres originales, la démarche artistique et les
        services de l'artiste (galerie, commandes sur mesure). Les œuvres et
        textes sont fournis à titre d'information et restent la propriété
        exclusive de l'artiste.
      </p>

      <LegalH2>Utilisation du site</LegalH2>
      <p>
        L'utilisateur s'engage à utiliser le site de manière licite et à ne pas
        porter atteinte au bon fonctionnement du service (surcharge, tentative
        d'accès non autorisé, reproduction non autorisée du contenu).
      </p>

      <LegalH2>Propriété intellectuelle</LegalH2>
      <p>
        La reproduction, la représentation ou la diffusion des œuvres et
        contenus du site, sans autorisation écrite de l'artiste, est
        strictement interdite et constitutive de contrefaçon.
      </p>

      <LegalH2>Responsabilité</LegalH2>
      <p>
        Le site ne saurait être tenu responsable d'une interruption, d'une
        indisponibilité temporaire ou d'un dysfonctionnement lié au réseau ou
        à l'hébergement. Les informations publiées (titres, techniques,
        dimensions, prix) sont susceptibles d'évoluer sans préavis.
      </p>

      <LegalH2>Modification des CGU</LegalH2>
      <p>
        Les présentes conditions peuvent être modifiées à tout moment. La
        version en vigueur est celle accessible en ligne.
      </p>

      <LegalH2>Droit applicable</LegalH2>
      <p>
        Les présentes CGU sont soumises au droit français. En cas de litige,
        les tribunaux français seront seuls compétents.
      </p>
    </LegalPage>
  );
}