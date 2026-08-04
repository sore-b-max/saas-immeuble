import { Injectable, signal, computed, inject } from '@angular/core';
import { Bail } from '../models/bail.model';
import { AppartementService } from './appartement.service';
import { simulateApiCall } from '../utils/api-delay.util';

@Injectable({
  providedIn: 'root'
})
export class BailService {
  private appartementService = inject(AppartementService);

  private bauxState = signal<Bail[]>([]);

  private mockDatabase: Bail[] = [
    {
      id: 1,
      locataireId: 1, // Koné Mamadou
      appartementId: 1, // B3
      dateDebut: '2025-01-01',
      dateFin: '2026-12-31',
      montantLoyerBase: 150000,
      montantCharges: 15000,
      montantCaution: 300000, // 2 mois de loyer
      statut: 'actif',
      dateCreation: new Date('2024-12-15')
    },
    {
      id: 2,
      locataireId: 2, // Ouédraogo Fatima
      appartementId: 2, // A1
      dateDebut: '2025-06-01',
      dateFin: '2026-05-31',
      montantLoyerBase: 120000,
      montantCharges: 10000,
      montantCaution: 240000,
      statut: 'actif',
      dateCreation: new Date('2025-05-10')
    }
  ];

  async fetchBaux(): Promise<void> {
    await simulateApiCall(1500);
    this.bauxState.set([...this.mockDatabase]);
  }

  public baux = this.bauxState.asReadonly();

  public bauxActifs = computed(() => this.bauxState().filter(b => b.statut === 'actif'));
  public bauxResilies = computed(() => this.bauxState().filter(b => b.statut === 'resilie'));

  async ajouterBail(bail: Omit<Bail, 'id' | 'dateCreation' | 'statut'>) {
    await simulateApiCall(800);
    const nouveauBail: Bail = {
      ...bail,
      id: Math.max(...this.bauxState().map(b => b.id), 0) + 1,
      statut: 'actif',
      dateCreation: new Date()
    };
    this.bauxState.update(baux => [...baux, nouveauBail]);
    
    // Mettre à jour le statut de l'appartement en 'occupe'
    this.appartementService.modifierAppartement(bail.appartementId, { statut: 'occupe' });
  }

  async resilierBail(id: number, dateFin: Date) {
    await simulateApiCall(800);
    this.bauxState.update(baux => baux.map(bail => {
      if (bail.id === id) {
        // Remettre l'appartement en 'vacant'
        this.appartementService.modifierAppartement(bail.appartementId, { statut: 'vacant' });
        return { ...bail, statut: 'resilie', dateFin };
      }
      return bail;
    }));
  }

  async renouvelerBail(id: number) {
    await simulateApiCall(800);
    this.bauxState.update(baux => baux.map(bail => {
      if (bail.id === id && bail.dateFin) {
        const currentDateFin = new Date(bail.dateFin);
        currentDateFin.setFullYear(currentDateFin.getFullYear() + 1);
        const newDateFin = currentDateFin.toISOString().split('T')[0];
        return { ...bail, dateFin: newDateFin };
      }
      return bail;
    }));
  }
}
