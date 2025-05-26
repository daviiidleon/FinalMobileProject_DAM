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

  async fetchMonthlyIncomeExpense(account: Account | null): Promise<IncomeExpense> {
    console.log(`WorkspaceMonthlyIncomeExpense called with account: ${account ? account.nombre : 'null'}`);
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate data fetching based on account type
        if (account === null) {
          resolve({ income: 0, expense: 0 });
        } else {
          switch (account.tipo) {
            case 'Checking':
              resolve({ income: parseFloat((Math.random() * 4000 + 1000).toFixed(2)), expense: parseFloat((Math.random() * 3000 + 500).toFixed(2)) });
              break;
            case 'Savings':
              resolve({ income: parseFloat((Math.random() * 50 + 10).toFixed(2)), expense: parseFloat((Math.random() * 20 + 5).toFixed(2)) });
              break;
            case 'Credit Card':
            case 'Loan':
            case 'Investment':
            case 'Cash':
              resolve({ income: 0, expense: 0 }); // Typically no direct income/expense for these types
              break;
            default:
              resolve({ income: 3000, expense: 2000 });
              break;
          }
        }
      }, 1000); // Simulate network delay
    });
  }

  async fetchBudgetUtilization(account: Account | null): Promise<BudgetUtilization> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate data fetching based on account type
        if (account === null) {
          // Return valid BudgetUtilization object
          resolve({ percentage: 0, utilized: 0, total: 0 });
        } else {
          let percentage: number;
          let utilized: number;
          let total: number;

          switch (account.tipo) {
            case 'Checking':
              total = 5000; // Example budget total
              utilized = parseFloat((Math.random() * total).toFixed(2));
              percentage = parseFloat(((utilized / total) * 100).toFixed(2));
              resolve({ percentage: percentage, utilized: utilized, total: total });
              break;
            case 'Savings':
              resolve({ percentage: 0, utilized: 0, total: 0 }); // Savings typically don't have budget utilization
              break;
            case 'Credit Card':
              total = 10000; // Example credit limit
              utilized = Math.abs(account.saldo); // Use absolute value of current balance as utilized
              percentage = parseFloat(((utilized / total) * 100).toFixed(2));
              resolve({ percentage: percentage, utilized: utilized, total: total });
              break;
            case 'Loan':
              resolve({ percentage: 0, utilized: 0, total: 0 }); // Loans typically don't have budget utilization
              break;
            default:
              resolve({ percentage: 0, utilized: 0, total: 0 });
              break;
          }
        }
      }, 700);
    });
  }

  async fetchIncomeExpenseChartData(account: Account | null): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate data fetching based on account type
        if (account === null) {
          resolve({ labels: [], datasets: [] });
        } else {
          switch (account.tipo) {
            case 'Checking':
              resolve({
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                  { label: 'Ingresos', data: [parseFloat((Math.random() * 1500 + 2000).toFixed(2)), parseFloat((Math.random() * 1000 + 2000).toFixed(2)), parseFloat((Math.random() * 800 + 1500).toFixed(2)), parseFloat((Math.random() * 1200 + 2500).toFixed(2)), parseFloat((Math.random() * 1000 + 1500).toFixed(2)), parseFloat((Math.random() * 1300 + 1900).toFixed(2))], backgroundColor: '#28a745' },
                  { label: 'Gastos', data: [parseFloat((Math.random() * 1000 + 1500).toFixed(2)), parseFloat((Math.random() * 800 + 1000).toFixed(2)), parseFloat((Math.random() * 1500 + 2000).toFixed(2)), parseFloat((Math.random() * 1200 + 1500).toFixed(2)), parseFloat((Math.random() * 2000 + 2500).toFixed(2)), parseFloat((Math.random() * 1300 + 1400).toFixed(2))], backgroundColor: '#dc3545' },
                ],
              });
              break;
            case 'Savings':
              resolve({
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                  { label: 'Crecimiento', data: [parseFloat((Math.random() * 50 + 1000).toFixed(2)), parseFloat((Math.random() * 60 + 1050).toFixed(2)), parseFloat((Math.random() * 70 + 1100).toFixed(2)), parseFloat((Math.random() * 80 + 1150).toFixed(2)), parseFloat((Math.random() * 90 + 1200).toFixed(2)), parseFloat((Math.random() * 100 + 1250).toFixed(2))], backgroundColor: '#007bff' },
                ],
              });
              break;
            case 'Credit Card':
            case 'Loan':
            case 'Investment':
            case 'Cash':
              resolve({
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                  { label: 'Ingresos', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#28a745' },
                  { label: 'Gastos', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#dc3545' },
                ],
              });
              break;
            default:
              resolve({
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                  { label: 'Ingresos', data: [parseFloat((Math.random() * 1500 + 2000).toFixed(2)), parseFloat((Math.random() * 1000 + 2000).toFixed(2)), parseFloat((Math.random() * 800 + 1500).toFixed(2)), parseFloat((Math.random() * 1200 + 2500).toFixed(2)), parseFloat((Math.random() * 1000 + 1500).toFixed(2)), parseFloat((Math.random() * 1300 + 1900).toFixed(2))], backgroundColor: '#28a745' },
                  { label: 'Gastos', data: [parseFloat((Math.random() * 1000 + 1500).toFixed(2)), parseFloat((Math.random() * 800 + 1000).toFixed(2)), parseFloat((Math.random() * 1500 + 2000).toFixed(2)), parseFloat((Math.random() * 1200 + 1500).toFixed(2)), parseFloat((Math.random() * 2000 + 2500).toFixed(2)), parseFloat((Math.random() * 1300 + 1400).toFixed(2))], backgroundColor: '#dc3545' },
                ],
              });
              break;
          }
        }
      }, 1200);
    });
  }

  async fetchRecentTransactions(account: Account | null): Promise<Transaction[]> {
    console.log(`WorkspaceRecentTransactions called with account: ${account ? account.nombre : 'null'}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (account === null) {
          resolve([]); // Resolve with empty array if no account is selected
        } else {
          switch (account.tipo) {
            case 'Checking':
              resolve([
                { id: 1, description: 'Compras de comestibles', amount: parseFloat((Math.random() * -40 - 20).toFixed(2)), date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) },
                { id: 2, description: 'Depósito de salario', amount: parseFloat((Math.random() * 500 + 2000).toFixed(2)), date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) },
                { id: 3, description: 'Pago de alquiler', amount: parseFloat((Math.random() * -100 - 700).toFixed(2)), date: new Date(Date.now() - Math.random() * 8 * 24 * 60 * 60 * 1000) },
                { id: 4, description: 'Cena con amigos', amount: parseFloat((Math.random() * -30 - 20).toFixed(2)), date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) },
                { id: 5, description: 'Transferencia', amount: parseFloat((Math.random() * -200).toFixed(2)), date: new Date(Date.now() - Math.random() * 1 * 24 * 60 * 60 * 1000) },
              ]);
              break;
            case 'Savings':
              resolve([
                { id: 6, description: 'Intereses ganados', amount: parseFloat((Math.random() * 10 + 1).toFixed(2)), date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) },
                { id: 7, description: 'Transferencia interna', amount: parseFloat((Math.random() * -500 - 100).toFixed(2)), date: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) },
              ]);
              break;
            case 'Credit Card':
            case 'Loan':
            case 'Investment':
            case 'Cash':
              resolve([
                { id: 8, description: 'Pago de factura', amount: parseFloat((Math.random() * 100 + 50).toFixed(2)), date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) },
                { id: 9, description: 'Compra en línea', amount: parseFloat((Math.random() * -100 - 20).toFixed(2)), date: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) },
              ]);
              break;
            default:
              resolve([
                { id: 10, description: 'Transacción genérica 1', amount: parseFloat((Math.random() * -100).toFixed(2)), date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) },
                { id: 11, description: 'Transacción genérica 2', amount: parseFloat((Math.random() * 50).toFixed(2)), date: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) },
              ]);
              break;
          }
        }
      }, 900);
    });
  }

  async fetchSavingsGoals(account: Account | null): Promise<SavingsGoal[]> {
    console.log(`WorkspaceSavingsGoals called with account: ${account ? account.nombre : 'null'}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (account === null) {
          resolve([]); // Resolve with empty array if no account is selected
        } else {
          switch (account.tipo) {
            case 'Checking':
              resolve([
                { id: 1, name: 'Fondo de Vacaciones', currentAmount: parseFloat((Math.random() * 500 + 200).toFixed(2)), targetAmount: 2000 },
                { id: 2, name: 'Nueva computadora portátil', currentAmount: parseFloat((Math.random() * 300 + 900).toFixed(2)), targetAmount: 1500 },
              ]);
              break;
            case 'Savings':
              resolve([
                { id: 3, name: 'Enganche de coche', currentAmount: parseFloat((Math.random() * 1000 + 2000).toFixed(2)), targetAmount: 5000 },
                { id: 4, name: 'Reforma de cocina', currentAmount: parseFloat((Math.random() * 200 + 300).toFixed(2)), targetAmount: 10000 },
                { id: 5, name: 'Fondo de Emergencia', currentAmount: parseFloat((Math.random() * 1000 + 4000).toFixed(2)), targetAmount: 5000 },
              ]);
              break;
            case 'Credit Card':
            case 'Loan':
            case 'Investment':
            case 'Cash':
              resolve([]); // No savings goals for these types
              break;
            default:
              resolve([
                { id: 1, name: 'Fondo de Vacaciones', currentAmount: parseFloat((Math.random() * 500 + 200).toFixed(2)), targetAmount: 2000 },
              ]);
              break;
          }
        }
      }, 800);
    });
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
