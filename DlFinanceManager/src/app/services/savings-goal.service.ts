import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SavingsGoal {
  id?: number;
  user_id?: number;
  account_id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date?: string | null;
  description?: string | null;
  is_achieved: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavingsGoalApiResponse {
  message: string;
  savings_goal: SavingsGoal;
}

@Injectable({
  providedIn: 'root'
})
export class SavingsGoalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud de meta de ahorro.';
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
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión o que el servidor esté funcionando.';
      }
    } else {
      errorMessage = 'No se pudo conectar con el servidor. Intente de nuevo más tarde.';
    }
    console.error('SavingsGoalService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getSavingsGoals(accountId?: number): Observable<SavingsGoal[]> {
    let url = `${this.apiUrl}/savings-goals`;
    if (accountId) {
      url += `?account_id=${accountId}`;
    }
    console.log(`SavingsGoalService: Solicitando GET ${url}`);
    return this.http.get<SavingsGoal[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getSavingsGoalById(id: number): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.apiUrl}/savings-goals/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createSavingsGoal(goal: SavingsGoal): Observable<SavingsGoalApiResponse> {
    console.log(`SavingsGoalService: Solicitando POST ${this.apiUrl}/savings-goals con datos:`, goal);
    return this.http.post<SavingsGoalApiResponse>(`${this.apiUrl}/savings-goals`, goal).pipe(
      catchError(this.handleError)
    );
  }

  updateSavingsGoal(id: number, goal: Partial<SavingsGoal>): Observable<SavingsGoalApiResponse> {
    console.log(`SavingsGoalService: Solicitando PUT ${this.apiUrl}/savings-goals/${id} con datos:`, goal);
    return this.http.put<SavingsGoalApiResponse>(`${this.apiUrl}/savings-goals/${id}`, goal).pipe(
      catchError(this.handleError)
    );
  }

  deleteSavingsGoal(id: number): Observable<any> {
    console.log(`SavingsGoalService: Solicitando DELETE ${this.apiUrl}/savings-goals/${id}`);
    return this.http.delete<any>(`${this.apiUrl}/savings-goals/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // MODIFICADO: Ahora acepta accountId para incluirlo en el payload
  addFundsToGoal(goalId: number, amount: number, accountId: number): Observable<SavingsGoalApiResponse> { // <-- Se añade accountId
    const payload = { amount: amount, account_id: accountId }; // <-- Se incluye account_id en el payload
    console.log(`SavingsGoalService: Solicitando POST ${this.apiUrl}/savings-goals/${goalId}/add-funds con datos:`, payload);
    return this.http.post<SavingsGoalApiResponse>(`${this.apiUrl}/savings-goals/${goalId}/add-funds`, payload).pipe(
      catchError(this.handleError)
    );
  }
}
