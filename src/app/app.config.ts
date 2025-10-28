import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withRouterConfig, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, 
      withHashLocation(),
      withRouterConfig({ 
        onSameUrlNavigation: 'reload' 
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    )
  ]
};
