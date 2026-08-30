import type { Metadata } from "next";
import { LegalH2, LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "CGV — David Drioton",
  description:
    "Conditions générales de vente des œuvres de David Drioton.",
};

export default function CgvPage() {
  return (
    <LegalPage title="Conditions générales de vente (CGV)" updated="1 septembre 2026">
      <LegalH2>Objet</LegalH2>
      <p>
        Les présentes conditions générales de vente régissent les commandes de
        pièces sur mesure et l'acquisition d'œuvres originales de David
        Drioton, artiste peintre à Barjols (Var, PACA). Elles prévalent sur
        tout autre document.
      </p>

      <LegalH2>Œuvres et pièces sur mesure</LegalH2>
      <p>
        Chaque œuvre est une pièce originale, peinte à la main à l'atelier, et
        signée. Une création sur mesure est réalisée sur devis : format
        (largeur × hauteur en centimètres), technique et prix sont confirmés
        avant lancement.
      </p>

      <LegalH2>Tarification</LegalH2>
      <p>
        Le prix d'une pièce sur mesure est calculé selon la surface en
        centimètres carrés (cm²) multipliée par le tarif au cm² en vigueur,
        indiqué sur la page Commande. Le prix affiché s'entend toutes taxes
        comprises, hors frais de livraison éventuels.
      </p>

      <LegalH2>Commande et paiement</LegalH2>
      <p>
        La commande est confirmée par l'envoi du formulaire ou via l'atelier.
        Le paiement intervient lors de la conclusion de la vente. Après
        enregistrement, l'atelier contacte le client pour confirmer les
        modalités (délai, livraison, retrait à l'atelier).
      </p>

      <LegalH2>Livraison et retrait</LegalH2>
      <p>
        Le retrait à l'atelier de Barjols est possible sur rendez-vous. La
        livraison peut être organisée sur devis selon la destination. Les
        délais indicatifs sont communiqués lors de la confirmation de commande.
      </p>

      <LegalH2>Droit de rétractation</LegalH2>
      <p>
        Conformément à la réglementation, pour les biens commandés à distance,
        le client dispose d'un délai légal de rétractation, sauf pour les
        œuvres réalisées selon les spécifications du client (pièces sur
        mesure), qui ne peuvent être retournées une fois entamées.
      </p>

      <LegalH2>Garantie et responsabilité</LegalH2>
      <p>
        Les œuvres sont livrées en parfait état. En cas de dommage lié au
        transport, le client doit le signaler dans les meilleurs délais.
        L'artiste s'engage sur l'authenticité et l'unicité de chaque pièce.
      </p>

      <LegalH2>Contact</LegalH2>
      <p>
        Pour toute question relative à une commande : {site.phone} ou{" "}
        {site.email}.
      </p>
    </LegalPage>
  );
}