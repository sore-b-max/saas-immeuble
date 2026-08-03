import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './toast.component.html'
})
export class ToastComponent {
  public toastService = inject(ToastService);
  toast = this.toastService.toastState;

  fermer() {
    this.toastService.hideToast();
  }
}
