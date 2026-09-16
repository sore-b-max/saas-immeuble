import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucideLock,
  lucideArrowRight,
  lucideBuilding,
  lucideEye,
  lucideEyeOff,
  lucideSparkles,
  lucideCheckCircle2,
  lucideShieldCheck
} from '@ng-icons/lucide';
import { LottiePlayerComponent } from '../../../shared/components/lottie-player/lottie-player.component';
import { register } from 'swiper/element/bundle';

// Enregistrement global des Web Components Swiper (<swiper-container> et <swiper-slide>)
register();

export interface HeroSlide {
  image: string;
  badge: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, LottiePlayerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styles: [`
    @keyframes floatCard {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.08); }
    }
    @keyframes fadeInScale {
      0% { opacity: 0; transform: scale(0.95) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slideTextIn {
      0% { opacity: 0; transform: translateY(16px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .floating-container {
      animation: fadeInScale 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .floating-card {
      animation: floatCard 8s ease-in-out infinite;
    }
    .bg-glow-1 {
      animation: pulseGlow 7s ease-in-out infinite;
    }
    .bg-glow-2 {
      animation: pulseGlow 9s ease-in-out infinite 3.5s;
    }
    swiper-container {
      width: 100%;
      height: 100%;
      --swiper-pagination-color: #34d399;
      --swiper-pagination-bullet-inactive-color: #ffffff;
      --swiper-pagination-bullet-inactive-opacity: 0.4;
      --swiper-pagination-bullet-size: 8px;
      --swiper-pagination-bullet-horizontal-gap: 4px;
      --swiper-theme-color: #34d399;
    }
    swiper-container::part(pagination) {
      bottom: 12px;
      padding-left: 24px;
      text-align: left;
    }
    swiper-slide {
      height: 100%;
    }
  `],
  providers: [
    provideIcons({
      lucideMail,
      lucideLock,
      lucideArrowRight,
      lucideBuilding,
      lucideEye,
      lucideEyeOff,
      lucideSparkles,
      lucideCheckCircle2,
      lucideShieldCheck
    })
  ]
})
export class Login {

  email = '';
  password = '';
  isLoading = false;
  showPassword = false;

  slides: HeroSlide[] = [
    {
      image: '/assets/images/slide-1.png',
      badge: 'Supervision 360°',
      title: 'Supervisez vos immeubles & loyers en temps réel.',
      subtitle: 'Plateforme professionnelle tout-en-un pour propriétaires et gestionnaires.'
    },
    {
      image: '/assets/images/slide-2.png',
      badge: 'Synergie & Équipe',
      title: "Gestion d'équipe & synergie immobilière.",
      subtitle: 'Collaborez efficacement avec vos gestionnaires et équipes sur le terrain.'
    },
    {
      image: '/assets/images/slide-3.jpg',
      badge: 'Bilan & Finance',
      title: 'Rapports financiers & suivi de trésorerie précis.',
      subtitle: 'Visualisez vos encaissements, quittances PDF et bilans en un instant.'
    },
    {
      image: '/assets/images/slide-4.png',
      badge: 'Performance & Croissance',
      title: 'Maximisez la rentabilité de votre patrimoine.',
      subtitle: 'Gagnez du temps au quotidien et offrez un service haut de gamme.'
    }
  ];

  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  fillDemo(type: 'admin' | 'locataire'): void {
    if (type === 'admin') {
      this.email = 'admin@saas.com';
      this.password = 'Admin123!';
      this.toast.showInfo('Compte Administrateur / Propriétaire sélectionné');
    } else {
      this.email = 'locataire@saas.com';
      this.password = 'Locataire123!';
      this.toast.showInfo('Compte Locataire sélectionné');
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.toast.showError('Veuillez remplir tous les champs');
      return;
    }
    this.isLoading = true;
    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          this.toast.showSuccess('Connexion réussie !');
          if (response.role === 'LOCATAIRE') {
            this.router.navigate(['/espace-locataire']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error(err);
          this.toast.showError('Identifiants incorrects ou erreur serveur');
        }
      });
  }
}
