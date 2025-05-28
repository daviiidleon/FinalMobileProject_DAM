import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Importa AuthGuard
import { NoAuthGuard } from './guards/no-auth.guard'; // Importa NoAuthGuard

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./page/home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard] // Protege esta ruta: requiere autenticación
  },
  {
    path: 'auth', // Ruta de login/registro
    loadComponent: () => import('./page/auth/auth.page').then(m => m.AuthPage),
    canActivate: [NoAuthGuard] // Protege esta ruta: no permite acceso si ya está autenticado
  },
  {
    path: '', // Ruta por defecto
    redirectTo: 'dashboard', // <-- CAMBIADO DE 'auth' a 'dashboard'
    pathMatch: 'full', // Asegura que la ruta completa debe coincidir
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./page/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  {
    path: 'transacciones', // Ruta para la página de transacciones
    loadComponent: () => import('./page/transacciones/transacciones.page').then(m => m.TransaccionesPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  {
    path: 'cuentas',
    loadComponent: () => import('./page/cuentas/cuentas.page').then(m => m.CuentasPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  {
    path: 'presupuestos',
    loadComponent: () => import('./page/presupuestos/presupuestos.page').then(m => m.PresupuestosPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  {
    path: 'ahorro', // Ruta para la página de ahorro
    loadComponent: () => import('./page/ahorro/ahorro.page').then(m => m.AhorroPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  {
    path: 'predicciones',
    loadComponent: () => import('./page/predicciones/predicciones.page').then(m => m.PrediccionesPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  {
    path: 'reportes',
    loadComponent: () => import('./page/reportes/reportes.page').then(m => m.ReportesPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./page/configuracion/configuracion.page').then(m => m.ConfiguracionPage),
    canActivate: [AuthGuard] // Protege esta ruta
  },
  // Opcional: Ruta comodín para redirigir URLs no encontradas
  {
    path: '**',
    redirectTo: 'dashboard', // <-- CAMBIADO DE 'home' a 'dashboard'
    pathMatch: 'full'
  }
];
