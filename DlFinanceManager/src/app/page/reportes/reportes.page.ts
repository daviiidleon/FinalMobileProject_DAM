// src/app/pages/reportes/reportes.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
  LoadingController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, statsChartOutline } from 'ionicons/icons';

import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";

// Importamos el servicio generador y TU servicio de transacciones
import { ReportGeneratorService } from '../../services/report-generator.service';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HeaderComponent, SideMenuComponent,
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon
  ]
})
export class ReportesPage implements OnInit {

  isLoading = false;
  private allTransactions: Transaction[] = [];
  // Aquí podrías tener la cuenta seleccionada globalmente
  // private selectedAccount: Account | null = null;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private reportGenerator: ReportGeneratorService,
    private transactionService: TransactionService // Inyectamos TU servicio real
  ) {
    addIcons({ documentTextOutline, statsChartOutline });
  }

  ngOnInit() {
    // ionViewWillEnter se asegura de que los datos se recarguen si volvemos a la página
  }

  ionViewWillEnter() {
    this.fetchTransactions();
  }

  private fetchTransactions() {
    this.isLoading = true;

    // Aquí podrías pasar el ID de la cuenta seleccionada si fuera necesario
    // const accountId = this.selectedAccount ? this.selectedAccount.id : undefined;
    // this.transactionService.getTransactions(accountId).subscribe({

    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.allTransactions = data;
        this.isLoading = false;
        console.log(`Se cargaron ${data.length} transacciones.`);
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.isLoading = false;
        // El handleError de tu servicio ya prepara un mensaje amigable
        this.presentToast(`Error al cargar las transacciones: ${err.message}`, 'danger');
      }
    });
  }

  async onGeneratePdf() {
    if (this.allTransactions.length === 0) {
      this.presentToast('No hay transacciones para generar el informe. Intenta recargar.', 'warning');
      return;
    }
    const loading = await this.loadingController.create({ message: 'Generando PDF...' });
    await loading.present();

    setTimeout(() => {
      try {
        this.reportGenerator.generatePdf(this.allTransactions);
        this.presentToast('La descarga del PDF ha comenzado.', 'success');
      } catch(e) {
        console.error("Error al generar PDF:", e);
        this.presentToast('Ocurrió un error al generar el PDF.', 'danger');
      } finally {
        loading.dismiss();
      }
    }, 500);
  }

  async onGenerateExcel() {
    if (this.allTransactions.length === 0) {
      this.presentToast('No hay transacciones para generar el informe. Intenta recargar.', 'warning');
      return;
    }
    const loading = await this.loadingController.create({ message: 'Generando Excel...' });
    await loading.present();

    setTimeout(() => {
      try {
        this.reportGenerator.generateExcel(this.allTransactions);
        this.presentToast('La descarga del Excel ha comenzado.', 'success');
      } catch(e) {
        console.error("Error al generar Excel:", e);
        this.presentToast('Ocurrió un error al generar el Excel.', 'danger');
      } finally {
        loading.dismiss();
      }
    }, 500);
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}
