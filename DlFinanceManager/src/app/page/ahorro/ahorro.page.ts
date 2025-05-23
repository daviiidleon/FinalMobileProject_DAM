import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Re-added Forms Modules

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
  IonModal, // Re-added IonModal
  IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonNote, IonSpinner, IonList, IonSelect, IonSelectOption, // Re-added Modal related components
  LoadingController,
  IonMenuButton, // Keep if needed for menu, otherwise remove
  AlertController, // Added AlertController for delete confirmation
  ToastController // Added ToastController for notifications
} from '@ionic/angular/standalone';

import { HeaderComponent } from '../../component/header/header.component';
import { SideMenuComponent } from '../../component/side-menu/side-menu.component';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cashOutline,
  calendarOutline,
  addCircleOutline,
  createOutline,
  trashOutline,
  closeOutline // Re-added close icon
} from 'ionicons/icons';


interface ObjetivoAhorro {
  id: string;
  nombre: string;
  montoMeta: number;
  montoActual: number;
  fechaLimite?: string | null; // Optional deadline
  progreso: number;
}

@Component({
  selector: 'app-ahorro',
  templateUrl: './ahorro.page.html',
  styleUrls: ['./ahorro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Re-added FormsModule
    ReactiveFormsModule, // Re-added ReactiveFormsModule

    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonCol, // Keep if you use Grid, otherwise remove
    IonRow, // Keep if you use Grid, otherwise remove
    IonGrid, // Keep if you use Grid, otherwise remove
    IonProgressBar,
    IonModal, // Re-added IonModal
    IonItem, IonLabel, IonInput, IonDatetime, IonButtons, IonNote, IonSpinner, IonList, IonSelect, IonSelectOption, // Re-added modal components

    DatePipe,
    CurrencyPipe,

    HeaderComponent,
    SideMenuComponent,
  ],
})
export class AhorroPage implements OnInit, OnDestroy {
  objetivos: ObjetivoAhorro[] = [];
  isLoading = true;

  // New properties for the Goal Modal
  @ViewChild('goalModal') goalModal!: IonModal; // Reference to the goal modal
  @ViewChild('addFundsModal') addFundsModal!: IonModal; // Reference to the add funds modal

  isGoalModalOpen: boolean = false;
  isAddFundsModalOpen: boolean = false;
  isEditMode: boolean = false;
  goalForm: FormGroup; // Re-added FormGroup
  isSubmitting: boolean = false;
  editingGoalId: string | null = null;
  fundsToAdd: number | null = null; // Re-added fundsToAdd
  showDatePicker: boolean = false; // New property to control datetime visibility for goals

