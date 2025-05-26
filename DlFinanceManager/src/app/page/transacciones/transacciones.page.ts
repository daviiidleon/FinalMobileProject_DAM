import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  LoadingController,
  AlertController,
  ToastController,
  IonModal,
  IonInput,
  IonLabel,
  IonDatetime,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  cloudUploadOutline,
  addCircleOutline,
  arrowDownCircle,
  arrowUpCircle,
  ellipsisVertical,
  pencilOutline,
  trashOutline,
  closeOutline,
  reloadCircle
} from 'ionicons/icons';
import { TransactionService } from '../../services/transaction.service';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/account.service'; // Import AccountService

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.page.html',
  styleUrls: ['./transacciones.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    SideMenuComponent,
    IonIcon,
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonBackButton,
    RouterLink,
    IonPopover,
    IonList,
    IonItem,
    IonModal,
    IonInput,
    IonLabel,
    IonDatetime,
    IonNote,
    IonSpinner
  ]
})
export class TransaccionesPage implements OnInit, OnDestroy {
  @ViewChild('addEditModal') addEditModal!: IonModal;

  transacciones: any[] = [];
  isLoading: boolean = true;
  private transactionsSubscription!: Subscription;

  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  transactionForm: FormGroup;
  isSubmitting: boolean = false;
  editingTransactionId: string | null = null;

  private accountSubscription!: Subscription;
  private selectedAccount: any | null = null;

