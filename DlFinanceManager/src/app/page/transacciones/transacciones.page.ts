// src/app/page/transacciones/transacciones.page.ts
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common'; // CommonModule debe estar aquí
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
  IonSpinner,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonFab, IonFabButton
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
  reloadCircle,
  swapHorizontalOutline,
  walletOutline,
  calendarOutline,
  filterOutline,
  receiptOutline
} from 'ionicons/icons';

import { AccountService, Account } from '../../services/account.service'; // Account ahora tiene current_balance
import { ClientAccount } from '../cuentas/cuentas.page';
import { TransactionService, Transaction, TransactionApiResponse } from '../../services/transaction.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as XLSX from 'xlsx';

interface ClientTransaction {
  id?: number;
  account_id: number;
  accountName?: string;
  category_id?: number;
  categoryName?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  transaction_date: string;
  payee?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.page.html',
  styleUrls: ['./transacciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    SideMenuComponent,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
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
    IonPopover,
    IonList,
    IonItem,
    IonModal,
    IonInput,
    IonLabel,
    IonDatetime,
    IonNote,
    IonSpinner,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonFab, IonFabButton
  ]
})
export class TransaccionesPage implements OnInit, OnDestroy {
  @ViewChild('addEditModal') addEditModal!: IonModal;
  @ViewChild('fileInput') fileInput!: any;

  transactions: ClientTransaction[] = [];
  filteredTransactions: ClientTransaction[] = [];
  isLoading: boolean = true;
  private subscriptions: Subscription = new Subscription();

  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  transactionForm: FormGroup;
  isSubmitting: boolean = false;
  editingTransactionId: number | null = null;

  accounts: ClientAccount[] = [];
  selectedAccountId: number | null = null;

  currentSearchTerm: string = '';
  selectedCategoryFilter: string = 'all';
  selectedTypeFilter: 'all' | 'income' | 'expense' | 'transfer' = 'all';

