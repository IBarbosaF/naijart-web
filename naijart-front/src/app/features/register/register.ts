import { Component, signal, inject, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    role: ['artist' as 'artist' | 'collector', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    name: [''],
    surname: ['']
  });

  // Solo mostramos nombre/apellido cuando el rol elegido es "artist"
  readonly isArtist = computed(() => this.form.controls.role.value === 'artist');

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { role, email, password, name, surname } = this.form.getRawValue();

    try {
      await this.auth.register({
        role,
        email,
        password,
        ...(role === 'artist' ? { name, surname } : {})
      });

      this.successMessage.set('Cuenta creada correctamente. Ya puedes iniciar sesión.');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch (error: any) {
      this.errorMessage.set(error?.error?.error ?? 'Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
