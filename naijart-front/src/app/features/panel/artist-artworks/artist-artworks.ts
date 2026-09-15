import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Artworks, Artwork, ArtworkStatus } from '../../../core/services/artworks';
import { Auth } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-artist-artworks',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './artist-artworks.html',
  styleUrl: './artist-artworks.scss'
})
export class ArtistArtworks implements OnInit {
  private fb = inject(FormBuilder);
  private artworksService = inject(Artworks);
  private auth = inject(Auth);

  protected readonly artworks = signal<Artwork[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // null = creando una obra nueva; con valor = editando esa obra
  protected readonly editingId = signal<string | null>(null);
  protected readonly selectedFileName = signal<string | null>(null);
  private selectedFile: File | null = null;

  protected readonly apiUrl = environment.apiUrl;
  protected readonly statusOptions: ArtworkStatus[] = ['available', 'reserved', 'sold'];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    style: [''],
    artwork_date: [''],
    price: [''],
    status: ['available' as ArtworkStatus]
  });

  ngOnInit(): void {
    this.loadArtworks();
  }

  private async loadArtworks(): Promise<void> {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    this.isLoading.set(true);
    try {
      this.artworks.set(await this.artworksService.getMine(userId));
    } catch {
      this.errorMessage.set('No se pudieron cargar tus obras.');
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

    const { title, description, style, artwork_date, price, status } = this.form.getRawValue();
    const data = {
      title,
      description: description || undefined,
      style: style || undefined,
      artwork_date: artwork_date || undefined,
      price: price || undefined,
      status,
      image: this.selectedFile
    };

    try {
      const currentId = this.editingId();
      if (currentId) {
        await this.artworksService.update(currentId, data);
      } else {
        await this.artworksService.create(data);
      }
      this.resetForm();
      await this.loadArtworks();
    } catch (error: any) {
      this.errorMessage.set(error?.error?.error ?? 'Error al guardar la obra.');
    } finally {
      this.isSaving.set(false);
    }
  }

  startEdit(artwork: Artwork): void {
    this.editingId.set(artwork.id);
    this.selectedFile = null;
    this.selectedFileName.set(null);
    this.form.setValue({
      title: artwork.title,
      description: artwork.description ?? '',
      style: artwork.style ?? '',
      artwork_date: artwork.artwork_date ? artwork.artwork_date.substring(0, 10) : '',
      price: artwork.price != null ? String(artwork.price) : '',
      status: artwork.status
    });
    // Llevamos la vista al formulario, arriba de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.selectedFile = null;
    this.selectedFileName.set(null);
    this.form.reset({
      title: '',
      description: '',
      style: '',
      artwork_date: '',
      price: '',
      status: 'available'
    });
  }

  async deleteArtwork(artwork: Artwork): Promise<void> {
    const confirmed = confirm(`¿Seguro que quieres borrar "${artwork.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await this.artworksService.delete(artwork.id);
      await this.loadArtworks();
    } catch (error: any) {
      this.errorMessage.set(error?.error?.error ?? 'Error al borrar la obra.');
    }
  }
}
