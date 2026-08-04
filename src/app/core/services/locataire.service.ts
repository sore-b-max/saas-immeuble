import { Injectable, signal, computed, effect } from '@angular/core';
import { Locataire } from '../models/locataire.model';
import { simulateApiCall } from '../utils/api-delay.util';

@Injectable({
  providedIn: 'root'
})
export class LocataireService {
  
  // 1. Le Signal principal : stocke la liste brute de tous les locataires
  // Il est privé car seule notre service doit pouvoir le modifier directement
  private locatairesSignal = signal<Locataire[]>([]);

  // Simulation de la base de données
  private mockDatabase: Locataire[] = [
    {
      id: 1,
      nom: 'Koné',
      prenom: 'Mamadou',
      telephone: '+226 70 11 22 33',
      numeroCNI: 'B1234567',
      appartementId: 101,
      dateEntree: new Date('2025-01-15'),
      estActif: true
    },
    {
      id: 2,
      nom: 'Ouédraogo',
      prenom: 'Fatima',
      telephone: '+226 71 44 55 66',
      numeroCNI: 'B9876543',
      appartementId: 102,
      dateEntree: new Date('2025-03-01'),
      estActif: true
    },
    {
      id: 3,
      nom: 'Traoré',
      prenom: 'Jean',
      telephone: '+226 72 99 88 77',
      numeroCNI: 'B4561239',
      appartementId: 103,
      dateEntree: new Date('2024-11-10'),
      estActif: false // Cet ancien locataire a quitté l'immeuble
    }
  ];

  async fetchLocataires(): Promise<void> {
    await simulateApiCall(1500); // Simule 1.5s de latence réseau
    this.locatairesSignal.set([...this.mockDatabase]);
  }

  // 2. Propriété exposée en lecture seule : les autres composants peuvent lire cette liste
  // mais ils ne peuvent pas faire `locataires.set(...)`
  public locataires = this.locatairesSignal.asReadonly();

  // 3. Computed Signals : données dérivées calculées automatiquement
  // Si locatairesSignal change, ces valeurs se mettent à jour toutes seules !
  public locatairesActifs = computed(() => 
    this.locatairesSignal().filter(loc => loc.estActif)
  );

  public locatairesInactifs = computed(() => 
    this.locatairesSignal().filter(loc => !loc.estActif)
  );

  public nombreTotal = computed(() => this.locatairesSignal().length);

  constructor() {
    // 4. L'Effect : Il réagit automatiquement à chaque changement
    // Dès que le tableau des locataires change, ce code s'exécute.
    effect(() => {
      console.log(`[LocataireService] Changement détecté ! Il y a maintenant ${this.nombreTotal()} locataires.`);
    });
  }

  // 5. Méthodes de modification utilisant .update() (immutabilité)
  public async ajouterLocataire(nouveauLocataire: Omit<Locataire, 'id'>): Promise<void> {
    await simulateApiCall(800);
    // On génère un faux ID pour l'exemple
    const id = this.nombreTotal() + 1;
    const locataireComplet: Locataire = { ...nouveauLocataire, id };

    // On utilise .update() pour créer un NOUVEAU tableau avec le nouveau locataire
    this.locatairesSignal.update(locatairesActuels => [...locatairesActuels, locataireComplet]);
  }

  public async archiverLocataire(id: number): Promise<void> {
    await simulateApiCall(800);
    // On met 'estActif' à false pour le locataire sélectionné
    this.locatairesSignal.update(locatairesActuels => 
      locatairesActuels.map(loc => 
        loc.id === id ? { ...loc, estActif: false } : loc
      )
    );
  }

  public async modifierLocataire(id: number, locataireModifie: Partial<Locataire>): Promise<void> {
    await simulateApiCall(800);
    this.locatairesSignal.update(locatairesActuels => 
      locatairesActuels.map(loc => 
        loc.id === id ? { ...loc, ...locataireModifie } : loc
      )
    );
  }
}
