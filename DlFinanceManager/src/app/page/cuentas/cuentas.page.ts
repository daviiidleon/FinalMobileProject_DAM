import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonCol,
  IonRow,
  IonGrid
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";

@Component({
  selector: 'app-cuentas',
  templateUrl: './cuentas.page.html',
  styleUrls: ['./cuentas.page.scss'],
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
    IonGrid
  ]
})
export class CuentasPage implements OnInit {

  cuentas: any[] = [
    {
      nombre: 'Cuenta Corriente',
      saldo: '€1,200.00',
      fechaCreacion: '01/01/2024'
    },
    {
      nombre: 'Ahorros',
      saldo: '€5,000.00',
      fechaCreacion: '15/03/2023'
    },
    {
      nombre: 'Tarjeta Crédito',
      saldo: '€-350.00',
      fechaCreacion: '22/09/2022'
    }
  ];

  constructor() { }

  ngOnInit() {
    // Lógica de carga inicial si fuese necesaria
  }
}
