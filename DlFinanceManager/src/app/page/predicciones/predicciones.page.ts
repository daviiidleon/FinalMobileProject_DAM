import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCol,
  IonContent, IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar,
  LoadingController // <--- Import LoadingController
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
    IonCol, IonGrid, CurrencyPipe
  ]
})
export class PrediccionesPage implements OnInit {

  sugerencias: any[] = [];
  isLoading: boolean = true; // <--- Initialize to true

  constructor(private loadingController: LoadingController) { } // <--- Inject LoadingController

  ngOnInit() {
    // ngOnInit is typically for one-time initialization.
    // For data loading that should happen every time the page is entered,
    // we'll use ionViewWillEnter.
  }

  // Ionic lifecycle hook - fires every time the view is about to become active
  async ionViewWillEnter() {
    await this.loadSugerencias();
  }

  async loadSugerencias() {
    this.isLoading = true; // Set loading to true to show skeleton

    // <--- Start Dashboard-style LoadingController
    const loading = await this.loadingController.create({
      message: 'Cargando sugerencias...',
      spinner: 'crescent'
    });
    await loading.present();
    // End Dashboard-style LoadingController --->

    // Simulate network delay for fetching data
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay

    // Actual data loading
    this.sugerencias = [
      {
        texto: '🎯 Puedes ahorrar 50€ reduciendo un 20% tu gasto en delivery.',
        impacto: 50,
        porcentaje: 40
      },
      {
        texto: '💡 Mueve 20€ a tu cuenta de ahorro esta semana: no los necesitas.',
        impacto: 20,
        porcentaje: 25
      },
      {
        texto: '📉 Estás gastando más en transporte que el 80% de usuarios como tú.',
        impacto: 35,
        porcentaje: 30
      }
    ];

    this.isLoading = false; // Set loading to false to hide skeleton
    loading.dismiss(); // <--- Dismiss the LoadingController
  }
}
