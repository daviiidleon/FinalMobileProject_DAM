import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonContent, IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";

@Component({
  selector: 'app-predicciones',
  templateUrl: './predicciones.page.html',
  styleUrls: ['./predicciones.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, SideMenuComponent, IonIcon, IonButton, IonRow, IonCol, IonGrid]
})
export class PrediccionesPage implements OnInit {

  // Datos de ejemplo
  predicciones = [
    { fecha: new Date(2025, 4, 10), categoria: 'Viajes', monto: 1000, tipo: 'Ingreso' },
    { fecha: new Date(2025, 5, 15), categoria: 'Salud', monto: 500, tipo: 'Gasto' },
    { fecha: new Date(2025, 6, 20), categoria: 'Educación', monto: 200, tipo: 'Ingreso' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
