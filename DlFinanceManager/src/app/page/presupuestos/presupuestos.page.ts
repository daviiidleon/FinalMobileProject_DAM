import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, PercentPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  closeOutline
} from 'ionicons/icons';

type CategoriaKey = 'comida' | 'transporte' | 'entretenimiento' | 'educacion' | 'salud' | 'housing' | 'utilities' | 'otros';

interface PastBudget {
  id: string;
  categoriaValue: CategoriaKey;
  categoriaDisplay: string;
  mes: string;
  anio: string;
  limite: string;
  gastado: string;
  restante: string;
  porcentaje: number;
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

    DatePipe,
    PercentPipe,

    HeaderComponent,
    SideMenuComponent,
  ]
})
export class PresupuestosPage implements OnInit {

  categoriaOptions: Record<CategoriaKey, string> = {
    comida: 'Comida',
    transporte: 'Transporte',
    entretenimiento: 'Entretenimiento',
    educacion: 'Educación',
    salud: 'Salud',
    housing: 'Vivienda',
    utilities: 'Servicios',
    otros: 'Otros'
  };

  pastBudgets: PastBudget[] = [];
  budgetAlerts: BudgetAlert[] = [];
  isLoading: boolean = true;

  @ViewChild('budgetModal') budgetModal!: IonModal;
  @ViewChild('createBudgetButton') createBudgetButtonRef!: ElementRef<HTMLIonButtonElement>;

  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  budgetForm: FormGroup;
  isSubmitting: boolean = false;
  editingBudgetId: string | null = null;
  currentDate = new Date();

