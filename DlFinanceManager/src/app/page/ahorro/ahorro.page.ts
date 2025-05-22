import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // <--- ¡ASEGÚRATE DE QUE ESTAS ESTÁN AQUÍ!

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
  IonList,
} from '@ionic/angular/standalone'; // <--- ¡Y TODAS LAS COMPONENTES IONIC USADAS EN TU HTML!

import { HeaderComponent } from '../../component/header/header.component'; // Asegúrate de que la ruta sea correcta
import { SideMenuComponent } from '../../component/side-menu/side-menu.component'; // Asegúrate de que la ruta sea correcta
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cashOutline,
  calendarOutline,
  addCircleOutline,
  createOutline,
  trashOutline,
  close
} from 'ionicons/icons';


interface ObjetivoAhorro {
  id: string;
  nombre: string;
  montoMeta: number;
  montoActual: number;
  fechaLimite?: string | null;
  progreso: number;
}

@Component({
  selector: 'app-ahorro',
  templateUrl: './ahorro.page.html',
  styleUrls: ['./ahorro.page.scss'],
  standalone: true, // Esto es crucial para componentes standalone
  imports: [ // ¡Esta lista debe contener todos los módulos y componentes standalone que usas!
    CommonModule,
    FormsModule,         // Necesario para ngModel (usado en fundsToAdd) y formularios básicos
    ReactiveFormsModule, // Necesario para FormGroup, FormBuilder y formControlName

    // Componentes Ionic (¡asegúrate de que todos los que usas en el HTML están aquí!)
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
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
    IonMenuButton,
    IonSpinner,
    IonList,

    // Pipes de Angular para formateo
    DatePipe,
    CurrencyPipe,

    // Tus componentes personalizados
    HeaderComponent,
    SideMenuComponent,
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
  isLoading = true; // Controla el esqueleto de carga y la visibilidad del botón "Create New Goal"

  private storageKey = 'objetivosAhorro';
  private storageSubscription: Subscription | undefined;

  constructor(private fb: FormBuilder, private loadingCtrl: LoadingController) {
    addIcons({
      addOutline,
      cashOutline,
      calendarOutline,
      addCircleOutline,
      createOutline,
      trashOutline,
      close
    });

    // Inicialización del formulario reactivo con validadores
    this.goalForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      montoMeta: [null, [Validators.required, Validators.min(0.01)]],
      montoActual: [0, Validators.min(0)],
      fechaLimite: [null],
    });
  }

  ngOnInit() {
    // ionViewWillEnter es preferido en Ionic para cargar datos al entrar a la vista
  }

  async ionViewWillEnter() {
    console.log('ionViewWillEnter: Iniciando carga de metas...');
    await this.loadObjetivos();
  }

  ngOnDestroy() {
    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }
  }

  async loadObjetivos() {
    this.isLoading = true; // Activa el estado de carga
    console.log('loadObjetivos: isLoading =', this.isLoading);

    const loading = await this.loadingCtrl.create({
      message: 'Cargando tus metas de ahorro...',
      spinner: 'crescent'
    });
    await loading.present();

    // Simula un retraso para ver el esqueleto de carga
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const storedObjetivos = localStorage.getItem(this.storageKey);
      if (storedObjetivos) {
        this.objetivos = JSON.parse(storedObjetivos).map((obj: ObjetivoAhorro) => ({
          ...obj,
          progreso: (obj.montoActual / obj.montoMeta) * 100,
        }));
        console.log('Metas cargadas desde localStorage:', this.objetivos.length);
      } else {
        this.objetivos = [];
        console.log('No se encontraron metas en localStorage.');
      }
    } catch (error) {
      console.error('Error al cargar metas:', error);
      this.objetivos = [];
    } finally {
      this.isLoading = false; // Desactiva el estado de carga
      await loading.dismiss(); // Cierra el spinner de carga
      console.log('loadObjetivos: Carga finalizada, isLoading =', this.isLoading);
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
    console.log('Metas guardadas en localStorage.');
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  formatDate(date: string | null | undefined): string | null {
    if (!date) {
      return null;
    }
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  }

  isDeadlinePassed(fechaLimite: string | null | undefined): boolean {
    if (!fechaLimite) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(fechaLimite);
    deadline.setHours(0, 0, 0, 0);

    return deadline < today;
  }

  // Abre el modal de creación/edición de metas
  openCreateGoalModal(goalToEdit?: ObjetivoAhorro) {
    this.isEditingGoal = !!goalToEdit;
    if (goalToEdit) {
      this.goalForm.patchValue({
        id: goalToEdit.id,
        nombre: goalToEdit.nombre,
        montoMeta: goalToEdit.montoMeta,
        montoActual: goalToEdit.montoActual,
        fechaLimite: goalToEdit.fechaLimite ? new Date(goalToEdit.fechaLimite).toISOString() : null,
      });
      console.log('Abriendo modal para editar meta:', goalToEdit.nombre);
    } else {
      this.goalForm.reset({ montoActual: 0 }); // Reinicia el formulario para nueva meta
      console.log('Abriendo modal para crear nueva meta.');
    }
    this.isCreateGoalModalOpen = true; // Esto es lo que hace visible el modal
    console.log('isCreateGoalModalOpen se estableció a TRUE. El modal debería ser visible ahora.');
  }

  // Cierra el modal de creación/edición de metas
  closeCreateGoalModal() {
    this.isCreateGoalModalOpen = false;
    this.isEditingGoal = false;
    this.goalForm.reset(); // Reinicia el formulario
    console.log('isCreateGoalModalOpen se estableció a FALSE. El modal debería estar oculto.');
  }

  // Envía el formulario de meta (creación o edición)
  async submitGoalForm() {
    if (this.goalForm.valid) {
      this.isSubmitting = true;
      const loading = await this.loadingCtrl.create({
        message: this.isEditingGoal ? 'Guardando cambios...' : 'Creando meta...',
      });
      await loading.present();

      const formValue = this.goalForm.value;
      const fechaLimiteFormatted = formValue.fechaLimite ? new Date(formValue.fechaLimite).toISOString() : null;

      const nuevoObjetivo: ObjetivoAhorro = {
        id: formValue.id || this.generateId(),
        nombre: formValue.nombre,
        montoMeta: formValue.montoMeta,
        montoActual: formValue.montoActual || 0,
        fechaLimite: fechaLimiteFormatted,
        progreso: (formValue.montoActual || 0) / formValue.montoMeta * 100,
      };

      if (this.isEditingGoal) {
        this.objetivos = this.objetivos.map((obj) => (obj.id === nuevoObjetivo.id ? nuevoObjetivo : obj));
        console.log('Meta actualizada:', nuevoObjetivo.nombre);
      } else {
        this.objetivos.push(nuevoObjetivo);
        console.log('Nueva meta creada:', nuevoObjetivo.nombre);
      }

      this.saveObjetivos();
      this.closeCreateGoalModal();
      await loading.dismiss();
      this.isSubmitting = false;
    } else {
      // Marca todos los controles como 'touched' para mostrar los mensajes de validación
      this.goalForm.markAllAsTouched();
      console.warn('Formulario inválido. No se puede enviar.', this.goalForm.errors, this.goalForm.value);
    }
  }

  openEditGoalModal(goal: ObjetivoAhorro) {
    this.openCreateGoalModal(goal);
  }

  openAddFundsModal(goal: ObjetivoAhorro) {
    this.selectedGoal = goal;
    this.fundsToAdd = null;
    this.isAddFundsModalOpen = true;
    console.log('Abriendo modal para añadir fondos a:', goal.nombre);
  }

  closeAddFundsModal() {
    this.isAddFundsModalOpen = false;
    this.selectedGoal = null;
    this.fundsToAdd = null;
    console.log('Modal de añadir fondos cerrado.');
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
            progreso: (nuevoMontoActual / obj.montoMeta) * 100,
          };
        }
        return obj;
      });

      this.saveObjetivos();
      this.closeAddFundsModal();
      await loading.dismiss();
      console.log(`Añadidos ${this.fundsToAdd} a ${this.selectedGoal.nombre}.`);
    } else {
      console.warn('Cantidad inválida o no hay meta seleccionada para añadir fondos.');
    }
  }

  async deleteGoal(goalId: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando meta...',
    });
    await loading.present();
    this.objetivos = this.objetivos.filter((obj) => obj.id !== goalId);
    this.saveObjetivos();
    await loading.dismiss();
    console.log(`Meta con ID ${goalId} eliminada.`);
  }
}
