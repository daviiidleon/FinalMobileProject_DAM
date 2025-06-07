// src/app/page/cuentas/cuentas.page.ts
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
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
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  LoadingController,
  AlertController,
  ToastController,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonModal,
  IonInput,
  IonLabel,
  IonDatetime,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component"; // Asegúrate de la ruta correcta
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  business,
  addCircle,
  pencilOutline,
  trashOutline,
  walletOutline,
  cardOutline,
  cashOutline,
  analyticsOutline,
  closeOutline,
  businessOutline,
  calendarOutline
} from 'ionicons/icons';

import { AccountService, Account, AccountApiResponse } from '../../services/account.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ClientAccount {
  id?: number;
  nombre: string;
  tipo: string;
  saldo: number; // En el frontend se llama 'saldo'
  institucion: string;
  fechaActualizacion?: string;
}

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
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
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonBadge,
    IonItem,
    IonList,
    IonModal,
    IonInput,
    IonLabel,
    IonDatetime,
    IonNote,
    IonSpinner
  ]
})
export class CuentasPage implements OnInit, OnDestroy {
  @ViewChild('accountModal') accountModal!: IonModal;

  accounts: ClientAccount[] = [];
  isLoading: boolean = true;
  private subscriptions: Subscription = new Subscription();

  selectedAccount: ClientAccount | null = null; // Para el resaltado visual

  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  accountForm: FormGroup;
  isSubmitting: boolean = false;
  editingAccountId: number | null = null;

  accountTypes: string[] = ['cash', 'bank', 'credit_card', 'investment', 'other'];

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private fb: FormBuilder,
    private accountService: AccountService,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({
      business,
      addCircle,
      pencilOutline,
      trashOutline,
      walletOutline,
      cardOutline,
      cashOutline,
      analyticsOutline,
      closeOutline,
      businessOutline,
      calendarOutline
    });

