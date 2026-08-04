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

  async ngOnInit() {
    try {
      this.isFetchingData.set(true);
      await this.immeubleService.fetchImmeuble();
      
      // Initialiser le formulaire avec les données actuelles
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
    } catch (err) {
      this.toastService.showError("Erreur lors du chargement des paramètres");
    } finally {
      this.isFetchingData.set(false);
    }
  }

  // Simulation d'un upload de fichier pour le MVP
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Pour le MVP (sans backend), on lit le fichier et on le convertit en base64
      // Cela permet de l'afficher et de le sauvegarder localement
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

  async sauvegarder() {
    if (!this.form.nom || !this.form.nomProprietaire) {
      this.toastService.showError('Le nom de l\'immeuble et du propriétaire sont obligatoires.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      // Simulation appel réseau
      await new Promise(r => setTimeout(r, 800));

      // Mettre à jour les informations globales
      this.immeubleService.mettreAJourInfos({
        nom: this.form.nom,
        adresse: this.form.adresse,
        ville: this.form.ville,
        nomProprietaire: this.form.nomProprietaire,
        telephone: this.form.telephone,
        devise: this.form.devise
      });

      // Mettre à jour le logo
      this.immeubleService.mettreAJourLogo(this.form.logoUrl);

      this.toastService.showSuccess('Paramètres de l\'immeuble enregistrés avec succès !');
    } catch (err) {
      this.toastService.showError("Erreur lors de la sauvegarde");
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
