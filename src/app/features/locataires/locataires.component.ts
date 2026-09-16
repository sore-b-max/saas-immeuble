import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHome, lucideUserPlus, lucideEdit, lucideAlertTriangle, lucidePlus, lucideUser, lucideSearch } from '@ng-icons/lucide';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LocataireService } from '../../core/services/locataire.service';
import { ToastService } from '../../core/services/toast.service';
import { LottiePlayerComponent } from '../../shared/components/lottie-player/lottie-player.component';

@Component({
  selector: 'app-locataires',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, ReactiveFormsModule, LottiePlayerComponent],
  templateUrl: './locataires.component.html',
  providers: [
    provideIcons({ lucideHome, lucideUserPlus, lucideSearch, lucideEdit, lucideAlertTriangle, lucidePlus, lucideUser })
  ]
})
export class LocatairesComponent implements OnInit {
  public locataireService = inject(LocataireService);

  isFetchingData = signal(true);

  locatairesActifs = this.locataireService.locatairesActifs;
  nombreTotal = this.locataireService.nombreTotal;

  recherche = signal('');

  locatairesFiltres = computed(() => {
    const terme = this.recherche().toLowerCase().trim();
    const liste = this.locatairesActifs();

    if (!terme) {
      return liste;
    }

    return liste.filter(loc => 
      loc.nom.toLowerCase().includes(terme) || 
      loc.prenom.toLowerCase().includes(terme)
    );
  });

  ngOnInit() {
    this.isFetchingData.set(true);
    this.locataireService.fetchLocataires().subscribe({
      next: () => this.isFetchingData.set(false),
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors du chargement des locataires");
        this.isFetchingData.set(false);
      }
    });
  }

  archiver(id: number) {
    if (confirm('Voulez-vous vraiment archiver ce locataire ?')) {
      this.locataireService.archiverLocataire(id).subscribe({
        next: () => this.toastService.showSuccess('Locataire archivé.'),
        error: (err) => {
          console.error(err);
          this.toastService.showError('Erreur lors de l\'archivage.');
        }
      });
    }
  }

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  afficherModal = signal(false);
  locataireEnEdition = signal<number | null>(null);

  locataireForm = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.email]],
    telephone: ['', [Validators.required, Validators.pattern(/^[+0-9\s]+$/)]],
    numeroCNI: ['', Validators.required],
    appartementId: [0, [Validators.required, Validators.min(1)]]
  });

  ouvrirModale(locataire?: any) {
    if (locataire) {
      this.locataireEnEdition.set(locataire.id);
      this.locataireForm.patchValue({
        nom: locataire.nom,
        prenom: locataire.prenom,
        email: locataire.email || '',
        telephone: locataire.telephone,
        numeroCNI: locataire.numeroCNI,
        appartementId: locataire.appartementId
      });
    } else {
      this.locataireEnEdition.set(null);
      this.locataireForm.reset();
    }
    this.afficherModal.set(true);
  }

  isSubmitting = signal(false);

  sauvegarderLocataire() {
    if (this.locataireForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const locataireId = this.locataireEnEdition();

    if (locataireId) {
      this.locataireService.modifierLocataire(locataireId, this.locataireForm.getRawValue()).subscribe({
        next: () => {
          this.toastService.showSuccess('Locataire modifié avec succès !');
          this.fermerModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError("Erreur lors de la modification.");
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.locataireService.ajouterLocataire({
        ...this.locataireForm.getRawValue(),
        dateEntree: new Date().toISOString().split('T')[0] as any as Date,
        estActif: true
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Locataire ajouté avec succès !');
          this.fermerModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError("Erreur lors de l'ajout.");
          this.isSubmitting.set(false);
        }
      });
    }
  }

  private fermerModal() {
    this.afficherModal.set(false);
    this.locataireEnEdition.set(null);
    this.locataireForm.reset();
    this.isSubmitting.set(false);
  }
}
