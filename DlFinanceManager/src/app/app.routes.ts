import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Asegúrate de que las rutas a los guards sean correctas
import { NoAuthGuard } from './guards/no-auth.guard'; // Asegúrate de que las rutas a los guards sean correctas

export const routes: Routes = [
  {
    path: '', // Ruta por defecto (cuando se accede a la raíz de la app)
    // Carga el componente de autenticación.
    // NoAuthGuard decidirá si el usuario ya está autenticado (y lo redirigirá al dashboard)
    // o si no lo está (y le permitirá ver la página de autenticación).
    loadComponent: () => import('./page/auth/auth.page').then(m => m.AuthPage),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'auth', // Ruta explícita de login/registro
    loadComponent: () => import('./page/auth/auth.page').then(m => m.AuthPage),
    canActivate: [NoAuthGuard] // Si el usuario ya está autenticado, no debería ver esta página.
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./page/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard] // Protege esta ruta: requiere autenticación
  },
  {
    path: 'transacciones',
    loadComponent: () => import('./page/transacciones/transacciones.page').then(m => m.TransaccionesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'cuentas',
    loadComponent: () => import('./page/cuentas/cuentas.page').then(m => m.CuentasPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'presupuestos',
    loadComponent: () => import('./page/presupuestos/presupuestos.page').then(m => m.PresupuestosPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'ahorro',
    loadComponent: () => import('./page/ahorro/ahorro.page').then(m => m.AhorroPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'predicciones',
    loadComponent: () => import('./page/predicciones/predicciones.page').then(m => m.PrediccionesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes',
    loadComponent: () => import('./page/reportes/reportes.page').then(m => m.ReportesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./page/configuracion/configuracion.page').then(m => m.ConfiguracionPage),
    canActivate: [AuthGuard]
  },
  // Opcional: Ruta comodín para redirigir URLs no encontradas
  {
    path: '**', // Cualquier otra ruta que no coincida con las anteriores
    redirectTo: '', // Redirige a la ruta raíz, que ahora está protegida por NoAuthGuard
    pathMatch: 'full'
  }
];
