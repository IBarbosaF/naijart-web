import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * El `title` de cada ruta en app.routes.ts es una clave de traducción
 * (ej. 'titles.gallery'), no un texto literal. Esta estrategia lo resuelve
 * al idioma activo y lo vuelve a aplicar cuando el idioma cambia, para que
 * el título de la pestaña no se quede en castellano.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);
  private currentKey?: string;

  constructor() {
    super();
    this.translate.onLangChange.subscribe(() => this.apply());
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.currentKey = this.buildTitle(snapshot);
    this.apply();
  }

  private apply(): void {
    const key = this.currentKey;
    if (!key) return;
    this.title.setTitle(this.translate.instant(key) as string);
  }
}
