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

  // (Les autres modules seront ajoutés dans les leçons suivantes)

  // Page 404 — route inconnue
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
