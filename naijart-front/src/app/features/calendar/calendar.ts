import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Events, EventItem, RequestStatus } from '../../core/services/events';
import { Auth } from '../../core/services/auth';
import { environment } from '../../../environments/environment';

interface CalendarEvent {
  id: number | string;
  titleKey: string;
  date: string; // ISO 'YYYY-MM-DD'
  startTime: string; // 'HH:MM' o ''
  endTime: string;
  locationKey: string;
  descriptionKey: string;
  image: string;
  isReal: boolean; // true = viene del backend (se puede solicitar apuntarse)
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

// Locale para toLocaleDateString: el código de idioma de la app por sí solo
// no basta para formatear fechas (necesita región).
const DATE_LOCALES: Record<string, string> = {
  es: 'es-ES',
  en: 'en-GB',
  fr: 'fr-FR'
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar {
  private readonly translate = inject(TranslateService);
  private readonly eventsService = inject(Events);
  private readonly auth = inject(Auth);

  protected readonly isArtist = computed(() => this.auth.role() === 'artist');

  // Lunes primero, igual que la rejilla
  readonly weekDayKeys = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map(
    d => `calendar.weekdays.${d}`
  );

  currentDate = signal(new Date(2026, 8, 1)); // arranca en septiembre 2026
  selectedEvent = signal<CalendarEvent | null>(null);

  // Estado de mis propias solicitudes (solo artist), por event id
  protected readonly myRequests = signal<Map<string, RequestStatus>>(new Map());
  protected readonly isRequesting = signal(false);
  protected readonly requestError = signal<string | null>(null);

  // Datos de ejemplo — se quedan como respaldo mientras no haya
  // suficientes eventos reales creados por un admin
  private readonly exampleEvents: CalendarEvent[] = [
    {
      id: 1,
      titleKey: 'calendar.events.e1.title',
      date: '2026-09-12',
      startTime: '18:00',
      endTime: '',
      locationKey: 'calendar.events.e1.location',
      descriptionKey: 'calendar.events.e1.description',
      image: '/images/gallery/event-raices.jpg',
      isReal: false
    },
    {
      id: 2,
      titleKey: 'calendar.events.e2.title',
      date: '2026-09-19',
      startTime: '11:00',
      endTime: '',
      locationKey: 'calendar.events.e2.location',
      descriptionKey: 'calendar.events.e2.description',
      image: '/images/gallery/event-tejido.jpg',
      isReal: false
    },
    {
      id: 3,
      titleKey: 'calendar.events.e3.title',
      date: '2026-09-26',
      startTime: '20:00',
      endTime: '',
      locationKey: 'calendar.events.e3.location',
      descriptionKey: 'calendar.events.e3.description',
      image: '/images/gallery/event-poesia.jpg',
      isReal: false
    },
    {
      id: 4,
      titleKey: 'calendar.events.e4.title',
      date: '2026-10-03',
      startTime: '19:00',
      endTime: '',
      locationKey: 'calendar.events.e4.location',
      descriptionKey: 'calendar.events.e4.description',
      image: '/images/gallery/event-charla.jpg',
      isReal: false
    }
  ];

  events = signal<CalendarEvent[]>(this.exampleEvents);

  // Lista para "Próximos eventos": siempre ordenada por fecha ascendente,
  // independientemente del orden en que hayan llegado (reales primero, luego ejemplo).
  protected readonly upcomingEvents = computed(() =>
    [...this.events()].sort((a, b) => a.date.localeCompare(b.date))
  );

  constructor() {
    this.loadRealEvents();
    if (this.isArtist()) {
      this.loadMyRequests();
    }
  }

  private async loadRealEvents(): Promise<void> {
    try {
      const real = await this.eventsService.getAll();
      const mapped = real.map((e) => this.toCalendarEvent(e));
      this.events.set([...mapped, ...this.exampleEvents]);
    } catch {
      // Si el backend no responde, nos quedamos con los de ejemplo
    }
  }

  private async loadMyRequests(): Promise<void> {
    try {
      const requests = await this.eventsService.getMyRequests();
      const map = new Map<string, RequestStatus>();
      for (const req of requests) {
        const match = this.events().find(
          (e) => e.isReal && e.date === req.event_date
        );
        if (match) map.set(String(match.id), req.status);
      }
      this.myRequests.set(map);
    } catch {
      // Silencioso — si falla, simplemente no se muestra el estado de solicitud
    }
  }

  private toCalendarEvent(event: EventItem): CalendarEvent {
    return {
      id: event.id,
      titleKey: event.title,
      date: event.event_date.substring(0, 10),
      startTime: event.start_time ? event.start_time.substring(0, 5) : '',
      endTime: event.end_time ? event.end_time.substring(0, 5) : '',
      locationKey: event.location ?? '',
      descriptionKey: event.description ?? '',
      image: event.image_url
        ? `${environment.apiUrl}${event.image_url}`
        : '/images/gallery/event-raices.jpg', // placeholder si el admin no subió foto
      isReal: true
    };
  }

  async requestToJoin(event: CalendarEvent): Promise<void> {
    if (!event.isReal) return;

    this.isRequesting.set(true);
    this.requestError.set(null);

    try {
      await this.eventsService.requestToJoin(String(event.id));
      const updated = new Map(this.myRequests());
      updated.set(String(event.id), 'pending');
      this.myRequests.set(updated);
    } catch (error: any) {
      this.requestError.set(error?.error?.error ?? 'Error al enviar la solicitud.');
    } finally {
      this.isRequesting.set(false);
    }
  }

  requestStatusFor(event: CalendarEvent): RequestStatus | null {
    return this.myRequests().get(String(event.id)) ?? null;
  }

  monthLabel = computed(() => {
    const d = this.currentDate();
    const month = this.translate.instant(`calendar.months.m${d.getMonth() + 1}`);
    return `${month} ${d.getFullYear()}`;
  });

  calendarDays = computed<CalendarDay[]>(() => {
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // lunes = 0

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const days: CalendarDay[] = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      days.push(this.buildDay(new Date(year, month - 1, daysInPrevMonth - i), false, today));
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(this.buildDay(new Date(year, month, day), true, today));
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      days.push(this.buildDay(new Date(year, month + 1, day), false, today));
    }

    return days;
  });

  private buildDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday: date.toDateString() === today.toDateString(),
      events: this.events().filter(e => this.isSameDate(e.date, date))
    };
  }

  private isSameDate(iso: string, date: Date): boolean {
    const [y, m, d] = iso.split('-').map(Number);
    return y === date.getFullYear() && m === date.getMonth() + 1 && d === date.getDate();
  }

  prevMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  selectDay(day: CalendarDay): void {
    if (day.events.length > 0) {
      this.selectedEvent.set(day.events[0]);
    }
  }

  openEvent(event: CalendarEvent): void {
    this.selectedEvent.set(event);
  }

  closeModal(): void {
    this.selectedEvent.set(null);
  }

  formatEventDate(iso: string): string {
    // Leer la señal aquí mantiene la dependencia reactiva: al cambiar de
    // idioma la plantilla vuelve a formatear las fechas.
    const lang = this.translate.currentLang() ?? 'es';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(DATE_LOCALES[lang] ?? 'es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
