import { Routes } from '@angular/router';

// =====================================================
// ROUTES : Plan de navigation de toute l'application
// Chaque route = une URL → un composant (une page)
// =====================================================

export const routes: Routes = [
  // Page d'accueil → redirige vers le dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Module 4 : Tableau de bord propriétaire
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  // Module Locataires
  {
    path: 'locataires',
    loadComponent: () =>
      import('./features/locataires/locataires.component')
        .then(m => m.LocatairesComponent)
  },

  // Module Appartements
  {
    path: 'appartements',
    loadComponent: () =>
      import('./features/appartements/appartements.component')
        .then(m => m.AppartementsComponent)
  },

  // Module Loyers
  {
    path: 'loyers',
    loadComponent: () =>
      import('./features/loyers/loyers.component')
        .then(m => m.LoyersComponent)
  },

  // Module Charges
  {
    path: 'charges',
    loadComponent: () =>
      import('./features/charges/charges.component')
        .then(m => m.ChargesComponent)
  },

  // Module Travaux
  {
    path: 'travaux',
    loadComponent: () =>
      import('./features/travaux/travaux.component')
        .then(m => m.TravauxComponent)
  },

  // (Les autres modules seront ajoutés dans les leçons suivantes)

  // Page 404 — route inconnue
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
