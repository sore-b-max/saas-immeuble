import { Injectable, signal } from '@angular/core';
import { DashboardDataDto } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // L'état central du dashboard
  dashboardState = signal<DashboardDataDto | null>(null);

  constructor() {}

  /**
   * Simule un appel HTTP vers le backend pour récupérer les stats du dashboard
   */
  async fetchDashboardData(): Promise<void> {
    // Simulation de la latence réseau (1.5 secondes)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Données mockées respectant les DTOs
    const mockData: DashboardDataDto = {
      kpis: {
        totalImmeubles: 3,
        tendanceImmeubles: { valeur: '+0', type: 'neutre' },
        totalAppartements: 24,
        tendanceApparts: { valeur: '+2', type: 'positif' },
        totalLocataires: 20,
        tendanceLocs: { valeur: '+1', type: 'positif' },
        tauxOccupation: Math.round((20 / 24) * 100)
      },
      finances: {
        loyersPayes: 15,
        loyersEnAttente: 3,
        loyersEnRetard: 2,
        revenuMensuel: 2_850_000,
        depensesTravaux: 450_000,
        revenuNet: 2_850_000 - 450_000
      },
      chartData: {
        labels: ['Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août'],
        data: [2100000, 2200000, 2400000, 2350000, 2600000, 2850000]
      },
      activitesRecentes: [
        { icone: 'lucideBanknote', texte: 'Loyer payé — Apt B3 (Koné Mamadou)', temps: 'Il y a 2h', type: 'succes' },
        { icone: 'lucideAlertTriangle', texte: 'Retard de loyer — Apt A1 (Ouédraogo Fatima)', temps: 'Il y a 5h', type: 'alerte' },
        { icone: 'lucideWrench', texte: 'Travaux terminés — Apt C2 (Fuite eau)', temps: 'Hier', type: 'info' },
        { icone: 'lucideZap', texte: 'Facture électricité saisie — Immeuble 1', temps: 'Hier', type: 'info' },
        { icone: 'lucideUserPlus', texte: 'Nouveau locataire — Apt D4 (Traoré Jean)', temps: 'Il y a 2j', type: 'succes' }
      ]
    };

    this.dashboardState.set(mockData);
  }
}
