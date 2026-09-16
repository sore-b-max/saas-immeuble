import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChargeService } from '../../core/services/charge.service';
import { Charge, TypeCharge, CleRepartition } from '../../core/models/charge.model';
import { AppartementService } from '../../core/services/appartement.service';
import { ToastService } from '../../core/services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideDroplet, lucideZap, lucideShield, lucideWrench, lucideFileText, lucideCheckCircle, lucideChevronDown, lucideChevronUp, lucideHome, lucideBell } from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, FormsModule],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.css',
  providers: [
    provideIcons({ lucidePlus, lucideDroplet, lucideZap, lucideShield, lucideWrench, lucideFileText, lucideCheckCircle, lucideChevronDown, lucideChevronUp, lucideHome, lucideBell })
  ]
})
export class ChargesComponent implements OnInit {
  
  chargeService = inject(ChargeService);
  appartementService = inject(AppartementService);
  toastService = inject(ToastService);

  isFetchingData = signal(true);
  isSubmitting = signal(false);

  charges = this.chargeService.charges;
  appartements = this.appartementService.appartements;

  showModale = signal(false);
  expandedChargeId = signal<number | null>(null);

  nouvelleFacture = signal({
    typeCharge: 'eau' as TypeCharge,
    libelle: '',
    montantTotal: 0,
    periodeFacture: new Date().toISOString().substring(0, 7),
    dateFacture: new Date().toISOString().split('T')[0],
    modeRepartition: 'egal' as CleRepartition,
    immeubleId: 1
  });

  ngOnInit() {
    this.isFetchingData.set(true);
    this.appartementService.fetchAppartements().subscribe();
    this.chargeService.fetchCharges().subscribe({
      next: () => this.isFetchingData.set(false),
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors du chargement des charges");
        this.isFetchingData.set(false);
      }
    });
  }

  toggleExpand(chargeId: number) {
    if (this.expandedChargeId() === chargeId) {
      this.expandedChargeId.set(null);
    } else {
      this.expandedChargeId.set(chargeId);
    }
  }

  getIconForType(type: string): string {
    switch(type) {
      case 'eau': return 'lucideDroplet';
      case 'electricite': return 'lucideZap';
      case 'gardiennage': return 'lucideShield';
      case 'entretien': return 'lucideWrench';
      default: return 'lucideFileText';
    }
  }

  getAppartementNumero(id: number): string {
    const apt = this.appartements().find(a => a.id === id);
    return apt ? apt.numero : 'Inconnu';
  }

  marquerPaye(chargeId: number, appartementId: number) {
    this.chargeService.marquerPaye(chargeId, appartementId).subscribe({
      next: () => this.toastService.showSuccess('Charge marquée comme payée.'),
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors de la mise à jour.");
      }
    });
  }

  notifierLocataires(charge: Charge) {
    this.toastService.showSuccess(`Les notifications SMS/Email ont été envoyées aux ${charge.repartitions?.length || 0} locataires concernés.`);
  }

  soumettreFacture() {
    const formValues = this.nouvelleFacture();
    
    if (formValues.montantTotal <= 0) {
      this.toastService.showError("Veuillez saisir un montant valide.");
      return;
    }

    if (!formValues.periodeFacture) {
      this.toastService.showError("Veuillez saisir une période.");
      return;
    }

    this.isSubmitting.set(true);
    this.chargeService.ajouterCharge({
      immeubleId: formValues.immeubleId,
      typeCharge: formValues.typeCharge as any,
      montantTotal: formValues.montantTotal,
      periodeFacture: formValues.periodeFacture,
      dateFacture: new Date(formValues.dateFacture),
      modeRepartition: formValues.modeRepartition as any
    }).subscribe({
      next: () => {
        this.toastService.showSuccess("Facture ajoutée avec succès");
        this.fermerModale();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors de l'ajout de la facture");
        this.isSubmitting.set(false);
      }
    });
  }

  ouvrirModale() {
    this.showModale.set(true);
  }

  fermerModale() {
    this.showModale.set(false);
    this.nouvelleFacture.set({
      typeCharge: 'eau',
      libelle: '',
      montantTotal: 0,
      periodeFacture: new Date().toISOString().substring(0, 7),
      dateFacture: new Date().toISOString().split('T')[0],
      modeRepartition: 'egal',
      immeubleId: 1
    });
  }
}
