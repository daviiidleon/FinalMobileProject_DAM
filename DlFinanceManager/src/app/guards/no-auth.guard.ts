import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators'; // Importa take
import { AuthService } from '../services/auth.service'; // Asegúrate de la ruta correcta

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAuthenticated.pipe(
      take(1), // Asegura que solo tome el primer valor y complete
      map(isAuthenticated => {
        if (isAuthenticated) {
          // El usuario ya está autenticado, redirige a la página principal (dashboard o home)
          console.log('NoAuthGuard: Usuario ya autenticado, redirigiendo a /home');
          return this.router.createUrlTree(['/home']); // Redirige a tu página principal
        } else {
          return true; // El usuario no está autenticado, permite el acceso a la ruta de auth
        }
      })
    );
  }
}
