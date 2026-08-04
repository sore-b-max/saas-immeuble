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

  // Données
  charges = this.chargeService.charges;
  appartements = this.appartementService.appartements;

  // UI State
  showModale = signal(false);
  expandedChargeId = signal<number | null>(null);

  // Formulaire Nouvelle Facture
  nouvelleFacture = signal({
    typeCharge: 'eau' as TypeCharge,
    libelle: '',
    montantTotal: 0,
    periodeFacture: new Date().toISOString().substring(0, 7), // Format YYYY-MM
    dateFacture: new Date().toISOString().split('T')[0],
    modeRepartition: 'egal' as CleRepartition,
    immeubleId: 1
  });

  async ngOnInit() {
    try {
      this.isFetchingData.set(true);
      await this.chargeService.fetchCharges();
    } catch (err) {
      this.toastService.showError("Erreur lors du chargement des charges");
    } finally {
      this.isFetchingData.set(false);
    }
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
    this.chargeService.marquerPaye(chargeId, appartementId);
  }

  notifierLocataires(charge: Charge) {
    this.toastService.showSuccess(`Les notifications SMS/Email ont été envoyées aux ${charge.repartitions?.length || 0} locataires concernés.`);
  }

  async soumettreFacture() {
    const formValues = this.nouvelleFacture();
    
    // Validation basique
    if (formValues.montantTotal <= 0) {
      this.toastService.showError("Veuillez saisir un montant valide.");
      return;
    }

    if (!formValues.periodeFacture) {
      this.toastService.showError("Veuillez saisir une période.");
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.chargeService.ajouterCharge({
        immeubleId: formValues.immeubleId,
        typeCharge: formValues.typeCharge as any,
        montantTotal: formValues.montantTotal,
        periodeFacture: formValues.periodeFacture,
        dateFacture: new Date(formValues.dateFacture),
        modeRepartition: formValues.modeRepartition as any
      });
      this.toastService.showSuccess("Facture ajoutée avec succès");
      this.fermerModale();
    } catch (err) {
      this.toastService.showError("Erreur lors de l'ajout de la facture");
    } finally {
      this.isSubmitting.set(false);
    }
  }

  ouvrirModale() {
    this.showModale.set(true);
  }

  fermerModale() {
    this.showModale.set(false);
    // Reset form
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
