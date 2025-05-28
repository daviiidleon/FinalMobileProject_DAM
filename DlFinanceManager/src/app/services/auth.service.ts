import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

// Importamos la interfaz UserProfile del UserService para consistencia
import { UserProfile } from './user.service'; // Asegúrate de que la ruta sea correcta

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
    private platform: Platform,
    private zone: NgZone
  ) {
    if (this.storage) {
      this.checkTokenAndUser();
    } else {
      console.error('AuthService: Storage was not properly injected or initialized via APP_INITIALIZER.');
    }
  }

  private async checkTokenAndUser() {
    const token = await this.storage.get('auth_token');
    const userData: UserProfile | null = await this.storage.get('user_data'); // Tipado para userData

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
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.error && error.error.errors) {
      const laravelErrors = Object.values(error.error.errors).flat();
      errorMessage = laravelErrors.join('\n');
    }
    else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('AuthService Error:', errorMessage);
    return throwError(errorMessage);
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
      await from(this.http.post(`${this.apiUrl}/logout`, {})).toPromise();
      console.log('API logout request sent successfully.');
    } catch (e: any) {
      console.error('AuthService: Error al notificar logout al backend (el token puede haber expirado o la API no está accesible):', e);
    }

    await this.storage.remove('auth_token');
    await this.storage.remove('user_data');
    console.log('AuthService: Token and user data removed from local storage.');
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    console.log('AuthService: User unauthenticated state set. Navigating...');

    this.zone.run(() => {
      this.router.navigateByUrl('/auth', { replaceUrl: true });
    });
  }

  // ¡NUEVO MÉTODO! Para actualizar el usuario en el almacenamiento y en el BehaviorSubject
  async updateCurrentUser(user: UserProfile) {
    await this.storage.set('user_data', user); // Guarda el nuevo objeto de usuario
    this.currentUserSubject.next(user);       // Emite el nuevo objeto a todos los suscriptores
    console.log('AuthService: User data updated in storage and subject.');
  }

  getToken(): Promise<string | null> {
    return this.storage.get('auth_token');
  }
}
