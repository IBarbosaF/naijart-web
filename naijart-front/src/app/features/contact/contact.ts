import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  private fb = inject(FormBuilder);

  submitState = signal<SubmitState>('idle');

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['general', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  subjectOptions = [
    { value: 'general', labelKey: 'contact.subjects.general' },
    { value: 'colaboracion', labelKey: 'contact.subjects.collaboration' },
    { value: 'prensa', labelKey: 'contact.subjects.press' },
    { value: 'otro', labelKey: 'contact.subjects.other' }
  ];

  scheduleRows = [
    { dayKey: 'contact.schedule.weekdays', hoursKey: 'contact.schedule.weekdaysHours' },
    { dayKey: 'contact.schedule.saturday', hoursKey: 'contact.schedule.saturdayHours' },
    { dayKey: 'contact.schedule.sunday', hoursKey: 'contact.schedule.closed' }
  ];

  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get message() { return this.contactForm.get('message'); }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitState.set('sending');

    // TODO Fase 2: sustituir simulación por llamada real al backend.
    setTimeout(() => {
      this.submitState.set('success');
      this.contactForm.reset({ subject: 'general' });

      setTimeout(() => this.submitState.set('idle'), 5000);
    }, 1400);
  }
}
