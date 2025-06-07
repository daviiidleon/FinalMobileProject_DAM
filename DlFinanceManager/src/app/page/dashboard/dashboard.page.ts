// src/app/pages/dashboard/dashboard.page.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
  LoadingController,
  AlertController,
  ToastController,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { SideMenuComponent } from '../../component/side-menu/side-menu.component';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  trendingUpOutline,
  arrowDownOutline,
  arrowUpOutline,
  addOutline,
  eyeOutline,
  eyeOffOutline,
  chevronForwardOutline,
  cashOutline,
  receiptOutline,
  statsChartOutline,
  chevronDownOutline,
} from 'ionicons/icons';

import { AccountService, Account } from '../../services/account.service'; // Account ahora tiene current_balance
import { ClientAccount } from '../cuentas/cuentas.page';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Balance {
  current: number;
}

interface IncomeExpense {
  income: number;
  expense: number;
}

interface BudgetUtilization {
  percentage: number;
  total?: number;
  utilized?: number;
}

interface Transaction {
  id: number | string;
  description: string;
  amount: number;
  date: string;
  type?: string;
}

interface SavingsGoal {
  id: string;
  nombre: string;
  montoActual: number;
  montoMeta: number;
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
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonSpinner,
    SideMenuComponent,
    IonButtons,
    IonMenuButton,
    IonLabel,
  ],
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  currentBalance: Balance | null = null;
  monthlyIncomeExpense: IncomeExpense | null = null;
  budgetUtilization: BudgetUtilization | null = null;

  incomeExpenseChartData: any;
  @ViewChild('incomeExpenseChart') incomeExpenseChartRef!: ElementRef;
  public chart: any;

  recentTransactions: Transaction[] = [];
  savingsGoals: SavingsGoal[] = [];

  isLoading: boolean = false;
  hideBalance: boolean = false;

  selectedDisplayAccount: ClientAccount | null = null;

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private accountService: AccountService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {
    addIcons({
      walletOutline,
      trendingUpOutline,
      arrowDownOutline,
      arrowUpOutline,
      addOutline,
      eyeOutline,
      eyeOffOutline,
      chevronForwardOutline,
      cashOutline,
      receiptOutline,
      statsChartOutline,
      chevronDownOutline,
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.accountService.selectedAccount$.subscribe(account => {
        this.selectedDisplayAccount = account;
        console.log('Dashboard: Cuenta seleccionada recibida:', account?.nombre);
        if (account) {
          this.loadDashboardDataForAccount(account);
        } else {
          this.resetDashboardData();
          this.isLoading = false;
        }
      })
    );

    this.loadInitialAccountsAndSetDefault();
  }

  async loadInitialAccountsAndSetDefault() {
    this.subscriptions.add(
      this.accountService.getAccounts().pipe(
        map((apiAccounts: Account[]) => {
          return apiAccounts.map(apiAcc => ({
            id: apiAcc.id,
            nombre: apiAcc.name,
            tipo: apiAcc.type,
            // ===> CAMBIO CLAVE AQUÍ: Usar apiAcc.current_balance <===
            saldo: apiAcc.current_balance ?? 0, // Usar apiAcc.current_balance
            institucion: apiAcc.institution || '',
            fechaActualizacion: apiAcc.updated_at
          }));
        })
      ).subscribe({
        next: (clientAccounts: ClientAccount[]) => {
          if (!this.accountService.getSelectedAccount() && clientAccounts.length > 0) {
            this.accountService.setSelectedAccount(clientAccounts[0]);
            console.log('Dashboard: Estableciendo la primera cuenta como seleccionada por defecto.');
          } else if (clientAccounts.length === 0) {
            this.accountService.setSelectedAccount(null);
            console.log('Dashboard: No hay cuentas disponibles, deseleccionando.');
          }
        },
        error: (err) => {
          console.error('Error cargando cuentas iniciales en Dashboard:', err);
          this.accountService.setSelectedAccount(null);
          this.presentToast('Error al cargar la lista de cuentas inicial.','danger');
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // La creación del gráfico se llama desde `loadDashboardDataForAccount` y `resetDashboardData`
    // con un setTimeout para asegurar que el canvas esté en el DOM.
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  async loadDashboardDataForAccount(account: ClientAccount | null) {
    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos del dashboard...',
      spinner: 'crescent',
    });
    if (account) {
      await loading.present();
      console.log(`Dashboard: Iniciando carga de datos para cuenta: ${account.nombre}`);
    } else {
      console.log('Dashboard: No hay cuenta seleccionada, reseteando datos del dashboard.');
      this.resetDashboardData();
      this.isLoading = false;
      return;
    }

    try {
      const [
        currentBalance,
        monthlyIncomeExpense,
        budgetUtilization,
        incomeExpenseChartData,
        recentTransactions,
        savingsGoals
      ] = await Promise.all([
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

      this.cdRef.detectChanges();
      setTimeout(() => {
        this.createIncomeExpenseChart();
      }, 50);
      console.log('Dashboard: Todos los datos cargados y chart creado.');

    } catch (error: any) {
      console.error('Error al cargar datos del dashboard para la cuenta:', error);
      this.presentToast(`Error al cargar datos del dashboard: ${error.message || 'Error desconocido'}`,'danger');
      this.resetDashboardData();
    } finally {
      this.isLoading = false;
      await loading.dismiss().catch(() => {});
    }
  }

  resetDashboardData() {
    this.currentBalance = { current: this.selectedDisplayAccount ? this.selectedDisplayAccount.saldo : 0 };
    this.monthlyIncomeExpense = { income: 0, expense: 0 };
    this.budgetUtilization = { percentage: 0, utilized: 0, total: 0 };
    this.incomeExpenseChartData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
      datasets: [
        { label: 'Ingresos', data: [0, 0, 0, 0, 0], backgroundColor: '#28a745' },
        { label: 'Gastos', data: [0, 0, 0, 0, 0], backgroundColor: '#dc3545' },
      ]
    };
    this.recentTransactions = [];
    this.savingsGoals = [];

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.createIncomeExpenseChart();
    }, 50);
    console.log('Dashboard: Datos del dashboard reseteados.');
  }

  // --- Funciones fetch simuladas, REEMPLAZAR CON LLAMADAS A TU API ---

  async fetchCurrentBalance(account: ClientAccount | null): Promise<Balance> {
    console.log(`fetchCurrentBalance called with account: ${account ? account.nombre : 'null'}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ current: account && account.saldo !== undefined && account.saldo !== null ? account.saldo : 0 });
      }, 300);
    });
  }

  async fetchMonthlyIncomeExpense(account: ClientAccount | null): Promise<IncomeExpense> {
    console.log(`fetchMonthlyIncomeExpense called with account: ${account ? account.nombre : 'null'}`);
    return new Promise(resolve => {
      setTimeout(() => {
        if (account && account.id) {
          switch (account.id) {
            case 1: resolve({ income: 2500, expense: 1800 }); break;
            case 2: resolve({ income: 800, expense: 600 }); break;
            default: resolve({ income: 0, expense: 0 });
          }
        } else {
          resolve({ income: 0, expense: 0 });
        }
      }, 400);
    });
  }

  async fetchBudgetUtilization(account: ClientAccount | null): Promise<BudgetUtilization> {
    console.log(`fetchBudgetUtilization called with account: ${account ? account.nombre : 'null'}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (account && account.id === 1) {
          resolve({ percentage: 75, utilized: 750, total: 1000 });
        } else {
          resolve({ percentage: 0, utilized: 0, total: 0 });
        }
      }, 350);
    });
  }

  async fetchIncomeExpenseChartData(account: ClientAccount | null): Promise<any> {
    console.log(`fetchIncomeExpenseChartData called with account: ${account ? account.nombre : 'null'}`);
    return new Promise(resolve => {
      setTimeout(() => {
        if (account && account.id) {
          switch (account.id) {
            case 1:
              resolve({
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
                datasets: [
                  { label: 'Ingresos', data: [1200, 1500, 1300, 1600, 1400], backgroundColor: '#28a745' },
                  { label: 'Gastos', data: [800, 900, 700, 1000, 850], backgroundColor: '#dc3545' },
                ]
              });
              break;
            case 2:
              resolve({
                labels: ['Marzo', 'Abril', 'Mayo'],
                datasets: [
                  { label: 'Ingresos', data: [300, 500, 400], backgroundColor: '#28a745' },
                  { label: 'Gastos', data: [200, 350, 300], backgroundColor: '#dc3545' },
                ]
              });
              break;
            default:
              resolve({
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
                datasets: [
                  { label: 'Ingresos', data: [0, 0, 0, 0, 0], backgroundColor: '#28a745' },
                  { label: 'Gastos', data: [0, 0, 0, 0, 0], backgroundColor: '#dc3545' },
                ]
              });
          }
        } else {
          resolve({
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
            datasets: [
              { label: 'Ingresos', data: [0, 0, 0, 0, 0], backgroundColor: '#28a745' },
              { label: 'Gastos', data: [0, 0, 0, 0, 0], backgroundColor: '#dc3545' },
            ]
          });
        }
      }, 500);
    });
  }

  async fetchRecentTransactions(account: ClientAccount | null): Promise<Transaction[]> {
    console.log(`fetchRecentTransactions called with account: ${account ? account.nombre : 'null'}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (account && account.id) {
          switch (account.id) {
            case 1:
              resolve([
                { id: 1, description: 'Cafetería', amount: 4.50, date: '2025-05-27', type: 'expense' },
                { id: 2, description: 'Transferencia recibida', amount: 200.00, date: '2025-05-26', type: 'income' },
                { id: 3, description: 'Pago de Netflix', amount: 12.99, date: '2025-05-26', type: 'expense' },
              ]);
              break;
            case 2:
              resolve([
                { id: 10, description: 'Alquiler', amount: 800.00, date: '2025-05-01', type: 'expense' },
                { id: 11, description: 'Intereses', amount: 5.00, date: '2025-05-10', type: 'income' },
              ]);
              break;
            default:
              resolve([]);
          }
        } else {
          resolve([]);
        }
      }, 450);
    });
  }

  async fetchSavingsGoals(account: ClientAccount | null): Promise<SavingsGoal[]> {
    console.log(`fetchSavingsGoals called with account: ${account ? account.nombre : 'null'}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const storedObjetivos = localStorage.getItem('objetivosAhorro');
        let allObjetivos: any[] = [];
        if (storedObjetivos) {
          try {
            allObjetivos = JSON.parse(storedObjetivos);
          } catch (e) {
            console.error('Error parsing stored savings goals:', e);
          }
        }
        const filteredGoals: SavingsGoal[] = (account && account.id)
          ? allObjetivos.filter(obj => (obj.accountId === account.id)).map(obj => ({
            id: obj.id,
            nombre: obj.nombre,
            montoActual: obj.montoActual,
            montoMeta: obj.montoMeta,
          }))
          : [];
        resolve(filteredGoals);
      }, 400);
    });
  }

  createIncomeExpenseChart(): void {
    if (this.incomeExpenseChartRef && this.incomeExpenseChartRef.nativeElement) {
      const ctx = this.incomeExpenseChartRef.nativeElement.getContext('2d');

      if (this.chart) {
        this.chart.destroy();
      }

      if (ctx) {
        const chartData = this.incomeExpenseChartData || {
          labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
          datasets: [
            { label: 'Ingresos', data: [0, 0, 0, 0, 0], backgroundColor: '#28a745' },
            { label: 'Gastos', data: [0, 0, 0, 0, 0], backgroundColor: '#dc3545' },
          ]
        };

        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: chartData.datasets,
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
        console.error('Failed to get canvas rendering context. Canvas might not be available.');
      }
    } else {
      console.warn('No se pueden crear los gráficos: referencia al canvas no disponible o `incomeExpenseChartRef` es nulo.');
    }
  }

  toggleHideBalance() {
    this.hideBalance = !this.hideBalance;
  }

  formatDate(isoDate: string): string {
    return formatDate(isoDate, 'MMM d, y', 'es-ES');
  }

  getAccountBalanceForDisplay(account: ClientAccount | null): string {
    if (!account || account.saldo === undefined || account.saldo === null) {
      return this.hideBalance ? '••••••' : '0,00 €';
    }
    const formattedBalance = account.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return this.hideBalance ? '••••••' : `${formattedBalance} €`;
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom',
    });
    toast.present();
  }

  openAccountSelector() {
    this.router.navigateByUrl('/cuentas');
  }
}
