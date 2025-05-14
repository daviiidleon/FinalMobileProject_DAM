import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";

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
    IonGrid
  ]
})
export class TransaccionesPage implements OnInit {

  // ✅ Cambiado: arreglo de transacciones inicializado
  transacciones: any[] = [
    {
      fecha: '14/05/2025',
      cuenta: 'Cuenta Corriente',
      cantidad: '€120.00',
      categoria: 'Alimentación',
      descripcion: 'Supermercado'
    },
    {
      fecha: '13/05/2025',
      cuenta: 'Tarjeta Crédito',
      cantidad: '€35.00',
      categoria: 'Transporte',
      descripcion: 'Gasolina'
    },
    {
      fecha: '12/05/2025',
      cuenta: 'Efectivo',
      cantidad: '€20.00',
      categoria: 'Ocio',
      descripcion: 'Cine'
    }
  ];

  constructor() { }

  ngOnInit() {
    // Aquí podrías cargar transacciones desde un servicio en el futuro
  }

}
