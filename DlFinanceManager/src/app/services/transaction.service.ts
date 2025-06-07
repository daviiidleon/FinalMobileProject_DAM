// src/app/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaz que representa una transacción tal como la espera o devuelve tu API de Laravel
export interface Transaction {
  id?: number; // Opcional, Laravel lo asignará
  user_id?: number; // Puede ser asignado por Laravel en el backend (ej. Auth::user()->id)
  account_id: number;
  category_id?: number; // Clave foránea a tu tabla de categorías
  type: 'income' | 'expense' | 'transfer'; // Tipos de transacción
  amount: number; // Cantidad de la transacción
  description: string; // Descripción corta
  transaction_date: string; // Fecha de la transacción (formato 'YYYY-MM-DD HH:MM:SS' o similar)
  payee?: string | null;    // Beneficiario/Pagador (opcional)
  notes?: string | null;    // Notas adicionales (opcional)
  created_at?: string; // Marca de tiempo de creación (Laravel)
  updated_at?: string; // Marca de tiempo de última actualización (Laravel)
}

// Interfaz para la respuesta de la API al crear/actualizar una transacción
export interface TransactionApiResponse {
  message: string;
  transaction: Transaction; // La transacción real devuelta por la API
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Maneja los errores de las solicitudes HTTP, extrayendo un mensaje amigable.
   * @param error El HttpErrorResponse recibido de la llamada HTTP.
   * @returns Un Observable de error con un mensaje procesado.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud.';

    if (error.error instanceof ErrorEvent) {
      // Errores del lado del cliente o de red
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.error && error.error.errors) {
      // Errores de validación de Laravel (ej. {"field": ["error message"]})
      // Combina todos los mensajes de error de los campos en una sola cadena.
      const laravelErrors = Object.values(error.error.errors).flat();
      errorMessage = laravelErrors.join('\n');
    } else if (error.error && error.error.message) {
      // Mensaje de error general de Laravel (ej. {"message": "Unauthenticated."})
      errorMessage = error.error.message;
    } else if (error.status) {
      // Errores del servidor HTTP con un código de estado (ej. 404, 500)
      // Incluye el texto de estado HTTP para mayor claridad.
      errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
      if (error.status === 0) {
        // Error de red, el servidor no responde o CORS bloqueado
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión o que el servidor esté funcionando.';
      }
    } else {
      // Otros tipos de errores no cubiertos anteriormente
      errorMessage = 'No se pudo conectar con el servidor. Intente de nuevo más tarde.';
    }

    console.error('TransactionService Error:', errorMessage, error); // Log completo del error para depuración
    return throwError(() => new Error(errorMessage)); // Propagar el error para que el componente lo maneje
  }

  /**
   * Obtiene una lista de transacciones desde la API.
   * @param accountId Opcional. Si se proporciona, filtra las transacciones por esta cuenta.
   * @returns Un Observable que emite un array de objetos Transaction.
   */
  getTransactions(accountId?: number): Observable<Transaction[]> {
    let url = `${this.apiUrl}/transactions`;
    if (accountId) {
      url += `?account_id=${accountId}`;
    }
    console.log(`TransactionService: Solicitando GET ${url}`); // Log de la URL que se está llamando
    return this.http.get<Transaction[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene una transacción específica por su ID desde la API.
   * @param id El ID de la transacción a obtener.
   * @returns Un Observable que emite el objeto Transaction.
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea una nueva transacción enviándola a la API.
   * @param transaction El objeto Transaction a crear.
   * @returns Un Observable que emite la respuesta de la API (TransactionApiResponse).
   */
  createTransaction(transaction: Transaction): Observable<TransactionApiResponse> {
    console.log(`TransactionService: Solicitando POST ${this.apiUrl}/transactions con datos:`, transaction);
    return this.http.post<TransactionApiResponse>(`${this.apiUrl}/transactions`, transaction).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una transacción existente enviando los cambios a la API.
   * @param id El ID de la transacción a actualizar.
   * @param transaction El objeto Transaction con los datos actualizados.
   * @returns Un Observable que emite la respuesta de la API (TransactionApiResponse).
   */
  updateTransaction(id: number, transaction: Transaction): Observable<TransactionApiResponse> {
    console.log(`TransactionService: Solicitando PUT ${this.apiUrl}/transactions/${id} con datos:`, transaction);
    return this.http.put<TransactionApiResponse>(`${this.apiUrl}/transactions/${id}`, transaction).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una transacción de la API por su ID.
   * @param id El ID de la transacción a eliminar.
   * @returns Un Observable que emite la respuesta de la API (generalmente un objeto vacío o un mensaje).
   */
  deleteTransaction(id: number): Observable<any> {
    console.log(`TransactionService: Solicitando DELETE ${this.apiUrl}/transactions/${id}`);
    return this.http.delete<any>(`${this.apiUrl}/transactions/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Envía un array de transacciones para importación masiva a la API.
   * Tu backend de Laravel necesitará un endpoint específico para manejar esta operación.
   * @param transactions Un array de objetos Transaction a importar.
   * @returns Un Observable que emite la respuesta de la API.
   */
  importTransactions(transactions: Transaction[]): Observable<any> {
    console.log(`TransactionService: Solicitando POST ${this.apiUrl}/transactions/import para importar ${transactions.length} transacciones.`);
    return this.http.post<any>(`${this.apiUrl}/transactions/import`, { transactions }).pipe(
      catchError(this.handleError)
    );
  }
}
