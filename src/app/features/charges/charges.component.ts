import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChargeService } from '../../core/services/charge.service';
import { Charge, TypeCharge, CleRepartition } from '../../core/models/charge.model';
import { AppartementService } from '../../core/services/appartement.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideDroplet, lucideZap, lucideShield, lucideWrench, lucideFileText, lucideCheckCircle, lucideChevronDown, lucideChevronUp, lucideHome } from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, FormsModule],
  templateUrl: './charges.component.html',
  styleUrl: './charges.component.css',
  providers: [
    provideIcons({ lucidePlus, lucideDroplet, lucideZap, lucideShield, lucideWrench, lucideFileText, lucideCheckCircle, lucideChevronDown, lucideChevronUp, lucideHome })
  ]
})
export class ChargesComponent {
  
  chargeService = inject(ChargeService);
  appartementService = inject(AppartementService);

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

  soumettreFacture() {
    const formValues = this.nouvelleFacture();
    
    // Validation basique
    if (formValues.montantTotal <= 0) {
      alert("Veuillez saisir un montant valide.");
      return;
    }

    if (!formValues.periodeFacture) {
      alert("Veuillez saisir une période.");
      return;
    }

    this.chargeService.ajouterCharge({
      immeubleId: formValues.immeubleId,
      typeCharge: formValues.typeCharge as any,
      montantTotal: formValues.montantTotal,
      periodeFacture: formValues.periodeFacture,
      dateFacture: new Date(formValues.dateFacture),
      modeRepartition: formValues.modeRepartition as any
    });

    this.fermerModale();
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
