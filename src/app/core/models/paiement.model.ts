// ==============================================
// MODÈLE : Paiement de loyer
// ==============================================

export interface Paiement {
  id: number;
  appartementId: number;
  locataireId: number;
  montant: number;        // En FCFA
  moisConcerne: string;   // Ex: "2026-08" (Août 2026)
  datePaiement?: Date;
  modePaiement: 'orange_money' | 'moov_money' | 'especes' | 'virement';
  statut: 'paye' | 'en_attente' | 'en_retard' | 'impaye';
  reference?: string;     // Référence transaction mobile money
  rappelEnvoye?: boolean; // Indique si un rappel a été envoyé au locataire
}
