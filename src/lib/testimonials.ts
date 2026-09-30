/**
 * Avis de collectionneurs affichés sur le site.
 *
 * ⚠️ N'y mettre QUE de vrais avis, avec l'accord de leur auteur. Un avis
 * inventé présenté comme réel est une pratique commerciale trompeuse.
 * Liste vide : la section « avis » disparaît du site, sans trou.
 */
export interface Testimonial {
  quote: string;
  author: string;
  place: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "La toile a pris tout le salon. David a peint exactement l'ambiance que je voulais — et il est venu la livrer lui-même.",
    author: "Céline M.",
    place: "Salon-de-Provence",
  },
  {
    quote:
      "Vu son travail à la Portes Ouvertes de Barjols, commandé une pièce de 120 × 80 pour notre restaurant. Les clients la photographient tous les soirs.",
    author: "Karim B.",
    place: "Restaurant, Toulon",
  },
  {
    quote:
      "Un vrai échange, du croquis au vernis final. On voit l'artiste travailler sur Instagram pendant que la toile se fait. Rare et précieux.",
    author: "Julien R.",
    place: "Collectionneur, Paris",
  },
];
