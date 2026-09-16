import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideAlertCircle, lucideInfo, lucideX } from '@ng-icons/lucide';
import { ToastService } from '../../../core/services/toast.service';
import { LottiePlayerComponent } from '../lottie-player/lottie-player.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent, LottiePlayerComponent],
  templateUrl: './toast.component.html',
  providers: [provideIcons({ lucideCheckCircle, lucideAlertCircle, lucideInfo, lucideX })]
})
export class ToastComponent {
  public toastService = inject(ToastService);
  toast = this.toastService.toastState;

  fermer() {
    this.toastService.hideToast();
  }
}
