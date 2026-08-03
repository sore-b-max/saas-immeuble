import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { AppartementService } from '../../core/services/appartement.service';

@Component({
  selector: 'app-appartements',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './appartements.component.html'
})
export class AppartementsComponent {
  public appartementService = inject(AppartementService);

  // On expose les signaux au HTML
  appartements = this.appartementService.appartements;
  nombreTotal = this.appartementService.nombreTotal;
  appartementsVacants = this.appartementService.appartementsVacants;
  appartementsOccupes = this.appartementService.appartementsOccupes;
  chiffreAffairePotentiel = this.appartementService.chiffreAffairePotentiel;
}
