import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
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
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, SideMenuComponent, IonIcon]
})
export class DashboardPage implements OnInit, AfterViewInit {
  // Data for summary cards
  currentBalance: Balance | null = null;
  monthlyIncomeExpense: IncomeExpense | null = null;
  budgetUtilization: BudgetUtilization | null = null;

  // Data for the Income vs Expenses chart
  incomeExpenseChartData: any; // Adjust type based on your charting library
  @ViewChild('incomeExpenseChart') incomeExpenseChartRef!: ElementRef;
  public chart: any;

  // Data for Recent Transactions and Savings Goals
  recentTransactions: Transaction[] = [];
  savingsGoals: SavingsGoal[] = [];

  isLoading: boolean = false;

  constructor() { }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.createIncomeExpenseChart();
  }

  async loadDashboardData() {
    this.isLoading = true; // Optional: For showing a loading indicator

    try {
      // Simulate fetching data from services (replace with your actual API calls)
      this.currentBalance = await this.fetchCurrentBalance();
      this.monthlyIncomeExpense = await this.fetchMonthlyIncomeExpense();
      this.budgetUtilization = await this.fetchBudgetUtilization();
      this.incomeExpenseChartData = await this.fetchIncomeExpenseChartData();
      this.recentTransactions = await this.fetchRecentTransactions();
      this.savingsGoals = await this.fetchSavingsGoals();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Optionally display an error message to the user
    } finally {
      this.isLoading = false; // Optional: Hide loading indicator
    }
  }

  // --- Data Fetching Methods (Replace with your actual service calls) ---

  async fetchCurrentBalance(): Promise<Balance> {
    // Example using a Promise to simulate an API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ current: 10580.50 });
      }, 500); // Simulate network delay
    });
    // In a real application, you would call your service here:
    // return this.dataService.getCurrentBalance().toPromise();
  }

  async fetchMonthlyIncomeExpense(): Promise<IncomeExpense> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ income: 5200, expense: 2800.75 });
      }, 750);
    });
    // return this.dataService.getMonthlyIncomeExpense().toPromise();
  }

  async fetchBudgetUtilization(): Promise<BudgetUtilization> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ percentage: 65 });
      }, 600);
    });
    // return this.dataService.getBudgetUtilization().toPromise();
  }

  async fetchIncomeExpenseChartData(): Promise<any> {
    // Example chart data (adjust based on your needs and charting library)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [
            { label: 'Ingresos', data: [3500, 3000, 2200, 3800, 2500, 3200], backgroundColor: 'green' },
            { label: 'Gastos', data: [2600, 1800, 3500, 2900, 4500, 2700], backgroundColor: 'red' },
          ],
        });
      }, 1000);
    });
    // return this.dataService.getIncomeExpenseData().toPromise();
  }

  async fetchRecentTransactions(): Promise<Transaction[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, description: 'Compras de comestibles', amount: -55.20, date: new Date() },
          { id: 2, description: 'Depósito de salario', amount: 2500.00, date: new Date() },
          // ... more transactions
        ]);
      }, 900);
    });
    // return this.dataService.getRecentTransactions().toPromise();
  }

  async fetchSavingsGoals(): Promise<SavingsGoal[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Fondo de Vacaciones', currentAmount: 750, targetAmount: 2000 },
          { id: 2, name: 'Nueva computadora portátil', currentAmount: 1200, targetAmount: 1500 },
          // ... more goals
        ]);
      }, 800);
    });
    // return this.dataService.getSavingsGoals().toPromise();
  }

  createIncomeExpenseChart(): void {
    if (this.incomeExpenseChartData && this.incomeExpenseChartRef) {
      const ctx = this.incomeExpenseChartRef.nativeElement.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar', // O 'line', 'pie', etc. based on your preference
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
            },
          },
        },
      });
    } else {
      console.warn('No se pueden crear los gráficos: datos o referencia al canvas no disponibles.');
    }
  }
}
