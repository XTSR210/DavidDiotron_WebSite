import type { Metadata } from "next";
import { LegalH2, LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales — David Drioton",
  description: "Mentions légales du site de l'artiste peintre David Drioton.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated="1 septembre 2026">
      <LegalH2>Éditeur du site</LegalH2>
      <p>
        Le présent site est édité par :
        <br />
        <strong className="text-white">{site.name}</strong>, artiste peintre
        reconnu, exerçant à l'atelier de Barjols (Var).
        <br />
        Adresse : {site.address}.
      </p>

      <LegalH2>Directeur de la publication</LegalH2>
      <p>David Drioton, artiste peintre et éditeur du présent site.</p>

      <LegalH2>Contact</LegalH2>
      <p>
        Téléphone : {site.phone}
        <br />
        Email : {site.email}
      </p>

      <LegalH2>Hébergement</LegalH2>
      <p>
        L'hébergement du site sera précisé lors de sa mise en ligne. Tant qu'il
        fonctionne en local (localhost), il n'est pas accessible au public.
      </p>

      <LegalH2>Propriété intellectuelle</LegalH2>
      <p>
        L'ensemble des éléments du site (textes, œuvres, visuels, logos,
        photographies, maquette) est protégé par le droit d'auteur et le droit
        de la propriété intellectuelle. Toute reproduction, représentation,
        modification, publication, adaptation totale ou partielle, quel que
        soit le procédé, est interdite sauf autorisation écrite préalable de
        l'artiste. Les œuvres exposées sont des pièces originales et uniques.
      </p>

      <LegalH2>Données personnelles</LegalH2>
      <p>
        Les informations recueillies dans le cadre d'une commande (nom, email,
        éventuellement téléphone) servent uniquement au traitement de celle-ci
        et à la relation avec l'artiste. Elles ne sont ni vendues, ni cédées à
        des tiers.
      </p>

      <LegalH2>Responsabilité</LegalH2>
      <p>
        Le site s'efforce d'assurer l'exactitude des informations publiées mais
        ne peut être tenu responsable des éventuelles omissions ou erreurs. Les
        liens externes vers d'autres sites (réseaux sociaux notamment) ne
        relèvent pas de la responsabilité de l'éditeur.
      </p>
    </LegalPage>
  );
}