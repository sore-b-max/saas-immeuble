import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { PaiementService } from '../../core/services/paiement.service';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './loyers.component.html'
})
export class LoyersComponent {
  public paiementService = inject(PaiementService);

  // On expose les signaux au HTML
  paiements = this.paiementService.paiements;
  montantTotalEncaisse = this.paiementService.montantTotalEncaisse;
  montantEnRetard = this.paiementService.montantEnRetard;
  nombrePaiementsPayes = this.paiementService.nombrePaiementsPayes;
  nombrePaiementsRetard = this.paiementService.nombrePaiementsRetard;
}
