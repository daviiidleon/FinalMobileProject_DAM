import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { Chart, registerables } from 'chart.js';
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

interface SavingsGoal {
  id: number;
  name: string;
  currentAmount: number;
  targetAmount: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
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
    IonIcon
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
  savingsGoals: SavingsGoal[] = [];

  isLoading: boolean = true; // Initialize to true to show skeletons on load

  constructor(private loadingController: LoadingController) { } // Inject LoadingController

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Chart creation should ideally happen after data is loaded and isLoading is false
    // We will call it within loadDashboardData's finally block
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

      // Create chart after all data is loaded and assigned
      this.createIncomeExpenseChart();

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

  async fetchSavingsGoals(): Promise<SavingsGoal[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Fondo de Vacaciones', currentAmount: 750, targetAmount: 2000 },
          { id: 2, name: 'Nueva computadora portátil', currentAmount: 1200, targetAmount: 1500 },
          { id: 3, name: 'Enganche de coche', currentAmount: 3000, targetAmount: 5000 },
        ]);
      }, 800);
    });
  }

  createIncomeExpenseChart(): void {
    if (this.incomeExpenseChartData && this.incomeExpenseChartRef) {
      // Destroy existing chart if it exists to prevent duplicates
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.incomeExpenseChartRef.nativeElement.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.incomeExpenseChartData.labels,
          datasets: this.incomeExpenseChartData.datasets.map((dataset: { label: any; data: any; backgroundColor: any; }) => ({
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
                color: 'rgba(0, 0, 0, 0.05)', // Light grid lines
              },
              ticks: {
                callback: function(value: any) {
                  return value + '€'; // Add Euro symbol to y-axis ticks
                }
              }
            },
            x: {
              grid: {
                display: false // Hide x-axis grid lines
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#333', // Legend text color
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
                    label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          }
        },
      });
    } else {
      console.warn('No se pueden crear los gráficos: datos o referencia al canvas no disponibles.');
    }
  }
}
