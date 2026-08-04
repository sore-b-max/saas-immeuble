import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
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
  lucideRocket,
  lucideEdit,
  lucideInfo,
  lucideX,
  lucideDownload,
  lucideSettings,
  lucideFileText
} from '@ng-icons/lucide';
import { tablerSearch, tablerBell } from '@ng-icons/tabler-icons';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
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
      lucideEdit,
      lucideInfo,
      lucideX,
      lucideDownload,
      lucideSettings,
      lucideFileText,
      tablerSearch,
      tablerBell
    })
  ]
};
