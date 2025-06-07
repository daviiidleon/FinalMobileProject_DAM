// src/app/page/ahorro/ahorro.page.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonCol,
  IonRow,
  IonGrid,
  IonProgressBar,
  IonModal,
  IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonNote, IonSpinner, IonList, IonSelect, IonSelectOption,
  LoadingController,
  IonMenuButton,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';

import { HeaderComponent } from '../../component/header/header.component';
import { SideMenuComponent } from '../../component/side-menu/side-menu.component';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cashOutline,
  calendarOutline,
  addCircleOutline,
  createOutline,
  trashOutline,
  closeOutline
} from 'ionicons/icons';

import { AccountService, Account } from '../../services/account.service'; // Account ahora tiene current_balance
import { ClientAccount } from '../cuentas/cuentas.page'; // Importar ClientAccount

// Import the 'map' operator
import { map } from 'rxjs/operators';


interface ObjetivoAhorro {
  id: string;
  nombre: string;
  montoMeta: number;
  montoActual: number;
  fechaLimite?: string | null;
  progreso: number;
  accountId: number; // Añadimos accountId para asociar el objetivo a una cuenta
}

@Component({
  selector: 'app-ahorro',
  templateUrl: './ahorro.page.html',
  styleUrls: ['./ahorro.page.scss'],
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
    IonCol,
    IonRow,
    IonGrid,
    IonProgressBar,
    IonModal,
    IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonNote, IonSpinner, IonList, IonSelect, IonSelectOption,

    DatePipe,
    CurrencyPipe,

    HeaderComponent,
    SideMenuComponent,
  ],
})
export class AhorroPage implements OnInit, OnDestroy {
  objetivos: ObjetivoAhorro[] = [];
  isLoading = true;

  @ViewChild('goalModal') goalModal!: IonModal;
  @ViewChild('addFundsModal') addFundsModal!: IonModal;

  isGoalModalOpen: boolean = false;
  isAddFundsModalOpen: boolean = false;
  isEditMode: boolean = false;
  goalForm: FormGroup;
  isSubmitting: boolean = false;
  editingGoalId: string | null = null;
  fundsToAdd: number | null = null;
  showDatePicker: boolean = false;
  selectedGoal: ObjetivoAhorro | null = null;

  accounts: ClientAccount[] = []; // Lista de cuentas para el select
  selectedAccountId: number | null = null; // ID de la cuenta seleccionada (para el select de filtro)
  currentAccountDetails: ClientAccount | null = null; // Detalles de la cuenta actualmente seleccionada (del AccountService)

  private storageKey = 'objetivosAhorro';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private accountService: AccountService,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({
      addOutline,
      cashOutline,
      calendarOutline,
      addCircleOutline,
      createOutline,
      trashOutline,
      closeOutline,
    });

