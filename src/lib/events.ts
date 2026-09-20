/**
 * Agenda de l'atelier — expositions, salons, Portes Ouvertes.
 *
 * ⚠️ Renseigner les vrais événements ici (les dates sont ensuite visibles
 * sur la page Rendez-vous). Laisser vide : la section affiche alors un
 * renvoi vers Instagram.
 */
export interface AtelierEvent {
  /** Nom de l'événement, ex. « Portes Ouvertes des artistes de Barjols ». */
  title: string;
  /** Dates affichées, ex. « 14 – 16 novembre 2026 ». */
  dates: string;
  /** Lieu, ex. « Atelier de Barjols (Var) ». */
  place: string;
  /** Note libre (horaires, entrée libre…). */
  note?: string;
}

export const events: AtelierEvent[] = [
  // Exemple de structure :
  // { title: "Portes Ouvertes des artistes de Barjols", dates: "…", place: "Barjols (Var)", note: "Entrée libre" },
];
