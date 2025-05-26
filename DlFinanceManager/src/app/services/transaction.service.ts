// src/app/services/transaction.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  // A BehaviorSubject holds the current array of transactions and emits it to new subscribers.
  // This is where your live list of transactions will reside.
  private transactionsSubject = new BehaviorSubject<any[]>([]);

  // This is the Observable that components will subscribe to for transaction updates.
  // Components will get a stream of the latest transactions whenever they change.
  public readonly transactions$: Observable<any[]> = this.transactionsSubject.asObservable();

  constructor() {
    // When the service is created, load some initial dummy data.
    // In a real application, you'd fetch this from a backend API or local storage.
    this.loadInitialTransactions();
  }

  private loadInitialTransactions() {
    // For demonstration, we'll use in-memory data.
    // Each transaction gets a unique ID using uuidv4().
    // NOTE: uuidv4 is removed from this snippet to simplify the diff,
    // assuming you have a way to generate IDs or handle this in the add method.
    const initialData = [
      { id: 'dummy-1', tipo: 'Expense', fecha: '2023-11-15', categoria: 'Food', descripcion: 'Groceries for the week', cantidad: '-€75.50' },
      { id: 'dummy-2', tipo: 'Income', fecha: '2023-11-01', categoria: 'Salary', descripcion: 'November Salary', cantidad: '+€2200.00' },
      { id: 'dummy-3', tipo: 'Expense', fecha: '2023-10-28', categoria: 'Utilities', descripcion: 'Electricity Bill', cantidad: '-€120.00' },
      { id: 'dummy-4', tipo: 'Expense', fecha: '2023-10-25', categoria: 'Transport', descripcion: 'Bus fare', cantidad: '-€30.00' },
      { id: 'dummy-5', tipo: 'Income', fecha: '2023-10-20', categoria: 'Investment', descripcion: 'Stock Dividend', cantidad: '+€500.00' },
      { id: 'dummy-6', tipo: 'Expense', fecha: '2023-10-18', categoria: 'Entertainment', descripcion: 'Concert Tickets', cantidad: '-€85.00' }
    ];
    // Emit the initial data to any subscribers
    this.transactionsSubject.next(initialData);
  }

  /**
   * Adds a new transaction to the list.
   * A unique ID is generated for the new transaction.
   * @param newTransaction The transaction object to add (without an ID).
   */
  addTransaction(newTransaction: any) {
    const currentTransactions = this.transactionsSubject.getValue(); // Get the current list
    // NOTE: Generating ID here if not already present. You might need a proper ID generation logic.
    const transactionId = newTransaction.id || Math.random().toString(36).substring(2); // Simple ID generation
    // Assign a unique ID before adding to the list.
    const transactionWithId = { ...newTransaction, id: transactionId };
    // Emit a new array with the added transaction, ensuring immutability.
    this.transactionsSubject.next([...currentTransactions, transactionWithId]);
  }

  /**
   * Updates an existing transaction in the list.
   * It finds the transaction by its ID and replaces it with the updated version.
   * @param updatedTransaction The transaction object with updated details (must contain its ID).
   */
  updateTransaction(updatedTransaction: any) {
    const currentTransactions = this.transactionsSubject.getValue(); // Get the current list
    const index = currentTransactions.findIndex(t => t.id === updatedTransaction.id);

    if (index > -1) {
      // Create a new array to maintain immutability and trigger change detection
      const newTransactions = [...currentTransactions];
      newTransactions[index] = updatedTransaction;
      this.transactionsSubject.next(newTransactions); // Emit the updated array
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
    const currentTransactions = this.transactionsSubject.getValue(); // Get the current list
    const filteredTransactions = currentTransactions.filter(t => t.id !== id); // Filter out the transaction by ID
    this.transactionsSubject.next(filteredTransactions); // Emit the new array without the deleted transaction
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
