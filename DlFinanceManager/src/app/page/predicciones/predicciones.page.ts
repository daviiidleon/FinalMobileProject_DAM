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
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, FormsModule, HeaderComponent,
    SideMenuComponent, IonIcon, IonButton, IonRow,
    IonCol, IonGrid
  ]
})
export class PrediccionesPage implements OnInit {

  sugerencias = [
    {
      texto: '🎯 Puedes ahorrar 50 € reduciendo un 20% tu gasto en delivery.',
      impacto: 50,
      porcentaje: 40
    },
    {
      texto: '💡 Mueve 20 € a tu cuenta de ahorro esta semana: no los necesitas.',
      impacto: 20,
      porcentaje: 25
    },
    {
      texto: '📉 Estás gastando más en transporte que el 80% de usuarios como tú.',
      impacto: 35,
      porcentaje: 30
    }
  ];

  constructor() { }

  ngOnInit() { }

}
