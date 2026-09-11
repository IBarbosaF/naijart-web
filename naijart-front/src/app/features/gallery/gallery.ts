import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GALLERY_ITEMS, GalleryItem } from '../../shared/data/gallery-items';

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

  protected readonly artworks: GalleryItem[] = GALLERY_ITEMS;

  protected readonly categories = computed(() => {
    const unique = Array.from(new Set(this.artworks.map(a => a.categoryKey)));
    return [ALL, ...unique];
  });

  protected readonly selectedCategory = signal<string>(ALL);

  protected readonly filteredArtworks = computed(() => {
    const cat = this.selectedCategory();
    return cat === ALL
      ? this.artworks
      : this.artworks.filter(a => a.categoryKey === cat);
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
