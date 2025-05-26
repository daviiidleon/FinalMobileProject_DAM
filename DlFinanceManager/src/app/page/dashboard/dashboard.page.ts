import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  LoadingController,
  IonIcon,
  IonButton // Asegúrate de que IonButton esté importado
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { Chart, registerables } from 'chart.js';
import { ObjetivoAhorro } from '../ahorro/ahorro.page';
import {RouterLink} from "@angular/router";
Chart.register(...registerables);

// Define interfaces for your data
interface Balance {
  current: number;
}

interface IncomeExpense {
  income: number;
  expense: number;
}

interface BudgetUtilization {
  percentage: number;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: Date;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton, // IonButton proporciona la funcionalidad routerLink
    IonIcon,
    HeaderComponent,
    SideMenuComponent,
    RouterLink,
  ]
})
export class DashboardPage implements OnInit, AfterViewInit {
  // Data for summary cards
  currentBalance: Balance | null = null;
  monthlyIncomeExpense: IncomeExpense | null = null;
  budgetUtilization: BudgetUtilization | null = null;

  // Data for the Income vs Expenses chart
  incomeExpenseChartData: any;
  @ViewChild('incomeExpenseChart') incomeExpenseChartRef!: ElementRef;
  public chart: any;

  // Data for Recent Transactions and Savings Goals
  recentTransactions: Transaction[] = [];
  savingsGoals: ObjetivoAhorro[] = [];

  isLoading: boolean = true; // Initialize to true to show skeletons on load

  constructor(private loadingController: LoadingController) { } // Inject LoadingController

  ngOnInit() {
    this.loadDashboardData();
    this.loadSavingsGoals(); // Load savings goals on init
  }

  ngAfterViewInit(): void {
    // La creación del gráfico se mueve al final de loadDashboardData para asegurar que el DOM esté listo
  }

  async loadDashboardData() {
    this.isLoading = true; // Show skeleton loaders
    const loading = await this.loadingController.create({ // Create Ionic loading spinner
      message: 'Loading dashboard...',
      spinner: 'crescent' // or 'dots', 'bubbles', 'circles', 'lines'
    });
    await loading.present(); // Present the Ionic loading spinner

    try {
      // Simulate fetching data from services (replace with your actual API calls)
      const [
        currentBalance,
        monthlyIncomeExpense,
        budgetUtilization,
        incomeExpenseChartData,
        recentTransactions,
        savingsGoals
      ] = await Promise.all([
        this.fetchCurrentBalance(),
        this.fetchMonthlyIncomeExpense(),
        this.fetchBudgetUtilization(),
        this.fetchIncomeExpenseChartData(),
        this.fetchRecentTransactions(),
        this.fetchSavingsGoals()
      ]);

      this.currentBalance = currentBalance;
      this.monthlyIncomeExpense = monthlyIncomeExpense;
      this.budgetUtilization = budgetUtilization;
      this.incomeExpenseChartData = incomeExpenseChartData;
      this.recentTransactions = recentTransactions;
      this.savingsGoals = savingsGoals;


    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Optionally display an error message to the user
      // For example, using an Ionic alert:
      // const alert = await this.alertController.create({
      //   header: 'Error',
      //   message: 'Failed to load dashboard data. Please try again later.',
      //   buttons: ['OK'],
      // });
      // await alert.present();
    } finally {
      this.isLoading = false; // Hide skeleton loaders
      loading.dismiss(); // Dismiss the Ionic loading spinner
      // Llama a createIncomeExpenseChart DESPUÉS de que isLoading sea false
      // y después de un pequeño retraso para asegurar que el DOM se haya actualizado.
      setTimeout(() => {
        this.createIncomeExpenseChart();
      }, 0); // Un setTimeout(..., 0) pone la ejecución al final de la cola de eventos
    }
  }

  // --- Data Fetching Methods (Replace with your actual service calls) ---

