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
  IonModal, // Importado IonModal
  IonItem,
  IonLabel,
  IonInput, // Importado IonInput
  IonDatetime,
  IonButtons,
  IonSpinner,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
  IonNote,
  LoadingController,
  AlertController,
  ToastController, IonList // Añadido ToastController
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
  close // Añadido icono de cerrar
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
    IonModal, // Incluido en imports
    IonItem,
    IonLabel,
    IonInput, // Incluido en imports
    IonDatetime,
    IonButtons,
    IonSpinner,
    IonProgressBar,
    IonSelect,
    IonSelectOption,
    IonNote,

    DatePipe,
    PercentPipe,

    HeaderComponent,
    SideMenuComponent,
    IonList
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

  // CAMBIO: Referencia al modal usando @ViewChild
  @ViewChild('budgetModal') budgetModal!: IonModal;
  // CAMBIO: Referencia al botón "Create Budget" (para el blur, si aún lo quieres)
  @ViewChild('createBudgetButton') createBudgetButtonRef!: ElementRef<HTMLIonButtonElement>;

  isEditingBudget = false;
  budgetForm: FormGroup;
  isSubmitting = false;
  editingBudgetId: string | null = null;
  currentDate = new Date();

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController // Inyectado ToastController
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
      close // Registrado el icono de cerrar
    });

    this.budgetForm = this.fb.group({
      categoria: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      mes: [this.currentDate.toISOString()],
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

  // Nueva función para abrir el modal, unificada para añadir y editar
  async openBudgetModal(mode: 'add' | 'edit', budget?: PastBudget) {
    if (mode === 'add') {
      this.isEditingBudget = false;
      this.budgetForm.reset({ mes: this.currentDate.toISOString() }); // Resetea el formulario
      this.editingBudgetId = null;
    } else { // mode === 'edit'
      this.isEditingBudget = true;
      if (budget) {
        this.editingBudgetId = budget.id;
        const dateForForm = new Date(`${budget.mes} 1, ${budget.anio}`);
        const monthYearString = dateForForm.toISOString();

        this.budgetForm.patchValue({
          categoria: budget.categoriaValue,
          monto: parseFloat(budget.limite.replace('€', '')),
          mes: monthYearString
        });
      }
    }
    // Presenta el modal usando la referencia @ViewChild
    await this.budgetModal.present();

    // Lógica para desenfocar el botón si es necesario (para la advertencia aria-hidden)
    // Esto es un parche y Ionic debería manejarlo automáticamente.
    setTimeout(() => {
      if (this.createBudgetButtonRef && this.createBudgetButtonRef.nativeElement) {
        this.createBudgetButtonRef.nativeElement.blur();
      }
    }, 50);
  }

  // Función para cerrar el modal usando dismiss()
  async closeBudgetModal() {
    await this.budgetModal.dismiss();
    this.isEditingBudget = false; // Resetear el modo de edición
    this.budgetForm.reset(); // Limpiar el formulario
    this.isSubmitting = false;
    this.editingBudgetId = null;
  }

  async submitBudgetForm() {
    if (this.budgetForm.valid) {
      this.isSubmitting = true;
      const formValue = this.budgetForm.value;
      const monthYear = new Date(formValue.mes);
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(monthYear);
      const year = monthYear.getFullYear().toString();
      const categoriaValue = formValue.categoria as CategoriaKey;
      const limiteNumerico = parseFloat(formValue.monto);

      let gastadoActual = '€0.00';
      if (this.isEditingBudget && this.editingBudgetId) {
        const existingBudget = this.getBudgetById(this.editingBudgetId);
        if (existingBudget) {
          gastadoActual = existingBudget.gastado;
        }
      }
      const gastadoNumerico = parseFloat(gastadoActual.replace('€', ''));
      const restanteNumerico = limiteNumerico - gastadoNumerico;
      const porcentajeCalculado = limiteNumerico > 0 ? gastadoNumerico / limiteNumerico : 0;

      const newBudget: PastBudget = {
        id: this.editingBudgetId || Math.random().toString(36).substring(2, 15),
        categoriaValue: categoriaValue,
        categoriaDisplay: this.categoriaOptions[categoriaValue],
        mes: month,
        anio: year,
        limite: `€${limiteNumerico.toFixed(2)}`,
        gastado: gastadoActual,
        restante: `€${restanteNumerico.toFixed(2)}`,
        porcentaje: porcentajeCalculado
      };

      const submitLoading = await this.loadingController.create({
        message: this.isEditingBudget ? 'Saving changes...' : 'Creating budget...',
        spinner: 'crescent'
      });
      await submitLoading.present();

      setTimeout(() => {
        if (this.isEditingBudget && this.editingBudgetId) {
          this.pastBudgets = this.pastBudgets.map(budget =>
            budget.id === this.editingBudgetId ? newBudget : budget
          );
          this.presentToast('Budget updated successfully!', 'success'); // Mensaje de éxito
        } else {
          this.pastBudgets.push(newBudget);
          this.presentToast('Budget created successfully!', 'success'); // Mensaje de éxito
        }
        this.pastBudgets.sort((a, b) => {
          const dateA = new Date(`${a.mes} 1, ${a.anio}`);
          const dateB = new Date(`${b.mes} 1, ${b.anio}`);
          return dateB.getTime() - dateA.getTime();
        });

        this.updateBudgetAlerts();

        this.isSubmitting = false;
        submitLoading.dismiss();
        this.closeBudgetModal(); // Cierra el modal usando la nueva función
      }, 700);
    } else {
      this.budgetForm.markAllAsTouched();
      this.presentToast('Please fill in all required fields.', 'danger'); // Mensaje de error de validación
    }
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
      this.presentToast('Budget deleted successfully!', 'success'); // Mensaje de éxito

      deleteLoading.dismiss();
    }, 500);
  }

  private getBudgetById(id: string | null): PastBudget | undefined {
    return this.pastBudgets.find(b => b.id === id);
  }

  private updateBudgetAlerts() {
    this.budgetAlerts = this.pastBudgets.filter(b => {
      const limiteNum = parseFloat(b.limite.replace('€', ''));
      const gastadoNum = parseFloat(b.gastado.replace('€', ''));
      return limiteNum > 0 && gastadoNum / limiteNum >= 1;
    }).map(b => ({
      message: `${b.categoriaDisplay} (${(b.porcentaje * 100).toFixed(0)}% used) for ${b.mes} ${b.anio}`
    }));
  }

  // Función para mostrar Toast
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
