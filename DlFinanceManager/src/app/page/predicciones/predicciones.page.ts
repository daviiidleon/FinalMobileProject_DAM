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
  IonToolbar, IonItem, IonLabel,
  IonList,
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
    IonCol, IonGrid, CurrencyPipe, IonItem, IonLabel, IonList
  ]
})
export class PrediccionesPage implements OnInit {

  sugerencias: any[] = []; // Property to hold prediction data
  isLoading: boolean = true; // <--- Initialize to true

  selectedAccount: any | null = null; // To hold the selected account

  constructor(private loadingController: LoadingController) { }

  ngOnInit() {
    // ngOnInit is typically for one-time initialization.
    // For data loading that should happen every time the page is entered,
    // we'll use ionViewWillEnter.
  }

  // Ionic lifecycle hook - fires every time the view is about to become active
  async ionViewWillEnter() {
    await this.loadSugerencias();
  }

  // Method responsible for loading data
  // Ensure prediction data is initialized to an empty array
  async loadSugerencias() {
    // Check if an account is selected. If so, show no data for now.
    if (this.selectedAccount) {
      this.sugerencias = []; // Initialize prediction data to an empty array
      this.isLoading = false; // Set loading to false
      console.log('Account selected, prediction data initialized to empty.');
      return; // Skip data loading logic if an account is selected
    }

    // <--- Start Dashboard-style LoadingController
    this.isLoading = true; // Set loading to true to show skeleton
    const loading = await this.loadingController.create({
      message: 'Cargando sugerencias...',
      spinner: 'crescent'
    });
    await loading.present();
    // End Dashboard-style LoadingController --->

    // Original logic for loading data (now only runs if no account is selected)
    // This part can be removed entirely if you never want simulated data.
    await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay

    // Initialize prediction data to an empty array
    // Remove existing logic that attempts to fetch or simulate prediction data.
    this.sugerencias = [];

    this.isLoading = false; // Set loading to false to hide skeleton
    loading.dismiss(); // <--- Dismiss the LoadingController
  }
}
