import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { 
  lucideBuilding, 
  lucideHome, 
  lucideUsers, 
  lucidePieChart,
  lucideBanknote,
  lucideCheckCircle,
  lucideClock,
  lucideAlertCircle,
  lucideZap,
  lucideWrench,
  lucidePlus,
  lucideAlertTriangle,
  lucideUserPlus,
  lucideRocket
} from '@ng-icons/lucide';
import { tablerSearch, tablerBell } from '@ng-icons/tabler-icons';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIcons({
      lucideBuilding, 
      lucideHome, 
      lucideUsers, 
      lucidePieChart,
      lucideBanknote,
      lucideCheckCircle,
      lucideClock,
      lucideAlertCircle,
      lucideZap,
      lucideWrench,
      lucidePlus,
      lucideAlertTriangle,
      lucideUserPlus,
      lucideRocket,
      tablerSearch,
      tablerBell
    })
  ]
};
