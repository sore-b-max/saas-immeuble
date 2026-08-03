import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AppartementService } from '../../core/services/appartement.service';

@Component({
  selector: 'app-appartements',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, ReactiveFormsModule],
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

  // ==========================================
  // MODALE AJOUT APPARTEMENT
  // ==========================================
  private fb = inject(FormBuilder);
  
  afficherModal = signal(false);

  appartementForm = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    superficie: [0, [Validators.required, Validators.min(10)]],
    loyer: [0, [Validators.required, Validators.min(1000)]],
    statut: ['vacant', Validators.required]
  });

  enregistrerAppartement() {
    if (this.appartementForm.invalid) return;

    const formValue = this.appartementForm.getRawValue();

    this.appartementService.ajouterAppartement({
      numero: formValue.numero,
      superficie: formValue.superficie,
      loyer: formValue.loyer,
      statut: formValue.statut as any,
      immeubleId: 1 // Valeur par défaut pour l'instant
    });

    this.afficherModal.set(false);
    this.appartementForm.reset({ statut: 'vacant' });
  }
}
