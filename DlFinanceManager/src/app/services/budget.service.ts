import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Budget {
  id?: number;
  user_id?: number;
  account_id: number;
  category_id?: number;
  name?: string | null;
  budget_amount: number;
  spent_amount?: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetApiResponse {
  message: string;
  budget: Budget;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

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
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión o que el servidor esté funcionando.';
      }
    } else {
      errorMessage = 'No se pudo conectar con el servidor. Intente de nuevo más tarde.';
    }
    console.error('BudgetService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getBudgets(accountId?: number): Observable<Budget[]> {
    let url = `${this.apiUrl}/budgets`;
    if (accountId) {
      url += `?account_id=${accountId}`;
    }
    console.log(`BudgetService: Solicitando GET ${url}`);
    return this.http.get<Budget[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getBudgetById(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/budgets/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createBudget(budget: Budget): Observable<BudgetApiResponse> {
    console.log(`BudgetService: Solicitando POST ${this.apiUrl}/budgets con datos:`, budget);
    return this.http.post<BudgetApiResponse>(`${this.apiUrl}/budgets`, budget).pipe(
      catchError(this.handleError)
    );
  }

  updateBudget(id: number, budget: Budget): Observable<BudgetApiResponse> {
    console.log(`BudgetService: Solicitando PUT ${this.apiUrl}/budgets/${id} con datos:`, budget);
    return this.http.put<BudgetApiResponse>(`${this.apiUrl}/budgets/${id}`, budget).pipe(
      catchError(this.handleError)
    );
  }

  deleteBudget(id: number): Observable<any> {
    console.log(`BudgetService: Solicitando DELETE ${this.apiUrl}/budgets/${id}`);
    return this.http.delete<any>(`${this.apiUrl}/budgets/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
