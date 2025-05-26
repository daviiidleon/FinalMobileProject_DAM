// src/app/services/account.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid'; // Don't forget to install uuid!

// Define and export the Account interface
export interface Account {
  id: string; // id is always a string
  nombre: string;
  tipo: string;
  saldo: number; // Balance of the account, changed to number for calculations
  institucion: string;
  fechaActualizacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  // Use the Account interface for type safety
  private _accounts = new BehaviorSubject<Account[]>([]);
  public readonly accounts$: Observable<Account[]> = this._accounts.asObservable();

  private selectedAccountSubject: BehaviorSubject<Account | null> = new BehaviorSubject<Account | null>(null);
  public selectedAccount$: Observable<Account | null> = this.selectedAccountSubject.asObservable();

  constructor() {
    this.loadInitialAccounts();
  }

  private loadInitialAccounts() {
    // Define the structure for the raw initial data, where 'id' is optional
    // and 'saldo' is a string before parsing.
    const rawInitialData: { nombre: string; tipo: string; saldo: string; institucion: string; fechaActualizacion: string }[] = [
      { nombre: 'Main Checking', tipo: 'Checking', saldo: '$1250.75', institucion: 'Bank of America', fechaActualizacion: '2023-11-20T10:00:00Z' },
      { nombre: 'Savings for House', tipo: 'Savings', saldo: '$15000.00', institucion: 'Ally Bank', fechaActualizacion: '2023-11-19T14:30:00Z' },
      { nombre: 'Visa Rewards', tipo: 'Credit Card', saldo: '+$500.00', institucion: 'Capital One', fechaActualizacion: '2023-11-21T09:15:00Z' },
      { nombre: 'Personal Loan', tipo: 'Loan', saldo: '+$10000.00', institucion: 'LendingClub', fechaActualizacion: '2023-11-18T11:45:00Z' },
      { nombre: 'Investment Portfolio', tipo: 'Investment', saldo: '$2500.25', institucion: 'Fidelity', fechaActualizacion: '2023-11-20T16:00:00Z' },
      { nombre: 'Cash in Wallet', tipo: 'Cash', saldo: '$150.00', institucion: '', fechaActualizacion: '2023-11-21T18:00:00Z' }
    ];

    // Map raw data to Account type, ensuring 'id' is always assigned a uuid and parsing 'saldo' to a number
    const accounts: Account[] = rawInitialData.map(data => ({
      id: uuidv4(), // Explicitly assign a new UUID here, ensuring 'id' is always present
      nombre: data.nombre,
      tipo: data.tipo,
      saldo: parseFloat(data.saldo.replace(/[^\d.-]/g, '')), // Remove non-numeric characters and parse
      institucion: data.institucion,
      fechaActualizacion: data.fechaActualizacion
    }));

    this._accounts.next(accounts);

    // Set the first account as selected by default, if available
    if (accounts.length > 0) {
      this.setSelectedAccount(accounts[0]);
    }
  }

  addAccount(newAccount: Omit<Account, 'id'>) { // 'newAccount' won't have an ID yet
    const currentAccounts = this._accounts.getValue();
    // When adding, create the full Account object with a generated ID
    const accountWithId: Account = { ...newAccount, id: uuidv4() };
    this._accounts.next([...currentAccounts, accountWithId]);
  }

  updateAccount(updatedAccount: Account) { // 'updatedAccount' will have an ID
    const currentAccounts = this._accounts.getValue();
    const index = currentAccounts.findIndex(a => a.id === updatedAccount.id);

    if (index > -1) {
      const newAccounts = [...currentAccounts];
      newAccounts[index] = updatedAccount;
      this._accounts.next(newAccounts);
      // If the updated account is the currently selected one, update the observable
      if (this.selectedAccountSubject.getValue()?.id === updatedAccount.id) {
        this.selectedAccountSubject.next(updatedAccount);
      }
    } else {
      console.warn('Account not found for update:', updatedAccount.id);
    }
  }

  deleteAccount(id: string) {
    const currentAccounts = this._accounts.getValue();
    const filteredAccounts = currentAccounts.filter(a => a.id !== id);
    this._accounts.next(filteredAccounts);

    // If the deleted account was the selected one, clear selection or select another
    if (this.selectedAccountSubject.getValue()?.id === id) {
      this.selectedAccountSubject.next(filteredAccounts.length > 0 ? filteredAccounts[0] : null);
    }
  }

  getAccountById(id: string): Observable<Account | undefined> {
    return this.accounts$.pipe(
      map(accounts => accounts.find(a => a.id === id))
    );
  }

  setSelectedAccount(account: Account | null) {
    this.selectedAccountSubject.next(account);
  }

  getSelectedAccount(): Account | null {
    return this.selectedAccountSubject.getValue();
  }
}
