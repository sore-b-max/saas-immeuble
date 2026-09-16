import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucidePlus, lucideHome, lucideHammer, lucideImage, 
  lucideCheckCircle, lucideClock, lucideAlertCircle,
  lucideMapPin, lucideBanknote, lucideImagePlus, lucideX,
  lucideLoader2
} from '@ng-icons/lucide';
import { TravauxService } from '../../core/services/travaux.service';
import { AppartementService } from '../../core/services/appartement.service';
import { ToastService } from '../../core/services/toast.service';
import { forkJoin } from 'rxjs';
import { LottiePlayerComponent } from '../../shared/components/lottie-player/lottie-player.component';

@Component({
  selector: 'app-travaux',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIconComponent, LottiePlayerComponent],
  templateUrl: './travaux.component.html',
  providers: [
    provideIcons({ 
      lucidePlus, lucideHome, lucideHammer, lucideImage, 
      lucideCheckCircle, lucideClock, lucideAlertCircle,
      lucideMapPin, lucideBanknote, lucideImagePlus, lucideX,
      lucideLoader2
    })
  ]
})
export class TravauxComponent implements OnInit {
  travauxService = inject(TravauxService);
  appartementService = inject(AppartementService);
  toastService = inject(ToastService);

  isFetchingData = signal(true);
  isSubmitting = signal(false);

  travaux = this.travauxService.travaux;
  appartements = this.appartementService.appartements;
  
  travauxEnCours = this.travauxService.travauxEnCours;
  travauxSignales = this.travauxService.travauxSignales;
  depensesTotales = this.travauxService.depensesTotales;

  showModale = signal(false);
  
  nouveauTravail = signal({
    titre: '',
    description: '',
    cout: 0,
    appartementId: 0,
    photos: [] as string[]
  });

  ngOnInit() {
    this.isFetchingData.set(true);
    forkJoin([
      this.travauxService.fetchTravaux(),
      this.appartementService.fetchAppartements()
    ]).subscribe({
      next: () => this.isFetchingData.set(false),
      error: (error) => {
        console.error(error);
        this.toastService.showError("Erreur lors du chargement des données.");
        this.isFetchingData.set(false);
      }
    });
  }

  getAppartementDetails(id: number): string {
    const apt = this.appartements().find(a => a.id === id);
    return apt ? `Appartement N° ${apt.numero}` : 'Parties communes / Inconnu';
  }

  ouvrirModale() {
    this.nouveauTravail.set({
      titre: '',
      description: '',
      cout: 0,
      appartementId: 0,
      photos: []
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

    this.isSubmitting.set(true);
    this.travauxService.ajouterTravail({
      titre: form.titre,
      description: form.description,
      cout: form.cout,
      appartementId: Number(form.appartementId),
      photos: form.photos.length > 0 ? form.photos : undefined
    }).subscribe({
      next: () => {
        this.toastService.showSuccess("L'intervention a été signalée avec succès.");
        this.fermerModale();
        this.isSubmitting.set(false);
      },
      error: (e) => {
        console.error(e);
        this.toastService.showError("Erreur lors de la soumission de l'intervention.");
        this.isSubmitting.set(false);
      }
    });
  }

  changerStatut(id: number, statutActuel: string) {
    this.isSubmitting.set(true);
    if (statutActuel === 'signale') {
      this.travauxService.changerStatut(id, 'en_cours').subscribe({
        next: () => {
          this.toastService.showSuccess("L'intervention est maintenant en cours.");
          this.isSubmitting.set(false);
        },
        error: (e) => {
          console.error(e);
          this.toastService.showError("Erreur lors du changement de statut.");
          this.isSubmitting.set(false);
        }
      });
    } else if (statutActuel === 'en_cours') {
      this.travauxService.changerStatut(id, 'termine').subscribe({
        next: () => {
          this.toastService.showSuccess("L'intervention a été clôturée !");
          this.isSubmitting.set(false);
        },
        error: (e) => {
          console.error(e);
          this.toastService.showError("Erreur lors du changement de statut.");
          this.isSubmitting.set(false);
        }
      });
    }
  }

  supprimerPhotoModale(index: number) {
    this.nouveauTravail.update(t => {
      const p = [...t.photos];
      p.splice(index, 1);
      return { ...t, photos: p };
    });
  }

  supprimerPhoto(travailId: number, index: number) {
    if (confirm('Voulez-vous vraiment supprimer cette photo ?')) {
      this.isSubmitting.set(true);
      this.travauxService.supprimerPhoto(travailId, index).subscribe({
        next: () => {
          this.toastService.showSuccess("Photo supprimée.");
          this.isSubmitting.set(false);
        },
        error: (e) => {
          console.error(e);
          this.toastService.showError("Erreur lors de la suppression de la photo.");
          this.isSubmitting.set(false);
        }
      });
    }
  }

  triggerFileInput(travailId?: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          if (travailId) {
            this.isSubmitting.set(true);
            this.travauxService.ajouterPhoto(travailId, base64).subscribe({
              next: () => {
                this.toastService.showSuccess("Photo ajoutée avec succès !");
                this.isSubmitting.set(false);
              },
              error: (err) => {
                console.error(err);
                this.toastService.showError("Erreur lors de l'ajout de la photo.");
                this.isSubmitting.set(false);
              }
            });
          } else {
            this.nouveauTravail.update(t => ({ ...t, photos: [...(t.photos || []), base64] }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
}
