import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate, DatePipe, CurrencyPipe } from '@angular/common'; // Importar formatDate aquí
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
  IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonNote, IonSpinner, IonList, IonSelect, IonSelectOption, IonTextarea,
  LoadingController,
  IonMenuButton,
  AlertController,
  ToastController,
  IonBadge
} from '@ionic/angular/standalone';

import { HeaderComponent } from '../../component/header/header.component';
import { SideMenuComponent } from '../../component/side-menu/side-menu.component';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
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

import { AccountService, Account } from '../../services/account.service';
import { ClientAccount } from '../cuentas/cuentas.page';

import { SavingsGoalService, SavingsGoal } from '../../services/savings-goal.service';


interface ClientSavingsGoal {
  id?: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date?: string | null;
  description?: string | null;
  is_achieved: boolean;
  progress: number; // Calculado en el frontend
  account_id: number;
  created_at?: string;
  updated_at?: string;
}

interface BudgetAlert {
  message: string;
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
    IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonNote, IonSpinner, IonList, IonSelect, IonSelectOption, IonTextarea,
    IonBadge,

    DatePipe,
    CurrencyPipe,

    HeaderComponent,
    SideMenuComponent,
  ],
})
export class AhorroPage implements OnInit, OnDestroy {
  objetivos: ClientSavingsGoal[] = [];
  isLoading = true;

  @ViewChild('goalModal') goalModal!: IonModal;
  @ViewChild('addFundsModal') addFundsModal!: IonModal;

  isGoalModalOpen: boolean = false;
  isAddFundsModalOpen: boolean = false;
  isEditMode: boolean = false;
  goalForm: FormGroup;
  isSubmitting: boolean = false;
  editingGoalId: number | null = null;
  fundsToAdd: number | null = null;
  selectedGoal: ClientSavingsGoal | null = null;

