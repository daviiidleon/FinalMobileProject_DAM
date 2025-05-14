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
    IonCol,
    IonRow,
    IonGrid
  ]
})
export class PresupuestosPage implements OnInit {

  presupuestos = [
    {
      categoria: 'Alimentación',
      monto: '€500.00',
      gastado: '€320.00',
      restante: '€180.00'
    },
    {
      categoria: 'Transporte',
      monto: '€200.00',
      gastado: '€150.00',
      restante: '€50.00'
    },
    {
      categoria: 'Ocio',
      monto: '€150.00',
      gastado: '€90.00',
      restante: '€60.00'
    }
  ];

  constructor() {}

  ngOnInit() {}
}
