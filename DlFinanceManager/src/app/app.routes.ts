import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./page/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'auth',
    loadComponent: () => import('./page/auth/auth.page').then(m => m.AuthPage),
  },
  {
    path: '',
    redirectTo: 'auth',      // ← aquí cambiamos a 'auth'
    pathMatch: 'full',
  },
];