  async fetchCurrentBalance(): Promise<Balance> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ current: 10580.50 });
      }, 800); // Simulate network delay
    });
  }

  async fetchMonthlyIncomeExpense(): Promise<IncomeExpense> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ income: 5200, expense: 2800.75 });
      }, 1000);
    });
  }

  async fetchBudgetUtilization(): Promise<BudgetUtilization> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ percentage: 65 });
      }, 700);
    });
  }

  async fetchIncomeExpenseChartData(): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [
            { label: 'Ingresos', data: [3500, 3000, 2200, 3800, 2500, 3200], backgroundColor: '#28a745' }, // Green for income
            { label: 'Gastos', data: [2600, 1800, 3500, 2900, 4500, 2700], backgroundColor: '#dc3545' }, // Red for expense
          ],
        });
      }, 1200);
    });
  }

  async fetchRecentTransactions(): Promise<Transaction[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, description: 'Compras de comestibles', amount: -55.20, date: new Date() },
          { id: 2, description: 'Depósito de salario', amount: 2500.00, date: new Date() },
          { id: 3, description: 'Pago de alquiler', amount: -800.00, date: new Date() },
          { id: 4, description: 'Cena con amigos', amount: -45.50, date: new Date() },
        ]);
      }, 900);
    });
  }

  // Note: The return type is now ObjetivoAhorro[] to match the interface from ahorro.page.ts
  async fetchSavingsGoals(): Promise<ObjetivoAhorro[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        // This is mock data. Replace this with actual logic to load goals from your data source.
        resolve([
          { id: 'mock-1', nombre: 'Fondo de Vacaciones', montoActual: 750, montoMeta: 2000, progreso: (750/2000)*100, fechaLimite: '2024-12-31T23:59:59.999Z' },
          { id: 'mock-2', nombre: 'Nueva computadora portátil', montoActual: 1200, montoMeta: 1500, progreso: (1200/1500)*100, fechaLimite: null },
          { id: 'mock-3', nombre: 'Enganche de coche', montoActual: 3000, montoMeta: 5000, progreso: (3000/5000)*100, fechaLimite: '2025-06-30T23:59:59.999Z' },
        ]);
      }, 800);
    });
  }

  async loadSavingsGoals() {
    // TODO: Implement actual logic to load savings goals
    // Example: Fetch from localStorage or a service
    // this.savingsGoals = await this.yourSavingsService.getGoals();
    console.log('Placeholder: loadSavingsGoals method called.');
  }

  createIncomeExpenseChart(): void {
    console.log('createIncomeExpenseChart called');
    console.log('incomeExpenseChartRef:', this.incomeExpenseChartRef);
    if (this.incomeExpenseChartRef && this.incomeExpenseChartRef.nativeElement) {
      const ctx = this.incomeExpenseChartRef.nativeElement.getContext('2d');

      // Destroy existing chart if it exists to prevent duplicates
      if (this.chart) {
        this.chart.destroy();
      }

      if (ctx) {
        const chartData = this.incomeExpenseChartData || { // Use mock data if actual data is null
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [
            { label: 'Ingresos', data: [3500, 3000, 2200, 3800, 2500, 3200], backgroundColor: '#28a745' }, // Green for income
            { label: 'Gastos', data: [2600, 1800, 3500, 2900, 4500, 2700], backgroundColor: '#dc3545' }, // Red for expense
          ],
        };

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: chartData.datasets.map((dataset: any) => ({
              label: dataset.label,
              data: dataset.data,
              backgroundColor: dataset.backgroundColor,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  callback: function(value: any) {
                    return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: '#333',
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += context.parsed.y.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
                    }
                    return label;
                  }
                }
              }
            }
          },
        });
      } else {
        console.error('Failed to get canvas rendering context.');
      }
    }
    else {
      console.warn('No se pueden crear los gráficos: referencia al canvas no disponible.');
    }
  }
}
