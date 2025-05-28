import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Opcional: Interfaz para el objeto de usuario que recibes de la API
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  // Añade otros campos si los devuelves desde la API
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.error && error.error.errors) {
      // Errores de validación de Laravel
      const laravelErrors = Object.values(error.error.errors).flat();
      errorMessage = laravelErrors.join('\n');
    } else if (error.error && error.error.message) {
      // Otros errores del servidor (mensaje de la API)
      errorMessage = error.error.message;
    } else if (error.status) {
      // Errores HTTP con código de estado
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
    }
    console.error('UserService Error:', error); // Log completo del error para depuración
    return throwError(errorMessage); // Propaga el error como un mensaje más amigable
  }

  // Método para obtener el perfil del usuario
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user`).pipe(
      catchError(this.handleError)
    );
  }

  // Método para actualizar el perfil del usuario
  updateUserProfile(userData: any): Observable<any> {
    // Usamos PUT ya que el endpoint de Laravel está configurado para PUT
    return this.http.put<any>(`${this.apiUrl}/user`, userData).pipe(
      catchError(this.handleError)
    );
  }
}
