// src/app/services/account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaz para el objeto Cuenta (ESTA ES LA INTERFAZ QUE ESPERA TU API DE LARAVEL)
export interface Account {
  id?: number;
  user_id?: number;
  name: string;
  // ===> ¡CAMBIO CLAVE AQUÍ! Renombrado a 'current_balance' para coincidir con el backend <===
  current_balance: number;
  currency: string;
  type: 'cash' | 'bank' | 'credit_card' | 'investment' | 'other'; // Asegúrate que estos ENUMs coincidan con tu backend
  institution?: string | null;
  initial_balance?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Importar ClientAccount para la visualización en el frontend si es necesario en el servicio
import { ClientAccount } from '../page/cuentas/cuentas.page'; // Asegúrate de que esta ruta sea correcta

// --- Interfaz para la respuesta de la API (cuando creas/actualizas una cuenta) ---
export interface AccountApiResponse {
  message: string;
  account: Account; // La cuenta real devuelta por la API
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = environment.apiUrl;

  // BehaviorSubject para la cuenta seleccionada, inicializado en null
  private selectedAccountSubject = new BehaviorSubject<ClientAccount | null>(null);
  public selectedAccount$: Observable<ClientAccount | null> = this.selectedAccountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar la cuenta seleccionada desde localStorage al inicio
    const storedAccount = localStorage.getItem('selectedAccount');
    if (storedAccount) {
      try {
        this.selectedAccountSubject.next(JSON.parse(storedAccount));
      } catch (e) {
        console.error("Error al parsear la cuenta seleccionada almacenada:", e);
        localStorage.removeItem('selectedAccount'); // Limpiar si está corrupto
      }
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.error && error.error.errors) {
      const laravelErrors = Object.values(error.error.errors).flat();
      errorMessage = laravelErrors.join('\n');
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status) {
      errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión, CORS, o que el servidor esté funcionando.';
      }
    } else {
      errorMessage = 'No se pudo conectar con el servidor. Intente de nuevo más tarde.';
    }
    console.error('AccountService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`).pipe(
      catchError(this.handleError)
    );
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounts/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createAccount(account: Account): Observable<AccountApiResponse> {
    return this.http.post<AccountApiResponse>(`${this.apiUrl}/accounts`, account).pipe(
      catchError(this.handleError)
    );
  }

  updateAccount(id: number, account: Account): Observable<AccountApiResponse> {
    return this.http.put<AccountApiResponse>(`${this.apiUrl}/accounts/${id}`, account).pipe(
      catchError(this.handleError)
    );
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/accounts/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  setSelectedAccount(account: ClientAccount | null) {
    this.selectedAccountSubject.next(account);
    console.log('AccountService: Cuenta seleccionada establecida:', account ? account.nombre : 'ninguna');
    if (account) {
      localStorage.setItem('selectedAccount', JSON.stringify(account));
    } else {
      localStorage.removeItem('selectedAccount');
    }
  }

  getSelectedAccount(): ClientAccount | null {
    return this.selectedAccountSubject.getValue();
  }
}
