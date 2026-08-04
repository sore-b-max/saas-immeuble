import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideLogOut, lucideFileText, lucideBanknote, 
  lucideWrench, lucideCheckCircle, lucideClock, lucideAlertCircle, lucideDownload,
  lucideBuilding, lucideX, lucideSmartphone
} from '@ng-icons/lucide';
import { LocataireService } from '../../core/services/locataire.service';
import { BailService } from '../../core/services/bail.service';
import { PaiementService } from '../../core/services/paiement.service';
import { ChargeService } from '../../core/services/charge.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-espace-locataire',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIconComponent],
  templateUrl: './espace-locataire.component.html',
  providers: [provideIcons({ 
    lucideLogOut, lucideFileText, lucideBanknote, 
    lucideWrench, lucideCheckCircle, lucideClock, lucideAlertCircle, lucideDownload,
    lucideBuilding, lucideX, lucideSmartphone
  })]
})
export class EspaceLocataireComponent implements OnInit {
  private locataireService = inject(LocataireService);
  private bailService = inject(BailService);
  private paiementService = inject(PaiementService);
  private chargeService = inject(ChargeService);
  private toastService = inject(ToastService);

  isFetchingData = signal(true);

  // Simulation : on prend le premier locataire
  locataire = signal<any>(null);
  bail = signal<any>(null);
  paiements = signal<any[]>([]);
  chargesLocataire = signal<any[]>([]);
  
  // Onglet actif : 'bail' | 'factures' | 'incidents'
  activeTab = signal<'bail' | 'factures' | 'incidents'>('bail');

  // Modal de paiement
  showPaiementModal = signal(false);
  isSubmittingPaiement = signal(false);
  paiementEnCours = signal<any>(null);
  typePaiementEnCours = signal<'loyer' | 'charge'>('loyer');
  formPaiement = { telephone: '', operateur: 'orange_money' };

  // Simulation d'incidents (en attendant un module complet)
  incidents = signal<any[]>([
    { id: 1, type: 'Plomberie', description: 'Fuite sous l\'évier de la cuisine', date: new Date('2026-08-01'), statut: 'en_cours' },
    { id: 2, type: 'Électricité', description: 'Prise défectueuse dans le salon', date: new Date('2026-06-15'), statut: 'termine' }
  ]);

  async ngOnInit() {
    try {
      this.isFetchingData.set(true);
      // Charger toutes les données nécessaires
      await Promise.all([
        this.locataireService.fetchLocataires(),
        this.bailService.fetchBaux(),
        this.paiementService.fetchPaiements(),
        this.chargeService.fetchCharges()
      ]);

      // 1. Récupérer le premier locataire pour simuler la connexion
      const locs = this.locataireService.locataires();
      if (locs.length > 0) {
        const currentLocataire = locs[0];
        this.locataire.set(currentLocataire);

        // 2. Récupérer son bail actif
        const baux = this.bailService.baux().filter(b => b.locataireId === currentLocataire.id);
        if (baux.length > 0) {
          const bailLoc = baux[0];
          this.bail.set(bailLoc);

          // 3. Récupérer ses paiements (loyers)
          const locPaiements = this.paiementService.paiements().filter(p => p.locataireId === currentLocataire.id);
          this.paiements.set(locPaiements);

          // 4. Récupérer les charges liées à son appartement
          const toutesLesCharges = this.chargeService.charges();
          const chargesPourLocataire = toutesLesCharges.reduce((acc, charge) => {
            const repartitionLocataire = charge.repartitions?.find(r => r.appartementId === bailLoc.appartementId);
            
            if (repartitionLocataire) {
              acc.push({
                chargeId: charge.id,
                typeCharge: charge.typeCharge,
                periodeFacture: charge.periodeFacture,
                dateFacture: charge.dateFacture,
                montant: repartitionLocataire.montant,
                statut: repartitionLocataire.statut
              });
            }
            return acc;
          }, [] as any[]);
          this.chargesLocataire.set(chargesPourLocataire);
        }
      }
    } catch (e) {
      this.toastService.showError("Erreur lors du chargement des données");
    } finally {
      this.isFetchingData.set(false);
    }
  }

  setTab(tab: 'bail' | 'factures' | 'incidents') {
    this.activeTab.set(tab);
  }

  ouvrirModalPaiement(item: any, type: 'loyer' | 'charge') {
    this.paiementEnCours.set(item);
    this.typePaiementEnCours.set(type);
    this.formPaiement = { telephone: '', operateur: 'orange_money' };
    this.showPaiementModal.set(true);
  }

  fermerModalPaiement() {
    this.showPaiementModal.set(false);
    this.paiementEnCours.set(null);
  }

  async executerPaiement() {
    if (!this.formPaiement.telephone) {
      this.toastService.showError("Veuillez saisir un numéro de téléphone valide");
      return;
    }

    this.isSubmittingPaiement.set(true);
    try {
      // Simulation d'une API de Mobile Money
      await new Promise(r => setTimeout(r, 1500));
      
      const item = this.paiementEnCours();
      const type = this.typePaiementEnCours();

      if (type === 'loyer') {
        // Appeler le service pour marquer payé
        await this.paiementService.modifierPaiement(item.id, { statut: 'paye', datePaiement: new Date() });
      } else if (type === 'charge') {
        const bailLoc = this.bail();
        if (bailLoc) {
          await this.chargeService.marquerPaye(item.chargeId, bailLoc.appartementId);
        }
      }

      // Recharger les données pour refléter les modifications
      await Promise.all([
        this.paiementService.fetchPaiements(),
        this.chargeService.fetchCharges()
      ]);
      this.ngOnInit(); // Refresh state

      this.toastService.showSuccess("Paiement validé avec succès !");
      this.fermerModalPaiement();
    } catch (e) {
      this.toastService.showError("Le paiement a échoué");
    } finally {
      this.isSubmittingPaiement.set(false);
    }
  }
}
