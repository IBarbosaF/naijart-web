import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { GALLERY_ITEMS } from '../../shared/data/gallery-items';
import { EventModal, CalendarEvent } from '../../shared/components/event-modal/event-modal';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, EventModal, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  // Preview de galería: toma los primeros N del mismo listado que usará
  // el componente de Galería, para que ambos queden sincronizados.
  galleryPreview = GALLERY_ITEMS.slice(0, 5);

  // Segmentos del borde de la moneda (efecto 3D del logo girando), ver home.scss
  coinEdgeSegments = Array.from({ length: 24 });

  // Estado del "bote" al hacer clic en la moneda — se activa al clicar
  // y se desactiva solo cuando la animación CSS termina (animationend).
  isCoinActive = signal(false);

  @ViewChild('coinDisc') coinDiscRef?: ElementRef<HTMLElement>;

  onCoinClick(): void {
    this.isCoinActive.set(true);

    // Giro extra al clicar: en vez de tocar la duración de la animación
    // base (eso provocaba un salto/corte porque el navegador recalcula
    // el ángulo contra la nueva duración), usamos la Web Animations API
    // con composite:'add' — suma rotación ENCIMA de la animación en
    // curso sin tocarla, así nunca hay corte ni reinicio.
    const disc = this.coinDiscRef?.nativeElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (disc && !prefersReducedMotion && 'animate' in disc) {
      disc.animate(
        [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(1080deg)' }],
        { duration: 900, easing: 'ease-out', composite: 'add' }
      );
    }
  }

  onCoinAnimationEnd(): void {
    this.isCoinActive.set(false);
  }

  // TODO: sustituir por datos reales / servicio de calendario.
  // Contenido de placeholder — no se traduce por ahora (ver nota en el chat de idiomas).
  // Cuando exista el componente de Calendario, valorar mover este
  // listado a shared/data/, igual que gallery-items.ts.
  upcomingEvents: CalendarEvent[] = [
    {
      day: '12',
      monthKey: 'months.sep',
      titleKey: 'home.events.event1.title',
      locationKey: 'home.events.event1.location',
      descriptionKey: 'home.events.event1.description'
    },
    {
      day: '28',
      monthKey: 'months.sep',
      titleKey: 'home.events.event2.title',
      locationKey: 'home.events.event2.location',
      descriptionKey: 'home.events.event2.description'
    },
    {
      day: '05',
      monthKey: 'months.oct',
      titleKey: 'home.events.event3.title',
      locationKey: 'home.events.event3.location',
      descriptionKey: 'home.events.event3.description'
    }
  ];

  selectedEvent = signal<CalendarEvent | null>(null);

  openEvent(event: CalendarEvent): void {
    this.selectedEvent.set(event);
  }

  closeEvent(): void {
    this.selectedEvent.set(null);
  }
}