  private storageKey = 'objetivosAhorro';
  private storageSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder, // Re-added FormBuilder
    private loadingCtrl: LoadingController,
    private alertController: AlertController, // Re-added AlertController
    private toastController: ToastController // Re-added ToastController
  ) {
    addIcons({
      addOutline,
      cashOutline,
      calendarOutline,
      addCircleOutline,
      createOutline,
      trashOutline,
      closeOutline, // Re-added close icon
    });

    // Re-initialize goalForm
    this.goalForm = this.fb.group({
      id: [''], // Will be set on edit or generated on add
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      montoMeta: [null, [Validators.required, Validators.min(0.01)]],
      montoActual: [0, Validators.min(0)],
      fechaLimite: [null], // No initial value, can be null
    });
  }

  ngOnInit() {
    // ionViewWillEnter is preferred in Ionic for loading data when entering the view
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
    this.isLoading = true;
    console.log('loadObjetivos: isLoading =', this.isLoading);

    const loading = await this.loadingCtrl.create({
      message: 'Cargando tus metas de ahorro...',
      spinner: 'crescent'
    });
    await loading.present();

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const storedObjetivos = localStorage.getItem(this.storageKey);
      if (storedObjetivos) {
        this.objetivos = JSON.parse(storedObjetivos).map((obj: ObjetivoAhorro) => {
          // Ensure montoActual doesn't exceed montoMeta, and calculate progress
          const montoActualClamped = Math.min(obj.montoActual, obj.montoMeta);
          return {
            ...obj,
            montoActual: montoActualClamped, // Clamp saved amount
            progreso: (montoActualClamped / obj.montoMeta) * 100,
          };
        });
        console.log('Metas cargadas desde localStorage:', this.objetivos.length);
      } else {
        this.objetivos = [];
        console.log('No se encontraron metas en localStorage.');
      }
    } catch (error) {
      console.error('Error al cargar metas:', error);
      this.objetivos = [];
    } finally {
      this.isLoading = false;
      await loading.dismiss();
      console.log('loadObjetivos: Carga finalizada, isLoading =', this.isLoading);
    }
  }

  saveObjetivos() {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(
        this.objetivos.map((obj) => {
          const { progreso, ...rest } = obj; // Exclude 'progreso' as it's derived
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
    // Use 'shortDate' or specify format 'yyyy-MM-dd' for consistency
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  }

  isDeadlinePassed(fechaLimite: string | null | undefined): boolean {
    if (!fechaLimite) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const deadline = new Date(fechaLimite);
    deadline.setHours(0, 0, 0, 0); // Normalize to start of day

    return deadline < today;
  }

  // --- Goal Modal Methods ---

  async openGoalModal(mode: 'add' | 'edit', goal?: ObjetivoAhorro) {
    this.isGoalModalOpen = true;
    this.isEditMode = mode === 'edit';
    this.goalForm.reset();
    this.editingGoalId = null;
    this.showDatePicker = false; // Ensure picker is hidden when modal opens

    if (this.isEditMode && goal) {
      this.editingGoalId = goal.id;
      this.goalForm.patchValue({
        id: goal.id,
        nombre: goal.nombre,
        montoMeta: goal.montoMeta,
        montoActual: goal.montoActual, // Existing amount for edit mode
        fechaLimite: goal.fechaLimite ? new Date(goal.fechaLimite).toISOString() : null,
      });
      // Disable montoActual if editing, as it should only be changed via "Add Funds"
      this.goalForm.get('montoActual')?.disable();
    } else {
      // Set default value for montoActual for new goals
      this.goalForm.get('montoActual')?.enable(); // Ensure it's enabled for new goals
      this.goalForm.patchValue({ montoActual: 0 });
      this.goalForm.get('id')?.setValue(this.generateId()); // Assign new ID
    }
  }

  async closeGoalModal() {
    this.isGoalModalOpen = false;
    this.isEditMode = false;
    this.isSubmitting = false;
    this.goalForm.reset();
    this.editingGoalId = null;
    this.showDatePicker = false; // Reset picker visibility
    this.goalForm.get('montoActual')?.enable(); // Re-enable montoActual for next potential 'add'
  }

  toggleDatePicker() {
    this.showDatePicker = !this.showDatePicker;
  }

  // This method is called when the user confirms the date selection (clicks "Confirm")
  onDateSelected(event: any) {
    // The formControlName="fechaLimite" already handles updating the form's value.
    // We just need to hide the picker.
    this.showDatePicker = false;
  }

  async submitGoalForm() {
    this.goalForm.markAllAsTouched();
    if (this.goalForm.invalid) {
      await this.presentToast('Please fill all required fields correctly.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Saving changes...' : 'Adding goal...',
      spinner: 'crescent'
    });
    await loading.present();

    const formValue = this.goalForm.getRawValue(); // Use getRawValue to get disabled field values
    const newGoal: ObjetivoAhorro = {
      id: formValue.id || this.generateId(), // Ensure ID is present
      nombre: formValue.nombre,
      montoMeta: parseFloat(formValue.montoMeta),
      montoActual: parseFloat(formValue.montoActual),
      fechaLimite: formValue.fechaLimite ? new Date(formValue.fechaLimite).toISOString() : null,
      progreso: 0 // Will be calculated after adding/updating
    };

    // Calculate progress
    newGoal.progreso = (newGoal.montoActual / newGoal.montoMeta) * 100;
    if (newGoal.progreso > 100) newGoal.progreso = 100; // Cap at 100%

    setTimeout(async () => {
      if (this.isEditMode && this.editingGoalId) {
        const index = this.objetivos.findIndex(g => g.id === this.editingGoalId);
        if (index !== -1) {
          // Keep the current montoActual if not explicitly adding funds
          const currentMontoActual = this.objetivos[index].montoActual;
          newGoal.montoActual = currentMontoActual; // Preserve existing saved amount
          newGoal.progreso = (newGoal.montoActual / newGoal.montoMeta) * 100;
          if (newGoal.progreso > 100) newGoal.progreso = 100;

          this.objetivos[index] = newGoal;
          await this.presentToast('Goal updated successfully!', 'success');
        }
      } else {
        this.objetivos.unshift(newGoal); // Add to the beginning for visibility
        await this.presentToast('Goal added successfully!', 'success');
      }

      this.saveObjetivos();
      this.isSubmitting = false;
      loading.dismiss();
      this.closeGoalModal();
      this.loadObjetivos(); // Reload to ensure UI is updated with new calculations
    }, 1000);
  }

  // --- Add Funds Modal Methods ---

  openAddFundsModal(goal: ObjetivoAhorro) {
    this.isAddFundsModalOpen = true;
    this.selectedGoal = goal; // Set the selected goal for adding funds
    this.fundsToAdd = null; // Reset funds to add
    this.isSubmitting = false; // Reset submitting state
  }

  closeAddFundsModal() {
    this.isAddFundsModalOpen = false;
    this.selectedGoal = null;
    this.fundsToAdd = null;
    this.isSubmitting = false;
  }

  selectedGoal: ObjetivoAhorro | null = null; // Declare selectedGoal property

  async addFunds() {
    if (!this.selectedGoal || typeof this.fundsToAdd !== 'number' || this.fundsToAdd <= 0) {
      await this.presentToast('Please enter a valid amount to add.', 'danger');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Adding funds...',
      spinner: 'crescent'
    });
    await loading.present();

    setTimeout(async () => {
      const index = this.objetivos.findIndex(g => g.id === this.selectedGoal?.id);
      if (index !== -1) {
        const goal = this.objetivos[index];
        goal.montoActual += this.fundsToAdd!; // Add funds
        if (goal.montoActual > goal.montoMeta) {
          goal.montoActual = goal.montoMeta; // Cap at target amount
        }
        goal.progreso = (goal.montoActual / goal.montoMeta) * 100;
        if (goal.progreso > 100) goal.progreso = 100; // Cap at 100%

        this.objetivos[index] = { ...goal }; // Ensure change detection fires
        this.saveObjetivos();
        await this.presentToast('Funds added successfully!', 'success');
      } else {
        await this.presentToast('Goal not found.', 'danger');
      }

      this.isSubmitting = false;
      loading.dismiss();
      this.closeAddFundsModal();
      this.loadObjetivos(); // Reload to ensure UI is updated
    }, 1000);
  }


  // --- General Methods ---

  async deleteGoal(goalId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this goal? This action cannot be undone.',
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
          handler: async () => { // Make handler async
            const loading = await this.loadingCtrl.create({
              message: 'Deleting goal...',
            });
            await loading.present();
            this.objetivos = this.objetivos.filter((obj) => obj.id !== goalId);
            this.saveObjetivos();
            await loading.dismiss();
            await this.presentToast('Goal deleted successfully!', 'success'); // Use await
            console.log(`Meta con ID ${goalId} eliminada.`);
            this.loadObjetivos(); // Reload to ensure UI is updated
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
