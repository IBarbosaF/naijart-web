import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GALLERY_ITEMS, GalleryItem } from '../../shared/data/gallery-items';
import { Artworks, Artwork } from '../../core/services/artworks';
import { environment } from '../../../environments/environment';

const ALL = 'all';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss'
})
export class Gallery {
  private readonly translate = inject(TranslateService);
  private readonly artworksService = inject(Artworks);

  // Arranca con las estáticas (Nelly + ejemplos) para que la página no
  // salga vacía mientras llega la respuesta del backend; en cuanto
  // responde, las obras reales se añaden delante.
  protected readonly artworks = signal<GalleryItem[]>(GALLERY_ITEMS);

  constructor() {
    this.loadRealArtworks();
  }

  private async loadRealArtworks(): Promise<void> {
    try {
      const realArtworks = await this.artworksService.getAll();
      const mapped = realArtworks.map((a) => this.toGalleryItem(a));
      this.artworks.set([...mapped, ...GALLERY_ITEMS]);
    } catch {
      // Si el backend no responde, nos quedamos con las estáticas — no rompemos la página
    }
  }

  // Convierte una obra real del backend a la misma forma que espera
  // el resto del componente y la plantilla (GalleryItem).
  private toGalleryItem(artwork: Artwork): GalleryItem {
    const artistName = `${artwork.artist_name} ${artwork.artist_surname}`.trim();
    const year = artwork.artwork_date ? new Date(artwork.artwork_date).getFullYear() : undefined;

    return {
      id: artwork.id,
      slug: artwork.id,
      title: artwork.title,
      artist: artistName,
      // El backend no usa claves i18n para el estilo (lo escribe el artista
      // a mano), así que se muestra tal cual; el pipe translate lo deja
      // igual si no encuentra esa clave.
      categoryKey: artwork.style ?? 'gallery.categories.other',
      year,
      medium: artwork.style ?? undefined,
      image: artwork.image_url
        ? `${environment.apiUrl}${artwork.image_url}`
        : 'images/gallery/ejemplo1.jpg', // fallback si el artista no subió foto
      descriptionKey: artwork.description ?? undefined
    };
  }

  protected readonly categories = computed(() => {
    const unique = Array.from(new Set(this.artworks().map(a => a.categoryKey)));
    return [ALL, ...unique];
  });

  protected readonly selectedCategory = signal<string>(ALL);

  protected readonly filteredArtworks = computed(() => {
    const cat = this.selectedCategory();
    return cat === ALL
      ? this.artworks()
      : this.artworks().filter(a => a.categoryKey === cat);
  });

  protected readonly lightboxOpen = signal(false);
  protected readonly currentIndex = signal(0);

  protected readonly currentArtwork = computed(() => {
    const list = this.filteredArtworks();
    return list.length ? list[this.currentIndex()] : null;
  });

  protected categoryLabelKey(category: string): string {
    return category === ALL ? 'gallery.categories.all' : category;
  }

  // Resuelve el título ya sea fijo (obras reales) o traducido (ejemplos).
  // instant() lee currentLang por dentro, se recalcula solo al cambiar idioma.
  protected artworkTitle(artwork: GalleryItem): string {
    if (artwork.title) return artwork.title;
    if (artwork.titleKey) return this.translate.instant(artwork.titleKey) as string;
    return '';
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  openLightbox(artwork: GalleryItem): void {
    const index = this.filteredArtworks().findIndex(a => a.id === artwork.id);
    this.currentIndex.set(index === -1 ? 0 : index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  next(): void {
    const list = this.filteredArtworks();
    if (!list.length) return;
    this.currentIndex.set((this.currentIndex() + 1) % list.length);
  }

  prev(): void {
    const list = this.filteredArtworks();
    if (!list.length) return;
    this.currentIndex.set((this.currentIndex() - 1 + list.length) % list.length);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}
