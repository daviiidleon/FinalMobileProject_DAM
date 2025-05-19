import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonProgressBar,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonButtons,
  IonNote,
  LoadingController,
  IonMenuButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../component/header/header.component';
import { SideMenuComponent } from '../../component/side-menu/side-menu.component';
import { Subscription } from 'rxjs';

interface ObjetivoAhorro {
  id: string;
  nombre: string;
  montoMeta: number;
  montoActual: number;
  fechaLimite?: string;
  progreso: number;
}

@Component({
  selector: 'app-ahorro',
  templateUrl: './ahorro.page.html',
  styleUrls: ['./ahorro.page.scss'],
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
    IonProgressBar,
    IonModal,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonDatetime,
    IonButtons,
    IonNote,
    IonMenuButton,
    IonSpinner,
  ],
})
export class AhorroPage implements OnInit, OnDestroy {
  objetivos: ObjetivoAhorro[] = [];
  isCreateGoalModalOpen = false;
  isAddFundsModalOpen = false;
  isEditingGoal = false;
  selectedGoal: ObjetivoAhorro | null = null;
  fundsToAdd: number | null = null;
  goalForm: FormGroup;
  isSubmitting = false;
  private storageKey = 'objetivosAhorro';
  private storageSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder, private loadingCtrl: LoadingController) {
    this.goalForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      montoMeta: [null, [Validators.required, Validators.min(0.01)]],
      montoActual: [0, Validators.min(0)],
      fechaLimite: [null],
    });
  }

  async ngOnInit() {
    await this.loadObjetivos();
  }

  ngOnDestroy() {
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
  }

  async loadObjetivos() {
    try {
      const storedObjetivos = localStorage.getItem(this.storageKey);
      if (storedObjetivos) {
        this.objetivos = JSON.parse(storedObjetivos).map((obj: ObjetivoAhorro) => ({
          ...obj,
          progreso: (obj.montoActual / obj.montoMeta) * 100,
        }));
      } else {
        this.objetivos = [];
      }
    } catch (error) {
      console.error('Error al cargar objetivos:', error);
      this.objetivos = [];
    }
  }

  saveObjetivos() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.objetivos.map((obj) => {
          const { progreso, ...rest } = obj;
          return rest;
        })
      )
    );
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  formatDate(date: string | null): string | null {
    if (!date) {
      return null;
    }
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
  }

  isDeadlinePassed(fechaLimite: string | undefined): boolean {
    if (!fechaLimite) {
      return false;
    }
    return new Date(fechaLimite) < new Date();
  }

  openCreateGoalModal(goalToEdit?: ObjetivoAhorro) {
    this.isEditingGoal = !!goalToEdit;
    if (goalToEdit) {
      this.goalForm.patchValue({
        id: goalToEdit.id,
        nombre: goalToEdit.nombre,
        montoMeta: goalToEdit.montoMeta,
        montoActual: goalToEdit.montoActual,
        fechaLimite: goalToEdit.fechaLimite,
      });
    } else {
      this.goalForm.reset({ montoActual: 0 });
    }
    this.isCreateGoalModalOpen = true;
  }

  closeCreateGoalModal() {
    this.isCreateGoalModalOpen = false;
    this.isEditingGoal = false;
    this.goalForm.reset();
  }

  async submitGoalForm() {
    if (this.goalForm.valid) {
      this.isSubmitting = true;
      const loading = await this.loadingCtrl.create({
        message: this.isEditingGoal ? 'Guardando...' : 'Creando objetivo...',
      });
      await loading.present();

      const formValue = this.goalForm.value;
      const nuevoObjetivo: ObjetivoAhorro = {
        id: formValue.id || this.generateId(),
        nombre: formValue.nombre,
        montoMeta: formValue.montoMeta,
        montoActual: formValue.montoActual || 0,
        fechaLimite: formValue.fechaLimite,
        progreso: (formValue.montoActual || 0) / formValue.montoMeta * 100,
      };

      if (this.isEditingGoal) {
        this.objetivos = this.objetivos.map((obj) => (obj.id === nuevoObjetivo.id ? nuevoObjetivo : obj));
      } else {
        this.objetivos.push(nuevoObjetivo);
      }

      this.saveObjetivos();
      this.closeCreateGoalModal();
      await loading.dismiss();
      this.isSubmitting = false;
    }
  }

  openEditGoalModal(goal: ObjetivoAhorro) {
    this.openCreateGoalModal(goal);
  }

  openAddFundsModal(goal: ObjetivoAhorro) {
    this.selectedGoal = goal;
    this.fundsToAdd = null;
    this.isAddFundsModalOpen = true;
  }

  closeAddFundsModal() {
    this.isAddFundsModalOpen = false;
    this.selectedGoal = null;
    this.fundsToAdd = null;
  }

  async addFunds() {
    if (this.selectedGoal && this.fundsToAdd !== null && this.fundsToAdd > 0) {
      const loading = await this.loadingCtrl.create({
        message: 'Añadiendo fondos...',
      });
      await loading.present();

      this.objetivos = this.objetivos.map((obj) => {
        if (obj.id === this.selectedGoal!.id) {
          const nuevoMontoActual = obj.montoActual + this.fundsToAdd!;
          return {
            ...obj,
            montoActual: nuevoMontoActual,
            progreso: nuevoMontoActual / obj.montoMeta * 100,
          };
        }
        return obj;
      });

      this.saveObjetivos();
      this.closeAddFundsModal();
      await loading.dismiss();
    }
  }

  async deleteGoal(goalId: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando objetivo...',
    });
    await loading.present();
    this.objetivos = this.objetivos.filter((obj) => obj.id !== goalId);
    this.saveObjetivos();
    await loading.dismiss();
  }
}

