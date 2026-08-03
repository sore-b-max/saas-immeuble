import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  // Le signal qui contient l'état actuel du toast
  toastState = signal<Toast>({
    message: '',
    type: 'success',
    visible: false
  });

  // Fonction pour afficher un succès
  showSuccess(message: string) {
    this.showToast(message, 'success');
  }

  // Fonction pour afficher une erreur
  showError(message: string) {
    this.showToast(message, 'error');
  }

  // Fonction interne
  private showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toastState.set({ message, type, visible: true });
    
    // Disparaît automatiquement après 3 secondes
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    this.toastState.update(current => ({ ...current, visible: false }));
  }
}
