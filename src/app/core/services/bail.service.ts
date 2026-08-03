import { Injectable, signal, computed, inject } from '@angular/core';
import { Bail } from '../models/bail.model';
import { AppartementService } from './appartement.service';

@Injectable({
  providedIn: 'root'
})
export class BailService {
  private appartementService = inject(AppartementService);

  private bauxState = signal<Bail[]>([
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
  ]);

  public baux = this.bauxState.asReadonly();

  public bauxActifs = computed(() => this.bauxState().filter(b => b.statut === 'actif'));
  public bauxResilies = computed(() => this.bauxState().filter(b => b.statut === 'resilie'));

  ajouterBail(bail: Omit<Bail, 'id' | 'dateCreation' | 'statut'>) {
    const nouveauBail: Bail = {
      ...bail,
      id: Math.max(...this.bauxState().map(b => b.id), 0) + 1,
      statut: 'actif',
      dateCreation: new Date()
    };
    this.bauxState.update(baux => [...baux, nouveauBail]);
    
    // Mettre à jour le statut de l'appartement en 'occupé'
    this.appartementService.modifierAppartement(bail.appartementId, { statut: 'occupé' });
  }

  resilierBail(id: number, dateFin: Date) {
    this.bauxState.update(baux => baux.map(bail => {
      if (bail.id === id) {
        // Remettre l'appartement en 'libre'
        this.appartementService.modifierAppartement(bail.appartementId, { statut: 'libre' });
        return { ...bail, statut: 'resilie', dateFin };
      }
      return bail;
    }));
  }
}
