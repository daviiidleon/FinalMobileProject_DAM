import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // RE-ADDED Reactive Forms imports
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
  IonModal, // RE-ADDED IonModal
  IonInput, // RE-ADDED IonInput
  IonLabel, // RE-ADDED IonLabel
  IonDatetime, // RE-ADDED IonDatetime
  IonNote, // RE-ADDED IonNote
  IonSpinner // RE-ADDED IonSpinner
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
  closeOutline, // RE-ADDED for modal
  // saveOutline, // Not used but could be for consistency
  // reloadCircle, // Not used but could be for consistency
  businessOutline, // For loan type
  calendarOutline // For last updated date
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
    FormsModule, // Keep FormsModule if you have any template-driven forms, otherwise can remove
    ReactiveFormsModule, // RE-ADDED
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
    IonModal, // RE-ADDED
    IonInput, // RE-ADDED
    IonLabel, // RE-ADDED
    IonDatetime, // RE-ADDED
    IonNote, // RE-ADDED
    IonSpinner // RE-ADDED
  ]
})
export class CuentasPage implements OnInit, OnDestroy {
  @ViewChild('accountModal') accountModal!: IonModal; // RE-ADDED ViewChild for modal

  accounts: any[] = [];
  isLoading: boolean = true;
  private accountsSubscription!: Subscription;
  selectedAccount: any | null = null; // Variable to hold the selected account

  // Properties for the add/edit form - RE-ADDED AND ADAPTED
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  accountForm: FormGroup;
  isSubmitting: boolean = false;
  editingAccountId: string | null = null; // To hold the ID of the account being edited

  accountTypes: string[] = ['Checking', 'Savings', 'Credit Card', 'Loan', 'Investment', 'Cash'];

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private fb: FormBuilder, // RE-ADDED FormBuilder
    private accountService: AccountService,
    private cdRef: ChangeDetectorRef // RE-ADDED ChangeDetectorRef
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
      closeOutline, // RE-ADDED
      businessOutline,
      calendarOutline
    });

    // Initialize the Reactive Form for Accounts - RE-ADDED AND ADAPTED
    this.accountForm = this.fb.group({
      id: [null], // Hidden field for ID, null for new accounts
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      tipo: ['', Validators.required],
      saldo: [null, [Validators.required, Validators.pattern(/^-?\d*\.?\d*$/)]], // Allows positive/negative decimals
      institucion: [''], // Optional
      fechaActualizacion: [new Date().toISOString()] // Default to today
    });
  }

  ngOnInit() {
    // Subscribe to the selected account changes
    this.accountService.selectedAccount$.subscribe(account => {
      this.selectedAccount = account;
      this.cdRef.detectChanges(); // Update view when selected account changes
    });
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

  // Method to open the add/edit modal - RE-ADDED AND ADAPTED
  async openAccountModal(mode: 'add' | 'edit', account?: any) {
    this.isEditMode = (mode === 'edit');
    this.isSubmitting = false; // Reset submitting state

    if (this.isEditMode && account) {
      this.editingAccountId = account.id;
      // Parse saldo to a number, removing currency symbols if present
      const saldoValue = parseFloat(account.saldo.replace(/[^\d.-]/g, ''));
      this.accountForm.patchValue({
        id: account.id,
        nombre: account.nombre,
        tipo: account.tipo,
        saldo: saldoValue,
        institucion: account.institucion,
        fechaActualizacion: account.fechaActualizacion // Assuming already compatible format
      });
    } else {
      this.editingAccountId = null;
      this.accountForm.reset({
        nombre: '',
        tipo: '', // No default type, user must select
        saldo: null,
        institucion: '',
        fechaActualizacion: new Date().toISOString()
      }); // Reset for new account
    }
    this.isModalOpen = true; // Open the modal
    this.cdRef.detectChanges(); // Force change detection after modal opens and form is updated
  }

  // Method to handle form submission - RE-ADDED AND ADAPTED
  async submitAccountForm() {
    this.accountForm.markAllAsTouched(); // Mark all fields as touched to show validation errors

    if (this.accountForm.invalid) {
      this.presentToast('Please fill in all required fields correctly.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Saving changes...' : 'Adding account...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = this.accountForm.value;
    let balance = parseFloat(formData.saldo);

    // Format balance with currency symbol based on account type
    let formattedBalance: string;
    if (formData.tipo === 'Credit Card' || formData.tipo === 'Loan') {
      formattedBalance = `€${balance.toFixed(2)}`; // Credit card/loan might not have negative symbol in raw data
    } else {
      formattedBalance = `€${balance.toFixed(2)}`;
    }


    const accountToSave = {
      ...formData,
      id: this.editingAccountId || this.generateUniqueId(), // Use existing ID or generate new
      saldo: formattedBalance // Store formatted balance
    };

    setTimeout(async () => { // Simulate API call delay
      if (this.isEditMode) {
        this.accountService.updateAccount(accountToSave);
        this.presentToast('Account updated successfully!', 'success');
      } else {
        this.accountService.addAccount(accountToSave);
        this.presentToast('Account added successfully!', 'success');
      }
      this.isSubmitting = false;
      await loading.dismiss();
      this.closeAccountModal(); // Close the modal
    }, 700);
  }

  // Method to close the modal - RE-ADDED AND ADAPTED
  async closeAccountModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.editingAccountId = null;
    this.accountForm.reset(); // Reset form state
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

  selectAccount(account: any) {
    console.log('Account selected:', account);
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
        return 'wallet-outline';
      case 'Credit Card':
        return 'card-outline';
      case 'Cash':
        return 'cash-outline';
      case 'Investment':
        return 'analytics-outline';
      case 'Loan':
        return 'business-outline'; // Using business-outline for loans
      default:
        return 'wallet-outline';
    }
  }

  isNegativeBalance(account: any): boolean {
    const balance = parseFloat(account.saldo.replace(/[^\d.-]/g, ''));
    // Credit card and Loan accounts are "negative" if they have a positive balance (meaning you owe money)
    return (account.tipo === 'Credit Card' || account.tipo === 'Loan') ? balance > 0 : balance < 0;
  }

  formatDate(isoDate: string | undefined): string {
    if (!isoDate) {
      return '';
    }
    // Ensure 'en-US' locale if you want month abbreviation, otherwise use a more generic format
    return formatDate(isoDate, 'MMM d, y', 'en-US');
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
