import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Si c'est un locataire et qu'il essaie d'accéder à autre chose que son espace
  if (role === 'LOCATAIRE' && !state.url.includes('/espace-locataire')) {
    router.navigate(['/espace-locataire']);
    return false;
  }

  // Si c'est un admin et qu'il essaie d'accéder à l'espace locataire
  if (role === 'ADMIN' && state.url.includes('/espace-locataire')) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
