import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from './services/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  
  // Clone la requête pour y ajouter un token d'authentification si disponible
  const token = localStorage.getItem('token');
  const authReq = token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Passe la requête au handler suivant et gère les erreurs de session
  return next(authReq).pipe(
    catchError((error) => {
      // Seules les erreurs d'authentification sur les actions de modification déclenchent un toast global
      // Les requêtes GET gèrent leur fallback localement dans chaque service sans polluer l'UI
      if (error.status === 401 && token) {
        toastService.showError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.status === 403 && req.method !== 'GET') {
        toastService.showError('Accès refusé.');
      }
      
      return throwError(() => error);
    })
  );
};
