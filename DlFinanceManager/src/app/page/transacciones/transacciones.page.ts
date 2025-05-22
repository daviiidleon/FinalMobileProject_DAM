import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'; // Import ViewChild
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonModal, // Import IonModal
  IonInput // Import IonInput
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { RouterLink } from '@angular/router'; // RouterLink is still here for non-modal buttons
import { addIcons } from 'ionicons';
import {
  cloudUploadOutline,
  addCircleOutline,
  arrowDownCircle,
  arrowUpCircle,
  ellipsisVertical,
  pencilOutline,
  trashOutline,
  close // Add close icon for the modal
} from 'ionicons/icons';
import { TransactionService } from '../../services/transaction.service';
import { Subscription } from 'rxjs';

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
    IonModal, // Include IonModal in imports
    IonInput // Include IonInput in imports
  ]
})
export class TransaccionesPage implements OnInit, OnDestroy {
  @ViewChild('addEditModal') addEditModal!: IonModal; // Reference to the modal

  transacciones: any[] = [];
  isLoading: boolean = true;
  private transactionsSubscription!: Subscription;

  // Properties for the add/edit form
  currentTransaction: any = {
    id: '',
    tipo: 'Expense',
    fecha: new Date().toISOString().substring(0, 10), // Default to today's date
    categoria: '',
    descripcion: '',
    cantidad: null,
  };
  isEditMode: boolean = false; // To determine if the modal is for editing or adding

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    // Removed Router as we are not navigating to separate pages for add/edit
    private transactionService: TransactionService
  ) {
    addIcons({
      cloudUploadOutline,
      addCircleOutline,
      arrowDownCircle,
      arrowUpCircle,
      ellipsisVertical,
      pencilOutline,
      trashOutline,
      close // Register the close icon
    });
  }

  ngOnInit() {
    this.loadTransactions();
  }

  ngOnDestroy() {
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  async loadTransactions() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Loading transactions...',
      spinner: 'crescent'
    });
    await loading.present();

    this.transactionsSubscription = this.transactionService.transactions$.subscribe(data => {
      this.transacciones = data;
      this.isLoading = false;
      loading.dismiss();
    });
  }

  // New method to open the add/edit modal
  async openAddEditModal(mode: 'add' | 'edit', transaction?: any) {
    if (mode === 'add') {
      this.isEditMode = false;
      // Reset currentTransaction for a new entry
      this.currentTransaction = {
        id: '',
        tipo: 'Expense',
        fecha: new Date().toISOString().substring(0, 10),
        categoria: '',
        descripcion: '',
        cantidad: null,
      };
    } else { // mode === 'edit'
      this.isEditMode = true;
      if (transaction) {
        // Create a deep copy to avoid modifying the original transaction directly
        this.currentTransaction = { ...transaction };

        // Special handling for amount if it's a string with currency symbol and sign
        if (typeof this.currentTransaction.cantidad === 'string') {
          // Remove non-numeric characters except '.' and '-' for parseFloat
          this.currentTransaction.cantidad = parseFloat(this.currentTransaction.cantidad.replace(/[^0-9.-]+/g, ""));
        }
        console.log('Editing transaction:', this.currentTransaction);
      }
    }
    await this.addEditModal.present();
  }

  // New method to handle form submission
  async saveTransaction() {
    // Basic validation
    if (!this.currentTransaction.tipo || !this.currentTransaction.fecha || !this.currentTransaction.categoria || !this.currentTransaction.descripcion || this.currentTransaction.cantidad === null || isNaN(parseFloat(this.currentTransaction.cantidad))) {
      this.presentToast('Please fill in all fields correctly.', 'danger');
      return;
    }

    // Format amount with currency symbol and sign
    let amount = parseFloat(this.currentTransaction.cantidad);
    const formattedAmount = (this.currentTransaction.tipo === 'Expense' ? '-' : '+') + '€' + amount.toFixed(2);
    const transactionToSave = { ...this.currentTransaction, cantidad: formattedAmount };

    if (this.isEditMode) {
      console.log('Updating transaction:', transactionToSave);
      this.transactionService.updateTransaction(transactionToSave);
      this.presentToast('Transaction updated successfully!', 'success');
    } else {
      console.log('Adding new transaction:', transactionToSave);
      this.transactionService.addTransaction(transactionToSave);
      this.presentToast('Transaction added successfully!', 'success');
    }

    await this.addEditModal.dismiss(); // Close the modal after saving
  }

  // Method to close the modal
  async cancelModal() {
    await this.addEditModal.dismiss();
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
}
