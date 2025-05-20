import { Component, OnInit, ViewChild } from '@angular/core';
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
  LoadingController // Import LoadingController
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons'; // Import addIcons
import {
  cloudUploadOutline, // For "Import from CSV/Excel"
  addCircleOutline,   // For "Add Transaction" and "Add your first transaction"
  arrowDownCircle,    // For "Expense" type
  arrowUpCircle,      // For "Income" type
  ellipsisVertical,   // For table row actions
  pencilOutline,      // For "Edit" in popover
  trashOutline        // For "Delete" in popover
} from 'ionicons/icons'; // Import the specific icons you need

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
    IonItem
  ]
})
export class TransaccionesPage implements OnInit {
  @ViewChild(IonPopover) popover!: IonPopover;
  popoverEvent: any;

  transacciones: any[] = []; // Initialize as empty to show loading state
  isLoading: boolean = true; // Set to true initially

  constructor(private loadingController: LoadingController) {
    // Add Ionicons to the global Ionicons library for this standalone component
    // This ensures they are available in the template.
    addIcons({
      cloudUploadOutline,
      addCircleOutline,
      arrowDownCircle,
      arrowUpCircle,
      ellipsisVertical,
      pencilOutline,
      trashOutline
    });
  } // Inject LoadingController

  ngOnInit() {
    this.loadTransactions();
  }

  async loadTransactions() {
    this.isLoading = true; // Show skeleton loaders
    const loading = await this.loadingController.create({ // Show Ionic spinner
      message: 'Loading transactions...',
      spinner: 'crescent'
    });
    await loading.present();

    // Simulate fetching data with a delay
    setTimeout(() => {
      this.transacciones = [
        {
          tipo: 'Expense',
          fecha: 'Nov 15, 2023',
          cuenta: 'Cuenta Corriente',
          cantidad: '-€75.50',
          categoria: 'Food',
          descripcion: 'Groceries for the week'
        },
        {
          tipo: 'Income',
          fecha: 'Nov 1, 2023',
          cuenta: 'Cuenta Corriente',
          cantidad: '+€2200.00',
          categoria: 'Salary',
          descripcion: 'November Salary'
        },
        {
          tipo: 'Expense',
          fecha: 'Oct 28, 2023',
          cuenta: 'Tarjeta Crédito',
          cantidad: '-€120.00',
          categoria: 'Utilities',
          descripcion: 'Electricity Bill'
        },
        {
          tipo: 'Expense',
          fecha: 'Oct 25, 2023',
          cuenta: 'Efectivo',
          cantidad: '-€30.00',
          categoria: 'Transport',
          descripcion: 'Bus fare'
        },
        {
          tipo: 'Income',
          fecha: 'Oct 20, 2023',
          cuenta: 'Cuenta Ahorro',
          cantidad: '+€500.00',
          categoria: 'Investment',
          descripcion: 'Stock Dividend'
        },
        {
          tipo: 'Expense',
          fecha: 'Oct 18, 2023',
          cuenta: 'Tarjeta Crédito',
          cantidad: '-€85.00',
          categoria: 'Entertainment',
          descripcion: 'Concert Tickets'
        }
      ];
      this.isLoading = false; // Hide skeleton loaders
      loading.dismiss(); // Dismiss Ionic spinner
    }, 1500); // Simulate 1.5 seconds of loading
  }

  async mostrarOpciones(transaccion: any, ev: any) {
    this.popoverEvent = ev;
    await this.popover.present(ev);
  }

  editarTransaccion(transaccion: any) {
    this.popover.dismiss();
    console.log('Editar transacción:', transaccion);
    // Implementa la lógica para editar la transacción
  }

  eliminarTransaccion(transaccion: any) {
    this.popover.dismiss();
    console.log('Eliminar transacción:', transaccion);
    // Implementa la lógica para eliminar la transacción
  }
}
