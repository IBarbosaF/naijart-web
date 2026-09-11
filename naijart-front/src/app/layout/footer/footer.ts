import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

interface FooterLink {
  key: string;
  path: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: 'instagram' | 'facebook' | 'linkedin';
}

type NewsletterStatus = 'idle' | 'success' | 'error';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly newsletterEmail = signal('');
  protected readonly newsletterStatus = signal<NewsletterStatus>('idle');

  // Ajusta los `path` cuando existan las rutas reales en app.routes.ts
  protected readonly navLinks: FooterLink[] = [
    { key: 'nav.gallery', path: '/galeria' },
    { key: 'nav.calendar', path: '/calendario' },
    { key: 'nav.about', path: '/quienes-somos' },
    { key: 'nav.join', path: '/unete' },
    { key: 'nav.contact', path: '/contacto' },
  ];

  // Sustituye las URLs por las cuentas reales del cliente
  // (name se muestra tal cual, son marcas — no se traducen)
  protected readonly socialLinks: SocialLink[] = [
    { name: 'Instagram', url: 'https://instagram.com/naijart', icon: 'instagram' },
    { name: 'Facebook', url: 'https://facebook.com/naijart', icon: 'facebook' },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/naijart', icon: 'linkedin' },
  ];

  protected onSubscribe(): void {
    const email = this.newsletterEmail().trim();

    if (!email || !email.includes('@')) {
      this.newsletterStatus.set('error');
      return;
    }

    // TODO: conectar con el servicio de newsletter real (backend por definir en Fase 2)
    this.newsletterStatus.set('success');
    this.newsletterEmail.set('');
  }
}
