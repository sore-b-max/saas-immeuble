// ==============================================
// MODÈLE : Charge commune
// Factures d'eau, électricité à répartir
// ==============================================

export type TypeCharge = 'eau' | 'electricite' | 'entretien' | 'gardiennage' | 'autre';
export type CleRepartition = 'egal' | 'superficie' | 'occupants';

export interface Charge {
  id: number;
  immeubleId: number;
  typeCharge: TypeCharge;
  montantTotal: number;       // Montant global de la facture
  periodeFacture: string;     // Ex: "2026-08"
  dateFacture: Date;
  modeRepartition: CleRepartition;
  repartitions?: ChargeRepartition[];
}

export interface ChargeRepartition {
  appartementId: number;
  montant: number;            // Quote-part de cet appartement
  statut: 'paye' | 'en_attente';
}
