// ==============================================
// MODÈLE : Locataire
// C'est la "fiche" d'un locataire dans notre app
// ==============================================

export interface Locataire {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;      // Ex: "+226 70 00 00 00"
  email?: string;         // Optionnel (pas tous ont un email)
  numeroCNI: string;      // Carte nationale d'identité
  appartementId: number;
  dateEntree: Date;
  estActif: boolean;      // true = locataire en place
}
