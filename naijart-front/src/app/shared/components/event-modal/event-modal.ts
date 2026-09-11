// src/app/shared/components/event-modal/event-modal.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface CalendarEvent {
  day: string;
  monthKey: string;        // clave de traducción, ej. 'months.sep'
  titleKey: string;        // clave de traducción, ej. 'home.events.event1.title'
  locationKey: string;
  descriptionKey?: string;
  image?: string;
}

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './event-modal.html',
  styleUrl: './event-modal.scss'
})
export class EventModal {
  @Input({ required: true }) event!: CalendarEvent;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}
