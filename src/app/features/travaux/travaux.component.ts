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

@Component({
  selector: 'app-travaux',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIconComponent],
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
    appartementId: 0,
    photos: [] as string[]
  });

  async ngOnInit() {
    try {
      this.isFetchingData.set(true);
      await Promise.all([
        this.travauxService.fetchTravaux(),
        this.appartementService.fetchAppartements()
      ]);
    } catch (error) {
      this.toastService.showError("Erreur lors du chargement des données.");
    } finally {
      this.isFetchingData.set(false);
    }
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

  async soumettreTravail() {
    const form = this.nouveauTravail();
    if (!form.titre || !form.description || form.cout <= 0 || form.appartementId <= 0) {
      this.toastService.showError("Veuillez remplir tous les champs correctement.");
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.travauxService.ajouterTravail({
        titre: form.titre,
        description: form.description,
        cout: form.cout,
        appartementId: Number(form.appartementId),
        photos: form.photos.length > 0 ? form.photos : undefined
      });
      
      this.toastService.showSuccess("L'intervention a été signalée avec succès.");
      this.fermerModale();
    } catch (e) {
      this.toastService.showError("Erreur lors de la soumission de l'intervention.");
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async changerStatut(id: number, statutActuel: string) {
    this.isSubmitting.set(true);
    try {
      if (statutActuel === 'signale') {
        await this.travauxService.changerStatut(id, 'en_cours');
        this.toastService.showSuccess("L'intervention est maintenant en cours.");
      } else if (statutActuel === 'en_cours') {
        await this.travauxService.changerStatut(id, 'termine');
        this.toastService.showSuccess("L'intervention a été clôturée !");
      }
    } catch (e) {
      this.toastService.showError("Erreur lors du changement de statut.");
    } finally {
      this.isSubmitting.set(false);
    }
  }

  supprimerPhotoModale(index: number) {
    this.nouveauTravail.update(t => {
      const p = [...t.photos];
      p.splice(index, 1);
      return { ...t, photos: p };
    });
  }

  async supprimerPhoto(travailId: number, index: number) {
    if (confirm('Voulez-vous vraiment supprimer cette photo ?')) {
      this.isSubmitting.set(true);
      try {
        await this.travauxService.supprimerPhoto(travailId, index);
        this.toastService.showSuccess("Photo supprimée.");
      } catch (e) {
        this.toastService.showError("Erreur lors de la suppression de la photo.");
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  triggerFileInput(travailId?: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          if (travailId) {
            // Ajouter à un travail existant
            this.isSubmitting.set(true);
            try {
              await this.travauxService.ajouterPhoto(travailId, base64);
              this.toastService.showSuccess("Photo ajoutée avec succès !");
            } catch (err) {
              this.toastService.showError("Erreur lors de l'ajout de la photo.");
            } finally {
              this.isSubmitting.set(false);
            }
          } else {
            // Ajouter au nouveau formulaire
            this.nouveauTravail.update(t => ({ ...t, photos: [...(t.photos || []), base64] }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
}
