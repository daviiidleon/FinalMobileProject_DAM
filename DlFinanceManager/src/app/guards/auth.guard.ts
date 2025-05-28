import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators'; // Importa take
import { AuthService } from '../services/auth.service'; // Asegúrate de la ruta correcta

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAuthenticated.pipe(
      take(1), // Asegura que solo tome el primer valor y complete
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true; // El usuario está autenticado, permite el acceso
        } else {
          // El usuario no está autenticado, redirige a la página de autenticación
          console.log('AuthGuard: Usuario no autenticado, redirigiendo a /auth');
          return this.router.createUrlTree(['/auth']); // Crea un UrlTree para la redirección
        }
      })
    );
  }
}
