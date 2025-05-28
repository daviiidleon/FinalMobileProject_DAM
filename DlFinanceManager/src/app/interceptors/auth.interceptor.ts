// Contenido para src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo intercepta peticiones a nuestra API
    if (request.url.startsWith(environment.apiUrl)) {
      return from(this.authService.getToken()).pipe(
        switchMap(token => {
          if (token) {
            // Si hay un token, añádelo al header Authorization
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          return next.handle(request);
        }),
        catchError(error => {
          // Si el token no es válido o hay un error de autenticación, puedes redirigir al login
          if (error.status === 401 || error.status === 403) {
            console.error('Interceptor: Petición no autorizada o prohibida, puede que el token haya expirado.');
            // No forzamos el logout aquí, dejamos que AuthService lo maneje si la API devuelve 401 en el logout.
          }
          return throwError(error); // Re-lanza el error
        })
      );
    } else {
      // Si la petición no es a nuestra API, no la interceptes
      return next.handle(request);
    }
  }
}
