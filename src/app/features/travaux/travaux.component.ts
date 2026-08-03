import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucidePlus, lucideHome, lucideHammer, lucideImage, 
  lucideCheckCircle, lucideClock, lucideAlertCircle,
  lucideMapPin, lucideBanknote, lucideImagePlus, lucideX
} from '@ng-icons/lucide';
import { TravauxService } from '../../core/services/travaux.service';
import { AppartementService } from '../../core/services/appartement.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-travaux',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIconComponent],
  templateUrl: './travaux.component.html',
  providers: [
    provideIcons({ 
      lucidePlus, lucideHome, lucideHammer, lucideImage, 
      lucideCheckCircle, lucideClock, lucideAlertCircle,
      lucideMapPin, lucideBanknote, lucideImagePlus, lucideX
    })
  ]
})
export class TravauxComponent {
  travauxService = inject(TravauxService);
  appartementService = inject(AppartementService);
  toastService = inject(ToastService);

  // Signaux pour les données
  travaux = this.travauxService.travaux;
  appartements = this.appartementService.appartements;
  
  // Statistiques
  travauxEnCours = this.travauxService.travauxEnCours;
  travauxSignales = this.travauxService.travauxSignales;
  depensesTotales = this.travauxService.depensesTotales;

  // Modale
  showModale = signal(false);
  
  // Modèle du formulaire
  nouveauTravail = signal({
    titre: '',
    description: '',
    cout: 0,
    appartementId: 0
  });

  getAppartementDetails(id: number): string {
    const apt = this.appartements().find(a => a.id === id);
    return apt ? `Appartement N° ${apt.numero}` : 'Parties communes / Inconnu';
  }

  ouvrirModale() {
    this.nouveauTravail.set({
      titre: '',
      description: '',
      cout: 0,
      appartementId: 0
    });
    this.showModale.set(true);
  }

  fermerModale() {
    this.showModale.set(false);
  }

  soumettreTravail() {
    const form = this.nouveauTravail();
    if (!form.titre || !form.description || form.cout <= 0 || form.appartementId <= 0) {
      this.toastService.showError("Veuillez remplir tous les champs correctement.");
      return;
    }

    this.travauxService.ajouterTravail({
      titre: form.titre,
      description: form.description,
      cout: form.cout,
      appartementId: Number(form.appartementId)
    });
    
    this.toastService.showSuccess("L'intervention a été signalée avec succès.");
    this.fermerModale();
  }

  changerStatut(id: number, statutActuel: string) {
    if (statutActuel === 'signale') {
      this.travauxService.changerStatut(id, 'en_cours');
      this.toastService.showSuccess("L'intervention est maintenant en cours.");
    } else if (statutActuel === 'en_cours') {
      this.travauxService.changerStatut(id, 'termine');
      this.toastService.showSuccess("L'intervention a été clôturée !");
    }
  }

  simulerAjoutPhoto(id: number) {
    // Dans le MVP, on simule l'upload en ajoutant une image aléatoire (placeholder)
    const randomId = Math.floor(Math.random() * 1000);
    const photoUrl = `https://picsum.photos/seed/${randomId}/600/400`;
    this.travauxService.ajouterPhoto(id, photoUrl);
    this.toastService.showSuccess("Photo ajoutée comme preuve.");
  }
}
