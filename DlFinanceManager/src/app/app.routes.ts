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
    path: '', // Ruta por defecto
    redirectTo: 'auth', // Redirige a la página de autenticación al iniciar la app
    pathMatch: 'full', // Asegura que la ruta completa debe coincidir
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./page/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'transacciones', // Ruta para la página de transacciones
    loadComponent: () => import('./page/transacciones/transacciones.page').then(m => m.TransaccionesPage)
  },
  {
    path: 'cuentas',
    loadComponent: () => import('./page/cuentas/cuentas.page').then(m => m.CuentasPage)
  },
  {
    path: 'presupuestos',
    loadComponent: () => import('./page/presupuestos/presupuestos.page').then(m => m.PresupuestosPage)
  },
  {
    path: 'ahorro', // Ruta para la página de ahorro
    loadComponent: () => import('./page/ahorro/ahorro.page').then(m => m.AhorroPage)
  },
  {
    path: 'predicciones',
    loadComponent: () => import('./page/predicciones/predicciones.page').then(m => m.PrediccionesPage)
  },
  {
    path: 'reportes',
    loadComponent: () => import('./page/reportes/reportes.page').then(m => m.ReportesPage)
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./page/configuracion/configuracion.page').then(m => m.ConfiguracionPage)
  },
];
