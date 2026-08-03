// ==============================================
// MODÈLE : Charge commune
// Factures d'eau, électricité à répartir
// ==============================================

export interface Charge {
  id: number;
  immeubleId: number;
  typeCharge: 'eau' | 'electricite' | 'entretien' | 'autre';
  montantTotal: number;       // Montant global de la facture
  periodeFacture: string;     // Ex: "2026-08"
  dateFacture: Date;
  modeRepartition: 'egal' | 'superficie' | 'occupants';
  repartitions?: ChargeRepartition[];
}

export interface ChargeRepartition {
  appartementId: number;
  montant: number;            // Quote-part de cet appartement
  statut: 'paye' | 'en_attente';
}
