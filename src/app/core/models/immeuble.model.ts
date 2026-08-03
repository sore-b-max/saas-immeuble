// ==============================================
// MODÈLE : Immeuble
// C'est la "fiche" d'un immeuble dans notre app
// ==============================================

export interface Immeuble {
  id: number;
  nom: string;          // Ex: "Résidence Les Palmiers"
  adresse: string;      // Ex: "Secteur 10, Ouagadougou"
  ville: string;        // Ex: "Ouagadougou"
  nombreEtages: number;
  nombreAppartements: number;
  proprietaireId: number;
  dateCreation: Date;
}
