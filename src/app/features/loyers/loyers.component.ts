import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideEdit, lucideDownload, lucideBell, lucideExternalLink, lucideFileSpreadsheet } from '@ng-icons/lucide';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PaiementService } from '../../core/services/paiement.service';
import { ToastService } from '../../core/services/toast.service';
import { QuittancePdfService } from '../../core/services/quittance-pdf.service';
import { LocataireService } from '../../core/services/locataire.service';
import { AppartementService } from '../../core/services/appartement.service';
import { ImmeubleService } from '../../core/services/immeuble.service';
import { CsvExportService } from '../../core/services/csv-export.service';
import { QuittanceData } from '../../core/models/quittance.model';
import { LottiePlayerComponent } from '../../shared/components/lottie-player/lottie-player.component';

@Component({
  selector: 'app-loyers',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, ReactiveFormsModule, LottiePlayerComponent],
  templateUrl: './loyers.component.html',
  providers: [provideIcons({ lucideEdit, lucideDownload, lucideBell, lucideExternalLink, lucideFileSpreadsheet })]
})
export class LoyersComponent implements OnInit {
  public paiementService = inject(PaiementService);
  private csvExportService = inject(CsvExportService);

  // Signaux d'état
  isLoading = signal(true);
  isSubmitting = signal(false);

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
  
  private locataireService = inject(LocataireService);
  private appartementService = inject(AppartementService);
  private pdfService = inject(QuittancePdfService);
  private immeubleService = inject(ImmeubleService);

  afficherModal = signal(false);

  paiementEnEdition = signal<number | null>(null);

  paiementForm = this.fb.nonNullable.group({
    appartementId: [0, [Validators.required, Validators.min(1)]],
    locataireId: [0, [Validators.required, Validators.min(1)]],
    montant: [0, [Validators.required, Validators.min(1000)]],
    modePaiement: ['especes', Validators.required],
    reference: ['']
  });

  ngOnInit() {
    this.isLoading.set(true);
    this.paiementService.fetchPaiements().subscribe({
      next: () => this.isLoading.set(false),
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors du chargement des paiements");
        this.isLoading.set(false);
      }
    });
  }

  exporterCSV() {
    const list = this.paiements();
    if (!list || list.length === 0) {
      this.toastService.showError("Aucun paiement à exporter.");
      return;
    }
    this.csvExportService.exportPaiements(list);
    this.toastService.showSuccess("Liste des paiements exportée en CSV avec succès !");
  }

  ouvrirModale(paiement?: any) {
    if (paiement) {
      this.paiementEnEdition.set(paiement.id);
      this.paiementForm.patchValue({
        appartementId: paiement.appartementId,
        locataireId: paiement.locataireId,
        montant: paiement.montant,
        modePaiement: paiement.modePaiement,
        reference: paiement.reference
      });
    } else {
      this.paiementEnEdition.set(null);
      this.paiementForm.reset({ modePaiement: 'especes' });
    }
    this.afficherModal.set(true);
  }

  enregistrerPaiement() {
    if (this.paiementForm.invalid) return;
    
    this.isSubmitting.set(true);
    const formValue = this.paiementForm.getRawValue();
    const paiementId = this.paiementEnEdition();

    if (paiementId) {
      this.paiementService.modifierPaiement(paiementId, {
        appartementId: formValue.appartementId,
        locataireId: formValue.locataireId,
        montant: formValue.montant,
        modePaiement: formValue.modePaiement as any,
        reference: formValue.reference
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Paiement modifié avec succès !');
          this.fermerModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.showError("Une erreur s'est produite.");
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.paiementService.ajouterPaiement({
        appartementId: formValue.appartementId,
        locataireId: formValue.locataireId,
        montant: formValue.montant,
        modePaiement: formValue.modePaiement as any,
        reference: formValue.reference,
        moisConcerne: '2026-08',
        datePaiement: new Date().toISOString().split('T')[0] as any as Date,
        statut: 'paye'
      }).subscribe({
        next: () => {
          this.toastService.showSuccess('Loyer encaissé avec succès !');
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
    this.paiementEnEdition.set(null);
    this.paiementForm.reset({ modePaiement: 'especes' });
    this.isSubmitting.set(false);
  }

  telechargerQuittance(paiement: any) {
    const locataires = this.locataireService.locataires();
    const appartements = this.appartementService.appartements();
    const immeuble = this.immeubleService.immeuble();
    
    const locataire = locataires.find(l => l.id === paiement.locataireId);
    const appartement = appartements.find(a => a.id === paiement.appartementId);
    
    const data: QuittanceData = {
      periode: paiement.moisConcerne,
      datePaiement: paiement.datePaiement || new Date(),
      modePaiement: paiement.modePaiement,
      reference: paiement.reference,
      montant: paiement.montant,
      bailleur: {
        nom: immeuble.nomProprietaire || immeuble.nom || 'Gestion SaaS Immeuble',
        adresse: immeuble.adresse || '01 BP 1234 Ouagadougou 01',
        telephone: immeuble.telephone || '+226 70 00 00 00',
        logoBase64: immeuble.logoUrl || undefined
      },
      locataire: {
        nomComplet: locataire ? `${locataire.prenom} ${locataire.nom}` : `Locataire ID ${paiement.locataireId}`,
        telephone: locataire?.telephone || 'Non renseigné',
        appartement: appartement ? `N° ${appartement.numero}` : `ID ${paiement.appartementId}`
      }
    };
    
    this.pdfService.genererQuittance(data);
    this.toastService.showSuccess('Quittance générée avec succès !');
  }

  envoyerRappel(paiement: any) {
    this.paiementService.modifierPaiement(paiement.id, { rappelEnvoye: true }).subscribe({
      next: () => this.toastService.showSuccess('Rappel SMS envoyé avec succès au locataire !'),
      error: (err) => console.error(err)
    });
  }
}

