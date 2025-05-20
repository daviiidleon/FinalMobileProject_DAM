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
  LoadingController // Import LoadingController
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
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
    IonButton
  ]
})
export class ReportesPage implements OnInit {

  isLoading = true; // Add isLoading property

  constructor(private loadingController: LoadingController) { } // Inject LoadingController

  ngOnInit() {
    // No logic here, ionViewWillEnter will handle initial load
  }

  async ionViewWillEnter() {
    await this.loadReportes();
  }

  async loadReportes() {
    this.isLoading = true; // Show skeleton
    const loading = await this.loadingController.create({
      message: 'Cargando reportes...',
      spinner: 'crescent'
    });
    await loading.present();

    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.isLoading = false; // Hide skeleton
    loading.dismiss();
  }
}
