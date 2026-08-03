import { Injectable, signal } from '@angular/core';
import { Immeuble } from '../models/immeuble.model';

@Injectable({
  providedIn: 'root'
})
export class ImmeubleService {
  // Simule les paramètres de l'immeuble récupérés depuis le backend
  private immeubleState = signal<Immeuble>({
    id: 1,
    nom: 'Résidence Les Palmiers',
    adresse: 'Secteur 10, Ouaga 2000, Ouagadougou',
    ville: 'Ouagadougou',
    nombreEtages: 4,
    nombreAppartements: 20,
    proprietaireId: 1,
    nomProprietaire: 'Serge Ouedraogo',
    telephone: '+226 70 00 00 00',
    logoUrl: '', // Vide par défaut, sera mis à jour par l'utilisateur
    devise: 'FCFA',
    dateCreation: new Date('2025-01-01')
  });

  public readonly immeuble = this.immeubleState.asReadonly();

  constructor() {
    // Si on avait un localstorage pour le MVP, on pourrait le charger ici
    const savedLogo = localStorage.getItem('saas_logo');
    if (savedLogo) {
      this.mettreAJourLogo(savedLogo);
    }
  }

  mettreAJourInfos(infos: Partial<Immeuble>) {
    this.immeubleState.update(actuel => ({
      ...actuel,
      ...infos
    }));
  }

  mettreAJourLogo(logoUrl: string) {
    this.immeubleState.update(actuel => ({
      ...actuel,
      logoUrl
    }));
    // Sauvegarde temporaire pour le MVP
    localStorage.setItem('saas_logo', logoUrl);
  }
}
