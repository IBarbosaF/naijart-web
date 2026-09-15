import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Events, EventItem, EventRequestForAdmin } from '../../../core/services/events';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-events.html',
  styleUrl: './admin-events.scss'
})
export class AdminEvents implements OnInit {
  private fb = inject(FormBuilder);
  private eventsService = inject(Events);

  protected readonly apiUrl = environment.apiUrl;

  protected readonly events = signal<EventItem[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // null = creando un evento nuevo; con valor = editando ese evento
  protected readonly editingId = signal<string | null>(null);
  protected readonly selectedFileName = signal<string | null>(null);
  private selectedFile: File | null = null;

  // Solicitudes del evento actualmente desplegado (null = ninguno abierto)
  protected readonly expandedEventId = signal<string | null>(null);
  protected readonly requests = signal<EventRequestForAdmin[]>([]);
  protected readonly isLoadingRequests = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    event_date: ['', [Validators.required]],
    start_time: [''],
    end_time: [''],
    location: ['']
  });

  ngOnInit(): void {
    this.loadEvents();
  }

  private async loadEvents(): Promise<void> {
    this.isLoading.set(true);
    try {
      this.events.set(await this.eventsService.getAll());
    } catch {
      this.errorMessage.set('No se pudieron cargar los eventos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.selectedFileName.set(this.selectedFile?.name ?? null);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const { title, description, event_date, start_time, end_time, location } = this.form.getRawValue();
    const data = {
      title,
      description: description || undefined,
      event_date,
      start_time: start_time || undefined,
      end_time: end_time || undefined,
      location: location || undefined,
      image: this.selectedFile
    };

    try {
      const currentId = this.editingId();
      if (currentId) {
        await this.eventsService.update(currentId, data);
      } else {
        await this.eventsService.create(data);
      }
      this.resetForm();
      await this.loadEvents();
    } catch (error: any) {
      this.errorMessage.set(error?.error?.error ?? 'Error al guardar el evento.');
    } finally {
      this.isSaving.set(false);
    }
  }

  startEdit(event: EventItem): void {
    this.editingId.set(event.id);
    this.selectedFile = null;
    this.selectedFileName.set(null);
    this.form.setValue({
      title: event.title,
      description: event.description ?? '',
      event_date: event.event_date.substring(0, 10),
      start_time: event.start_time ? event.start_time.substring(0, 5) : '',
      end_time: event.end_time ? event.end_time.substring(0, 5) : '',
      location: event.location ?? ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.selectedFile = null;
    this.selectedFileName.set(null);
    this.form.reset({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '' });
  }

  async deleteEvent(event: EventItem): Promise<void> {
    const confirmed = confirm(`¿Seguro que quieres borrar "${event.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await this.eventsService.delete(event.id);
      if (this.expandedEventId() === event.id) this.expandedEventId.set(null);
      await this.loadEvents();
    } catch (error: any) {
      this.errorMessage.set(error?.error?.error ?? 'Error al borrar el evento.');
    }
  }

  async toggleRequests(event: EventItem): Promise<void> {
    if (this.expandedEventId() === event.id) {
      this.expandedEventId.set(null);
      return;
    }

    this.expandedEventId.set(event.id);
    this.isLoadingRequests.set(true);
    try {
      this.requests.set(await this.eventsService.getRequestsForEvent(event.id));
    } catch {
      this.requests.set([]);
    } finally {
      this.isLoadingRequests.set(false);
    }
  }

  async respondToRequest(event: EventItem, request: EventRequestForAdmin, status: 'approved' | 'rejected'): Promise<void> {
    try {
      await this.eventsService.updateRequestStatus(event.id, request.id, status);
      this.requests.set(await this.eventsService.getRequestsForEvent(event.id));
    } catch (error: any) {
      this.errorMessage.set(error?.error?.error ?? 'Error al actualizar la solicitud.');
    }
  }
}
