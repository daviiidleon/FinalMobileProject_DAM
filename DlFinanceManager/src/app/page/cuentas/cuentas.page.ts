import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
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
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonButtons,
  LoadingController,
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { addIcons } from 'ionicons';
import {
  business,
  addCircle,
  receiptOutline,     // CORRECTED: Changed from receiptTextOutline to receiptOutline
  walletOutline,
  cardOutline,
  trendingUp,
  cashOutline,
  shapesOutline,
  calendarOutline,
  pencilOutline,
  trashOutline,
  reloadCircle,
  saveOutline,
  closeOutline
} from 'ionicons/icons';

interface Account {
  id: string;
  nombre: string;
  tipo: string;
  saldo: number;
  institucion?: string;
  fechaActualizacion?: string;
}

interface AccountTypeIcons {
  [key: string]: string; // Type is string for Ionicon names
}

const ACCOUNT_TYPES = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Loan', 'Other'];

const accountTypeIcons: AccountTypeIcons = {
  Checking: 'receipt-outline',     // CORRECTED: Changed from receipt-text-outline to receipt-outline
  Savings: 'wallet-outline',
  'Credit Card': 'card-outline',
  Investment: 'trending-up',
  Loan: 'cash-outline',
  Other: 'shapes-outline',
};

interface AccountFormValues {
  nombre: string;
  tipo: string;
  saldo: number;
  institucion?: string;
}

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    HeaderComponent,
    SideMenuComponent,
    IonIcon,
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    IonModal,
    ReactiveFormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonButtons,
  ]
})
export class CuentasPage implements OnInit {
  accounts: Account[] = [];
  isLoading = true;
  isModalOpen = false;
  editingAccount: Account | undefined;
  accountForm: FormGroup;
  accountTypes = ACCOUNT_TYPES;
  isFormSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
  ) {
    this.accountForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['', Validators.required],
      saldo: [0, Validators.required],
      institucion: [''],
    });

    // Add Ionicons to the global Ionicons library for this standalone component
    addIcons({
      business,
      addCircle,
      receiptOutline,     // CORRECTED here too
      walletOutline,
      cardOutline,
      trendingUp,
      cashOutline,
      shapesOutline,
      calendarOutline,
      pencilOutline,
      trashOutline,
      reloadCircle,
      saveOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.loadAccounts();
  }

  async loadAccounts() {
    const loading = await this.loadingController.create({
      message: 'Loading accounts...',
      spinner: 'crescent'
    });
    await loading.present();

    setTimeout(() => {
      this.accounts = [
        { id: 'acc1', nombre: 'Checking Account', tipo: 'Checking', saldo: 5210.75, institucion: 'City Bank', fechaActualizacion: new Date().toISOString() },
        { id: 'acc2', nombre: 'High Yield Savings', tipo: 'Savings', saldo: 25300.10, institucion: 'Online Savings Co.', fechaActualizacion: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'acc3', nombre: 'Travel Rewards Card', tipo: 'Credit Card', saldo: -750.20, institucion: 'Global Credit Inc.', fechaActualizacion: new Date(Date.now() - 86400000).toISOString() },
        { id: 'acc4', nombre: 'Retirement Fund', tipo: 'Investment', saldo: 125000.00, institucion: 'InvestWell Group' },
      ];
      this.isLoading = false;
      loading.dismiss();
    }, 1500);
  }

  openModal(account?: Account) {
    this.editingAccount = account ? { ...account } : undefined;
    if (this.editingAccount) {
      this.accountForm.patchValue({
        nombre: this.editingAccount.nombre || '',
        tipo: this.editingAccount.tipo || undefined,
        saldo: this.editingAccount.saldo || 0,
        institucion: this.editingAccount.institucion || '',
      });
    } else {
      this.accountForm.reset();
    }
    this.isModalOpen = true;
    this.isFormSubmitted = false;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingAccount = undefined;
    this.isFormSubmitted = false;
  }

  async submitForm() {
    this.isFormSubmitted = true;
    if (this.accountForm.valid) {
      const formData = this.accountForm.value as AccountFormValues;
      const submitLoading = await this.loadingController.create({
        message: this.editingAccount ? 'Updating account...' : 'Creating account...',
        spinner: 'crescent'
      });
      await submitLoading.present();

      setTimeout(() => {
        if (this.editingAccount) {
          this.updateAccount(formData);
        } else {
          this.createAccount(formData);
        }
        submitLoading.dismiss();
        this.closeModal();
      }, 700);
    } else {
      Object.values(this.accountForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  createAccount(formData: AccountFormValues) {
    const newAccount: Account = {
      ...formData,
      id: `acc${Date.now()}`,
      fechaActualizacion: new Date().toISOString()
    };
    this.accounts = [newAccount, ...this.accounts].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  updateAccount(formData: AccountFormValues) {
    if (this.editingAccount) {
      this.accounts = this.accounts.map(acc =>
        acc.id === this.editingAccount!.id ? { ...acc, ...formData, fechaActualizacion: new Date().toISOString() } : acc
      ).sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.editingAccount = undefined;
    }
  }

  async deleteAccount(accountId: string) {
    const deleteLoading = await this.loadingController.create({
      message: 'Deleting account...',
      spinner: 'crescent'
    });
    await deleteLoading.present();

    setTimeout(() => {
      this.accounts = this.accounts.filter(acc => acc.id !== accountId);
      deleteLoading.dismiss();
    }, 500);
  }

  getIcon(type: string): string {
    // Mapping custom string names to valid Ionicons names
    switch (type) {
      case 'Checking': return 'receipt-outline'; // CORRECTED here too
      case 'Savings': return 'wallet-outline';
      case 'Credit Card': return 'card-outline';
      case 'Investment': return 'trending-up';
      case 'Loan': return 'cash-outline';
      default: return 'shapes-outline';
    }
  }

  isNegativeBalance(account: Account): boolean {
    return account.saldo < 0 && (account.tipo === 'Credit Card' || account.tipo === 'Loan');
  }

  formatDate(isoDate: string | undefined): string {
    if (!isoDate) {
      return '';
    }
    return formatDate(isoDate, 'MMM d, yyyy', 'en-US');
  }

  getFormControl(name: string) {
    return this.accountForm.controls[name];
  }
}
