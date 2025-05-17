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
  IonToolbar
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { RouterLink } from '@angular/router'; // Import RouterLink

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

  transacciones: any[] = [
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
      fecha: 'Nov 5, 2023',
      cuenta: 'Tarjeta Crédito',
      cantidad: '-€120.00',
      categoria: 'Utilities',
      descripcion: 'Electricity Bill'
    },
    {
      tipo: 'Expense',
      fecha: 'Nov 10, 2023',
      cuenta: 'Efectivo',
      cantidad: '-€30.00',
      categoria: 'Transport',
      descripcion: 'Bus fare'
    }
    // Add more transactions here
  ];

  constructor() { }

  ngOnInit() {
    // Here you would typically load transactions from a service
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