  categories: { id: number, name: string }[] = [
    { id: 1, name: 'Comida' },
    { id: 2, name: 'Transporte' },
    { id: 3, name: 'Vivienda' },
    { id: 4, name: 'Servicios' },
    { id: 5, name: 'Entretenimiento' },
    { id: 6, name: 'Salud' },
    { id: 7, name: 'Educación' },
    { id: 8, name: 'Salario' },
    { id: 9, name: 'Inversión' },
    { id: 10, name: 'Otros' }
  ];

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
      reloadCircle,
      swapHorizontalOutline,
      walletOutline,
      calendarOutline,
      filterOutline,
      receiptOutline
    });

    this.transactionForm = this.fb.group({
      id: [null],
      account_id: [null, Validators.required],
      type: ['expense', Validators.required],
      transaction_date: [new Date().toISOString(), Validators.required],
      category_id: [null, Validators.required],
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      payee: [null],
      notes: [null]
    });
  }

  async ngOnInit() {
    console.log('TransaccionesPage: ngOnInit - Inicializando.');
    this.subscriptions.add(
      this.accountService.selectedAccount$.subscribe(async account => {
        console.log('TransaccionesPage: selectedAccount$ subscription triggered.');
        if (account && account.id !== undefined) {
          this.selectedAccountId = account.id;
          console.log('TransaccionesPage: Cuenta seleccionada recibida:', account.nombre, 'ID:', this.selectedAccountId);
          if (!this.isEditMode && (this.transactionForm.get('account_id')?.value === null || this.transactionForm.get('account_id')?.value === undefined)) {
            this.transactionForm.patchValue({ account_id: this.selectedAccountId });
            console.log('TransaccionesPage: Formulario account_id parcheado.');
          }
        } else {
          this.selectedAccountId = null;
          console.log('TransaccionesPage: Ninguna cuenta seleccionada recibida.');
        }
        await this.loadTransactions();
        this.cdRef.detectChanges();
      })
    );

    await this.loadAccounts();
    console.log('TransaccionesPage: Cuentas cargadas para el select.');
  }

  ionViewWillEnter() {
    console.log('TransaccionesPage: ionViewWillEnter - Recargando transacciones.');
    this.loadTransactions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async loadAccounts() {
    console.log('TransaccionesPage: loadAccounts() - Iniciando carga de cuentas.');
    this.subscriptions.add(
      this.accountService.getAccounts().pipe(
        map((apiAccounts: Account[]) => {
          return apiAccounts.map(apiAcc => ({
            id: apiAcc.id,
            nombre: apiAcc.name,
            tipo: apiAcc.type,
            // ===> CAMBIO CLAVE AQUÍ: Usar apiAcc.current_balance <===
            saldo: apiAcc.current_balance ?? 0, // Mapear current_balance de la API a saldo
            institucion: apiAcc.institution || '',
            fechaActualizacion: apiAcc.updated_at
          }));
        })
      ).subscribe({
        next: (clientAccounts: ClientAccount[]) => {
          this.accounts = clientAccounts;
          console.log('TransaccionesPage: Cuentas cargadas para mapeo:', this.accounts.length);
          if (!this.accountService.getSelectedAccount() && clientAccounts.length > 0) {
            this.accountService.setSelectedAccount(clientAccounts[0]);
            console.log('TransaccionesPage: Primera cuenta establecida como seleccionada globalmente.');
          } else if (clientAccounts.length === 0) {
            this.accountService.setSelectedAccount(null);
            console.log('TransaccionesPage: No hay cuentas, deseleccionando globalmente.');
          }
        },
        error: async (err) => {
          console.error('ERROR TransaccionesPage: Error al cargar cuentas para filtro:', err);
          const alert = await this.alertController.create({ header: 'Error', message: err.message || 'No se pudieron cargar las cuentas para el filtro.', buttons: ['OK'] });
          await alert.present();
        }
      })
    );
  }

  async loadTransactions() {
    console.log('TransaccionesPage: loadTransactions() - Iniciando carga de transacciones.');
    if (this.selectedAccountId === null) {
      this.transactions = [];
      this.filteredTransactions = [];
      this.isLoading = false;
      console.log('TransaccionesPage: No hay selectedAccountId, vaciando transacciones y finalizando carga.');
      this.cdRef.detectChanges();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando transacciones...',
      spinner: 'crescent'
    });
    await loading.present();
    console.log(`TransaccionesPage: Solicitando transacciones para accountId: ${this.selectedAccountId}`);

    this.subscriptions.add(
      this.transactionService.getTransactions(this.selectedAccountId).subscribe({
        next: (apiTransactions: Transaction[]) => {
          console.log('TransaccionesPage: Transacciones recibidas de la API (raw):', apiTransactions);
          this.transactions = apiTransactions.map(t => {
            const account = this.accounts.find(acc => acc.id === t.account_id);
            return {
              ...t,
              accountName: account ? account.nombre : 'Cuenta Desconocida',
              categoryName: this.getCategoryName(t.category_id)
            };
          });
          console.log('TransaccionesPage: Transacciones mapeadas para UI:', this.transactions);
          this.applyFilters();
          this.isLoading = false;
          loading.dismiss();
          console.log('TransaccionesPage: Carga y filtrado de transacciones completado.');
          this.cdRef.detectChanges();
        },
        error: async (err) => {
          console.error('ERROR TransaccionesPage: Error al cargar transacciones desde API:', err);
          this.isLoading = false;
          loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error de Carga',
            message: err.message || 'No se pudieron cargar las transacciones. Por favor, intente de nuevo o verifique su conexión.',
            buttons: ['OK']
          });
          await alert.present();
          this.cdRef.detectChanges();
        }
      })
    );
  }

  onSearchChange(event: any) {
    this.currentSearchTerm = event.detail.value ? event.detail.value.toLowerCase() : '';
    this.applyFilters();
  }

  onCategorySelectChange(event: any) {
    this.selectedCategoryFilter = event.detail.value;
    this.applyFilters();
  }

  onTypeSegmentChange(event: any) {
    this.selectedTypeFilter = event.detail.value;
    this.applyFilters();
  }

  applyFilters() {
    console.log('TransaccionesPage: Aplicando filtros. Datos iniciales:', this.transactions.length);
    let tempTransactions = [...this.transactions];

    if (this.selectedTypeFilter !== 'all') {
      tempTransactions = tempTransactions.filter(t => t.type === this.selectedTypeFilter);
    }

    if (this.selectedCategoryFilter !== 'all') {
      tempTransactions = tempTransactions.filter(t => t.categoryName === this.selectedCategoryFilter);
    }

    if (this.currentSearchTerm) {
      tempTransactions = tempTransactions.filter(t =>
        t.description.toLowerCase().includes(this.currentSearchTerm) ||
        t.amount.toString().includes(this.currentSearchTerm) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(this.currentSearchTerm)) ||
        (t.payee && t.payee.toLowerCase().includes(this.currentSearchTerm)) ||
        (t.notes && t.notes.toLowerCase().includes(this.currentSearchTerm))
      );
    }

    this.filteredTransactions = tempTransactions;
    console.log('TransaccionesPage: Transacciones filtradas resultantes:', this.filteredTransactions.length);
    this.cdRef.detectChanges();
  }

  async openAddEditModal(mode: 'add' | 'edit', transaction?: ClientTransaction) {
    this.isEditMode = (mode === 'edit');
    this.isSubmitting = false;

    if (mode === 'add' && this.selectedAccountId === null) {
      await this.presentToast('Por favor, selecciona una cuenta antes de añadir una transacción.', 'warning');
      return;
    }

    if (this.isEditMode && transaction) {
      this.editingTransactionId = transaction.id || null;
      this.transactionForm.patchValue({
        id: transaction.id,
        account_id: transaction.account_id,
        type: transaction.type,
        transaction_date: transaction.transaction_date ? new Date(transaction.transaction_date).toISOString() : null,
        category_id: transaction.category_id,
        description: transaction.description,
        amount: transaction.amount,
        payee: transaction.payee,
        notes: transaction.notes
      });
      console.log('TransaccionesPage: Abriendo modal en modo EDICIÓN para ID:', transaction.id);
    } else {
      this.editingTransactionId = null;
      this.transactionForm.reset({
        account_id: this.selectedAccountId,
        type: 'expense',
        transaction_date: new Date().toISOString(),
        category_id: null,
        description: '',
        amount: null,
        payee: null,
        notes: null
      });
      console.log('TransaccionesPage: Abriendo modal en modo AÑADIR. account_id preestablecido:', this.selectedAccountId);
    }
    this.isModalOpen = true;
    this.cdRef.detectChanges();
  }

  async saveTransaction() {
    this.transactionForm.markAllAsTouched();

    if (this.transactionForm.invalid) {
      console.warn('TransaccionesPage: Formulario inválido al guardar.');
      await this.presentToast('Por favor, completa todos los campos requeridos correctamente.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Guardando cambios...' : 'Añadiendo transacción...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = this.transactionForm.value;

    if (formData.account_id === null && this.selectedAccountId !== null) {
      formData.account_id = this.selectedAccountId;
    }

    const transactionToSend: Transaction = {
      account_id: formData.account_id,
      category_id: formData.category_id,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      transaction_date: formatDate(formData.transaction_date, 'yyyy-MM-dd HH:mm:ss', 'en-US'),
      payee: formData.payee || null,
      notes: formData.notes || null
    };

    console.log('TransaccionesPage: Transacción a enviar a la API:', transactionToSend);

    if (this.isEditMode && this.editingTransactionId !== null) {
      this.subscriptions.add(
        this.transactionService.updateTransaction(this.editingTransactionId, transactionToSend).subscribe({
          next: async (res: TransactionApiResponse) => {
            console.log('TransaccionesPage: Transacción actualizada con éxito:', res);
            await loading.dismiss();
            this.presentToast('¡Transacción actualizada con éxito!', 'success');
            this.closeTransactionModal();
            await this.loadTransactions();
          },
          error: async (err) => {
            console.error('ERROR TransaccionesPage: Error al actualizar transacción:', err);
            await loading.dismiss();
            this.presentToast(err.message || 'No se pudo actualizar la transacción. Intente de nuevo.', 'danger');
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.transactionService.createTransaction(transactionToSend).subscribe({
          next: async (res: TransactionApiResponse) => {
            console.log('TransaccionesPage: Transacción añadida con éxito:', res);
            await loading.dismiss();
            this.presentToast('¡Transacción añadida con éxito!', 'success');
            this.closeTransactionModal();
            await this.loadTransactions();
          },
          error: async (err) => {
            console.error('ERROR TransaccionesPage: Error al añadir transacción:', err);
            await loading.dismiss();
            this.presentToast(err.message || 'No se pudo añadir la transacción. Intente de nuevo.', 'danger');
          }
        })
      );
    }
  }

  async deleteTransaction(id: number | undefined) {
    if (id === undefined) {
      console.error('TransaccionesPage: Intento de eliminar transacción sin ID.');
      await this.presentToast('No se pudo eliminar la transacción: ID no válido.', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingController.create({ message: 'Eliminando transacción...', spinner: 'crescent' });
            await loading.present();
            console.log('TransaccionesPage: Iniciando eliminación de transacción con ID:', id);

            this.subscriptions.add(
              this.transactionService.deleteTransaction(id).subscribe({
                next: async () => {
                  console.log('TransaccionesPage: Transacción eliminada con éxito.');
                  await loading.dismiss();
                  this.presentToast('¡Transacción eliminada con éxito!', 'success');
                  await this.loadTransactions();
                },
                error: async (err) => {
                  console.error('ERROR TransaccionesPage: Error al eliminar transacción:', err);
                  await loading.dismiss();
                  this.presentToast(err.message || 'No se pudo eliminar la transacción. Intente de nuevo.', 'danger');
                }
              })
            );
          },
        },
      ],
    });
    await alert.present();
  }

  closeTransactionModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.editingTransactionId = null;
    this.transactionForm.reset();
    console.log('TransaccionesPage: Modal de transacción cerrado y formulario reseteado.');
  }

  public handleFileSelect(event: any) {
    console.log('TransaccionesPage: handleFileSelect - Iniciando.');
    if (this.selectedAccountId === null) {
      this.presentToast('Por favor, selecciona una cuenta antes de importar transacciones.', 'warning');
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.name.endsWith('.xlsx')) {
        const reader = new FileReader();

        reader.onload = async (e: any) => {
          const binarystr = e.target.result;
          const wb = XLSX.read(binarystr, { type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd' });

          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          const excelData: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          console.log('TransaccionesPage: Datos de Excel leídos:', excelData);

          if (excelData && excelData.length > 1) {
            const headers = excelData[0].map((h: string) => h ? h.toLowerCase().trim() : '');
            const requiredHeaders = ['type', 'date', 'category', 'description', 'amount'];
            const optionalHeaders = ['payee', 'notes'];

            const missingRequiredHeaders = requiredHeaders.filter(header => !headers.includes(header));
            if (missingRequiredHeaders.length > 0) {
              await this.presentToast(`Encabezados requeridos faltantes en el archivo Excel: ${missingRequiredHeaders.join(', ')}. Asegúrate de que las columnas sean 'Type', 'Date', 'Category', 'Description', 'Amount'.`, 'danger');
              return;
            }

            const transactionsToImport: Transaction[] = [];
            let importErrors = 0;

            for (let i = 1; i < excelData.length; i++) {
              const row = excelData[i];
              if (!Array.isArray(row) || row.filter(cell => cell !== null && cell !== undefined && String(cell).trim() !== '').length === 0) {
                continue;
              }

              try {
                const getType = (header: string) => row[headers.indexOf(header)];

                const transactionType = String(getType('type')).toLowerCase();
                const transactionDateValue = getType('date');
                const categoryName = String(getType('category'));
                const description = String(getType('description'));
                const amount = parseFloat(String(getType('amount')));
                const payee = getType('payee') ? String(getType('payee')) : null;
                const notes = getType('notes') ? String(getType('notes')) : null;

                const category = this.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
                const categoryId = category ? category.id : null;

                const parsedDate = this.parseExcelDate(transactionDateValue);

                const newTransaction: Transaction = {
                  account_id: this.selectedAccountId!,
                  type: transactionType as 'income' | 'expense' | 'transfer',
                  transaction_date: formatDate(parsedDate, 'yyyy-MM-dd HH:mm:ss', 'en-US'),
                  category_id: categoryId || 10,
                  description: description,
                  amount: amount,
                  payee: payee,
                  notes: notes
                };

                if (!['income', 'expense', 'transfer'].includes(newTransaction.type) ||
                  isNaN(newTransaction.amount) || newTransaction.amount <= 0 ||
                  !newTransaction.description || !newTransaction.transaction_date || !categoryId) {
                  console.warn(`TransaccionesPage: Saltando fila ${i + 1} debido a datos inválidos o incompletos:`, row, newTransaction);
                  importErrors++;
                  continue;
                }

                transactionsToImport.push(newTransaction);
              } catch (e) {
                console.error(`TransaccionesPage: Error procesando fila ${i + 1}:`, row, e);
                importErrors++;
              }
            }
            console.log('TransaccionesPage: Transacciones preparadas para importar:', transactionsToImport);

            if (transactionsToImport.length > 0) {
              const importLoading = await this.loadingController.create({
                message: 'Importando transacciones...',
                spinner: 'crescent'
              });
              await importLoading.present();

              this.subscriptions.add(
                this.transactionService.importTransactions(transactionsToImport).subscribe({
                  next: async (res) => {
                    console.log('TransaccionesPage: Importación de Excel exitosa:', res);
                    await importLoading.dismiss();
                    let successMessage = `¡Se importaron ${transactionsToImport.length} transacciones con éxito!`;
                    if (importErrors > 0) {
                      successMessage += ` ${importErrors} filas no se pudieron importar debido a errores.`;
                    }
                    await this.presentToast(successMessage, 'success');
                    await this.loadTransactions();
                  },
                  error: async (err) => {
                    console.error('ERROR TransaccionesPage: Error al importar transacciones desde Excel:', err);
                    await importLoading.dismiss();
                    this.presentToast(err.message || 'No se pudieron importar las transacciones.', 'danger');
                  }
                })
              );
            } else {
              await this.presentToast('No se encontraron transacciones válidas para importar en el archivo.', 'warning');
            }
          } else {
            this.presentToast('El archivo Excel está vacío o tiene un formato incorrecto (primera fila como encabezados).', 'warning');
          }
        };
        reader.readAsBinaryString(file);
      } else {
        this.presentToast('Por favor, selecciona un archivo .xlsx válido.', 'danger');
      }
    }
  }

  private parseExcelDate(excelDateValue: any): Date {
    if (typeof excelDateValue === 'number') {
      const excelEpoch = new Date('1899-12-30T00:00:00Z');
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + excelDateValue * millisecondsPerDay);
      return date;
    } else if (excelDateValue instanceof Date) {
      return excelDateValue;
    } else if (typeof excelDateValue === 'string') {
      const date = new Date(excelDateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    console.warn(`TransaccionesPage: No se pudo parsear la fecha de Excel: ${excelDateValue}. Usando la fecha actual.`);
    return new Date();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    toast.present();
  }

  formatDate(isoDateString: string | undefined): string {
    if (!isoDateString) {
      return '';
    }
    const date = new Date(isoDateString);
    // Usar 'es-ES' ya que se registró en main.ts
    return formatDate(date, 'd MMM y', 'es-ES');
  }

  getIconForTransactionType(type: string): string {
    switch (type) {
      case 'income':
        return 'arrow-up-circle-outline';
      case 'expense':
        return 'arrow-down-circle-outline';
      case 'transfer':
        return 'swap-horizontal-outline';
      default:
        return 'receipt-outline';
    }
  }

  getAmountColor(type: string): string {
    switch (type) {
      case 'income':
        return 'success';
      case 'expense':
        return 'danger';
      case 'transfer':
        return 'medium';
      default:
        return 'medium';
    }
  }

  getCategoryName(categoryId: number | undefined): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin Categoría';
  }
}
