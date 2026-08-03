import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { LocataireService } from '../../core/services/locataire.service';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent],
  templateUrl: './locataires.component.html'
})
export class LocatairesComponent {
  // 1. On injecte le service pour accéder aux données
  public locataireService = inject(LocataireService);

  // 2. On expose les signaux utiles directement au template (HTML)
  // Cela permet au HTML de s'abonner aux données et de se mettre à jour tout seul
  locatairesActifs = this.locataireService.locatairesActifs;
  nombreTotal = this.locataireService.nombreTotal;

  // 3. (Optionnel) Une méthode pour archiver depuis la vue
  archiver(id: number) {
    if(confirm('Voulez-vous vraiment archiver ce locataire ?')) {
      this.locataireService.archiverLocataire(id);
    }
  }
}
