import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular'; // Importación correcta
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular'; // Importación correcta

// Importamos la interfaz UserProfile del UserService para consistencia
import { UserProfile } from './user.service'; // Asegúrate de que la ruta sea correcta a tu UserService

// Definimos la respuesta de autenticación para incluir el objeto de usuario
interface AuthResponse {
  user: UserProfile; // Ahora tipado con UserProfile
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

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private router: Router,
    private platform: Platform, // Inyecta Platform
    private zone: NgZone // Inyecta NgZone
  ) {
    // Inicializa el Storage de forma asíncrona y luego comprueba el token
    // Se asegura de que la plataforma esté lista antes de inicializar Storage
    this.platform.ready().then(() => {
      this.storage.create().then(() => {
        this.checkTokenAndUser();
      }).catch(e => {
        console.error('AuthService: Error al inicializar Storage. La aplicación podría no funcionar correctamente si el almacenamiento es vital.', e);
      });
    });
  }

  private async checkTokenAndUser() {
    const token = await this.storage.get('auth_token');
    const userData: UserProfile | null = await this.storage.get('user_data');

    if (token && userData) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(userData);
      console.log('AuthService: Token y datos de usuario encontrados en almacenamiento.');
    } else {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
      console.log('AuthService: No hay token o datos de usuario en almacenamiento.');
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.errors) {
      // Errores de validación de Laravel (ej. {"errors": {"email": ["El email ya ha sido tomado."]} })
      const laravelErrors = Object.values(error.error.errors).flat(); // Aplana los arrays de errores
      errorMessage = laravelErrors.join('\n');
    }
    else if (error.error && error.error.message) {
      // Otros mensajes de error de Laravel (ej. "Credenciales inválidas" para login)
      errorMessage = error.error.message;
    } else if (error.status) {
      // Error del lado del servidor (4xx, 5xx) sin un cuerpo de respuesta específico
      errorMessage = `Error de servidor: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error('AuthService Error:', errorMessage);
    return throwError(() => errorMessage); // Es preferible devolver una función para throwError
  }

  register(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap(async (res: AuthResponse) => {
        await this.storage.set('auth_token', res.token);
        await this.storage.set('user_data', res.user);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(res.user);
      }),
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(async (res: AuthResponse) => {
        await this.storage.set('auth_token', res.token);
        await this.storage.set('user_data', res.user);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(res.user);
      }),
      catchError(this.handleError)
    );
  }

  async logout() {
    console.log('AuthService.logout() called. Attempting API logout...');

    try {
      // Envía la petición de logout al backend. Se usa .toPromise() para que sea awaitable.
      // Si la API falla o el token expira, la petición puede fallar, pero limpiamos el almacenamiento local de todas formas.
      await from(this.http.post(`${this.apiUrl}/logout`, {})).toPromise();
      console.log('API logout request sent successfully.');
    } catch (e: any) {
      console.error('AuthService: Error al notificar logout al backend (el token puede haber expirado o la API no está accesible):', e);
    }

    // Limpia el almacenamiento local independientemente del resultado de la petición al backend.
    await this.storage.remove('auth_token');
    await this.storage.remove('user_data');
    console.log('AuthService: Token y datos de usuario eliminados del almacenamiento local.');
    this.isAuthenticatedSubject.next(false); // Establece el estado de no autenticado
    this.currentUserSubject.next(null);       // Limpia el usuario actual
    console.log('AuthService: Estado de usuario desautenticado. Navegando...');

    // Asegura la navegación dentro de la zona de ejecución de Angular.
    this.zone.run(() => {
      this.router.navigateByUrl('/auth', { replaceUrl: true }); // Redirige a la página de autenticación
    });
  }

  async updateCurrentUser(user: UserProfile) {
    await this.storage.set('user_data', user); // Guarda el nuevo objeto de usuario en el almacenamiento local
    this.currentUserSubject.next(user);       // Emite el nuevo objeto a todos los suscriptores
    console.log('AuthService: Datos de usuario actualizados en el almacenamiento y en el subject.');
  }

  getToken(): Promise<string | null> {
    return this.storage.get('auth_token');
  }
}
