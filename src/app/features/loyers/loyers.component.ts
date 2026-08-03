import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PaiementService } from '../../core/services/paiement.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, ReactiveFormsModule],
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

  // ==========================================
  // MODALE ENCAISSEMENT LOYER
  // ==========================================
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  
  afficherModal = signal(false);

  paiementForm = this.fb.nonNullable.group({
    appartementId: [0, [Validators.required, Validators.min(1)]],
    locataireId: [0, [Validators.required, Validators.min(1)]],
    montant: [0, [Validators.required, Validators.min(1000)]],
    modePaiement: ['especes', Validators.required],
    reference: ['']
  });

  enregistrerPaiement() {
    if (this.paiementForm.invalid) return;

    const formValue = this.paiementForm.getRawValue();

    this.paiementService.ajouterPaiement({
      appartementId: formValue.appartementId,
      locataireId: formValue.locataireId,
      montant: formValue.montant,
      modePaiement: formValue.modePaiement as any,
      reference: formValue.reference,
      moisConcerne: '2026-08',
      datePaiement: new Date(),
      statut: 'paye'
    });

    this.afficherModal.set(false);
    this.paiementForm.reset();

    this.toastService.showSuccess('Loyer encaissé avec succès !');
  }
}