  showMonthYearPicker: boolean = false; // New property to control datetime visibility

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
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
    });

    this.budgetForm = this.fb.group({
      categoria: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      mes: [this.currentDate.toISOString(), Validators.required],
    });
  }

  ngOnInit() {
    this.loadBudgets();
  }

  async loadBudgets() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Loading budgets...',
      spinner: 'crescent'
    });
    await loading.present();

    setTimeout(() => {
      this.pastBudgets = [
        {
          id: '1',
          categoriaValue: 'comida',
          categoriaDisplay: 'Comida',
          mes: 'December',
          anio: '2023',
          limite: '€550',
          gastado: '€120',
          restante: '€430',
          porcentaje: 0.218
        },
        {
          id: '2',
          categoriaValue: 'comida',
          categoriaDisplay: 'Comida',
          mes: 'November',
          anio: '2023',
          limite: '€500',
          gastado: '€350.75',
          restante: '€149.25',
          porcentaje: 0.702
        },
        {
          id: '3',
          categoriaValue: 'transporte',
          categoriaDisplay: 'Transporte',
          mes: 'November',
          anio: '2023',
          limite: '€150',
          gastado: '€160',
          restante: '-€10',
          porcentaje: 1.067
        }
      ];

      this.updateBudgetAlerts();

      this.isLoading = false;
      loading.dismiss();
    }, 1500);
  }

  getCategoryIcon(categoryValue: CategoriaKey): string {
    switch (categoryValue) {
      case 'comida':
        return 'fast-food-outline';
      case 'transporte':
        return 'car-outline';
      case 'entretenimiento':
        return 'film-outline';
      case 'educacion':
        return 'book-outline';
      case 'salud':
        return 'heart-outline';
      case 'housing':
        return 'home-outline';
      case 'utilities':
        return 'flash-outline';
      case 'otros':
        return 'ellipsis-horizontal-outline';
      default:
        return 'pricetag-outline';
    }
  }

  // Helper to get category keys for ngFor in select
  getCategoryKeys(): CategoriaKey[] {
    return Object.keys(this.categoriaOptions) as CategoriaKey[];
  }

  async openBudgetModal(mode: 'add' | 'edit', budget?: PastBudget) {
    this.isModalOpen = true;
    this.isEditMode = mode === 'edit';
    this.budgetForm.reset();
    this.editingBudgetId = null;
    this.showMonthYearPicker = false; // Ensure picker is hidden when modal opens

    if (this.isEditMode && budget) {
      this.editingBudgetId = budget.id;
      const limitAsNumber = parseFloat(budget.limite.replace('€', ''));
      // Construct a valid date string for parsing, ensuring month and year
      // Make sure this construction results in a valid ISO string recognized by ion-datetime
      const budgetDate = new Date(`${budget.mes} 1, ${budget.anio}`); // Example: "December 1, 2023"
      this.budgetForm.patchValue({
        categoria: budget.categoriaValue,
        monto: limitAsNumber,
        mes: budgetDate.toISOString(), // Ensure it's an ISO string
      });
    } else {
      this.budgetForm.patchValue({ mes: new Date().toISOString() }); // Default to current date as ISO string
    }
  }

  async closeBudgetModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.budgetForm.reset();
    this.editingBudgetId = null;
    this.showMonthYearPicker = false; // Reset picker visibility when modal closes
  }

  toggleMonthYearPicker() {
    this.showMonthYearPicker = !this.showMonthYearPicker;
  }

  // This method will be called when the user confirms the date selection (clicks "Confirm")
  // The 'ionChange' event on ion-datetime fires when the value is selected and confirmed
  // (if showDefaultButtons is true)
  onMonthYearSelected(event: any) {
    // The formControlName="mes" already handles updating the form's value.
    // We just need to hide the picker.
    this.showMonthYearPicker = false;
  }

  async submitBudgetForm() {
    this.budgetForm.markAllAsTouched();
    if (this.budgetForm.invalid) {
      await this.presentToast('Please fill all required fields correctly.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingController.create({
      message: this.isEditMode ? 'Saving changes...' : 'Adding budget...',
      spinner: 'crescent'
    });
    await loading.present();

    const formValue = this.budgetForm.value;
    const selectedDate = new Date(formValue.mes); // Should already be a valid ISO string from the picker
    const month = selectedDate.toLocaleString('en-US', { month: 'long' });
    const year = selectedDate.getFullYear().toString();

    const newBudget: PastBudget = {
      id: this.isEditMode && this.editingBudgetId ? this.editingBudgetId : Date.now().toString(),
      categoriaValue: formValue.categoria,
      categoriaDisplay: this.categoriaOptions[formValue.categoria as CategoriaKey],
      mes: month,
      anio: year,
      limite: `€${formValue.monto.toFixed(2)}`,
      gastado: '€0.00',
      restante: `€${formValue.monto.toFixed(2)}`,
      porcentaje: 0
    };

    setTimeout(async () => {
      if (this.isEditMode && this.editingBudgetId) {
        const index = this.pastBudgets.findIndex(b => b.id === this.editingBudgetId);
        if (index !== -1) {
          const oldBudget = this.pastBudgets[index];
          const oldGastadoNum = parseFloat(oldBudget.gastado.replace('€', ''));

          newBudget.gastado = `€${oldGastadoNum.toFixed(2)}`;
          newBudget.restante = `€${(formValue.monto - oldGastadoNum).toFixed(2)}`;
          newBudget.porcentaje = oldGastadoNum / formValue.monto;

          this.pastBudgets[index] = newBudget;
          await this.presentToast('Budget updated successfully!', 'success');
        }
      } else {
        this.pastBudgets.unshift(newBudget);
        await this.presentToast('Budget added successfully!', 'success');
      }

      this.updateBudgetAlerts();
      this.isSubmitting = false;
      loading.dismiss();
      this.closeBudgetModal();
    }, 1000);
  }

  async confirmDeleteBudget(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this budget? This action cannot be undone.',
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
          handler: () => {
            this.deleteBudget(id);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteBudget(id: string) {
    const deleteLoading = await this.loadingController.create({
      message: 'Deleting budget...',
      spinner: 'crescent'
    });
    await deleteLoading.present();

    setTimeout(() => {
      this.pastBudgets = this.pastBudgets.filter(budget => budget.id !== id);

      this.updateBudgetAlerts();
      this.presentToast('Budget deleted successfully!', 'success');

      deleteLoading.dismiss();
    }, 500);
  }

  private getBudgetById(id: string | null): PastBudget | undefined {
    return this.pastBudgets.find(b => b.id === id);
  }

  private updateBudgetAlerts() {
    // Only include alerts for budgets where the limit is greater than 0
    this.budgetAlerts = this.pastBudgets.filter(b => {
      const limiteNum = parseFloat(b.limite.replace('€', ''));
      const gastadoNum = parseFloat(b.gastado.replace('€', ''));
      return limiteNum > 0 && gastadoNum / limiteNum >= 1; // Alert if 100% or more is used
    }).map(b => ({
      message: `${b.categoriaDisplay} (${(b.porcentaje * 100).toFixed(0)}% used) for ${b.mes} ${b.anio}`
    }));
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
