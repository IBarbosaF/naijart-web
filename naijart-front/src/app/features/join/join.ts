import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

type ProfileType = 'artist' | 'collaborator';

interface JoinFormData {
  type: ProfileType;
  name: string;
  email: string;
  portfolioLink: string;
  interestArea: string;
  message: string;
}

interface Benefit {
  icon: string;
  titleKey: string;   // clave de traducción, ej. 'join.benefits.b1.title'
  descriptionKey: string;
}

interface ProcessStep {
  number: string;
  titleKey: string;
  descriptionKey: string;
}

interface InterestArea {
  value: string;
  labelKey: string;
}

interface Testimonial {
  quoteKey: string;
  nameKey: string;
  roleKey: string;
}

const EMPTY_FORM: JoinFormData = {
  type: 'artist',
  name: '',
  email: '',
  portfolioLink: '',
  interestArea: '',
  message: '',
};

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './join.html',
  styleUrl: './join.scss',
})
export class Join {
  // ===== CONTENIDO (placeholder — sustituir por textos reales) =====

  protected readonly benefits: Benefit[] = [
    { icon: 'globe', titleKey: 'join.benefits.b1.title', descriptionKey: 'join.benefits.b1.description' },
    { icon: 'users', titleKey: 'join.benefits.b2.title', descriptionKey: 'join.benefits.b2.description' },
    { icon: 'book', titleKey: 'join.benefits.b3.title', descriptionKey: 'join.benefits.b3.description' },
    { icon: 'link', titleKey: 'join.benefits.b4.title', descriptionKey: 'join.benefits.b4.description' },
  ];

  protected readonly steps: ProcessStep[] = [
    { number: '01', titleKey: 'join.steps.s1.title', descriptionKey: 'join.steps.s1.description' },
    { number: '02', titleKey: 'join.steps.s2.title', descriptionKey: 'join.steps.s2.description' },
    { number: '03', titleKey: 'join.steps.s3.title', descriptionKey: 'join.steps.s3.description' },
    { number: '04', titleKey: 'join.steps.s4.title', descriptionKey: 'join.steps.s4.description' },
  ];

  protected readonly testimonials: Testimonial[] = [
    { quoteKey: 'join.testimonials.t1.quote', nameKey: 'join.testimonials.name', roleKey: 'join.testimonials.t1.role' },
    { quoteKey: 'join.testimonials.t2.quote', nameKey: 'join.testimonials.name', roleKey: 'join.testimonials.t2.role' },
    { quoteKey: 'join.testimonials.t3.quote', nameKey: 'join.testimonials.name', roleKey: 'join.testimonials.t3.role' },
  ];

  protected readonly interestAreas: InterestArea[] = [
    { value: 'design', labelKey: 'join.areas.design' },
    { value: 'events', labelKey: 'join.areas.events' },
    { value: 'social', labelKey: 'join.areas.social' },
    { value: 'translation', labelKey: 'join.areas.translation' },
    { value: 'other', labelKey: 'join.areas.other' },
  ];

  // ===== ESTADO DEL FORMULARIO =====

  protected readonly formData = signal<JoinFormData>({ ...EMPTY_FORM });
  protected readonly formStatus = signal<'idle' | 'success'>('idle');

  protected setType(type: ProfileType): void {
    this.formData.update((data) => ({ ...data, type }));
  }

  protected updateField<K extends keyof JoinFormData>(field: K, value: JoinFormData[K]): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
  }

  protected onSubmit(): void {
    // TODO (Fase 2): conectar con backend / servicio de email real.
    // Por ahora simulamos el envío para no bloquear la experiencia de usuario.
    console.log('Solicitud Únete (pendiente de backend):', this.formData());
    this.formStatus.set('success');
  }

  protected sendAnother(): void {
    this.formData.set({ ...EMPTY_FORM });
    this.formStatus.set('idle');
  }
}
