import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // 'YYYY-MM-DD'
  start_time: string | null; // 'HH:MM:SS'
  end_time: string | null;
  location: string | null;
  image_url: string | null;
  created_by: string;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface MyEventRequest {
  id: string;
  status: RequestStatus;
  requested_at: string;
  title: string;
  event_date: string;
  location: string | null;
}

export interface EventRequestForAdmin {
  id: string;
  status: RequestStatus;
  requested_at: string;
  artist_id: string;
  name: string;
  surname: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  image?: File | null;
}

@Injectable({ providedIn: 'root' })
export class Events {
  private http = inject(HttpClient);

  // ===== LISTAR (público) =====
  async getAll(): Promise<EventItem[]> {
    const response = await firstValueFrom(
      this.http.get<{ ok: boolean; events: EventItem[] }>(`${environment.apiUrl}/events`)
    );
    return response.events;
  }

  // ===== CREAR (admin) =====
  async create(data: EventFormData): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/events`, this.toFormData(data))
    );
  }

  // ===== EDITAR (admin) =====
  async update(id: string, data: EventFormData): Promise<void> {
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/events/${id}`, this.toFormData(data))
    );
  }

  // ===== BORRAR (admin) =====
  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/events/${id}`)
    );
  }

  // ===== SOLICITAR APUNTARSE (artista) =====
  async requestToJoin(eventId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/events/${eventId}/requests`, {})
    );
  }

  // ===== VER MIS SOLICITUDES (artista) =====
  async getMyRequests(): Promise<MyEventRequest[]> {
    const response = await firstValueFrom(
      this.http.get<{ ok: boolean; requests: MyEventRequest[] }>(`${environment.apiUrl}/events/mine/requests`)
    );
    return response.requests;
  }

  // ===== VER SOLICITUDES DE UN EVENTO (admin) =====
  async getRequestsForEvent(eventId: string): Promise<EventRequestForAdmin[]> {
    const response = await firstValueFrom(
      this.http.get<{ ok: boolean; requests: EventRequestForAdmin[] }>(
        `${environment.apiUrl}/events/${eventId}/requests`
      )
    );
    return response.requests;
  }

  // ===== APROBAR / RECHAZAR SOLICITUD (admin) =====
  async updateRequestStatus(eventId: string, requestId: string, status: 'approved' | 'rejected'): Promise<void> {
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/events/${eventId}/requests/${requestId}`, { status })
    );
  }

  // El backend espera multipart/form-data (por la imagen), así que
  // convertimos el objeto de datos a FormData antes de enviarlo.
  private toFormData(data: EventFormData): FormData {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('event_date', data.event_date);
    if (data.start_time) formData.append('start_time', data.start_time);
    if (data.end_time) formData.append('end_time', data.end_time);
    if (data.location) formData.append('location', data.location);
    if (data.image) formData.append('image', data.image);
    return formData;
  }
}
