import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, UserRole } from '../services/auth';

// Guard funcional (estilo Angular moderno).
// Uso básico, solo exige sesión iniciada (cualquier rol):
//   { path: 'mi-perfil', component: Profile, canActivate: [authGuard] }
//
// Uso con roles concretos, vía route.data:
//   { path: 'admin/blog', component: BlogAdmin, canActivate: [authGuard], data: { roles: ['admin'] } }
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (allowedRoles && !allowedRoles.includes(auth.role()!)) {
    // Logueado, pero con el rol equivocado para esta ruta concreta
    router.navigate(['/']);
    return false;
  }

  return true;
};
