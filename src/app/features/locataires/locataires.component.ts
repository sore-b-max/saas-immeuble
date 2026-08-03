import { Component, inject, signal, computed } from '@angular/core';
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
  locatairesActifs = this.locataireService.locatairesActifs;
  nombreTotal = this.locataireService.nombreTotal;

  // 3. (Leçon 5) Signal pour stocker le texte de recherche
  recherche = signal('');

  // 4. (Leçon 5) Computed Signal qui filtre la liste en temps réel
  locatairesFiltres = computed(() => {
    const terme = this.recherche().toLowerCase().trim();
    const liste = this.locatairesActifs();

    if (!terme) {
      return liste; // Si rien n'est tapé, on retourne tout le monde
    }

    return liste.filter(loc => 
      loc.nom.toLowerCase().includes(terme) || 
      loc.prenom.toLowerCase().includes(terme)
    );
  });

  // 5. (Optionnel) Une méthode pour archiver depuis la vue
  archiver(id: number) {
    if(confirm('Voulez-vous vraiment archiver ce locataire ?')) {
      this.locataireService.archiverLocataire(id);
    }
  }
}
