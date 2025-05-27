import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  LoadingController,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { AccountService, Account } from 'src/app/services/account.service'; // Import Account here
import { Subscription } from 'rxjs';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { Chart, registerables } from 'chart.js';
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

// Corrected BudgetUtilization interface
interface BudgetUtilization {
  percentage: number;
  total?: number; // Make total optional or remove if not always needed
  utilized?: number; // Add utilized if you're returning it. Changed from 'utilization'
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
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    HeaderComponent,
    SideMenuComponent,
    RouterLink,
  ]
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
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

  isLoading: boolean = true;

  private accountSubscription!: Subscription;

  constructor(
    private loadingController: LoadingController,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.accountSubscription = this.accountService.selectedAccount$.subscribe(account => {
      // Add this console log to inspect the received account object
      console.log('Selected account updated in DashboardPage:', account);
      // Pass the entire account object to loadDashboardData
      this.loadDashboardData(account);
    });
  }

  ngAfterViewInit(): void {
    // The chart creation is now handled within loadDashboardData after data is fetched
    // and a small timeout to ensure DOM is ready.
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    // Destroy the Chart.js instance to prevent memory leaks
    if (this.chart) {
      this.chart.destroy();
    }
  }

  async loadDashboardData(account: Account | null) { // Changed parameter type to accept the account object
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Loading dashboard...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const [
        currentBalance,
        monthlyIncomeExpense,
        budgetUtilization,
        incomeExpenseChartData,
        recentTransactions,
        savingsGoals
      ] = await Promise.all([ // Pass the account object to fetch methods
        this.fetchCurrentBalance(account),
        this.fetchMonthlyIncomeExpense(account),
        this.fetchBudgetUtilization(account),
        this.fetchIncomeExpenseChartData(account),
        this.fetchRecentTransactions(account),
        this.fetchSavingsGoals(account)
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
    } finally {
      this.isLoading = false;
      loading.dismiss();
      // Call createIncomeExpenseChart AFTER isLoading is false
      // and after a small delay to ensure the DOM has updated.
      setTimeout(() => {
        this.createIncomeExpenseChart();
      }, 0);
    }
  }

  // --- Data Fetching Methods (Replace with your actual service calls) ---

  async fetchCurrentBalance(account: Account | null): Promise<Balance> {
    console.log(`WorkspaceCurrentBalance called with account: ${account ? account.nombre : 'null'}`); // Log account name
    return new Promise((resolve) => {
      setTimeout(() => {
        if (account === null) {
          resolve({ current: 0 });
        } else {
          // Use account.saldo directly as it's now a number
          resolve({ current: account.saldo });
        }
      }, 800); // Simulate network delay
    });
  }

  async fetchMonthlyIncomeExpense(account: Account | null): Promise<IncomeExpense> { // Ensure this returns a Promise
    console.log(`WorkspaceMonthlyIncomeExpense called with account: ${account ? account.nombre : 'null'}`);
    return new Promise(resolve => {
      setTimeout(() => {
        // Always resolve with 0 income and expense as per requirement
        resolve({ income: 0, expense: 0 });
      }, 1000); // Simulate network delay
    });
  }

  async fetchBudgetUtilization(account: Account | null): Promise<BudgetUtilization> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // As per requirement, always resolve with 0 utilization and total
        // Note: Ensure the BudgetUtilization interface is updated if 'percentage', 'utilized' or 'total' are not the final properties needed.
        resolve({ percentage: 0, utilized: 0, total: 0 });
      }, 700); // Simulate network delay
    });
  }

  async fetchIncomeExpenseChartData(account: Account | null): Promise<any> {
    // Ensure fetchIncomeExpenseChartData returns empty data as per requirement
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ labels: [], datasets: [] });
      }, 1200);
    });
  }

  async fetchRecentTransactions(account: Account | null): Promise<Transaction[]> {
    console.log(`WorkspaceRecentTransactions called with account: ${account ? account.nombre : 'null'}`);
    // As per requirement, always resolve with an empty array
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return empty array for transactions
        resolve([]);
      }, 900);
    });
  }

  async fetchSavingsGoals(account: Account | null): Promise<SavingsGoal[]> {
    console.log(`WorkspaceSavingsGoals called with account: ${account ? account.nombre : 'null'}`);
    // As per requirement, always resolve with an empty array
    // Removed simulation logic
    return Promise.resolve([]);
  }

  createIncomeExpenseChart(): void {
    console.log('createIncomeExpenseChart called');
    console.log('incomeExpenseChartRef:', this.incomeExpenseChartRef);
    if (this.incomeExpenseChartRef && this.incomeExpenseChartRef.nativeElement) {
      const ctx = this.incomeExpenseChartRef.nativeElement.getContext('2d');

      if (this.chart) {
        this.chart.destroy();
      }

      if (ctx) {
        // Fallback to empty data if incomeExpenseChartData is not available
        const chartData = this.incomeExpenseChartData || {
          labels: [],
          datasets: [], // Ensure datasets is an array of objects
        };

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels,
            // Ensure datasets is correctly structured for Chart.js.
            // If incomeExpenseChartData has `incomeData` and `expenseData` properties,
            // you'll need to transform them into the `datasets` array here.
            datasets: chartData.datasets.length > 0 ? chartData.datasets : [
              // Example transformation if incomeExpenseChartData provides incomeData and expenseData
              // { label: 'Ingresos', data: chartData.incomeData || [], backgroundColor: '#28a745' },
              // { label: 'Gastos', data: chartData.expenseData || [], backgroundColor: '#dc3545' },
            ],
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
