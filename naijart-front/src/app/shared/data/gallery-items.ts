// src/app/shared/data/gallery-items.ts
// Fuente única de datos de galería. La usa el preview del Home y el
// componente de Galería — así ambos muestran lo mismo sin duplicar la lista.
//
// Dos tipos de entrada conviven aquí:
// - Obras reales: título/artista en texto fijo (title), no se traducen.
// - Obras de ejemplo (placeholder, ids 7-18): título traducido vía
//   titleKey, apuntando a las claves ya existentes en los 3 JSON
//   (gallery.items.i1...i12). Se quedan mientras no haya más obras reales.

export interface GalleryItem {
  id: number;
  slug: string;
  title?: string;          // título fijo — usar en obras reales
  titleKey?: string;       // clave i18n — usar en obras de ejemplo
  artist: string;          // nombre del artista — siempre texto fijo
  categoryKey: string;     // clave i18n, ej. 'gallery.categories.painting'
  year?: number;
  medium?: string;         // técnica — texto fijo, ej. 'Oil on canvas'
  size?: string;           // medidas — texto fijo
  // Ruta dentro de public/images/gallery/
  image: string;
  descriptionKey?: string; // opcional — texto curatorial traducido
}

export const GALLERY_ITEMS: GalleryItem[] = [
  // ===== OBRAS REALES — Nelly Idagba =====
  {
    id: 1,
    slug: 'bound-by-light',
    title: 'Bound by Light',
    artist: 'Nelly Idagba',
    categoryKey: 'gallery.categories.painting',
    year: 2026,
    medium: 'Oil on canvas',
    size: '93.98 cm × 119.38 cm',
    image: 'images/gallery/boundByLight.jpeg'
  },
  {
    id: 2,
    slug: 'crown-within',
    title: 'Crown Within',
    artist: 'Nelly Idagba',
    categoryKey: 'gallery.categories.painting',
    year: 2026,
    medium: 'Oil on canvas',
    size: '76.2 cm × 91.44 cm',
    image: 'images/gallery/crownWithin.jpeg'
  },
  {
    id: 3,
    slug: 'the-weight-of-time',
    title: 'The Weight of Time',
    artist: 'Nelly Idagba',
    categoryKey: 'gallery.categories.painting',
    year: 2026,
    medium: 'Oil on canvas',
    size: '93.98 cm × 119.38 cm',
    image: 'images/gallery/theWeightOfTime.jpeg'
  },
  {
    id: 4,
    slug: 'ekombi',
    title: 'Ekombi',
    artist: 'Nelly Idagba',
    categoryKey: 'gallery.categories.painting',
    year: 2026,
    medium: 'Oil on canvas',
    size: '93.98 cm × 119.38 cm',
    image: 'images/gallery/ekombi.jpeg'
  },
  {
    id: 5,
    slug: 'cast-in-silence',
    title: 'Cast in Silence',
    artist: 'Nelly Idagba',
    categoryKey: 'gallery.categories.painting',
    year: 2026,
    medium: 'Oil on canvas',
    size: '93.98 cm × 119.38 cm',
    image: 'images/gallery/castInSilence.jpeg'
  },
  {
    id: 6,
    slug: 'the-witness',
    title: 'The Witness',
    artist: 'Nelly Idagba',
    categoryKey: 'gallery.categories.painting',
    year: 2026,
    medium: 'Oil on canvas',
    // Único tamaño que llegó en pulgadas (30×40 in), convertido a cm
    // para que la ficha técnica sea homogénea con el resto.
    size: '76.2 cm × 101.6 cm',
    image: 'images/gallery/theWitness.jpeg'
  },

  // ===== OBRAS DE EJEMPLO (placeholder, título/desc. traducidos) =====
  {
    id: 7,
    slug: 'obra-ejemplo-01',
    titleKey: 'gallery.items.i1.title',
    artist: 'Adaeze Nwosu',
    categoryKey: 'gallery.categories.painting',
    year: 2023,
    image: 'images/gallery/ejemplo1.jpg',
    descriptionKey: 'gallery.items.i1.description'
  },
  {
    id: 8,
    slug: 'obra-ejemplo-02',
    titleKey: 'gallery.items.i2.title',
    artist: 'Chibueze Okafor',
    categoryKey: 'gallery.categories.sculpture',
    year: 2022,
    image: 'images/gallery/ejemplo3.jpg',
    descriptionKey: 'gallery.items.i2.description'
  },
  {
    id: 9,
    slug: 'obra-ejemplo-03',
    titleKey: 'gallery.items.i3.title',
    artist: 'Folake Adeyemi',
    categoryKey: 'gallery.categories.photography',
    year: 2024,
    image: 'images/gallery/ejemplo2.jpg',
    descriptionKey: 'gallery.items.i3.description'
  },
  {
    id: 10,
    slug: 'obra-ejemplo-04',
    titleKey: 'gallery.items.i4.title',
    artist: 'Ngozi Eze',
    categoryKey: 'gallery.categories.textile',
    year: 2023,
    image: 'images/gallery/ejemplo5.webp',
    descriptionKey: 'gallery.items.i4.description'
  },
  {
    id: 11,
    slug: 'obra-ejemplo-05',
    titleKey: 'gallery.items.i5.title',
    artist: 'Emeka Obi',
    categoryKey: 'gallery.categories.digital',
    year: 2024,
    image: 'images/gallery/ejemplo4.jpg',
    descriptionKey: 'gallery.items.i5.description'
  },
  {
    id: 12,
    slug: 'obra-ejemplo-06',
    titleKey: 'gallery.items.i6.title',
    artist: 'Amara Chukwu',
    categoryKey: 'gallery.categories.painting',
    year: 2021,
    image: 'images/gallery/ejemplo6.jfif',
    descriptionKey: 'gallery.items.i6.description'
  },
  {
    id: 13,
    slug: 'obra-ejemplo-07',
    titleKey: 'gallery.items.i7.title',
    artist: 'Chibueze Okafor',
    categoryKey: 'gallery.categories.sculpture',
    year: 2020,
    image: 'images/gallery/ejemplo7.jpg',
    descriptionKey: 'gallery.items.i7.description'
  },
  {
    id: 14,
    slug: 'obra-ejemplo-08',
    titleKey: 'gallery.items.i8.title',
    artist: 'Folake Adeyemi',
    categoryKey: 'gallery.categories.photography',
    year: 2023,
    image: 'images/gallery/ejemplo8.webp',
    descriptionKey: 'gallery.items.i8.description'
  },
  {
    id: 15,
    slug: 'obra-ejemplo-09',
    titleKey: 'gallery.items.i9.title',
    artist: 'Ngozi Eze',
    categoryKey: 'gallery.categories.textile',
    year: 2022,
    image: 'images/gallery/ejemplo9.jfif',
    descriptionKey: 'gallery.items.i9.description'
  },
  {
    id: 16,
    slug: 'obra-ejemplo-10',
    titleKey: 'gallery.items.i10.title',
    artist: 'Emeka Obi',
    categoryKey: 'gallery.categories.digital',
    year: 2023,
    image: 'images/gallery/ejemplo10.avif',
    descriptionKey: 'gallery.items.i10.description'
  },
  {
    id: 17,
    slug: 'obra-ejemplo-11',
    titleKey: 'gallery.items.i11.title',
    artist: 'Amara Chukwu',
    categoryKey: 'gallery.categories.painting',
    year: 2024,
    image: 'images/gallery/ejemplo11.jpg',
    descriptionKey: 'gallery.items.i11.description'
  },
  {
    id: 18,
    slug: 'obra-ejemplo-12',
    titleKey: 'gallery.items.i12.title',
    artist: 'Folake Adeyemi',
    categoryKey: 'gallery.categories.photography',
    year: 2022,
    image: 'images/gallery/ejemplo12.jpg',
    descriptionKey: 'gallery.items.i12.description'
  }
];
