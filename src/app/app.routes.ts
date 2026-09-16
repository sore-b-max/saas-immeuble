import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';

// =====================================================
// ROUTES : Plan de navigation de toute l'application
// Chaque route = une URL → un composant (une page)
// =====================================================

export const routes: Routes = [
  // Page d'accueil → redirige vers le tableau de bord
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  
  // Page de Connexion
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },

  // Module 4 : Tableau de bord propriétaire
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  // Module Locataires
  {
    path: 'locataires',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/locataires/locataires.component')
        .then(m => m.LocatairesComponent)
  },

  // Module Appartements
  {
    path: 'appartements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appartements/appartements.component')
        .then(m => m.AppartementsComponent)
  },

  // Module Loyers
  {
    path: 'loyers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/loyers/loyers.component')
        .then(m => m.LoyersComponent)
  },

  // Module Charges
  {
    path: 'charges',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/charges/charges.component')
        .then(m => m.ChargesComponent)
  },

  // Module Baux et Contrats
  {
    path: 'baux',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/baux/baux.component')
        .then(m => m.BauxComponent)
  },

  // Espace Locataire (Dashboard spécifique au locataire)
  {
    path: 'espace-locataire',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/espace-locataire/espace-locataire.component')
        .then(m => m.EspaceLocataireComponent)
  },

  // Portail Locataire (Paiement Mobile Money) - Accessible sans être admin
  {
    path: 'portail-locataire/:id',
    loadComponent: () =>
      import('./features/portail-locataire/portail-locataire.component')
        .then(m => m.PortailLocataireComponent)
  },

  // Module Travaux
  {
    path: 'travaux',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/travaux/travaux.component')
        .then(m => m.TravauxComponent)
  },

  // Module Paramètres (Configuration de l'immeuble)
  {
    path: 'parametres',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/parametres/parametres.component')
        .then(m => m.ParametresComponent)
  },

  // Module Mon Profil & Compte
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profil/profil.component')
        .then(m => m.ProfilComponent)
  },

  // (Les autres modules seront ajoutés dans les leçons suivantes)

  // Page 404 — route inconnue
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
