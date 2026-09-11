import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { TranslatedTitleStrategy } from './core/services/title-strategy';
import { I18N_VERSION } from './core/i18n-version';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Sin esto, al navegar se conserva la posición de scroll: pulsando un
    // enlace del pie desde el Home aterrizabas a 3000px de la página nueva y
    // parecía que el enlace no funcionaba. 'enabled' sube arriba al navegar
    // y devuelve la posición anterior al usar el botón Atrás.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/',
        // El ?v= evita que un navegador con el JSON viejo en cache
        // siga mostrando traducciones antiguas (ver i18n-version.ts).
        suffix: `.json?v=${I18N_VERSION}`
      }),
      fallbackLang: 'en',
      lang: 'en'
    })
  ]
};
