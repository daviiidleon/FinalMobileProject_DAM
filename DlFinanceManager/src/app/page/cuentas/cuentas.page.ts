// src/app/page/cuentas/cuentas.page.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem, // <-- MAKE SURE THIS IS IMPORTED
  IonList,
  IonRow,
  IonSearchbar,
  IonSelect, // <-- MAKE SURE THIS IS IMPORTED
  IonSelectOption, // <-- MAKE SURE THIS IS IMPORTED
  IonTitle,
  IonToolbar,
  LoadingController,
  AlertController,
  ToastController,
  IonModal, // <-- MAKE SURE THIS IS IMPORTED
  IonInput, // <-- MAKE SURE THIS IS IMPORTED
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonLabel, // <-- MAKE SURE THIS IS IMPORTED
  IonText // <-- MAKE SURE THIS IS IMPORTED
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
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
  saveOutline,
  reloadCircle
} from 'ionicons/icons';
import { AccountService } from '../../services/account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // <--- CRITICAL FOR FORMS. MUST BE HERE.
    HeaderComponent,
    SideMenuComponent,
    RouterLink, // Used for navigation in side-menu, good to have it here

    // ALL Ionic Components used in the template MUST be listed here.
    // If any of these are missing or misspelled, the UI will not render.
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
    IonModal,
    IonInput, // <--- IMPORTANT: For ion-input
    IonLabel, // <--- IMPORTANT: For ion-label
    IonText,  // <--- IMPORTANT: For ion-text (for validation messages)
    IonItem,  // <--- IMPORTANT: For ion-item (wraps inputs/selects)
    IonList   // If you remove IonList, ensure IonItem still works, though it's typically fine.
  ]
})
export class CuentasPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal!: IonModal;

  accounts: any[] = [];
  isLoading: boolean = true;
  isModalOpen: boolean = false;
  editingAccount: any | null = null;

  accountForm: FormGroup;
  isFormSubmitted: boolean = false;

  accountTypes: string[] = ['Checking', 'Savings', 'Credit Card', 'Loan', 'Investment', 'Cash'];
  private accountsSubscription!: Subscription;

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private accountService: AccountService
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
      saveOutline,
      reloadCircle
    });

    this.accountForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['', Validators.required],
      saldo: [null, [Validators.required, Validators.pattern(/^-?\d*\.?\d*$/)]],
      institucion: [''],
      fechaActualizacion: [new Date().toISOString()]
    });
  }

  ngOnInit() {
    this.loadAccounts();
  }

  ngOnDestroy() {
    if (this.accountsSubscription) {
      this.accountsSubscription.unsubscribe();
    }
  }

  async loadAccounts() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Loading accounts...',
      spinner: 'crescent'
    });
    await loading.present();

    this.accountsSubscription = this.accountService.accounts$.subscribe(data => {
      this.accounts = data;
      this.isLoading = false;
      loading.dismiss();
    });
  }

  async openModal(account?: any) {
    this.isFormSubmitted = false;
    if (account) {
      this.editingAccount = { ...account };
      // IMPORTANT: Remove currency symbol before patching for number input
      this.editingAccount.saldo = parseFloat(this.editingAccount.saldo.replace(/[^\d.-]/g, ''));
      this.accountForm.patchValue(this.editingAccount);
      console.log('Editing account:', this.editingAccount);
    } else {
      this.editingAccount = null;
      this.accountForm.reset({
        id: null,
        nombre: '',
        tipo: '',
        saldo: null,
        institucion: '',
        fechaActualizacion: new Date().toISOString()
      });
      console.log('Adding new account');
    }
    this.isModalOpen = true;
  }

  async closeModal() {
    this.isModalOpen = false;
    this.accountForm.reset();
    this.editingAccount = null;
  }

  async submitForm() {
    this.isFormSubmitted = true;

    if (this.accountForm.invalid) {
      this.presentToast('Please fill in all required fields correctly.', 'danger');
      return;
    }

    const formData = { ...this.accountForm.value };
    let formattedBalance = '';
    const balanceAmount = parseFloat(formData.saldo);

    // Logic to format balance based on type (e.g., Credit Card/Loan balances are positive when owed)
    if (this.isCreditCardOrLoan(formData) && balanceAmount > 0) {
      formattedBalance = `+$${balanceAmount.toFixed(2)}`;
    } else if (balanceAmount < 0) {
      formattedBalance = `-$${Math.abs(balanceAmount).toFixed(2)}`;
    } else {
      formattedBalance = `$${balanceAmount.toFixed(2)}`;
    }

    formData.saldo = formattedBalance;
    formData.fechaActualizacion = new Date().toISOString();

    if (this.editingAccount) {
      console.log('Updating account:', formData);
      this.accountService.updateAccount(formData);
      this.presentToast('Account updated successfully!', 'success');
    } else {
      console.log('Adding new account:', formData);
      this.accountService.addAccount(formData);
      this.presentToast('Account added successfully!', 'success');
    }

    await this.closeModal();
  }

  async deleteAccount(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this account? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: () => {
            this.accountService.deleteAccount(id);
            this.presentToast('Account deleted successfully!', 'success');
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

  getIcon(accountType: string): string {
    switch (accountType) {
      case 'Checking':
      case 'Savings':
        return 'wallet-outline';
      case 'Credit Card':
        return 'card-outline';
      case 'Cash':
        return 'cash-outline';
      case 'Investment':
        return 'analytics-outline';
      case 'Loan':
        return 'business-outline';
      default:
        return 'wallet-outline';
    }
  }

  isNegativeBalance(account: any): boolean {
    const balance = parseFloat(account.saldo.replace(/[^\d.-]/g, ''));
    return (account.tipo === 'Credit Card' || account.tipo === 'Loan') ? balance > 0 : balance < 0;
  }

  isCreditCardOrLoan(account: any): boolean {
    return (account.tipo === 'Credit Card' || account.tipo === 'Loan');
  }

  formatDate(isoDate: string | undefined): string {
    if (!isoDate) {
      return '';
    }
    return formatDate(isoDate, 'MMM d, y', 'en-US');
  }

  getFormControl(name: string) {
    return this.accountForm.get(name);
  }
}
