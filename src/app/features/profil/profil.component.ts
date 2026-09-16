import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideUser, lucideMail, lucidePhone, lucideShield, lucideKey, 
  lucideBell, lucideCheckCircle, lucideSave, lucideBuilding, lucideHome, lucideSparkles
} from '@ng-icons/lucide';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ImmeubleService } from '../../core/services/immeuble.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIconComponent],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- EN-TÊTE -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <ng-icon name="lucideUser" class="text-blue-600"></ng-icon> Mon Profil & Compte
        </h1>
        <p class="text-slate-500 text-sm mt-1">Gérez vos informations personnelles, votre sécurité et vos préférences.</p>
      </div>

      <!-- CARTE EN-TÊTE PROFIL -->
      <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 opacity-10">
          <ng-icon name="lucideBuilding" size="200px"></ng-icon>
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div class="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 text-white flex items-center justify-center font-black text-3xl shadow-inner">
            P
          </div>
          <div class="text-center sm:text-left">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 class="text-xl font-bold">{{ userProfile().nomComplet }}</h2>
              <span class="bg-white/20 backdrop-blur-sm text-xs font-semibold px-2.5 py-0.5 rounded-full border border-white/30">
                PROPRIÉTAIRE ADMIN
              </span>
            </div>
            <p class="text-blue-100 text-sm mt-1 flex items-center justify-center sm:justify-start gap-2">
              <ng-icon name="lucideMail" size="14px"></ng-icon> {{ userProfile().email }}
            </p>
            <p class="text-blue-200 text-xs mt-2 flex items-center justify-center sm:justify-start gap-2">
              <ng-icon name="lucideSparkles" size="14px" class="text-amber-300"></ng-icon> Compte actif — ImmoSaaS Plan Premium
            </p>
          </div>
        </div>
      </div>

      <!-- SECTIONS DE CONFIGURATION -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- ONGLETS DE NAVIGATION -->
        <div class="space-y-2">
          <button (click)="activeTab.set('infos')" 
                  [ngClass]="activeTab() === 'infos' ? 'bg-blue-50 text-blue-700 border-blue-600 font-semibold' : 'bg-white text-slate-600 border-transparent hover:bg-slate-50'"
                  class="w-full text-left p-4 rounded-xl border-l-4 shadow-sm transition-all flex items-center gap-3">
            <ng-icon name="lucideUser" size="18px"></ng-icon> Informations personnelles
          </button>
          
          <button (click)="activeTab.set('securite')" 
                  [ngClass]="activeTab() === 'securite' ? 'bg-blue-50 text-blue-700 border-blue-600 font-semibold' : 'bg-white text-slate-600 border-transparent hover:bg-slate-50'"
                  class="w-full text-left p-4 rounded-xl border-l-4 shadow-sm transition-all flex items-center gap-3">
            <ng-icon name="lucideShield" size="18px"></ng-icon> Sécurité & Mot de passe
          </button>
          
          <button (click)="activeTab.set('notifications')" 
                  [ngClass]="activeTab() === 'notifications' ? 'bg-blue-50 text-blue-700 border-blue-600 font-semibold' : 'bg-white text-slate-600 border-transparent hover:bg-slate-50'"
                  class="w-full text-left p-4 rounded-xl border-l-4 shadow-sm transition-all flex items-center gap-3">
            <ng-icon name="lucideBell" size="18px"></ng-icon> Notifications & SMS
          </button>

          <a routerLink="/parametres" 
             class="w-full text-left p-4 rounded-xl border-l-4 border-transparent bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-3 mt-4">
            <ng-icon name="lucideHome" size="18px" class="text-slate-400"></ng-icon> Paramètres de l'immeuble →
          </a>
        </div>

        <!-- CONTENU DES ONGLETS -->
        <div class="lg:col-span-2">
          
          <!-- ONGLET 1 : INFORMATIONS -->
          <div *ngIf="activeTab() === 'infos'" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            <h3 class="text-lg font-semibold text-slate-800 border-b pb-3">Informations Personnelles</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                <input type="text" [(ngModel)]="userProfile().nomComplet" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
                <input type="email" [(ngModel)]="userProfile().email" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone mobile</label>
                <input type="text" [(ngModel)]="userProfile().telephone" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                <input type="text" value="Propriétaire Administrateur" disabled class="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed">
              </div>
            </div>

            <div class="pt-4 border-t flex justify-end">
              <button (click)="sauvegarderInfos()" [disabled]="isSubmitting()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-5 rounded-lg transition-all flex items-center gap-2 shadow-sm">
                <ng-icon name="lucideSave" size="16px"></ng-icon> Enregistrer les modifications
              </button>
            </div>
          </div>

          <!-- ONGLET 2 : SÉCURITÉ -->
          <div *ngIf="activeTab() === 'securite'" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            <h3 class="text-lg font-semibold text-slate-800 border-b pb-3">Modifier le mot de passe</h3>
            
            <div class="space-y-4 max-w-md">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe actuel</label>
                <input type="password" [(ngModel)]="passwords.actuel" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                <input type="password" [(ngModel)]="passwords.nouveau" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input type="password" [(ngModel)]="passwords.confirmation" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="pt-4 border-t flex justify-end">
              <button (click)="changerMotDePasse()" [disabled]="isSubmitting()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-5 rounded-lg transition-all flex items-center gap-2 shadow-sm">
                <ng-icon name="lucideKey" size="16px"></ng-icon> Mettre à jour le mot de passe
              </button>
            </div>
          </div>

          <!-- ONGLET 3 : NOTIFICATIONS -->
          <div *ngIf="activeTab() === 'notifications'" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
            <h3 class="text-lg font-semibold text-slate-800 border-b pb-3">Préférences de Notification</h3>
            
            <div class="space-y-4">
              <label class="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                <div>
                  <p class="font-medium text-slate-800 text-sm">Notifications par Email</p>
                  <p class="text-xs text-slate-500">Recevoir des alertes lors de la saisie des paiements et dépenses</p>
                </div>
                <input type="checkbox" [(ngModel)]="notifications.email" class="w-5 h-5 text-blue-600 rounded">
              </label>

              <label class="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                <div>
                  <p class="font-medium text-slate-800 text-sm">Rappels de Loyer Automatiques (SMS)</p>
                  <p class="text-xs text-slate-500">Envoyer automatiquement un SMS de rappel aux locataires en retard</p>
                </div>
                <input type="checkbox" [(ngModel)]="notifications.smsAuto" class="w-5 h-5 text-blue-600 rounded">
              </label>

              <label class="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 cursor-pointer">
                <div>
                  <p class="font-medium text-slate-800 text-sm">Alertes de Signalement de Travaux</p>
                  <p class="text-xs text-slate-500">Notifier instantanément lorsqu'un nouveau problème est signalé</p>
                </div>
                <input type="checkbox" [(ngModel)]="notifications.alertesTravaux" class="w-5 h-5 text-blue-600 rounded">
              </label>
            </div>

            <div class="pt-4 border-t flex justify-end">
              <button (click)="sauvegarderNotifications()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-5 rounded-lg transition-all flex items-center gap-2 shadow-sm">
                <ng-icon name="lucideSave" size="16px"></ng-icon> Enregistrer les préférences
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  `,
  providers: [
    provideIcons({ 
      lucideUser, lucideMail, lucidePhone, lucideShield, lucideKey, 
      lucideBell, lucideCheckCircle, lucideSave, lucideBuilding, lucideHome, lucideSparkles
    })
  ]
})
export class ProfilComponent implements OnInit {
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private immeubleService = inject(ImmeubleService);

  activeTab = signal<'infos' | 'securite' | 'notifications'>('infos');
  isSubmitting = signal(false);

  userProfile = signal({
    nomComplet: 'Serge Ouedraogo',
    email: 'admin@immosaas.com',
    telephone: '+226 70 00 00 00'
  });

  passwords = {
    actuel: '',
    nouveau: '',
    confirmation: ''
  };

  notifications = {
    email: true,
    smsAuto: true,
    alertesTravaux: true
  };

  ngOnInit() {
    const email = this.authService.userEmail();
    const immeuble = this.immeubleService.immeuble();
    this.userProfile.set({
      nomComplet: immeuble.nomProprietaire || 'Serge Ouedraogo',
      email: email || 'admin@immosaas.com',
      telephone: immeuble.telephone || '+226 70 00 00 00'
    });
  }

  sauvegarderInfos() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.toastService.showSuccess('Profil mis à jour avec succès !');
      this.isSubmitting.set(false);
    }, 400);
  }

  changerMotDePasse() {
    if (!this.passwords.actuel || !this.passwords.nouveau || !this.passwords.confirmation) {
      this.toastService.showError('Veuillez remplir tous les champs de mot de passe.');
      return;
    }
    if (this.passwords.nouveau !== this.passwords.confirmation) {
      this.toastService.showError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.toastService.showSuccess('Mot de passe mis à jour avec succès !');
      this.passwords = { actuel: '', nouveau: '', confirmation: '' };
      this.isSubmitting.set(false);
    }, 400);
  }

  sauvegarderNotifications() {
    this.toastService.showSuccess('Préférences de notification enregistrées !');
  }
}
