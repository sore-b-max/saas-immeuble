// ==============================================
// MODÈLE : Travaux
// Suivi des interventions dans les appartements
// ==============================================

export interface Travaux {
  id: number;
  titre: string;              // Ex: "Fuite robinet cuisine"
  description: string;
  cout: number;               // Coût en FCFA
  appartementId: number;
  dateSignalement: Date;
  dateRealisation?: Date;
  statut: 'signale' | 'en_cours' | 'termine';
  photos?: string[];          // URLs des photos (stockage cloud)
}
