import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from './services/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  
  // Clone la requête pour y ajouter un token d'authentification si nécessaire
  const token = localStorage.getItem('token');
  const authReq = token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Passe la requête au handler suivant et gère les erreurs globales
  return next(authReq).pipe(
    catchError((error) => {
      // Gestion globale des erreurs
      if (error.status === 401) {
        toastService.showError('Session expirée. Veuillez vous reconnecter.');
        // Logique de redirection vers le login...
      } else if (error.status === 403) {
        toastService.showError('Accès refusé.');
      } else if (error.status >= 500) {
        toastService.showError('Erreur serveur. Veuillez réessayer plus tard.');
      }
      
      return throwError(() => error);
    })
  );
};
