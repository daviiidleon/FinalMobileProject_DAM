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
  IonGrid,
  IonProgressBar
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";

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
    IonProgressBar
  ]
})
export class AhorroPage implements OnInit {

  // Definir los objetivos de ahorro
  objetivos = [
    {
      nombre: 'Viaje a las Maldivas',
      monto: 3000,
      ahorrado: 1200,
      progreso: 40 // 40% del progreso alcanzado
    },
    {
      nombre: 'Nuevo ordenador',
      monto: 1500,
      ahorrado: 800,
      progreso: 53
    },
    {
      nombre: 'Curso de Diseño',
      monto: 500,
      ahorrado: 250,
      progreso: 50
    }
  ];

  constructor() { }

  ngOnInit() {}
}
