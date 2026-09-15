import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

// Interceptor funcional (estilo Angular moderno, sin clases).
// Añade "Authorization: Bearer <token>" a cada petición saliente,
// si hay una sesión activa. Las rutas públicas del backend (GET de
// artworks, events, blog...) simplemente ignoran esa cabecera si llega,
// así que no hace falta filtrar por URL aquí.
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();

  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(cloned);
};
