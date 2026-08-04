import { Injectable, signal, computed } from '@angular/core';
import { Paiement } from '../models/paiement.model';
import { simulateApiCall } from '../utils/api-delay.util';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  
  // 1. Les données brutes (initialement vide, chargées via fetchPaiements)
  private paiementsState = signal<Paiement[]>([]);

  // Simulation de la base de données
  private mockDatabase: Paiement[] = [
    { id: 1, appartementId: 1, locataireId: 1, montant: 150000, moisConcerne: '2026-08', datePaiement: new Date('2026-08-01'), modePaiement: 'orange_money', statut: 'paye', reference: 'OM-123456' },
    { id: 2, appartementId: 2, locataireId: 2, montant: 200000, moisConcerne: '2026-08', datePaiement: new Date('2026-08-02'), modePaiement: 'moov_money', statut: 'paye', reference: 'MM-987654' },
    { id: 3, appartementId: 3, locataireId: 3, montant: 130000, moisConcerne: '2026-08', modePaiement: 'especes', statut: 'en_retard' },
    { id: 4, appartementId: 4, locataireId: 4, montant: 250000, moisConcerne: '2026-08', modePaiement: 'virement', statut: 'en_attente' }
  ];

  async fetchPaiements(): Promise<void> {
    await simulateApiCall(1500); // Simule 1.5s de latence réseau
    this.paiementsState.set([...this.mockDatabase]);
  }

  // 2. Ce qu'on expose publiquement
  paiements = this.paiementsState.asReadonly();

  // 3. Les signaux calculés (computed)
  montantTotalEncaisse = computed(() => 
    this.paiementsState()
      .filter(p => p.statut === 'paye')
      .reduce((total, p) => total + p.montant, 0)
  );

  montantEnRetard = computed(() => 
    this.paiementsState()
      .filter(p => p.statut === 'en_retard' || p.statut === 'impaye')
      .reduce((total, p) => total + p.montant, 0)
  );

  nombrePaiementsPayes = computed(() => 
    this.paiementsState().filter(p => p.statut === 'paye').length
  );
  
  nombrePaiementsRetard = computed(() => 
    this.paiementsState().filter(p => p.statut === 'en_retard').length
  );

  async ajouterPaiement(paiement: Omit<Paiement, 'id'>) {
    await simulateApiCall(800);
    const nouveauPaiement: Paiement = {
      ...paiement,
      id: Math.floor(Math.random() * 1000) + 10 // ID généré aléatoirement pour la démo
    };
    this.paiementsState.update(paiementsActuels => [nouveauPaiement, ...paiementsActuels]);
  }

  async modifierPaiement(id: number, paiementModifie: Partial<Paiement>) {
    await simulateApiCall(800);
    this.paiementsState.update(paiementsActuels => 
      paiementsActuels.map(p => 
        p.id === id ? { ...p, ...paiementModifie } : p
      )
    );
  }
}
