import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate, DatePipe, PercentPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonModal,
  IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonNote, IonList,
  IonProgressBar,
  LoadingController,
  AlertController,
  ToastController,
  IonSearchbar,
  IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle,
  IonBadge
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { addIcons } from 'ionicons';
import {
  addOutline,
  warningOutline,
  fastFoodOutline,
  carOutline,
  filmOutline,
  bookOutline,
  heartOutline,
  homeOutline,
  flashOutline,
  ellipsisHorizontalOutline,
  pricetagOutline,
  createOutline,
  trashOutline,
  closeOutline,
  calendarOutline,
  walletOutline,
  searchOutline
} from 'ionicons/icons';

import { BudgetService, Budget, BudgetApiResponse } from '../../services/budget.service';
import { AccountService, Account } from '../../services/account.service';
import { ClientAccount } from '../cuentas/cuentas.page';

type CategoriaKey = 'comida' | 'transporte' | 'entretenimiento' | 'educacion' | 'salud' | 'vivienda' | 'servicios' | 'otros' | 'salario' | 'inversion';

interface ClientBudget {
  id?: number;
  name?: string | null;
  account_id: number;
  accountName?: string;
  category_id?: number;
  categoryName?: string;
  amount: number; // Esto es el `budget_amount` de la API
  spent_amount: number; // Mapeado de `spent_amount` de la API (aunque no se use en UI ahora)
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BudgetAlert {
  message: string;
}

@Component({
  selector: 'app-presupuestos',
  templateUrl: './presupuestos.page.html',
  styleUrls: ['./presupuestos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonModal,
    IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonNote, IonList,
    IonProgressBar,
    IonSearchbar,
    IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle,
    IonBadge,

    DatePipe,
    PercentPipe,

    HeaderComponent,
    SideMenuComponent,
  ]
})
export class PresupuestosPage implements OnInit, OnDestroy {

  categoriaOptions: Record<CategoriaKey, string> = {
    comida: 'Comida',
    transporte: 'Transporte',
    entretenimiento: 'Entretenimiento',
    educacion: 'Educación',
    salud: 'Salud',
    vivienda: 'Vivienda',
    servicios: 'Servicios',
    salario: 'Salario',
    inversion: 'Inversión',
    otros: 'Otros'
  };

  categories: { id: number, name: string }[] = [
    { id: 1, name: 'Comida' },
    { id: 2, name: 'Transporte' },
    { id: 3, name: 'Entretenimiento' },
    { id: 4, name: 'Educación' },
    { id: 5, name: 'Salud' },
    { id: 6, name: 'Vivienda' },
    { id: 7, name: 'Servicios' },
    { id: 8, name: 'Salario' },
    { id: 9, name: 'Inversión' },
    { id: 10, name: 'Otros' }
  ];

  budgets: ClientBudget[] = [];
  filteredBudgets: ClientBudget[] = [];
  budgetAlerts: BudgetAlert[] = []; // Se mantiene para compatibilidad, pero updateBudgetAlerts lo vaciará
  isLoading: boolean = true;
  private subscriptions: Subscription = new Subscription();

  @ViewChild('budgetModal') budgetModal!: IonModal;

  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  budgetForm: FormGroup;
  isSubmitting: boolean = false;
  editingBudgetId: number | null = null;

  selectedAccountId: number | null = null;
  accounts: ClientAccount[] = [];
  currentSearchTerm: string = '';

  // ELIMINADO: remainingAccountBalance y currentSelectedAccount ya no se usarán en la UI
  // remainingAccountBalance: number | null = null;
  // currentSelectedAccount: ClientAccount | null = null;


  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private budgetService: BudgetService,
    private accountService: AccountService,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({
      addOutline,
      warningOutline,
      fastFoodOutline,
      carOutline,
      filmOutline,
      bookOutline,
      heartOutline,
      homeOutline,
      flashOutline,
      ellipsisHorizontalOutline,
      pricetagOutline,
      createOutline,
      trashOutline,
      closeOutline,
      calendarOutline,
      walletOutline,
      searchOutline
    });

    this.budgetForm = this.fb.group({
      name: [null, Validators.required],
      account_id: [null, Validators.required],
      category_id: [null],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      start_date: [new Date().toISOString(), Validators.required],
      end_date: [this.addMonths(new Date(), 1).toISOString(), Validators.required],
    });
  }

