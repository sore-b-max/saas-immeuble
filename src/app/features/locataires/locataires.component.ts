import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LocataireService } from '../../core/services/locataire.service';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, ReactiveFormsModule],
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

  // ==========================================
  // LEÇON 6 : LOGIQUE DU FORMULAIRE (MODAL)
  // ==========================================
  
  private fb = inject(FormBuilder);

  // Contrôle l'affichage de la fenêtre modale
  afficherModal = signal(false);

  // Formulaire Réactif
  locataireForm = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    telephone: ['', [Validators.required, Validators.pattern(/^[+0-9\s]+$/)]],
    numeroCNI: ['', Validators.required],
    appartementId: [0, [Validators.required, Validators.min(1)]]
  });

  sauvegarderLocataire() {
    if (this.locataireForm.invalid) {
      return;
    }

    // 1. On envoie les données au service
    this.locataireService.ajouterLocataire({
      ...this.locataireForm.getRawValue(),
      dateEntree: new Date(),
      estActif: true
    });

    // 2. On referme la modale
    this.afficherModal.set(false);

    // 3. On réinitialise le formulaire pour la prochaine fois
    this.locataireForm.reset();
  }
}
