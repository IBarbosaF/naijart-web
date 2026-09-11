import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

interface CalendarEvent {
  id: number;
  titleKey: string;        // clave de traducción, ej. 'calendar.events.e1.title'
  date: string; // ISO 'YYYY-MM-DD'
  time: string;
  locationKey: string;
  descriptionKey: string;
  image: string;
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

  // Lunes primero, igual que la rejilla
  readonly weekDayKeys = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'].map(
    d => `calendar.weekdays.${d}`
  );

  currentDate = signal(new Date(2026, 8, 1)); // arranca en septiembre 2026
  selectedEvent = signal<CalendarEvent | null>(null);

  // Datos de ejemplo — sustituir por contenido real del cliente
  events: CalendarEvent[] = [
    {
      id: 1,
      titleKey: 'calendar.events.e1.title',
      date: '2026-09-12',
      time: '18:00',
      locationKey: 'calendar.events.e1.location',
      descriptionKey: 'calendar.events.e1.description',
      image: '/images/gallery/event-raices.jpg'
    },
    {
      id: 2,
      titleKey: 'calendar.events.e2.title',
      date: '2026-09-19',
      time: '11:00',
      locationKey: 'calendar.events.e2.location',
      descriptionKey: 'calendar.events.e2.description',
      image: '/images/gallery/event-tejido.jpg'
    },
    {
      id: 3,
      titleKey: 'calendar.events.e3.title',
      date: '2026-09-26',
      time: '20:00',
      locationKey: 'calendar.events.e3.location',
      descriptionKey: 'calendar.events.e3.description',
      image: '/images/gallery/event-poesia.jpg'
    },
    {
      id: 4,
      titleKey: 'calendar.events.e4.title',
      date: '2026-10-03',
      time: '19:00',
      locationKey: 'calendar.events.e4.location',
      descriptionKey: 'calendar.events.e4.description',
      image: '/images/gallery/event-charla.jpg'
    }
  ];

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
      events: this.events.filter(e => this.isSameDate(e.date, date))
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
