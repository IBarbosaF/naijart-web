import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Language } from '../../core/services/language';

interface NavLink {
  key: string;
  path: string;
}

type Lang = 'en' | 'es' | 'fr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly translate = inject(TranslateService);
  private readonly language = inject(Language);

  // Estado del menú móvil (hamburguesa)
  protected readonly isMenuOpen = signal(false);

  // Añade el borde/sombra dorados al hacer scroll
  protected readonly isScrolled = signal(false);

  // Idioma activo, leído directamente del servicio real de traducción
  protected readonly currentLang = computed(
    () => (this.translate.currentLang() ?? 'es') as Lang
  );
  protected readonly languages: Lang[] = ['en', 'es', 'fr'];

  // Ajusta los `path` cuando existan las rutas reales en app.routes.ts
  protected readonly navLinks: NavLink[] = [
    { key: 'nav.gallery', path: '/galeria' },
    { key: 'nav.calendar', path: '/calendario' },
    { key: 'nav.about', path: '/quienes-somos' },
    { key: 'nav.join', path: '/unete' },
    { key: 'nav.contact', path: '/contacto' },
  ];

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected setLang(lang: Lang): void {
    this.language.setLang(lang);
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 8);
  }
}
