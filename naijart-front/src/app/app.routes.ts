import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'titles.home'
  },

  // Pendientes de crear el componente (los iremos descomentando):

  {
     path: 'galeria',
     loadComponent: () => import('./features/gallery/gallery').then(m => m.Gallery),
     title: 'titles.gallery'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.Login),
    title: 'titles.login'
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/register/register').then(m => m.Register),
    title: 'titles.register'
  },
  {
     path: 'calendario',
     loadComponent: () => import('./features/calendar/calendar').then(m => m.Calendar),
     title: 'titles.calendar'
   },
  {
     path: 'unete',
     loadComponent: () => import('./features/join/join').then(m => m.Join),
     title: 'titles.join'
   },
   {
     path: 'contacto',
     loadComponent: () => import('./features/contact/contact').then(m => m.Contact),
     title: 'titles.contact'
   },
   {
     path: 'quienes-somos',
     loadComponent: () => import('./features/team/team').then(m => m.Team),
     title: 'titles.about'
   },
  // {
  //   path: 'blog',
  //   loadComponent: () => import('./features/blog/blog').then(m => m.Blog),
  //   title: 'NAIJART — Blog'
  // },

  {
    path: 'panel/artista/obras',
    loadComponent: () => import('./features/panel/artist-artworks/artist-artworks').then(m => m.ArtistArtworks),
    canActivate: [authGuard],
    data: { roles: ['artist'] },
    title: 'titles.artistArtworks'
  },
  {
    path: 'panel/admin/eventos',
    loadComponent: () => import('./features/panel/admin-events/admin-events').then(m => m.AdminEvents),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    title: 'titles.adminEvents'
  },

  // Ruta comodín: si alguien entra a una URL que no existe, lo mandamos a Home
  // (más adelante podemos crear una página 404 real en vez de redirigir)
  {
    path: '**',
    redirectTo: ''
  }
];
