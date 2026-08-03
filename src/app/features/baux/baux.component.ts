import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideHome, lucidePlus, lucideFileText, lucideUser, lucideBuilding, lucideDownload 
} from '@ng-icons/lucide';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BailService } from '../../core/services/bail.service';
import { LocataireService } from '../../core/services/locataire.service';
import { AppartementService } from '../../core/services/appartement.service';
import { ImmeubleService } from '../../core/services/immeuble.service';
import { ContratPdfService } from '../../core/services/contrat-pdf.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-baux',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIconComponent, ReactiveFormsModule],
  templateUrl: './baux.component.html',
  providers: [
    provideIcons({ lucideHome, lucidePlus, lucideFileText, lucideUser, lucideBuilding, lucideDownload }),
    DatePipe
  ]
})
export class BauxComponent {
  private bailService = inject(BailService);
  private locataireService = inject(LocataireService);
  private appartementService = inject(AppartementService);
  private immeubleService = inject(ImmeubleService);
  private contratPdfService = inject(ContratPdfService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);

  // Signaux exposés à la vue
  baux = this.bailService.baux;
  bauxActifs = this.bailService.bauxActifs;
  locataires = this.locataireService.locataires;
  appartements = this.appartementService.appartements;
  
  // Pour la sélection, on ne montre que les locataires sans bail actif et les apparts libres
  appartementsLibres = computed(() => this.appartements().filter(a => a.statut === 'libre'));

  afficherModal = signal(false);

  bailForm = this.fb.nonNullable.group({
    locataireId: [0, [Validators.required, Validators.min(1)]],
    appartementId: [0, [Validators.required, Validators.min(1)]],
    dateDebut: ['', Validators.required],
    montantLoyerBase: [0, [Validators.required, Validators.min(1000)]],
    montantCharges: [0, [Validators.required, Validators.min(0)]],
    montantCaution: [0, [Validators.required, Validators.min(0)]]
  });

  ouvrirModale() {
    this.bailForm.reset({
      dateDebut: this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '',
      montantLoyerBase: 0,
      montantCharges: 0,
      montantCaution: 0
    });
    this.afficherModal.set(true);
  }

  fermerModale() {
    this.afficherModal.set(false);
  }

  // Permet de pré-remplir le loyer en fonction de l'appartement choisi
  onAppartementChange() {
    const appartId = this.bailForm.get('appartementId')?.value;
    if (appartId) {
      const appart = this.appartements().find(a => a.id == appartId);
      if (appart) {
        this.bailForm.patchValue({
          montantLoyerBase: appart.loyerDeBase || 0,
          montantCaution: (appart.loyerDeBase || 0) * 2 // Caution par défaut : 2 mois
        });
      }
    }
  }

  enregistrerBail() {
    if (this.bailForm.invalid) {
      this.toastService.showError('Veuillez remplir tous les champs obligatoires correctement.');
      return;
    }

    const formValue = this.bailForm.getRawValue();
    this.bailService.ajouterBail(formValue);
    
    this.toastService.showSuccess('Bail créé avec succès !');
    this.fermerModale();
  }

  telechargerContrat(bail: any) {
    const locataire = this.locataires().find(l => l.id === bail.locataireId);
    const appartement = this.appartements().find(a => a.id === bail.appartementId);
    const immeuble = this.immeubleService.immeuble();

    if (!locataire || !appartement) {
      this.toastService.showError('Informations introuvables pour générer le PDF.');
      return;
    }

    this.contratPdfService.genererContratBail(bail, locataire, appartement, immeuble);
    this.toastService.showSuccess('Le téléchargement du contrat a démarré !');
  }

  getLocataireNom(id: number): string {
    const l = this.locataires().find(x => x.id === id);
    return l ? `${l.prenom} ${l.nom}` : 'Inconnu';
  }

  getAppartementInfo(id: number): string {
    const a = this.appartements().find(x => x.id === id);
    return a ? `Apt ${a.numero}` : 'Inconnu';
  }
}
