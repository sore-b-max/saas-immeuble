import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, lucidePlus, lucideCheckCircle, lucideAlertCircle, 
  lucideWallet, lucideBanknote, lucideMaximize, lucideCreditCard, 
  lucideEdit, lucideBuilding 
} from '@ng-icons/lucide';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AppartementService } from '../../core/services/appartement.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-appartements',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, ReactiveFormsModule],
  templateUrl: './appartements.component.html',
  providers: [
    provideIcons({ 
      lucideHome, lucidePlus, lucideCheckCircle, lucideAlertCircle, 
      lucideWallet, lucideBanknote, lucideMaximize, lucideCreditCard, 
      lucideEdit, lucideBuilding 
    })
  ]
})
export class AppartementsComponent implements OnInit {
  public appartementService = inject(AppartementService);

  // Signaux d'état
  isLoading = signal(true);
  isSubmitting = signal(false);

  // On expose les signaux au HTML
  appartements = this.appartementService.appartements;
  nombreTotal = this.appartementService.nombreTotal;
  appartementsVacants = this.appartementService.appartementsVacants;
  appartementsOccupes = this.appartementService.appartementsOccupes;
  chiffreAffairePotentiel = this.appartementService.chiffreAffairePotentiel;

  // ==========================================
  // MODALE AJOUT APPARTEMENT
  // ==========================================
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  
  afficherModal = signal(false);

  appartementEnEdition = signal<number | null>(null);

  appartementForm = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    superficie: [0, [Validators.required, Validators.min(10)]],
    loyer: [0, [Validators.required, Validators.min(1000)]],
    statut: ['vacant', Validators.required]
  });

  ngOnInit() {
    this.isLoading.set(true);
    this.appartementService.fetchAppartements().subscribe({
      next: () => this.isLoading.set(false),
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors du chargement des appartements");
        this.isLoading.set(false);
      }
    });
  }

  ouvrirModale(apt?: any) {
    if (apt) {
      this.appartementEnEdition.set(apt.id);
      this.appartementForm.patchValue({
        numero: apt.numero,
        superficie: apt.superficie,
        loyer: apt.loyer,
        statut: apt.statut
      });
    } else {
      this.appartementEnEdition.set(null);
      this.appartementForm.reset({ statut: 'vacant' });
    }
    this.afficherModal.set(true);
  }

  enregistrerAppartement() {
    if (this.appartementForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.appartementForm.getRawValue();
    const aptId = this.appartementEnEdition();

    if (aptId) {
      this.appartementService.modifierAppartement(aptId, {
        numero: formValue.numero,
        superficie: formValue.superficie,
        loyer: formValue.loyer,
        statut: formValue.statut as any
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Appartement modifié avec succès !');
          this.fermerModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError("Une erreur s'est produite.");
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.appartementService.ajouterAppartement({
        numero: formValue.numero,
        superficie: formValue.superficie,
        loyer: formValue.loyer,
        statut: formValue.statut as any,
        immeubleId: 1
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Appartement ajouté avec succès !');
          this.fermerModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError("Une erreur s'est produite.");
          this.isSubmitting.set(false);
        }
      });
    }
  }

  private fermerModal() {
    this.afficherModal.set(false);
    this.appartementEnEdition.set(null);
    this.appartementForm.reset({ statut: 'vacant' });
    this.isSubmitting.set(false);
  }
}