    this.goalForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      montoMeta: [null, [Validators.required, Validators.min(0.01)]],
      montoActual: [0, Validators.min(0)],
      fechaLimite: [null],
      accountId: [null, Validators.required] // Campo para asociar el objetivo a una cuenta
    });
  }

  async ngOnInit() {
    // 1. Suscribirse a la cuenta seleccionada del servicio
    this.subscriptions.add(
      this.accountService.selectedAccount$.subscribe(async account => {
        this.currentAccountDetails = account; // Actualizar los detalles de la cuenta principal
        if (account && account.id !== undefined) {
          this.selectedAccountId = account.id; // Mantener el ID del select sincronizado
          console.log('AhorroPage: Cuenta seleccionada desde servicio:', account.nombre);
        } else {
          this.selectedAccountId = null;
          console.log('AhorroPage: Ninguna cuenta seleccionada desde servicio.');
        }
        await this.loadObjetivosFromStorage(); // Recargar objetivos cuando cambia la cuenta
        this.cdRef.detectChanges(); // Forzar la detección de cambios
      })
    );

    // 2. Cargar la lista de todas las cuentas (para el ion-select en el futuro, si lo pones)
    await this.loadAccounts();

    // NOTA: loadObjetivosFromStorage ya se llama dentro de la suscripción a selectedAccount$,
    // lo que asegura que los objetivos se carguen solo para la cuenta correcta.
  }

  async ionViewWillEnter() {
    // Recargar cuentas y objetivos cada vez que la vista entra para asegurar la frescura de los datos
    await this.loadAccounts();
    // La suscripción a selectedAccount$ ya disparará loadObjetivosFromStorage
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // --- Lógica de Carga de Cuentas (para el select, si lo usas) ---
  async loadAccounts() {
    this.subscriptions.add(
      this.accountService.getAccounts().pipe(
        map((apiAccounts: Account[]) => {
          return apiAccounts.map(apiAcc => ({
            id: apiAcc.id,
            nombre: apiAcc.name,
            tipo: apiAcc.type,
            // ===> CAMBIO CLAVE AQUÍ: Usar apiAcc.current_balance <===
            saldo: apiAcc.current_balance ?? 0, // Usar apiAcc.current_balance
            institucion: apiAcc.institution || '',
            fechaActualizacion: apiAcc.updated_at
          }));
        })
      ).subscribe({
        next: (clientAccounts: ClientAccount[]) => {
          this.accounts = clientAccounts;
          // Si no hay cuenta seleccionada en el servicio, y hay cuentas disponibles,
          // establece la primera como seleccionada (para que otras páginas reaccionen)
          if (!this.accountService.getSelectedAccount() && clientAccounts.length > 0) {
            this.accountService.setSelectedAccount(clientAccounts[0]);
          } else if (clientAccounts.length === 0) {
            this.accountService.setSelectedAccount(null); // Si no hay cuentas, deselecciona
          }
        },
        error: async (err) => {
          console.error('Error al cargar cuentas para select en AhorroPage:', err);
          const alert = await this.alertController.create({ header: 'Error', message: err.message || 'No se pudieron cargar las cuentas para la selección.', buttons: ['OK'] });
          await alert.present();
        }
      })
    );
  }

  // Este método ya no es para cambiar la cuenta principal, sino si tuvieras un select en AhorroPage
  onAccountChange(event: any) {
    const accountId = event.detail.value;
    // Esto solo actualizaría el filtro local si tuvieras un select de cuenta en AhorroPage.
    // La cuenta principal se gestiona vía AccountService.selectedAccount$.
    console.log('AhorroPage: Cambió la cuenta seleccionada en el select local a:', accountId);
    // Si quieres que cambiar el select en AhorroPage cambie la cuenta globalmente:
    const selectedAccount = this.accounts.find(acc => acc.id === accountId);
    if (selectedAccount) {
      this.accountService.setSelectedAccount(selectedAccount);
    }
  }


  // --- Lógica de Carga y Guardado de Objetivos ---
  private async loadObjetivosFromStorage() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando tus metas de ahorro...',
      spinner: 'crescent'
    });
    await loading.present();

    const currentAccountId = this.selectedAccountId;
    if (currentAccountId === null) {
      this.objetivos = []; // Si no hay cuenta seleccionada, no hay objetivos
      this.isLoading = false;
      await loading.dismiss();
      return;
    }

    try {
      const storedObjetivos = localStorage.getItem(this.storageKey);
      if (storedObjetivos) {
        const allObjetivos: ObjetivoAhorro[] = JSON.parse(storedObjetivos);
        // Filtrar objetivos que pertenecen a la cuenta seleccionada
        this.objetivos = allObjetivos.filter(obj => obj.accountId === currentAccountId).map((obj: ObjetivoAhorro) => {
          const montoActualClamped = Math.min(obj.montoActual, obj.montoMeta);
          return {
            ...obj,
            montoActual: montoActualClamped,
            progreso: (obj.montoMeta > 0) ? (montoActualClamped / obj.montoMeta) * 100 : 0,
          };
        });
        console.log(`Metas cargadas para cuenta ${currentAccountId} desde localStorage:`, this.objetivos.length);
      } else {
        this.objetivos = [];
        console.log('No se encontraron metas en localStorage.');
      }
    } catch (error) {
      console.error('Error al cargar metas:', error);
      this.objetivos = [];
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  saveObjetivos() {
    let allObjetivos: ObjetivoAhorro[] = [];
    try {
      const storedObjetivos = localStorage.getItem(this.storageKey);
      if (storedObjetivos) {
        allObjetivos = JSON.parse(storedObjetivos);
      }
    }
    catch (e) {
      console.error('Error al parsear objetivos de localStorage para guardar:', e);
    }

    const currentAccountId = this.selectedAccountId;
    if (currentAccountId === null) {
      console.warn('No hay cuenta seleccionada para guardar objetivos.');
      return;
    }

    // Filtra objetivos de otras cuentas y añade/actualiza los de la cuenta actual
    const updatedAllObjetivos = allObjetivos.filter(obj => obj.accountId !== currentAccountId);
    this.objetivos.forEach(obj => {
      // Asegura que el accountId se guarde con el objetivo
      updatedAllObjetivos.push({ ...obj, accountId: currentAccountId });
    });

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(updatedAllObjetivos.map((obj:any) => {
        const { progreso, ...rest } = obj;
        return rest;
      }))
    );
    console.log('Metas guardadas en localStorage.');
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  formatDate(date: string | null | undefined): string | null {
    if (!date) {
      return null;
    }
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('es-ES', options).format(dateObj); // Usar es-ES
  }

  isDeadlinePassed(fechaLimite: string | null | undefined): boolean {
    if (!fechaLimite) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(fechaLimite);
    deadline.setHours(0, 0, 0, 0);

    return deadline < today;
  }

  // --- Goal Modal Methods ---
  async openGoalModal(mode: 'add' | 'edit', goal?: ObjetivoAhorro) {
    if (this.selectedAccountId === null) {
      await this.presentToast('Por favor, selecciona una cuenta antes de añadir o editar una meta de ahorro.', 'warning');
      return;
    }

    this.isGoalModalOpen = true;
    this.isEditMode = mode === 'edit';
    this.goalForm.reset();
    this.editingGoalId = null;
    this.isSubmitting = false;
    this.showDatePicker = false;

    // Asegura que el accountId del formulario se establezca correctamente
    this.goalForm.get('accountId')?.setValue(this.selectedAccountId);
    this.goalForm.get('accountId')?.disable(); // Para que el usuario no cambie la cuenta desde el modal

    if (this.isEditMode && goal) {
      this.editingGoalId = goal.id;
      this.goalForm.patchValue({
        id: goal.id,
        nombre: goal.nombre,
        montoMeta: goal.montoMeta,
        montoActual: goal.montoActual,
        fechaLimite: goal.fechaLimite ? new Date(goal.fechaLimite).toISOString() : null,
      });
      this.goalForm.get('montoActual')?.disable(); // montoActual solo se cambia vía "Add Funds"
    } else {
      this.goalForm.get('montoActual')?.enable();
      this.goalForm.patchValue({ montoActual: 0 });
      this.goalForm.get('id')?.setValue(this.generateId());
    }
  }

  async closeGoalModal() {
    this.isGoalModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.goalForm.reset();
    this.editingGoalId = null;
    this.showDatePicker = false;
    this.goalForm.get('montoActual')?.enable();
    this.goalForm.get('accountId')?.enable(); // Re-habilitar accountId
  }

  toggleDatePicker() {
    this.showDatePicker = !this.showDatePicker;
  }

  onDateSelected(event: any) {
    this.showDatePicker = false;
  }

  async submitGoalForm() {
    this.goalForm.markAllAsTouched();
    if (this.goalForm.invalid) {
      await this.presentToast('Please fill all required fields correctly.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Saving changes...' : 'Adding goal...',
      spinner: 'crescent'
    });
    await loading.present();

    const formValue = this.goalForm.getRawValue();
    const newGoal: ObjetivoAhorro = {
      id: formValue.id || this.generateId(),
      nombre: formValue.nombre,
      montoMeta: parseFloat(formValue.montoMeta),
      montoActual: parseFloat(formValue.montoActual),
      fechaLimite: formValue.fechaLimite ? new Date(formValue.fechaLimite).toISOString() : null,
      progreso: 0, // Se recalculará
      accountId: formValue.accountId // Asegura que se pase el accountId
    };

    if (this.isEditMode && this.editingGoalId) {
      const index = this.objetivos.findIndex(g => g.id === this.editingGoalId);
      if (index !== -1) {
        newGoal.montoActual = this.objetivos[index].montoActual; // Preservar montoActual
        newGoal.progreso = (newGoal.montoActual / newGoal.montoMeta) * 100;
        if (newGoal.progreso > 100) newGoal.progreso = 100;

        this.objetivos[index] = { ...newGoal };
        await this.presentToast('Goal updated successfully!', 'success');
      }
    } else {
      this.objetivos.unshift(newGoal);
      await this.presentToast('Goal added successfully!', 'success');
    }

    this.saveObjetivos();
    this.isSubmitting = false;
    await loading.dismiss();
    await this.closeGoalModal();
    await this.loadObjetivosFromStorage(); // Recargar para actualizar la UI
  }

  // --- Add Funds Modal Methods ---
  openAddFundsModal(goal: ObjetivoAhorro) {
    this.isAddFundsModalOpen = true;
    this.selectedGoal = goal;
    this.fundsToAdd = null;
    this.isSubmitting = false;
  }

  closeAddFundsModal() {
    this.isAddFundsModalOpen = false;
    this.selectedGoal = null;
    this.fundsToAdd = null;
    this.isSubmitting = false;
  }

  async addFunds() {
    if (!this.selectedGoal || typeof this.fundsToAdd !== 'number' || this.fundsToAdd <= 0) {
      await this.presentToast('Please enter a valid amount to add.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Adding funds...',
      spinner: 'crescent'
    });
    await loading.present();

    const index = this.objetivos.findIndex(g => g.id === this.selectedGoal?.id);
    if (index !== -1) {
      const goal = this.objetivos[index];
      goal.montoActual += this.fundsToAdd;
      if (goal.montoActual > goal.montoMeta) {
        goal.montoActual = goal.montoMeta;
      }
      goal.progreso = (goal.montoMeta > 0) ? (goal.montoActual / goal.montoMeta) * 100 : 0;
      if (goal.progreso > 100) goal.progreso = 100;

      this.objetivos[index] = { ...goal };
      this.saveObjetivos();
      await this.presentToast('Funds added successfully!', 'success');
    } else {
      await this.presentToast('Goal not found.', 'danger');
    }

    this.isSubmitting = false;
    await loading.dismiss();
    this.closeAddFundsModal();
    await this.loadObjetivosFromStorage(); // Recargar para actualizar UI
  }

  // --- General Methods ---
  async deleteGoal(goalId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this goal? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Delete cancelled');
          },
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Deleting goal...',
            });
            await loading.present();
            this.objetivos = this.objetivos.filter((obj) => obj.id !== goalId);
            this.saveObjetivos();
            await loading.dismiss();
            await this.presentToast('Goal deleted successfully!', 'success');
            await this.loadObjetivosFromStorage(); // Recargar para actualizar UI
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
}
