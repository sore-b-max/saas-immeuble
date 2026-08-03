export interface BailleurInfo {
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  logoBase64?: string;
}

export interface LocataireInfo {
  nomComplet: string;
  telephone: string;
  appartement: string;
}

export interface QuittanceData {
  periode: string;
  datePaiement: string | Date;
  modePaiement: string;
  reference: string;
  montant: number;
  bailleur: BailleurInfo;
  locataire: LocataireInfo;
}