  constructor(
    private accountService: AccountService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private transactionService: TransactionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({
      cloudUploadOutline,
      addCircleOutline,
      arrowDownCircle,
      arrowUpCircle,
      ellipsisVertical,
      pencilOutline,
      trashOutline,
      closeOutline,
      reloadCircle
    });

    this.transactionForm = this.fb.group({
      id: [null],
      tipo: ['Expense', Validators.required],
      fecha: [new Date().toISOString(), Validators.required],
      categoria: ['', Validators.required],
      descripcion: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0.01)]],
      accountId: [null] // Add accountId to the form group
    });
  }

  public handleFileSelect(event: any) {
    console.log('handleFileSelect triggered');

    if (!this.selectedAccount) {
      this.presentToast('Please select an account before importing transactions.', 'warning');
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.name.endsWith('.xlsx')) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          console.log('FileReader onload triggered');

          const binarystr = e.target.result;
          const wb = XLSX.read(binarystr, { type: 'binary' });

          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

          console.log('Excel raw data structure:', typeof data, Array.isArray(data) ? 'is array' : 'is not array');
          console.log('Excel raw data content:', data);

          if (data && data.length > 1) {
            console.log('Processing rows...');
            for (let i = 1; i < data.length; i++) {
              const row = data[i];
              if (Array.isArray(row) && row.length >= 5) {
                const transaction: any = {};

                transaction.id = this.generateUniqueId();
                transaction.tipo = row[0];

                if (transaction.tipo !== 'Expense' && transaction.tipo !== 'Income') {
                  console.warn(`Skipping row ${i} due to invalid type: ${transaction.tipo}`);
                  continue;
                }

                const dateValue = row[1];
                transaction.fecha = this.parseExcelDate(dateValue);

                transaction.categoria = row[2];
                transaction.descripcion = row[3];
                transaction.cantidad = parseFloat(row[4]);
                transaction.accountId = this.selectedAccount.id; // Assign the selected account ID

                console.log('Adding transaction:', transaction);
                this.transactionService.addTransaction(transaction);
              } else {
                console.warn('Skipping row due to insufficient data or invalid format:', row);
              }
            }
            console.log('Finished processing rows.');
            this.loadTransactions();
          } else {
            this.loadTransactions();
            console.log('No data or only header row found in Excel.');
          }
        };
        reader.readAsBinaryString(file);
      } else {
        this.presentToast('Please select a valid .xlsx file.', 'danger');
      }
    }
  }

  ngOnInit() {
    // Subscribe to account selection changes
    this.accountSubscription = this.accountService.selectedAccount$.subscribe(account => {
      this.selectedAccount = account;
      if (this.selectedAccount) {
        this.loadTransactions(this.selectedAccount.id); // Load transactions for the selected account
      } else {
        this.transacciones = []; // Clear transactions if no account is selected
        console.log('No account selected, transactions cleared.');
        // If no account is selected, dismiss any loading indicator
        this.loadingController.dismiss().catch(() => {});
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

  async loadTransactions(accountId?: string) {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: accountId ? 'Loading transactions...' : 'Select an account to view transactions...',
      spinner: 'crescent'
    });
    await loading.present();

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }

    this.transactionsSubscription = this.transactionService.transactions$.subscribe(data => {
      const currentAccountId = accountId || (this.selectedAccount ? this.selectedAccount.id : null);

      console.log(`Loading transactions. Current selected account ID: ${this.selectedAccount?.id || 'None'}. AccountId parameter: ${accountId || 'None'}. Effective account ID for filtering: ${currentAccountId || 'None'}`);

      if (currentAccountId) {
        // Filter transactions only if they have an accountId and it matches the currentAccountId
        this.transacciones = data.filter(transaction => transaction.accountId === currentAccountId);
        console.log(`Transactions loaded for account ${currentAccountId}:`, this.transacciones);
      } else {
        this.transacciones = [];
        console.log('No account selected, transactions cleared.');
      }

      this.isLoading = false;
      loading.dismiss();
    });
  }

  async openAddEditModal(mode: 'add' | 'edit', transaction?: any) {
    this.isEditMode = (mode === 'edit');
    this.isSubmitting = false;

    if (mode === 'add' && !this.selectedAccount) {
      this.presentToast('Please select an account before adding a transaction.', 'warning');
      return;
    }

    if (this.isEditMode && transaction) {
      this.editingTransactionId = transaction.id;
      const amountValue = typeof transaction.cantidad === 'string'
        ? parseFloat(transaction.cantidad.replace(/[^\d.-]/g, ''))
        : transaction.cantidad;

      this.transactionForm.patchValue({
        id: transaction.id,
        tipo: transaction.tipo,
        fecha: transaction.fecha,
        categoria: transaction.categoria,
        descripcion: transaction.descripcion,
        cantidad: amountValue,
        accountId: transaction.accountId // Patch existing accountId
      });
    } else {
      this.editingTransactionId = null;
      this.transactionForm.reset({
        tipo: 'Expense',
        fecha: new Date().toISOString(),
        categoria: '',
        descripcion: '',
        cantidad: null,
        accountId: this.selectedAccount ? this.selectedAccount.id : null // Set accountId for new transactions
      });
    }
    this.isModalOpen = true;
    this.cdRef.detectChanges();
  }

  async saveTransaction() {
    this.transactionForm.markAllAsTouched();

    if (this.transactionForm.invalid) {
      this.presentToast('Please fill in all required fields correctly.', 'danger');
      return;
    }

    // Ensure an account is selected before saving (redundant check, but safe)
    if (!this.selectedAccount && !this.isEditMode) {
      this.presentToast('No account selected to save the transaction to.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Saving changes...' : 'Adding transaction...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = this.transactionForm.value;
    let amount = parseFloat(formData.cantidad);
    const formattedAmount = (formData.tipo === 'Expense' ? '-€' : '+€') + amount.toFixed(2);

    const transactionToSave = {
      ...formData,
      id: this.editingTransactionId || this.generateUniqueId(),
      cantidad: formattedAmount,
      // Ensure accountId is correctly set for new and existing transactions
      accountId: formData.accountId || (this.selectedAccount ? this.selectedAccount.id : null)
    };

    setTimeout(async () => {
      if (this.isEditMode) {
        this.transactionService.updateTransaction(transactionToSave);
        this.presentToast('Transaction updated successfully!', 'success');
      } else {
        this.transactionService.addTransaction(transactionToSave);
        this.presentToast('Transaction added successfully!', 'success');
      }
      this.isSubmitting = false;
      this.loadTransactions();
      await loading.dismiss();
      this.cancelModal();
    }, 700);
  }

  async cancelModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.editingTransactionId = null;
    this.transactionForm.reset();
  }

  async eliminarTransaccion(transaccion: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete the transaction "${transaccion.descripcion}" on ${transaccion.fecha}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Delete cancelled');
          },
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: () => {
            this.transactionService.deleteTransaction(transaccion.id);
            this.presentToast('Transaction deleted successfully!', 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  private generateUniqueId(): string {
    // Combine account ID with a timestamp and random string for better uniqueness within an account
    const accountId = this.selectedAccount ? this.selectedAccount.id : 'no-account';
    return `${accountId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private parseExcelDate(excelDate: any): string {
    if (typeof excelDate === 'number') {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
      return date.toISOString();
    } else if (typeof excelDate === 'string') {
      const parts = excelDate.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).toISOString();
      }
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    return new Date().toISOString();
  }
}
