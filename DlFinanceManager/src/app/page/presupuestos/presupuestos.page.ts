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

// Define types for better type safety
type CategoriaKey = 'comida' | 'transporte' | 'entretenimiento' | 'educacion' | 'salud' | 'housing' | 'utilities' | 'otros';

interface PastBudget {
  id: string;
  categoriaValue: CategoriaKey;
  categoriaDisplay: string;
  mes: string;
  anio: string;
  limite: string; // Stored as formatted string, e.g., "€100.00"
  gastado: string; // Stored as formatted string, e.g., "€50.00"
  restante: string; // Stored as formatted string
  porcentaje: number; // Stored as a decimal, e.g., 0.5 for 50%
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

    // Budgets are currently initialized to empty for now
    this.pastBudgets = [];
    this.updateBudgetAlerts(); // Update alerts after initializing budgets
    this.isLoading = false;
    await loading.dismiss();
  }
  // Method to get category icon based on category key
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
    this.isSubmitting = false; // Reset submitting state
    this.showMonthYearPicker = false; // Ensure picker is hidden when modal opens

    if (this.isEditMode && budget) {
      this.editingBudgetId = budget.id;
      const limitAsNumber = parseFloat(budget.limite.replace('€', ''));
      // Construct a valid date string for parsing, ensuring month and year
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

    let newBudget: PastBudget = {
      id: this.isEditMode && this.editingBudgetId ? this.editingBudgetId : Date.now().toString(),
      categoriaValue: formValue.categoria,
      categoriaDisplay: this.categoriaOptions[formValue.categoria as CategoriaKey],
      mes: month,
      anio: year,
      limite: `€${parseFloat(formValue.monto).toFixed(2)}`,
      gastado: '€0.00', // Default for new budgets
      restante: `€${parseFloat(formValue.monto).toFixed(2)}`, // Default for new budgets
      porcentaje: 0 // Default for new budgets
    };

    setTimeout(async () => {
      if (this.isEditMode && this.editingBudgetId) {
        const index = this.pastBudgets.findIndex(b => b.id === this.editingBudgetId);
        if (index !== -1) {
          const oldBudget = this.pastBudgets[index];
          // When editing, retain 'gastado' value and recalculate 'restante' and 'porcentaje'
          const oldGastadoNum = parseFloat(oldBudget.gastado.replace('€', ''));

          newBudget.gastado = `€${oldGastadoNum.toFixed(2)}`;
          newBudget.restante = `€${(parseFloat(formValue.monto) - oldGastadoNum).toFixed(2)}`;
          newBudget.porcentaje = oldGastadoNum / parseFloat(formValue.monto);

          this.pastBudgets[index] = newBudget;
          await this.presentToast('Budget updated successfully!', 'success');
        }
      } else {
        // Add new budget to the beginning of the array
        this.pastBudgets.unshift(newBudget);
        await this.presentToast('Budget added successfully!', 'success');
      }

      this.updateBudgetAlerts();
      this.isSubmitting = false;
      await loading.dismiss();
      await this.closeBudgetModal();
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
          cssClass: 'danger',
          handler: async () => {
            await this.deleteBudget(id); // Ensure deleteBudget is awaited
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

    setTimeout(async () => { // Made this async to use await
      this.pastBudgets = this.pastBudgets.filter(budget => budget.id !== id);

      this.updateBudgetAlerts();
      await this.presentToast('Budget deleted successfully!', 'success'); // Await toast

      await deleteLoading.dismiss(); // Await dismiss
    }, 500);
  }

  private getBudgetById(id: string | null): PastBudget | undefined {
    // Ensure pastBudgets is defined before attempting to find
    if (!this.pastBudgets) {
      return undefined;
    }
    return this.pastBudgets.find(b => b.id === id);
  }

  private updateBudgetAlerts() {
    // Ensure pastBudgets is defined before filtering
    if (!this.pastBudgets) {
      this.budgetAlerts = [];
      return;
    }
    // Only include alerts for budgets where the limit is greater than 0
    this.budgetAlerts = this.pastBudgets.filter(b => {
      const limiteNum = parseFloat(b.limite.replace('€', ''));
      const gastadoNum = parseFloat(b.gastado.replace('€', ''));
      return limiteNum > 0 && (gastadoNum / limiteNum) >= 1; // Alert if 100% or more is used
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
