import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

// =====================================================
// COMPOSANT : Dashboard (Tableau de bord propriétaire)
// Ce que le propriétaire voit en arrivant sur l'app
// =====================================================

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  // --- DONNÉES SIMULÉES (on les remplacera par l'API Spring Boot plus tard) ---

  // Signals : données réactives (écran mis à jour automatiquement)
  totalImmeubles    = signal(3);
  totalAppartements = signal(24);
  totalLocataires   = signal(20);

  // Loyers du mois en cours
  loyersPayes      = signal(15);
  loyersEnAttente  = signal(3);
  loyersEnRetard   = signal(2);

  // Finances
  revenuMensuel    = signal(2_850_000);   // En FCFA
  depensesTravaux  = signal(450_000);

  // Computed : calculé automatiquement depuis les signals
  tauxOccupation = computed(() =>
    Math.round((this.totalLocataires() / this.totalAppartements()) * 100)
  );

  revenuNet = computed(() =>
    this.revenuMensuel() - this.depensesTravaux()
  );

  // Dernières activités
  activitesRecentes = signal([
    { icone: 'lucideBanknote', texte: 'Loyer payé — Apt B3 (Koné Mamadou)', temps: 'Il y a 2h', type: 'succes' },
    { icone: 'lucideAlertTriangle', texte: 'Retard de loyer — Apt A1 (Ouédraogo Fatima)', temps: 'Il y a 5h', type: 'alerte' },
    { icone: 'lucideWrench', texte: 'Travaux terminés — Apt C2 (Fuite eau)', temps: 'Hier', type: 'info' },
    { icone: 'lucideZap', texte: 'Facture électricité saisie — Immeuble 1', temps: 'Hier', type: 'info' },
    { icone: 'lucideUserPlus', texte: 'Nouveau locataire — Apt D4 (Traoré Jean)', temps: 'Il y a 2j', type: 'succes' },
  ]);
}
