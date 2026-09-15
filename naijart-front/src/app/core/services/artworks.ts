import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ArtworkStatus = 'available' | 'reserved' | 'sold';

export interface Artwork {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_surname: string;
  title: string;
  description: string | null;
  style: string | null;
  artwork_date: string | null;
  price: number | null;
  status: ArtworkStatus;
  image_url: string | null;
  created_at: string;
}

export interface ArtworkFormData {
  title: string;
  description?: string;
  style?: string;
  artwork_date?: string;
  price?: number | string;
  status?: ArtworkStatus;
  image?: File | null;
}

@Injectable({ providedIn: 'root' })
export class Artworks {
  private http = inject(HttpClient);

  // ===== LISTAR (público) =====
  async getAll(): Promise<Artwork[]> {
    const response = await firstValueFrom(
      this.http.get<{ ok: boolean; artworks: Artwork[] }>(`${environment.apiUrl}/artworks`)
    );
    return response.artworks;
  }

  // ===== VER UNA OBRA (público) =====
  async getById(id: string): Promise<Artwork> {
    const response = await firstValueFrom(
      this.http.get<{ ok: boolean; artwork: Artwork }>(`${environment.apiUrl}/artworks/${id}`)
    );
    return response.artwork;
  }

  // ===== LISTAR SOLO LAS MÍAS (artista logueado) =====
  // El backend no tiene un endpoint dedicado "mine", así que filtramos aquí
  // por el artist_id del usuario logueado sobre el listado completo.
  async getMine(artistId: string): Promise<Artwork[]> {
    const all = await firstValueFrom(
      this.http.get<{ ok: boolean; artworks: Artwork[] }>(`${environment.apiUrl}/artworks?status=all`)
    );
    return all.artworks.filter((a) => a.artist_id === artistId);
  }

  // ===== CREAR (artista) =====
  async create(data: ArtworkFormData): Promise<void> {
    const formData = this.toFormData(data);
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/artworks`, formData)
    );
  }

  // ===== EDITAR (artista dueño) =====
  async update(id: string, data: ArtworkFormData): Promise<void> {
    const formData = this.toFormData(data);
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/artworks/${id}`, formData)
    );
  }

  // ===== BORRAR (artista dueño) =====
  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/artworks/${id}`)
    );
  }

  // El backend espera multipart/form-data (por la imagen), así que
  // convertimos el objeto de datos a FormData antes de enviarlo.
  private toFormData(data: ArtworkFormData): FormData {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.style) formData.append('style', data.style);
    if (data.artwork_date) formData.append('artwork_date', data.artwork_date);
    if (data.price !== undefined && data.price !== null) formData.append('price', String(data.price));
    if (data.status) formData.append('status', data.status);
    if (data.image) formData.append('image', data.image);
    return formData;
  }
}
