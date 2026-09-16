import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideSettings, lucideHome, lucideUpload, lucideSave, lucideImage, lucideTrash2, lucideLoader2
} from '@ng-icons/lucide';
import { ImmeubleService } from '../../core/services/immeuble.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent],
  templateUrl: './parametres.component.html',
  providers: [
    provideIcons({ 
      lucideSettings, lucideHome, lucideUpload, lucideSave, lucideImage, lucideTrash2, lucideLoader2
    })
  ]
})
export class ParametresComponent implements OnInit {
  immeubleService = inject(ImmeubleService);
  toastService = inject(ToastService);

  isFetchingData = signal(true);
  isSubmitting = signal(false);

  // Formulaire local
  form = {
    nom: '',
    adresse: '',
    ville: '',
    nomProprietaire: '',
    telephone: '',
    devise: '',
    logoUrl: ''
  };

  ngOnInit() {
    this.isFetchingData.set(true);
    this.immeubleService.fetchImmeuble().subscribe({
      next: () => {
        const infos = this.immeubleService.immeuble();
        this.form = {
          nom: infos.nom || '',
          adresse: infos.adresse || '',
          ville: infos.ville || '',
          nomProprietaire: infos.nomProprietaire || '',
          telephone: infos.telephone || '',
          devise: infos.devise || 'FCFA',
          logoUrl: infos.logoUrl || ''
        };
        this.isFetchingData.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors du chargement des paramètres");
        this.isFetchingData.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.logoUrl = e.target.result;
        this.toastService.showSuccess('Logo chargé avec succès (Base64)');
      };
      reader.readAsDataURL(file);
    }
  }

  supprimerLogo() {
    this.form.logoUrl = '';
  }

  sauvegarder() {
    if (!this.form.nom || !this.form.nomProprietaire) {
      this.toastService.showError('Le nom de l\'immeuble et du propriétaire sont obligatoires.');
      return;
    }

    this.isSubmitting.set(true);
    this.immeubleService.mettreAJourInfos({
      nom: this.form.nom,
      adresse: this.form.adresse,
      ville: this.form.ville,
      nomProprietaire: this.form.nomProprietaire,
      telephone: this.form.telephone,
      devise: this.form.devise,
      logoUrl: this.form.logoUrl
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('Paramètres de l\'immeuble enregistrés avec succès !');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError("Erreur lors de la sauvegarde");
        this.isSubmitting.set(false);
      }
    });
  }
}
