import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
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

  constructor(
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private transactionService: TransactionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef // Inject ChangeDetectorRef
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

  async openAddEditModal(mode: 'add' | 'edit', transaction?: any) {
    this.isEditMode = (mode === 'edit');
    this.isSubmitting = false;

    if (this.isEditMode && transaction) {
      this.editingTransactionId = transaction.id;
      const amountValue = parseFloat(transaction.cantidad.replace(/[^\d.-]/g, ''));
      this.transactionForm.patchValue({
        id: transaction.id,
        tipo: transaction.tipo,
        fecha: transaction.fecha,
        categoria: transaction.categoria,
        descripcion: transaction.descripcion,
        cantidad: amountValue
      });
    } else {
      this.editingTransactionId = null;
      this.transactionForm.reset({
        tipo: 'Expense',
        fecha: new Date().toISOString(),
        categoria: '',
        descripcion: '',
        cantidad: null
      });
    }
    this.isModalOpen = true;
    this.cdRef.detectChanges(); // Force change detection after modal opens and form is updated
  }

  async saveTransaction() {
    this.transactionForm.markAllAsTouched();

    if (this.transactionForm.invalid) {
      this.presentToast('Please fill in all required fields correctly.', 'danger');
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
      cantidad: formattedAmount
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
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
