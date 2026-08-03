export interface Bail {
  id: number;
  locataireId: number;
  appartementId: number;
  dateDebut: Date | string;
  dateFin?: Date | string;
  montantLoyerBase: number;
  montantCharges: number;
  montantCaution: number;
  statut: 'actif' | 'resilie' | 'en_attente';
  dateCreation: Date;
}