  accounts: ClientAccount[] = [];
  selectedAccountId: number | null = null;
  currentAccountDetails: ClientAccount | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private accountService: AccountService,
    private savingsGoalService: SavingsGoalService,
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
      name: ['', [Validators.required, Validators.minLength(3)]],
      target_amount: [null, [Validators.required, Validators.min(0.01)]],
      saved_amount: [0, Validators.min(0)],
      target_date: [null],
      description: [null],
      account_id: [null, Validators.required]
    });
  }

  async ngOnInit() {
    this.subscriptions.add(
      this.accountService.selectedAccount$.subscribe(async account => {
        this.currentAccountDetails = account;
        if (account && account.id !== undefined) {
          this.selectedAccountId = account.id;
          console.log('AhorroPage: Cuenta seleccionada desde servicio:', account.nombre);
          if (!this.isEditMode && (this.goalForm.get('account_id')?.value === null || this.goalForm.get('account_id')?.value === undefined)) {
            this.goalForm.patchValue({ account_id: this.selectedAccountId });
          }
        } else {
          this.selectedAccountId = null;
          console.log('AhorroPage: Ninguna cuenta seleccionada desde servicio.');
        }
        await this.loadSavingsGoals();
        this.cdRef.detectChanges();
      })
    );

    await this.loadAccounts();
  }

  async ionViewWillEnter() {
    await this.loadAccounts();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async loadAccounts() {
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
          if (!this.accountService.getSelectedAccount() && clientAccounts.length > 0) {
            this.accountService.setSelectedAccount(clientAccounts[0]);
          } else if (clientAccounts.length === 0) {
            this.accountService.setSelectedAccount(null);
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

  private async loadSavingsGoals() {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando tus metas de ahorro...',
      spinner: 'crescent'
    });
    await loading.present();

    if (this.selectedAccountId === null) {
      this.objetivos = [];
      this.isLoading = false;
      await loading.dismiss();
      this.cdRef.detectChanges();
      return;
    }

    this.subscriptions.add(
      this.savingsGoalService.getSavingsGoals(this.selectedAccountId).subscribe({
        next: (apiGoals: SavingsGoal[]) => {
          console.log('AhorroPage: Metas de ahorro recibidas de la API (raw):', apiGoals);
          this.objetivos = apiGoals.map(goal => ({
            ...goal,
            progress: (Number(goal.target_amount) > 0) ? (Number(goal.saved_amount) / Number(goal.target_amount)) * 100 : 0,
            saved_amount: Math.min(Number(goal.saved_amount), Number(goal.target_amount))
          }));
          console.log('AhorroPage: Metas de ahorro mapeadas para UI:', this.objetivos);
          this.isLoading = false;
          loading.dismiss();
          this.cdRef.detectChanges();
        },
        error: async (err) => {
          console.error('ERROR AhorroPage: Error al cargar metas de ahorro desde API:', err);
          this.isLoading = false;
          loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error de Carga',
            message: err.message || 'No se pudieron cargar las metas de ahorro. Por favor, intente de nuevo o verifique su conexión.',
            buttons: ['OK']
          });
          await alert.present();
          this.cdRef.detectChanges();
        }
      })
    );
  }

  formatDateForDisplay(date: string | null | undefined): string | null {
    if (!date) {
      return null;
    }
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
  }

  isDeadlinePassed(targetDate: string | null | undefined): boolean {
    if (!targetDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(targetDate);
    deadline.setHours(0, 0, 0, 0);

    return deadline < today;
  }

  async openGoalModal(mode: 'add' | 'edit', goal?: ClientSavingsGoal) {
    if (this.selectedAccountId === null) {
      await this.presentToast('Por favor, selecciona una cuenta antes de añadir o editar una meta de ahorro.', 'warning');
      return;
    }

    this.isGoalModalOpen = true;
    this.isEditMode = mode === 'edit';
    this.goalForm.reset();
    this.editingGoalId = null;
    this.isSubmitting = false;

    this.goalForm.get('account_id')?.setValue(this.selectedAccountId);
    this.goalForm.get('account_id')?.disable();

    if (this.isEditMode && goal) {
      this.editingGoalId = goal.id || null;
      this.goalForm.patchValue({
        name: goal.name,
        target_amount: goal.target_amount,
        saved_amount: goal.saved_amount,
        target_date: goal.target_date ? new Date(goal.target_date).toISOString() : null,
        description: goal.description,
        account_id: goal.account_id
      });
      this.goalForm.get('saved_amount')?.disable();
    } else {
      this.goalForm.get('saved_amount')?.enable();
      this.goalForm.patchValue({ saved_amount: 0 });
    }
  }

  async closeGoalModal() {
    this.isGoalModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.goalForm.reset();
    this.editingGoalId = null;
    this.goalForm.get('saved_amount')?.enable();
    this.goalForm.get('account_id')?.enable();
  }

  onDateSelected() { /* No necesita lógica si ion-datetime está usando formControlName */ }


  async submitGoalForm() {
    this.goalForm.markAllAsTouched();
    if (this.goalForm.invalid) {
      await this.presentToast('Por favor, completa todos los campos requeridos correctamente.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Guardando cambios...' : 'Añadiendo meta...',
      spinner: 'crescent'
    });
    await loading.present();

    const formValue = this.goalForm.getRawValue();

    const goalToSend: SavingsGoal = {
      name: formValue.name,
      target_amount: parseFloat(formValue.target_amount),
      saved_amount: parseFloat(formValue.saved_amount),
      target_date: formValue.target_date ? formatDate(formValue.target_date, 'yyyy-MM-dd HH:mm:ss', 'en-US') : null,
      description: formValue.description || null,
      account_id: formValue.account_id,
      is_achieved: (parseFloat(formValue.saved_amount) >= parseFloat(formValue.target_amount)),
    };

    if (this.isEditMode && this.editingGoalId !== null) {
      const updatePayload: Partial<SavingsGoal> = {
        name: goalToSend.name,
        target_amount: goalToSend.target_amount,
        target_date: goalToSend.target_date,
        description: goalToSend.description,
        account_id: goalToSend.account_id,
        is_achieved: goalToSend.is_achieved
      };

      this.subscriptions.add(
        this.savingsGoalService.updateSavingsGoal(this.editingGoalId, updatePayload as SavingsGoal).subscribe({
          next: async (res) => {
            console.log('AhorroPage: Meta actualizada con éxito:', res);
            await loading.dismiss();
            this.presentToast('¡Meta actualizada con éxito!', 'success');
            this.closeGoalModal();
            await this.loadSavingsGoals();
          },
          error: async (err) => {
            console.error('ERROR AhorroPage: Error al actualizar meta:', err);
            await loading.dismiss();
            this.presentToast(err.message || 'No se pudo actualizar la meta. Intente de nuevo.', 'danger');
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.savingsGoalService.createSavingsGoal(goalToSend).subscribe({
          next: async (res) => {
            console.log('AhorroPage: Meta añadida con éxito:', res);
            await loading.dismiss();
            this.presentToast('¡Meta añadida con éxito!', 'success');
            this.closeGoalModal();
            await this.loadSavingsGoals();
          },
          error: async (err) => {
            console.error('ERROR AhorroPage: Error al añadir meta:', err);
            await loading.dismiss();
            this.presentToast(err.message || 'No se pudo añadir la meta. Intente de nuevo.', 'danger');
          }
        })
      );
    }
  }

  openAddFundsModal(goal: ClientSavingsGoal) {
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
      await this.presentToast('Por favor, introduce una cantidad válida para añadir.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Añadiendo fondos...',
      spinner: 'crescent'
    });
    await loading.present();

    // Pasar el account_id de la meta seleccionada en el payload
    this.subscriptions.add(
      this.savingsGoalService.addFundsToGoal(this.selectedGoal.id!, this.fundsToAdd, this.selectedGoal.account_id!).subscribe({ // <-- Se pasa account_id
        next: async (res) => {
          console.log('AhorroPage: Fondos añadidos con éxito:', res);
          await loading.dismiss();
          this.presentToast('¡Fondos añadidos con éxito!', 'success');
          this.closeAddFundsModal();
          await this.loadSavingsGoals();
        },
        error: async (err) => {
          console.error('ERROR AhorroPage: Error al añadir fondos:', err);
          await loading.dismiss();
          this.presentToast(err.message || 'No se pudieron añadir los fondos. Intente de nuevo.', 'danger');
        }
      })
    );
  }

  async confirmDeleteGoal(goalId: number | undefined) {
    if (goalId === undefined || goalId === null) {
      await this.presentToast('No se pudo eliminar la meta: ID no válido.', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta meta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            await this.deleteGoal(goalId);
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteGoal(goalId: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando meta...',
      spinner: 'crescent'
    });
    await loading.present();

    this.subscriptions.add(
      this.savingsGoalService.deleteSavingsGoal(goalId).subscribe({
        next: async () => {
          console.log('AhorroPage: Meta eliminada con éxito.');
          await loading.dismiss();
          this.presentToast('¡Meta eliminada con éxito!', 'success');
          await this.loadSavingsGoals();
        },
        error: async (err) => {
          console.error('ERROR AhorroPage: Error al eliminar meta:', err);
          await loading.dismiss();
          this.presentToast(err.message || 'No se pudo eliminar la meta. Intente de nuevo.', 'danger');
        }
      })
    );
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
