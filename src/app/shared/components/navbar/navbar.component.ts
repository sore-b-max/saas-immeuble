import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  lucideMenu, lucideX, lucideHome, lucideBuilding, 
  lucideUsers, lucideBanknote, lucideWrench, lucideZap, 
  lucideFileText, lucideSettings, lucideLogOut 
} from '@ng-icons/lucide';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIconComponent],
  template: `
    <nav class="bg-white/70 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center mr-8">
              <a routerLink="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity mt-1">
                <!-- SVG Icon -->
                <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-sm">
                  <defs>
                    <linearGradient id="logoGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#3b82f6"/>
                      <stop offset="1" stop-color="#2563eb"/>
                    </linearGradient>
                  </defs>
                  <rect x="5" y="5" width="90" height="90" rx="24" fill="url(#logoGrad)"/>
                  <path d="M50 25 L30 45 V80 H70 V45 Z" stroke="white" stroke-width="8" stroke-linejoin="round" />
                  <rect x="42" y="42" width="16" height="10" fill="white" />
                  <rect x="42" y="58" width="16" height="10" fill="white" />
                  <path d="M44 80 V74 C44 72 46 70 48 70 H52 C54 70 56 72 56 74 V80" fill="white" />
                  <path d="M22 62 C30 38 55 30 78 40" stroke="#60a5fa" stroke-width="6" stroke-linecap="round" fill="transparent"/>
                  <circle cx="22" cy="62" r="5" fill="#60a5fa"/>
                </svg>
                <!-- Texts -->
                <div class="flex flex-col justify-center">
                  <span class="text-2xl font-black tracking-tight" style="color: #111827; line-height: 1.1;">
                    Immo<span class="text-blue-500">SaaS</span>
                  </span>
                  <span class="text-[0.6rem] font-bold text-gray-500 tracking-[0.2em] mt-0.5">
                    GESTION IMMOBILIÈRE
                  </span>
                </div>
              </a>
            </div>
            
            <!-- Desktop Menu -->
            <div class="hidden lg:ml-4 lg:flex lg:space-x-2 items-center">
              <a *ngFor="let item of menuItems" 
                 [routerLink]="item.path"
                 [routerLinkActiveOptions]="{exact: item.path === '/'}"
                 routerLinkActive="text-blue-700 bg-blue-50 font-semibold shadow-sm ring-1 ring-blue-500/10"
                 class="text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                 [title]="item.name">
                {{ item.name }}
              </a>
            </div>
          </div>
          
          <div class="hidden lg:ml-6 lg:flex lg:items-center">
            <!-- Right side desktop -->
            <div class="ml-4 relative flex items-center gap-3">
              <a routerLink="/parametres" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg">
                <ng-icon name="lucideSettings" size="18px"></ng-icon>
              </a>
              <div class="h-4 w-px bg-slate-200 mx-1"></div>
              
              <!-- Profile Dropdown Container -->
              <div class="relative">
                <button (click)="toggleProfileMenu()" (blur)="closeProfileMenuDelayed()" class="flex items-center gap-2 cursor-pointer group focus:outline-none">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow group-hover:scale-105 transition-all duration-200">
                    P
                  </div>
                </button>
                
                <!-- Dropdown Menu -->
                <div *ngIf="isProfileMenuOpen()" class="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div class="px-4 py-3">
                    <p class="text-sm text-slate-900 font-semibold">Compte Propriétaire</p>
                    <p class="text-sm font-medium text-slate-500 truncate">admin&#64;immosaas.com</p>
                  </div>
                  <div class="py-1">
                    <a href="#" class="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <ng-icon name="lucideUsers" size="16px" class="mr-3 text-slate-400 group-hover:text-blue-500"></ng-icon> Mon Profil
                    </a>
                    <a routerLink="/parametres" class="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <ng-icon name="lucideSettings" size="16px" class="mr-3 text-slate-400 group-hover:text-blue-500"></ng-icon> Paramètres
                    </a>
                  </div>
                  <div class="py-1">
                    <a href="#" class="group flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                      <ng-icon name="lucideLogOut" size="16px" class="mr-3 text-red-400 group-hover:text-red-500"></ng-icon> Déconnexion
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <!-- Mobile menu button -->
          <div class="flex items-center lg:hidden">
            <button (click)="toggleMobileMenu()" class="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors">
              <ng-icon [name]="isMobileMenuOpen() ? 'lucideX' : 'lucideMenu'" size="24px"></ng-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="isMobileMenuOpen()" class="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-100 absolute w-full left-0 shadow-2xl">
        <div class="pt-2 pb-3 space-y-1 px-4">
          <a *ngFor="let item of menuItems" 
             [routerLink]="item.path" 
             [routerLinkActiveOptions]="{exact: item.path === '/'}"
             (click)="toggleMobileMenu()"
             routerLinkActive="bg-blue-50/80 border-blue-600 text-blue-700 font-semibold"
             class="border-transparent text-slate-600 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all flex items-center rounded-r-lg group">
            <ng-icon [name]="item.icon" size="20px" class="mr-3 text-slate-400 group-hover:text-blue-500 transition-colors"></ng-icon>
            {{ item.name }}
          </a>
        </div>
        <div class="pt-4 pb-3 border-t border-slate-100 bg-slate-50/50">
          <div class="flex items-center px-6">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200">P</div>
            </div>
            <div class="ml-4">
              <div class="text-base font-semibold text-slate-800">Compte Propriétaire</div>
              <div class="text-sm font-medium text-slate-500">admin&#64;immosaas.com</div>
            </div>
          </div>
          <div class="mt-4 space-y-1 px-4">
            <a routerLink="/parametres" (click)="toggleMobileMenu()" class="block px-4 py-2 text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors flex items-center">
              <ng-icon name="lucideSettings" size="20px" class="mr-3 text-slate-400"></ng-icon> Paramètres
            </a>
            <a href="#" class="block px-4 py-2 text-base font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center">
              <ng-icon name="lucideLogOut" size="20px" class="mr-3"></ng-icon> Déconnexion
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  providers: [
    provideIcons({ 
      lucideMenu, lucideX, lucideHome, lucideBuilding, 
      lucideUsers, lucideBanknote, lucideWrench, lucideZap, 
      lucideFileText, lucideSettings, lucideLogOut 
    })
  ]
})
export class NavbarComponent {
  isMobileMenuOpen = signal(false);
  isProfileMenuOpen = signal(false);

  menuItems = [
    { name: 'Tableau de bord', path: '/', icon: 'lucideHome' },
    { name: 'Loyers', path: '/loyers', icon: 'lucideBanknote' },
    { name: 'Appartements', path: '/appartements', icon: 'lucideBuilding' },
    { name: 'Locataires', path: '/locataires', icon: 'lucideUsers' },
    { name: 'Baux', path: '/baux', icon: 'lucideFileText' },
    { name: 'Charges', path: '/charges', icon: 'lucideZap' },
    { name: 'Travaux', path: '/travaux', icon: 'lucideWrench' }
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen.update(val => !val);
  }

  closeProfileMenuDelayed() {
    // Permet au clic sur un lien du menu de s'exécuter avant de fermer le menu
    setTimeout(() => {
      this.isProfileMenuOpen.set(false);
    }, 150);
  }
}
