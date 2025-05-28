import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

interface AuthResponse {
  user: any;
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: Storage, // La instancia de Storage ya inyectada y creada por main.ts
    private router: Router,
    private platform: Platform,
    private zone: NgZone
  ) {
    // Si el Storage está listo (garantizado por APP_INITIALIZER), comprobar el token al inicio.
    // Ya no es necesario 'storageReadySubject' ni 'setTimeout' aquí.
    if (this.storage) {
      this.checkToken();
    } else {
      // Esto no debería ocurrir si APP_INITIALIZER funciona correctamente.
      console.error('AuthService: Storage was not properly injected or initialized via APP_INITIALIZER.');
    }
  }

  // Método para verificar si un token existe en el almacenamiento al iniciar la aplicación
  private async checkToken() {
    const token = await this.storage.get('auth_token'); // 'get' ahora debería funcionar
    if (token) {
      this.isAuthenticatedSubject.next(true);
      console.log('AuthService: Token encontrado en almacenamiento:', token);
    } else {
      this.isAuthenticatedSubject.next(false);
      console.log('AuthService: No hay token en almacenamiento.');
    }
  }

  // Helper para manejar errores de HTTP
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.errors) {
      // Laravel Validation Errors
      const laravelErrors = Object.values(error.error.errors).flat();
      errorMessage = laravelErrors.join('\n');
    }
    else if (error.error && error.error.message) {
      // Server-side errors (Laravel)
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('AuthService Error:', errorMessage);
    return throwError(errorMessage); // Propaga el error
  }

  // Método de Registro
  register(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap(async (res: AuthResponse) => {
        await this.storage.set('auth_token', res.token); // 'set' ahora debería funcionar
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  // Método de Login
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(async (res: AuthResponse) => {
        await this.storage.set('auth_token', res.token); // 'set' ahora debería funcionar
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  // Método de Logout
  async logout() {
    console.log('AuthService.logout() called. Attempting API logout...');

    try {
      // La petición HTTP se enviará con el token gracias al Interceptor
      await from(this.http.post(`${this.apiUrl}/logout`, {})).toPromise();
      console.log('API logout request sent successfully.');
    } catch (e: any) {
      console.error('AuthService: Error al notificar logout al backend (el token puede haber expirado o la API no está accesible):', e);
      // Continuamos con el logout local aunque el backend falle
    }

    // Realiza el logout local
    await this.storage.remove('auth_token'); // 'remove' ahora debería funcionar
    console.log('AuthService: Token removed from local storage.');
    this.isAuthenticatedSubject.next(false);
    console.log('AuthService: User unauthenticated state set. Navigating...');

    this.zone.run(() => {
      // ¡¡¡CAMBIO REALIZADO AQUÍ: Navegar a '/auth' en lugar de '/login'!!!
      this.router.navigateByUrl('/auth', { replaceUrl: true }); // Usar replaceUrl para limpiar el historial
    });
  }

  // Método para obtener el token (usado por el Interceptor HTTP)
  // Ahora asume que Storage ya está listo
  getToken(): Promise<string | null> {
    return this.storage.get('auth_token');
  }
}
