import { Injectable, signal, computed } from '@angular/core';
import { Travaux } from '../models/travaux.model';
import { simulateApiCall } from '../utils/api-delay.util';

@Injectable({
  providedIn: 'root'
})
export class TravauxService {
  // Liste des travaux (données simulées pour le MVP)
  private travauxState = signal<Travaux[]>([]);

  private mockDatabase: Travaux[] = [
    {
      id: 1,
      titre: 'Fuite robinet salle de bain',
      description: 'Le robinet de la baignoire goutte continuellement même fermé.',
      cout: 15000,
      appartementId: 1,
      dateSignalement: new Date('2026-08-01T10:30:00'),
      statut: 'signale'
    },
    {
      id: 2,
      titre: 'Changement serrure porte principale',
      description: 'La serrure accroche, nécessite un remplacement complet du barillet.',
      cout: 25000,
      appartementId: 2,
      dateSignalement: new Date('2026-07-28T14:15:00'),
      dateRealisation: new Date('2026-07-30T09:00:00'),
      statut: 'termine',
      photos: ['https://placehold.co/600x400/eeeeee/888888?text=Serrure+Remplacee']
    },
    {
      id: 3,
      titre: 'Réparation climatisation',
      description: 'Le split ne refroidit plus la pièce, compresseur tourne dans le vide.',
      cout: 45000,
      appartementId: 3,
      dateSignalement: new Date('2026-08-02T08:00:00'),
      statut: 'en_cours'
    }
  ];

  async fetchTravaux(): Promise<void> {
    await simulateApiCall(1500);
    this.travauxState.set([...this.mockDatabase]);
  }

  // Signaux publics en lecture seule
  public readonly travaux = this.travauxState.asReadonly();

  // Statistiques dérivées
  public travauxEnCours = computed(() => this.travauxState().filter(t => t.statut === 'en_cours').length);
  public travauxSignales = computed(() => this.travauxState().filter(t => t.statut === 'signale').length);
  public depensesTotales = computed(() => 
    this.travauxState()
      .filter(t => t.statut === 'termine')
      .reduce((sum, current) => sum + current.cout, 0)
  );

  constructor() { }

  /**
   * Ajouter un nouveau travail / intervention
   */
  async ajouterTravail(travail: Omit<Travaux, 'id' | 'statut' | 'dateSignalement'>) {
    await simulateApiCall(800);
    const nouveauTravail: Travaux = {
      ...travail,
      id: this.travauxState().length > 0 ? Math.max(...this.travauxState().map(t => t.id)) + 1 : 1,
      statut: 'signale',
      dateSignalement: new Date()
    };
    
    this.travauxState.update(travaux => [nouveauTravail, ...travaux]);
  }

  /**
   * Mettre à jour le statut d'un travail
   */
  async changerStatut(id: number, nouveauStatut: 'signale' | 'en_cours' | 'termine') {
    await simulateApiCall(800);
    this.travauxState.update(travaux => 
      travaux.map(t => {
        if (t.id === id) {
          const modifie = { ...t, statut: nouveauStatut };
          if (nouveauStatut === 'termine') {
            modifie.dateRealisation = new Date();
          }
          return modifie;
        }
        return t;
      })
    );
  }

  /**
   * Ajouter une photo (simulée via base64 ou URL) à un travail
   */
  async ajouterPhoto(id: number, photoUrl: string) {
    await simulateApiCall(800);
    this.travauxState.update(travaux => 
      travaux.map(t => {
        if (t.id === id) {
          return {
            ...t,
            photos: t.photos ? [...t.photos, photoUrl] : [photoUrl]
          };
        }
        return t;
      })
    );
  }

  /**
   * Supprimer une photo d'un travail
   */
  async supprimerPhoto(id: number, index: number) {
    await simulateApiCall(400);
    this.travauxState.update(travaux => 
      travaux.map(t => {
        if (t.id === id && t.photos) {
          const newPhotos = [...t.photos];
          newPhotos.splice(index, 1);
          return {
            ...t,
            photos: newPhotos
          };
        }
        return t;
      })
    );
  }
}
