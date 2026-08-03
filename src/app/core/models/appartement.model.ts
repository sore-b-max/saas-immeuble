// ==============================================
// MODÈLE : Appartement
// ==============================================

export interface Appartement {
  id: number;
  numero: string;         // Ex: "A1", "B2", "101"
  superficie: number;     // En m²
  loyer: number;          // Loyer mensuel en FCFA
  immeubleId: number;
  statut: 'occupe' | 'vacant' | 'en_travaux';
  locataireId?: number;   // Optionnel (vacant si absent)
}
