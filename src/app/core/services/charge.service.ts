import { Injectable, signal, computed, inject } from '@angular/core';
import { Charge, ChargeRepartition } from '../models/charge.model';
import { AppartementService } from './appartement.service';
import { simulateApiCall } from '../utils/api-delay.util';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  
  private appartementService = inject(AppartementService);

  // 1. Les données brutes (Le Signal principal)
  private chargesState = signal<Charge[]>([]);

  private mockDatabase: Charge[] = [
    {
      id: 1,
      immeubleId: 1,
      typeCharge: 'eau',
      montantTotal: 30000,
      periodeFacture: '2026-08',
      dateFacture: new Date('2026-08-01'),
      modeRepartition: 'egal',
      repartitions: [
        { appartementId: 1, montant: 15000, statut: 'paye' },
        { appartementId: 2, montant: 15000, statut: 'en_attente' }
      ]
    },
    {
      id: 2,
      immeubleId: 1,
      typeCharge: 'electricite',
      montantTotal: 50000,
      periodeFacture: '2026-08',
      dateFacture: new Date('2026-08-05'),
      modeRepartition: 'superficie',
      repartitions: [
        { appartementId: 1, montant: 21739, statut: 'en_attente' }, // (50/115) * 50000
        { appartementId: 2, montant: 28261, statut: 'en_attente' }  // (65/115) * 50000
      ]
    }
  ];

  async fetchCharges(): Promise<void> {
    await simulateApiCall(1500);
    this.chargesState.set([...this.mockDatabase]);
  }

  // 2. Ce qu'on expose publiquement
  charges = this.chargesState.asReadonly();

  // 3. Méthodes de service
  
  async ajouterCharge(charge: Omit<Charge, 'id' | 'repartitions'>) {
    await simulateApiCall(800);
    // Calculer automatiquement les répartitions avant d'ajouter
    const repartitions = this.calculerRepartition(charge.immeubleId, charge.montantTotal, charge.modeRepartition);
    
    const nouvelleCharge: Charge = {
      ...charge,
      id: Math.floor(Math.random() * 1000) + 10,
      repartitions
    };
    
    this.chargesState.update(actuels => [nouvelleCharge, ...actuels]);
  }

  /**
   * Logique métier clé : Répartition automatique des factures communes
   */
  private calculerRepartition(immeubleId: number, montantTotal: number, mode: 'egal' | 'superficie' | 'occupants'): ChargeRepartition[] {
    // On ne répartit que sur les appartements occupés (choix métier par défaut, à valider)
    const appartements = this.appartementService.appartements().filter(a => a.immeubleId === immeubleId && a.statut === 'occupe');
    
    if (appartements.length === 0) return [];

    let repartitions: ChargeRepartition[] = [];

    switch (mode) {
      case 'egal':
        const montantParApt = Math.round(montantTotal / appartements.length);
        repartitions = appartements.map(apt => ({
          appartementId: apt.id,
          montant: montantParApt,
          statut: 'en_attente'
        }));
        break;

      case 'superficie':
        const superficieTotale = appartements.reduce((acc, apt) => acc + (apt.superficie || 0), 0);
        if (superficieTotale === 0) throw new Error("Superficie totale nulle");
        
        repartitions = appartements.map(apt => ({
          appartementId: apt.id,
          montant: Math.round((apt.superficie / superficieTotale) * montantTotal),
          statut: 'en_attente'
        }));
        break;

      case 'occupants':
        const totalOccupants = appartements.reduce((acc, apt) => acc + (apt.nombreOccupants || 0), 0);
        if (totalOccupants === 0) throw new Error("Nombre total d'occupants nul");

        repartitions = appartements.map(apt => ({
          appartementId: apt.id,
          montant: Math.round(((apt.nombreOccupants || 0) / totalOccupants) * montantTotal),
          statut: 'en_attente'
        }));
        break;
    }

    // Ajustement des arrondis pour que la somme soit exactement égale au montant total
    const sommeCalculee = repartitions.reduce((acc, rep) => acc + rep.montant, 0);
    const difference = montantTotal - sommeCalculee;
    
    if (difference !== 0 && repartitions.length > 0) {
      // On ajoute ou soustrait la différence au premier appartement pour balancer
      repartitions[0].montant += difference;
    }

    return repartitions;
  }

  async marquerPaye(chargeId: number, appartementId: number) {
    await simulateApiCall(800);
    this.chargesState.update(actuels => 
      actuels.map(charge => {
        if (charge.id !== chargeId) return charge;
        
        const newRepartitions = charge.repartitions?.map(rep => 
          rep.appartementId === appartementId ? { ...rep, statut: 'paye' as const } : rep
        );
        
        return { ...charge, repartitions: newRepartitions };
      })
    );
  }
}
