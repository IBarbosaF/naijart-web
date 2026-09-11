import { Injectable, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'es' | 'en' | 'fr';

@Injectable({ providedIn: 'root' })
export class Language {
  private translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'naijart-lang';

  init(): void {
    // En el servidor no hay localStorage ni navigator.language fiable:
    // usamos español por defecto y dejamos que el cliente reconcilie
    // el idioma real al hidratar.
    if (!this.isBrowser) {
      this.apply('en');
      return;
    }

    const saved = localStorage.getItem(this.STORAGE_KEY) as AppLang | null;
    const browserLang = this.translate.getBrowserLang() as AppLang | undefined;
    const initialLang: AppLang = saved ?? (browserLang && ['en', 'es', 'fr'].includes(browserLang) ? browserLang : 'en');
    this.apply(initialLang);
  }

  setLang(lang: AppLang): void {
    this.apply(lang);
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  getCurrentLang(): string {
    return this.translate.currentLang() ?? 'es';
  }

  // El `lang` del <html> lo leen los lectores de pantalla y los buscadores,
  // así que tiene que seguir al idioma activo, no quedarse en el de index.html.
  private apply(lang: AppLang): void {
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
  }
}
