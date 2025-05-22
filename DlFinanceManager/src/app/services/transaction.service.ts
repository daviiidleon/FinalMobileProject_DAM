// src/app/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid'; // Don't forget to install uuid!

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  // A BehaviorSubject holds the current array of transactions and emits it to new subscribers.
  // This is where your live list of transactions will reside.
  private _transactions = new BehaviorSubject<any[]>([]);

  // This is the Observable that components will subscribe to for transaction updates.
  // Components will get a stream of the latest transactions whenever they change.
  public readonly transactions$: Observable<any[]> = this._transactions.asObservable();

  constructor() {
    // When the service is created, load some initial dummy data.
    // In a real application, you'd fetch this from a backend API or local storage.
    this.loadInitialTransactions();
  }

  private loadInitialTransactions() {
    // For demonstration, we'll use in-memory data.
    // Each transaction gets a unique ID using uuidv4().
    const initialData = [
      { id: uuidv4(), tipo: 'Expense', fecha: '2023-11-15', categoria: 'Food', descripcion: 'Groceries for the week', cantidad: '-€75.50' },
      { id: uuidv4(), tipo: 'Income', fecha: '2023-11-01', categoria: 'Salary', descripcion: 'November Salary', cantidad: '+€2200.00' },
      { id: uuidv4(), tipo: 'Expense', fecha: '2023-10-28', categoria: 'Utilities', descripcion: 'Electricity Bill', cantidad: '-€120.00' },
      { id: uuidv4(), tipo: 'Expense', fecha: '2023-10-25', categoria: 'Transport', descripcion: 'Bus fare', cantidad: '-€30.00' },
      { id: uuidv4(), tipo: 'Income', fecha: '2023-10-20', categoria: 'Investment', descripcion: 'Stock Dividend', cantidad: '+€500.00' },
      { id: uuidv4(), tipo: 'Expense', fecha: '2023-10-18', categoria: 'Entertainment', descripcion: 'Concert Tickets', cantidad: '-€85.00' }
    ];
    // Emit the initial data to any subscribers
    this._transactions.next(initialData);
  }

  /**
   * Adds a new transaction to the list.
   * A unique ID is generated for the new transaction.
   * @param newTransaction The transaction object to add (without an ID).
   */
  addTransaction(newTransaction: any) {
    const currentTransactions = this._transactions.getValue(); // Get the current list
    // Assign a unique ID before adding to the list.
    const transactionWithId = { ...newTransaction, id: uuidv4() };
    // Emit a new array with the added transaction, ensuring immutability.
    this._transactions.next([...currentTransactions, transactionWithId]);
  }

  /**
   * Updates an existing transaction in the list.
   * It finds the transaction by its ID and replaces it with the updated version.
   * @param updatedTransaction The transaction object with updated details (must contain its ID).
   */
  updateTransaction(updatedTransaction: any) {
    const currentTransactions = this._transactions.getValue(); // Get the current list
    const index = currentTransactions.findIndex(t => t.id === updatedTransaction.id);

    if (index > -1) {
      // Create a new array to maintain immutability and trigger change detection
      const newTransactions = [...currentTransactions];
      newTransactions[index] = updatedTransaction;
      this._transactions.next(newTransactions); // Emit the updated array
    } else {
      console.warn('Transaction not found for update:', updatedTransaction.id);
    }
  }

  /**
   * Deletes a transaction from the list by its ID.
   * It filters out the transaction to be deleted and emits the new list.
   * @param id The unique ID of the transaction to delete.
   */
  deleteTransaction(id: string) {
    const currentTransactions = this._transactions.getValue(); // Get the current list
    const filteredTransactions = currentTransactions.filter(t => t.id !== id);
    this._transactions.next(filteredTransactions); // Emit the new array without the deleted transaction
  }

  /**
   * Retrieves a single transaction by its ID.
   * @param id The unique ID of the transaction to retrieve.
   * @returns An Observable that emits the transaction or `undefined` if not found.
   */
  getTransactionById(id: string): Observable<any | undefined> {
    // This pipes through the transactions stream and maps it to find a specific transaction.
    return this.transactions$.pipe(
      map(transactions => transactions.find(t => t.id === id))
    );
  }
}