  async ngOnInit() {
    console.log('PresupuestosPage: ngOnInit - Inicializando.');
    this.subscriptions.add(
      this.accountService.selectedAccount$.subscribe(async account => {
        if (account && account.id !== undefined) {
          this.selectedAccountId = account.id;
          // this.currentSelectedAccount = account; // Ya no se usa para visualización directa
          console.log('PresupuestosPage: Cuenta seleccionada recibida:', account.nombre, 'ID:', this.selectedAccountId, 'Saldo:', account.saldo);
          if (!this.isEditMode && (this.budgetForm.get('account_id')?.value === null || this.budgetForm.get('account_id')?.value === undefined)) {
            this.budgetForm.patchValue({ account_id: this.selectedAccountId });
          }
        } else {
          this.selectedAccountId = null;
          // this.currentSelectedAccount = null; // Ya no se usa para visualización directa
          console.log('PresupuestosPage: Ninguna cuenta seleccionada recibida.');
        }
        await this.loadBudgets();
        this.cdRef.detectChanges();
      })
    );
    await this.loadAccounts();
    console.log('PresupuestosPage: Cuentas cargadas para el select del formulario.');
  }

  ionViewWillEnter() {
    console.log('PresupuestosPage: ionViewWillEnter - Recargando presupuestos.');
    this.loadBudgets();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async loadAccounts() {
    console.log('PresupuestosPage: loadAccounts() - Iniciando carga de cuentas.');
    this.subscriptions.add(
      this.accountService.getAccounts().pipe(
        map((apiAccounts: Account[]) => {
          return apiAccounts.map(apiAcc => ({
            id: apiAcc.id,
            nombre: apiAcc.name,
            tipo: apiAcc.type,
            saldo: apiAcc.current_balance ?? 0,
            institucion: apiAcc.institution || '',
            fechaActualizacion: apiAcc.updated_at
          }));
        })
      ).subscribe({
        next: (clientAccounts: ClientAccount[]) => {
          this.accounts = clientAccounts;
          console.log('PresupuestosPage: Cuentas cargadas para el formulario:', this.accounts.length);
          if (!this.accountService.getSelectedAccount() && clientAccounts.length > 0) {
            this.accountService.setSelectedAccount(clientAccounts[0]);
            console.log('PresupuestosPage: Estableciendo la primera cuenta como seleccionada por defecto:', clientAccounts[0].nombre);
          } else if (clientAccounts.length === 0) {
            this.accountService.setSelectedAccount(null);
            console.log('PresupuestosPage: No hay cuentas para seleccionar.');
          }
        },
        error: async (err) => {
          console.error('ERROR PresupuestosPage: Error al cargar cuentas:', err);
          const alert = await this.alertController.create({ header: 'Error', message: err.message || 'No se pudieron cargar las cuentas para los presupuestos.', buttons: ['OK'] });
          await alert.present();
        }
      })
    );
  }


  async loadBudgets() {
    console.log('PresupuestosPage: loadBudgets() - Iniciando carga de presupuestos.');
    if (this.selectedAccountId === null) {
      this.budgets = [];
      this.filteredBudgets = [];
      this.isLoading = false;
      // this.remainingAccountBalance = null; // Ya no se usa
      this.updateBudgetAlerts(); // Vaciará las alertas
      console.log('PresupuestosPage: No hay selectedAccountId, vaciando presupuestos y finalizando carga.');
      this.cdRef.detectChanges();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando presupuestos...',
      spinner: 'crescent'
    });
    await loading.present();
    console.log(`PresupuestosPage: Solicitando presupuestos para accountId: ${this.selectedAccountId}`);

    this.subscriptions.add(
      this.budgetService.getBudgets(this.selectedAccountId).subscribe({
        next: (apiBudgets: Budget[]) => {
          console.log('PresupuestosPage: Presupuestos recibidos de la API (raw):', apiBudgets);

          // ELIMINADO: La lógica de totalBudgetedForSelectedAccount y remainingAccountBalance
          // let totalBudgetedForSelectedAccount: number = 0;
          // let currentAccountBalance = this.currentSelectedAccount ? this.currentSelectedAccount.saldo : 0;
          // console.log(`PresupuestosPage: Saldo actual de la cuenta '${this.currentSelectedAccount?.nombre}': ${currentAccountBalance}`);


          this.budgets = apiBudgets.map(b => {
            const account = this.accounts.find(acc => acc.id === b.account_id);
            const category = this.categories.find(cat => cat.id === b.category_id);
            const amountNum = Number(b.budget_amount);
            const spentNum = Number(b.spent_amount ?? 0);

            // totalBudgetedForSelectedAccount += amountNum; // ELIMINADO: La suma para el balance restante de la cuenta

            const isActive = new Date(b.end_date) >= new Date();

            return {
              ...b,
              amount: amountNum,
              spent_amount: spentNum,
              accountName: account ? account.nombre : 'Cuenta Desconocida',
              categoryName: category ? category.name : 'Sin Categoría',
              is_active: isActive
            };
          }).sort((a, b) => {
            if (a.is_active && !b.is_active) return -1;
            if (!a.is_active && b.is_active) return 1;
            return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
          });

          // ELIMINADO: La asignación final de remainingAccountBalance
          // this.remainingAccountBalance = currentAccountBalance - totalBudgetedForSelectedAccount;
          // console.log(`PresupuestosPage: Total Presupuestado para esta cuenta: ${totalBudgetedForSelectedAccount}. ` +
          //             `Restante en cuenta (saldo - total presupuestado): ${this.remainingAccountBalance}.`);

          console.log('PresupuestosPage: Presupuestos mapeados para UI:', this.budgets);
          this.applyFilters();
          this.updateBudgetAlerts(); // Vaciará las alertas
          this.isLoading = false;
          loading.dismiss();
          console.log('PresupuestosPage: Carga y filtrado de presupuestos completado.');
          this.cdRef.detectChanges();
        },
        error: async (err) => {
          console.error('ERROR PresupuestosPage: Error al cargar presupuestos desde API:', err);
          this.isLoading = false;
          loading.dismiss();
          // this.remainingAccountBalance = null; // ELIMINADO: Ya no se usa
          const alert = await this.alertController.create({
            header: 'Error de Carga',
            message: err.message || 'No se pudieron cargar los presupuestos. Por favor, intente de nuevo o verifique su conexión.',
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

  applyFilters() {
    console.log('PresupuestosPage: Aplicando filtros. Datos iniciales:', this.budgets.length);
    let tempBudgets = [...this.budgets];

    if (this.currentSearchTerm) {
      tempBudgets = tempBudgets.filter(b =>
        (b.name && b.name.toLowerCase().includes(this.currentSearchTerm)) ||
        (b.categoryName && b.categoryName.toLowerCase().includes(this.currentSearchTerm)) ||
        (b.accountName && b.accountName.toLowerCase().includes(this.currentSearchTerm)) ||
        b.amount.toString().includes(this.currentSearchTerm)
      );
    }

    this.filteredBudgets = tempBudgets;
    console.log('PresupuestosPage: Presupuestos filtrados resultantes:', this.filteredBudgets.length);
    this.cdRef.detectChanges();
  }

  getCategoryIcon(categoryId: number | undefined): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    switch (category?.name.toLowerCase()) {
      case 'comida': return 'fast-food-outline';
      case 'transporte': return 'car-outline';
      case 'entretenimiento': return 'film-outline';
      case 'educación': return 'book-outline';
      case 'salud': return 'heart-outline';
      case 'vivienda': return 'home-outline';
      case 'servicios': return 'flash-outline';
      default: return 'pricetag-outline';
    }
  }

  getCategoryNameById(categoryId: number | undefined): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sin Categoría';
  }

  async openBudgetModal(mode: 'add' | 'edit', budget?: ClientBudget) {
    this.isModalOpen = true;
    this.isEditMode = mode === 'edit';
    this.budgetForm.reset();
    this.editingBudgetId = null;
    this.isSubmitting = false;

    if (this.isEditMode && budget) {
      this.editingBudgetId = budget.id || null;
      this.budgetForm.patchValue({
        name: budget.name,
        account_id: budget.account_id,
        category_id: budget.category_id,
        amount: budget.amount ?? null,
        start_date: budget.start_date ? new Date(budget.start_date).toISOString() : null,
        end_date: budget.end_date ? new Date(budget.end_date).toISOString() : null,
      });
      console.log('PresupuestosPage: Abriendo modal en modo EDICIÓN para ID:', budget.id);
      console.log('PresupuestosPage: Valores del formulario en edición (parcheado):', this.budgetForm.value);
    } else {
      this.editingBudgetId = null;
      this.budgetForm.reset({
        name: null,
        account_id: this.selectedAccountId,
        category_id: null,
        amount: null,
        start_date: new Date().toISOString(),
        end_date: this.addMonths(new Date(), 1).toISOString(),
      });
      console.log('PresupuestosPage: Abriendo modal en modo AÑADIR. account_id preestablecido:', this.selectedAccountId);
      console.log('PresupuestosPage: Valores del formulario en añadir (reset):', this.budgetForm.value);
    }
    this.cdRef.detectChanges();
  }

  async closeBudgetModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.budgetForm.reset();
    this.editingBudgetId = null;
    this.cdRef.detectChanges();
  }

  async submitBudgetForm() {
    this.budgetForm.markAllAsTouched();
    if (this.budgetForm.invalid) {
      console.warn('PresupuestosPage: Formulario inválido al guardar.');
      await this.presentToast('Por favor, completa todos los campos requeridos correctamente.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Guardando cambios...' : 'Añadiendo presupuesto...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = this.budgetForm.value;

    if (formData.account_id === null && this.selectedAccountId !== null) {
      formData.account_id = this.selectedAccountId;
    }

    const amountToSend = typeof formData.amount === 'string' && formData.amount.trim() === '' ? null : parseFloat(formData.amount);

    if (amountToSend === null || isNaN(amountToSend) || amountToSend <= 0) {
      console.error('PresupuestosPage: Monto inválido a enviar a la API:', formData.amount);
      await loading.dismiss();
      await this.presentToast('El monto del presupuesto debe ser un número positivo.', 'danger');
      this.isSubmitting = false;
      return;
    }

    const budgetToSend: Budget = {
      name: formData.name,
      account_id: formData.account_id,
      category_id: formData.category_id || null,
      budget_amount: amountToSend,
      start_date: formatDate(formData.start_date, 'yyyy-MM-dd HH:mm:ss', 'en-US'),
      end_date: formatDate(formData.end_date, 'yyyy-MM-dd HH:mm:ss', 'en-US'),
    };

    console.log('PresupuestosPage: Presupuesto a enviar a la API:', budgetToSend);

    if (this.isEditMode && this.editingBudgetId !== null) {
      this.subscriptions.add(
        this.budgetService.updateBudget(this.editingBudgetId, budgetToSend).subscribe({
          next: async (res: BudgetApiResponse) => {
            console.log('PresupuestosPage: Presupuesto actualizado con éxito:', res);
            await loading.dismiss();
            this.presentToast('¡Presupuesto actualizado con éxito!', 'success');
            this.closeBudgetModal();
            await this.loadBudgets();
          },
          error: async (err) => {
            console.error('ERROR PresupuestosPage: Error al actualizar presupuesto:', err);
            await loading.dismiss();
            this.presentToast(err.message || 'No se pudo actualizar el presupuesto. Intente de nuevo.', 'danger');
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.budgetService.createBudget(budgetToSend).subscribe({
          next: async (res: BudgetApiResponse) => {
            console.log('PresupuestosPage: Presupuesto añadido con éxito:', res);
            await loading.dismiss();
            this.presentToast('¡Presupuesto añadido con éxito!', 'success');
            this.closeBudgetModal();
            await this.loadBudgets();
          },
          error: async (err) => {
            console.error('ERROR PresupuestosPage: Error al añadir presupuesto:', err);
            await loading.dismiss();
            this.presentToast(err.message || 'No se pudo añadir el presupuesto. Intente de nuevo.', 'danger');
          }
        })
      );
    }
  }

  async confirmDeleteBudget(id: number | undefined) {
    if (id === undefined) {
      console.error('PresupuestosPage: Intento de eliminar presupuesto sin ID.');
      await this.presentToast('No se pudo eliminar el presupuesto: ID no válido.', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            await this.deleteBudget(id);
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteBudget(id: number) {
    const deleteLoading = await this.loadingController.create({
      message: 'Eliminando presupuesto...',
      spinner: 'crescent'
    });
    await deleteLoading.present();
    console.log('PresupuestosPage: Iniciando eliminación de presupuesto con ID:', id);

    this.subscriptions.add(
      this.budgetService.deleteBudget(id).subscribe({
        next: async () => {
          console.log('PresupuestosPage: Presupuesto eliminado con éxito.');
          await deleteLoading.dismiss();
          this.presentToast('¡Presupuesto eliminado con éxito!', 'success');
          await this.loadBudgets();
        },
        error: async (err) => {
          console.error('ERROR PresupuestosPage: Error al eliminar presupuesto:', err);
          await deleteLoading.dismiss();
          this.presentToast(err.message || 'No se pudo eliminar el presupuesto. Intente de nuevo.', 'danger');
        }
      })
    );
  }

  // Se mantiene el método, pero ahora solo vacía las alertas.
  private updateBudgetAlerts() {
    this.budgetAlerts = []; // Vaciamos el array de alertas para que no se muestre el marco rojo
  }

  formatDatePeriod(startDate: string, endDate: string): string {
    const start = formatDate(startDate, 'd/MM/yyyy', 'es-ES');
    const end = formatDate(endDate, 'd/MM/yyyy', 'es-ES');
    return `${start} - ${end}`;
  }

  addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
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
}
