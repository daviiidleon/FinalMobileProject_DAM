// src/app/services/account.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid'; // Don't forget to install uuid!

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private _accounts = new BehaviorSubject<any[]>([]);
  public readonly accounts$: Observable<any[]> = this._accounts.asObservable();

  constructor() {
    this.loadInitialAccounts();
  }

  private loadInitialAccounts() {
    const initialData = [
      { id: uuidv4(), nombre: 'Main Checking', tipo: 'Checking', saldo: '$1250.75', institucion: 'Bank of America', fechaActualizacion: '2023-11-20T10:00:00Z' },
      { id: uuidv4(), nombre: 'Savings for House', tipo: 'Savings', saldo: '$15000.00', institucion: 'Ally Bank', fechaActualizacion: '2023-11-19T14:30:00Z' },
      { id: uuidv4(), nombre: 'Visa Rewards', tipo: 'Credit Card', saldo: '+$500.00', institucion: 'Capital One', fechaActualizacion: '2023-11-21T09:15:00Z' },
      { id: uuidv4(), nombre: 'Personal Loan', tipo: 'Loan', saldo: '+$10000.00', institucion: 'LendingClub', fechaActualizacion: '2023-11-18T11:45:00Z' },
      { id: uuidv4(), nombre: 'Investment Portfolio', tipo: 'Investment', saldo: '$2500.25', institucion: 'Fidelity', fechaActualizacion: '2023-11-20T16:00:00Z' },
      { id: uuidv4(), nombre: 'Cash in Wallet', tipo: 'Cash', saldo: '$150.00', institucion: '', fechaActualizacion: '2023-11-21T18:00:00Z' }
    ];
    this._accounts.next(initialData);
  }

  addAccount(newAccount: any) {
    const currentAccounts = this._accounts.getValue();
    const accountWithId = { ...newAccount, id: uuidv4() };
    this._accounts.next([...currentAccounts, accountWithId]);
  }

  updateAccount(updatedAccount: any) {
    const currentAccounts = this._accounts.getValue();
    const index = currentAccounts.findIndex(a => a.id === updatedAccount.id);

    if (index > -1) {
      const newAccounts = [...currentAccounts];
      newAccounts[index] = updatedAccount;
      this._accounts.next(newAccounts);
    } else {
      console.warn('Account not found for update:', updatedAccount.id);
    }
  }

  deleteAccount(id: string) {
    const currentAccounts = this._accounts.getValue();
    const filteredAccounts = currentAccounts.filter(a => a.id !== id);
    this._accounts.next(filteredAccounts);
  }

  getAccountById(id: string): Observable<any | undefined> {
    return this.accounts$.pipe(
      map(accounts => accounts.find(a => a.id === id))
    );
  }
}