    this.accountForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['', Validators.required],
      // ===> Cambio: `saldo` en el formulario se mapea a `current_balance` en la API <===
      saldo: [null, [Validators.required, Validators.pattern(/^-?\d*\.?\d*$/)]],
      currency: ['EUR', Validators.required],
      institucion: [''] // `institution` en el backend, `institucion` en el form
    });
  }

  ngOnInit() {
    this.loadAccounts();
    this.subscriptions.add(
      this.accountService.selectedAccount$.subscribe(account => {
        this.selectedAccount = account;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ionViewWillEnter() {
    this.loadAccounts();
  }

  async loadAccounts() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando cuentas...',
      spinner: 'crescent'
    });
    await loading.present();

    this.subscriptions.add(
      this.accountService.getAccounts().pipe(
        map((apiAccounts: Account[]) => {
          return apiAccounts.map(apiAcc => ({
            id: apiAcc.id,
            nombre: apiAcc.name,
            tipo: apiAcc.type,
            // ===> CAMBIO CLAVE: Mapear 'current_balance' de la API a 'saldo' del frontend <===
            saldo: apiAcc.current_balance ?? 0, // Usar 'current_balance' de la API
            institucion: apiAcc.institution || '', // Tu backend no lo devuelve explícitamente en el modelo, pero lo mantenemos
            fechaActualizacion: apiAcc.updated_at
          }));
        })
      ).subscribe({
        next: (clientAccounts: ClientAccount[]) => {
          this.accounts = clientAccounts;
          this.isLoading = false;
          loading.dismiss();

          if (!this.accountService.getSelectedAccount() && clientAccounts.length > 0) {
            this.accountService.setSelectedAccount(clientAccounts[0]);
          } else if (clientAccounts.length === 0) {
            this.accountService.setSelectedAccount(null);
          }
        },
        error: async (err) => {
          console.error('Error al cargar cuentas:', err);
          this.isLoading = false;
          loading.dismiss();
          this.accountService.setSelectedAccount(null);
          const alert = await this.alertController.create({
            header: 'Error',
            message: err.message || 'No se pudieron cargar las cuentas. Por favor, intente de nuevo.',
            buttons: ['OK']
          });
          await alert.present();
        }
      })
    );
  }

  async openAccountModal(mode: 'add' | 'edit', account?: ClientAccount) {
    this.isEditMode = (mode === 'edit');
    this.isSubmitting = false;

    if (this.isEditMode && account && account.id !== undefined) {
      this.editingAccountId = account.id;
      this.accountForm.patchValue({
        id: account.id,
        nombre: account.nombre,
        tipo: account.tipo,
        saldo: account.saldo, // Cargar 'saldo' del frontend
        institucion: account.institucion,
        currency: 'EUR'
      });
    } else {
      this.editingAccountId = null;
      this.accountForm.reset({
        nombre: '',
        tipo: 'cash',
        saldo: 0,
        institucion: '',
        currency: 'EUR'
      });
    }
    this.isModalOpen = true;
    this.cdRef.detectChanges();
  }

  async submitAccountForm() {
    this.accountForm.markAllAsTouched();

    if (this.accountForm.invalid) {
      this.presentToast('Por favor, complete todos los campos requeridos correctamente.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Guardando cambios...' : 'Añadiendo cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = this.accountForm.value;

    const accountToSave: Account = {
      name: formData.nombre,
      type: formData.tipo,
      // ===> CAMBIO CLAVE: Enviar 'current_balance' a la API desde 'saldo' del formulario <===
      current_balance: parseFloat(formData.saldo), // 'saldo' del formulario se mapea a 'current_balance' para la API
      currency: formData.currency,
      institution: formData.institucion || null // Se envía si lo usas en el backend
    };

    if (this.isEditMode && this.editingAccountId !== null) {
      this.subscriptions.add(
        this.accountService.updateAccount(this.editingAccountId, accountToSave).subscribe({
          next: async (res: AccountApiResponse) => {
            await loading.dismiss();
            this.presentToast('¡Cuenta actualizada exitosamente!', 'success');
            this.closeAccountModal();
            await this.loadAccounts();
            if (this.accountService.getSelectedAccount()?.id === res.account.id) {
              this.accountService.setSelectedAccount({
                id: res.account.id,
                nombre: res.account.name,
                tipo: res.account.type,
                saldo: res.account.current_balance, // Usar current_balance de la respuesta de la API
                institucion: res.account.institution || '',
                fechaActualizacion: res.account.updated_at
              });
            }
          },
          error: async (err) => {
            await loading.dismiss();
            console.error('Error al actualizar cuenta:', err);
            this.presentToast(err.message || 'No se pudo actualizar la cuenta. Intente de nuevo.', 'danger');
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.accountService.createAccount(accountToSave).subscribe({
          next: async (res: AccountApiResponse) => {
            await loading.dismiss();
            this.presentToast('¡Cuenta añadida exitosamente!', 'success');
            this.closeAccountModal();
            await this.loadAccounts();
            if (!this.accountService.getSelectedAccount()) {
              this.accountService.setSelectedAccount({
                id: res.account.id,
                nombre: res.account.name,
                tipo: res.account.type,
                saldo: res.account.current_balance, // Usar current_balance de la respuesta de la API
                institucion: res.account.institution || '',
                fechaActualizacion: res.account.updated_at
              });
            }
          },
          error: async (err) => {
            await loading.dismiss();
            console.error('Error al añadir cuenta:', err);
            this.presentToast(err.message || 'No se pudo añadir la cuenta. Intente de nuevo.', 'danger');
          }
        })
      );
    }
  }

  async closeAccountModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.editingAccountId = null;
    this.accountForm.reset();
  }

  async deleteAccount(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Está seguro de que desea eliminar esta cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando cuenta...',
              spinner: 'crescent'
            });
            await loading.present();

            this.subscriptions.add(
              this.accountService.deleteAccount(id).subscribe({
                next: async () => {
                  await loading.dismiss();
                  this.presentToast('¡Cuenta eliminada exitosamente!', 'success');
                  await this.loadAccounts();
                  if (this.accountService.getSelectedAccount()?.id === id) {
                    this.accountService.setSelectedAccount(this.accounts.length > 0 ? this.accounts[0] : null);
                  }
                },
                error: async (err) => {
                  await loading.dismiss();
                  console.error('Error al eliminar cuenta:', err);
                  this.presentToast(err.message || 'No se pudo eliminar la cuenta. Intente de nuevo.', 'danger');
                }
              })
            );
          },
        },
      ],
    });

    await alert.present();
  }

  selectAccount(account: ClientAccount) {
    this.accountService.setSelectedAccount(account);
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

  getIcon(accountType: string): string {
    switch (accountType) {
      case 'Checking':
      case 'Savings':
      case 'bank':
        return 'wallet-outline';
      case 'Credit Card':
      case 'credit_card':
        return 'card-outline';
      case 'Cash':
      case 'cash':
        return 'cash-outline';
      case 'Investment':
      case 'investment':
        return 'analytics-outline';
      case 'Loan':
      case 'other':
        return 'business-outline';
      default:
        return 'wallet-outline';
    }
  }

  isNegativeBalance(account: ClientAccount): boolean {
    if (account && typeof account.saldo === 'number') {
      return (account.tipo === 'credit_card' || account.tipo === 'other') ? account.saldo > 0 : account.saldo < 0;
    }
    return false;
  }

  formatDate(isoDate: string | undefined): string {
    if (!isoDate) {
      return '';
    }
    return formatDate(isoDate, 'MMM d, y', 'es-ES');
  }
}
