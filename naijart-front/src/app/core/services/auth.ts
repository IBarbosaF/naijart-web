import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'admin' | 'artist' | 'collector';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

interface LoginResponse {
  ok: boolean;
  token: string;
  user: AuthUser;
}

interface RegisterPayload {
  email: string;
  password: string;
  role: 'artist' | 'collector'; // el registro público nunca crea admins
  name?: string;
  surname?: string;
}

const TOKEN_KEY = 'naijart_token';
const USER_KEY = 'naijart_user';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private injector = inject(Injector);

  // Estado de sesión disponible para toda la app como signal.
  // null = no hay sesión iniciada.
  private currentUserSignal = signal<AuthUser | null>(this.readUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly role = computed(() => this.currentUserSignal()?.role ?? null);

  // ===== REGISTRO =====
  async register(payload: RegisterPayload): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/register`, payload)
    );
    // El registro NO inicia sesión automáticamente — el usuario hace login después.
  }

  // ===== LOGIN =====
  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
    );

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }

  // ===== LOGOUT =====
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.injector.get(Router).navigate(['/']);
  }

  // ===== Utilidades para el interceptor y los guards =====
  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUserFromStorage(): AuthUser | null {
    // SSR: en el servidor no existe localStorage, hay que comprobarlo
    if (typeof localStorage === 'undefined') return null;

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
