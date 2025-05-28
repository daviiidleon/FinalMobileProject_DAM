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
  profile_picture_url?: string; // <-- Added: Property for the avatar URL
  // Add other fields if you return them from the API
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
      // Client-side error
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.error && error.error.errors) {
      // Laravel validation errors
      const laravelErrors = Object.values(error.error.errors).flat();
      errorMessage = laravelErrors.join('\n');
    } else if (error.error && error.error.message) {
      // Other server errors (API message)
      errorMessage = error.error.message;
    } else if (error.status) {
      // HTTP errors with status code
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
    }
    console.error('UserService Error:', error); // Full error log for debugging
    return throwError(errorMessage); // Propagate the error as a more friendly message
  }

  // Method to get the user profile
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user`).pipe(
      catchError(this.handleError)
    );
  }

  // Method to update the user profile (name, email, password)
  updateUserProfile(userData: any): Observable<any> {
    // We use PUT as the Laravel endpoint is configured for PUT
    return this.http.put<any>(`${this.apiUrl}/user`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // NEW METHOD to upload the avatar
  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file, file.name); // 'avatar' must match the field name in the API

    return this.http.post<any>(`${this.apiUrl}/user/avatar`, formData).pipe(
      catchError(this.handleError)
    );
  }
}
