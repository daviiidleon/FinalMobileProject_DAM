import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonButtons,
  IonSpinner,
  IonProgressBar,
  IonSelect,
  IonSelectOption, IonNote
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";

type CategoriaKey = 'comida' | 'transporte' | 'entretenimiento' | 'educacion' | 'salud' | 'housing' | 'utilities' | 'otros';

interface PastBudget {
  id: string;
  categoriaValue: CategoriaKey; // Usamos el tipo CategoriaKey
  categoriaDisplay: string; // Para mostrar en la lista
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
    IonModal,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonDatetime,
    IonButtons,
    IonSpinner,
    IonProgressBar,
    DatePipe,
    IonSelect,
    IonSelectOption,
    IonNote
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

  pastBudgets: PastBudget[] = [
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

  budgetAlerts: BudgetAlert[] = [
    { message: 'Transport (107% used) for November 2023' }
  ];

  isCreateBudgetModalOpen = false;
  isEditingBudget = false;
  budgetForm: FormGroup;
  isSubmitting = false;
  editingBudgetId: string | null = null;
  currentDate = new Date();

  constructor(private fb: FormBuilder) {
    this.budgetForm = this.fb.group({
      categoria: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      mes: [this.currentDate.toISOString()],
    });
  }

  ngOnInit() { }

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

  openCreateBudgetModal() {
    this.isEditingBudget = false;
    this.budgetForm.reset({ mes: this.currentDate.toISOString() });
    this.isCreateBudgetModalOpen = true;
    this.editingBudgetId = null;
  }

  closeCreateBudgetModal() {
    this.isCreateBudgetModalOpen = false;
    this.isEditingBudget = false;
    this.budgetForm.reset();
    this.isSubmitting = false;
    this.editingBudgetId = null;
  }

  submitBudgetForm() {
    if (this.budgetForm.valid) {
      this.isSubmitting = true;
      const formValue = this.budgetForm.value;
      const monthYear = new Date(formValue.mes);
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(monthYear);
      const year = monthYear.getFullYear().toString();
      const categoriaValue = formValue.categoria as CategoriaKey; // Casteamos el valor

      const newBudget: PastBudget = {
        id: this.editingBudgetId || Math.random().toString(36).substring(2, 15),
        categoriaValue: categoriaValue,
        categoriaDisplay: this.categoriaOptions[categoriaValue],
        mes: month,
        anio: year,
        limite: `€${formValue.monto.toFixed(2)}`,
        gastado: '€0.00',
        restante: `€${formValue.monto.toFixed(2)}`,
        porcentaje: 0
      };

      if (this.isEditingBudget && this.editingBudgetId) {
        this.pastBudgets = this.pastBudgets.map(budget =>
          budget.id === this.editingBudgetId ? newBudget : budget
        );
      } else {
        this.pastBudgets.push(newBudget);
      }

      this.isSubmitting = false;
      this.closeCreateBudgetModal();
    }
  }

  openEditBudgetModal(budget: PastBudget) {
    this.isEditingBudget = true;
    this.editingBudgetId = budget.id;
    const monthYearString = `${budget.anio}-${(new Date(Date.parse(budget.mes + ' 1, ' + budget.anio)).getMonth() + 1).toString().padStart(2, '0')}-01`;
    this.budgetForm.patchValue({
      categoria: budget.categoriaValue,
      monto: parseFloat(budget.limite.replace('€', '')),
      mes: monthYearString
    });
    this.isCreateBudgetModalOpen = true;
  }

  deleteBudget(id: string) {
    this.pastBudgets = this.pastBudgets.filter(budget => budget.id !== id);
  }
}
