import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
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
  arrowUpCircleOutline,
  arrowDownCircleOutline
} from 'ionicons/icons';

import { AccountService, Account } from '../../services/account.service';
import { ClientAccount } from '../cuentas/cuentas.page';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// --- Interfaces ---
interface Balance { current: number; }
interface IncomeExpense { income: number; expense: number; }
interface BudgetUtilization { percentage: number; total?: number; utilized?: number; }
interface Transaction { id: number | string; description: string; amount: number; date: string; type: 'income' | 'expense'; }
interface SavingsGoal { id: string; nombre: string; montoActual: number; montoMeta: number; }

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonIcon,
    IonButton, IonSpinner, SideMenuComponent, IonButtons, IonMenuButton, IonLabel,
  ],
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  currentBalance: Balance | null = null;
  monthlyIncomeExpense: IncomeExpense | null = null;
  budgetUtilization: BudgetUtilization | null = null;
  recentTransactions: Transaction[] = [];
  savingsGoals: SavingsGoal[] = [];

  private incomeExpenseChartData: any;
  @ViewChild('incomeExpenseChart') private incomeExpenseChartRef!: ElementRef;
  public chart: any;

  isLoading: boolean = false;
  hideBalance: boolean = false;
  selectedDisplayAccount: ClientAccount | null = null;

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private accountService: AccountService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {
    addIcons({
      walletOutline, trendingUpOutline, arrowDownOutline, arrowUpOutline, addOutline, eyeOutline, eyeOffOutline,
      chevronForwardOutline, cashOutline, receiptOutline, statsChartOutline, chevronDownOutline, arrowUpCircleOutline, arrowDownCircleOutline
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.accountService.selectedAccount$.subscribe(account => {
        this.selectedDisplayAccount = account;
        this.loadDashboardDataForAccount(account);
      })
    );
    this.loadInitialAccountsAndSetDefault();
  }

  async loadInitialAccountsAndSetDefault() {
    this.subscriptions.add(
      this.accountService.getAccounts().pipe(
        map((apiAccounts: Account[]) => apiAccounts.map(apiAcc => ({
          id: apiAcc.id,
          nombre: apiAcc.name,
          tipo: apiAcc.type,
          saldo: apiAcc.current_balance ?? 0,
          institucion: apiAcc.institution || '',
          fechaActualizacion: apiAcc.updated_at
        })))
      ).subscribe({
        next: (clientAccounts: ClientAccount[]) => {
          if (!this.accountService.getSelectedAccount() && clientAccounts.length > 0) {
            this.accountService.setSelectedAccount(clientAccounts[0]);
          } else if (clientAccounts.length === 0) {
            this.accountService.setSelectedAccount(null);
          }
        },
        error: (err) => {
          console.error('Error cargando cuentas iniciales en Dashboard:', err);
          this.presentToast('Error al cargar la lista de cuentas.', 'danger');
        }
      })
    );
  }

  ngAfterViewInit(): void { }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.chart) { this.chart.destroy(); }
  }

  async loadDashboardDataForAccount(account: ClientAccount | null) {
    this.isLoading = true;

    if (!account) {
      this.resetDashboardData(true);
      this.savingsGoals = await this.fetchUserSavingsGoals();
      this.isLoading = false;
      this.cdRef.detectChanges();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Cargando datos...' });
    await loading.present();

    try {
      // Obtenemos los datos base en paralelo
      const [
        currentBalance,
        budgetUtilization,
        allTransactions, // Esta es la fuente de datos principal
        savingsGoals
      ] = await Promise.all([
        this.fetchCurrentBalance(account),
        this.fetchBudgetUtilization(account),
        this.fetchAllTransactionsForAccount(account),
        this.fetchUserSavingsGoals()
      ]);

      // ** CALCULOS DINÁMICOS BASADOS EN TRANSACCIONES **

      // 1. Calcular ingresos/gastos del mes para las tarjetas
      this.monthlyIncomeExpense = this.calculateCurrentMonthIncomeExpense(allTransactions);

      // 2. Generar datos del gráfico para los últimos 6 meses
      this.incomeExpenseChartData = this.generateChartDataFromTransactions(allTransactions);

      // 3. Asignar el resto de los datos a la UI
      this.currentBalance = currentBalance;
      this.budgetUtilization = budgetUtilization;
      this.recentTransactions = allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
      this.savingsGoals = savingsGoals;

      this.cdRef.detectChanges();

      // Finalmente, crear el gráfico
      setTimeout(() => {
        this.createIncomeExpenseChart();
      }, 150);

    } catch (error: any) {
      console.error('Error al cargar datos del dashboard:', error);
      this.presentToast(`Error al cargar datos: ${error.message || 'Error desconocido'}`, 'danger');
      this.resetDashboardData(true);
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  resetDashboardData(isFullReset = false) {
    this.currentBalance = { current: 0 };
    this.monthlyIncomeExpense = { income: 0, expense: 0 };
    this.budgetUtilization = { percentage: 0 };
    this.incomeExpenseChartData = null;
    this.recentTransactions = [];
    if (isFullReset) { this.savingsGoals = []; }
    if (this.chart) { this.chart.destroy(); this.chart = null; }
    this.cdRef.detectChanges();
  }

  // --- Funciones Fetch (Simuladas) ---
  async fetchCurrentBalance(account: ClientAccount): Promise<Balance> { return { current: account.saldo ?? 0 }; }
  async fetchBudgetUtilization(account: ClientAccount): Promise<BudgetUtilization> { if(account.id === 1) return { percentage: 75 }; return { percentage: 45 }; }
  async fetchUserSavingsGoals(): Promise<SavingsGoal[]> {
    return new Promise((resolve) => {
      const storedObjetivos = localStorage.getItem('objetivosAhorro') || '[]';
      let allObjetivos: SavingsGoal[] = [];
      try { allObjetivos = JSON.parse(storedObjetivos); } catch (e) { console.error('Error parsing stored savings goals:', e); }
      resolve(allObjetivos.slice(-3).reverse());
    });
  }

  /**
   * **FUNCIÓN CORREGIDA**
   * Simula la obtención de TODAS las transacciones para una cuenta de forma dinámica.
   * Ahora genera datos diferentes para cada cuenta.
   */
  async fetchAllTransactionsForAccount(account: ClientAccount): Promise<Transaction[]> {
    const generatedTransactions: Transaction[] = [];
    const today = new Date();
    // **CORRECCIÓN**: Aseguramos que accountSeed sea siempre un número.
    // Si el id no es un número (es string o undefined), usamos 1 como valor por defecto.
    const accountSeed = typeof account.id === 'number' ? account.id : 1;

    // Generar transacciones para los últimos 6 meses
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);

      // Ingreso mensual (ej. Salario)
      generatedTransactions.push({
        id: `inc-${accountSeed}-${i}`,
        description: `Ingreso del mes ${i+1}`,
        amount: 1500 + (accountSeed * 100) - (i * 50), // Cantidad varía por cuenta y mes
        date: new Date(monthDate.setDate(1)).toISOString(),
        type: 'income',
      });

      // Varios gastos por mes
      const numExpenses = 2 + (accountSeed % 3); // Entre 2 y 4 gastos
      for (let j = 0; j < numExpenses; j++) {
        generatedTransactions.push({
          id: `exp-${accountSeed}-${i}-${j}`,
          description: `Gasto aleatorio ${j+1}`,
          amount: 50 + (accountSeed * 10) + (j * 20) + Math.random() * 100, // Gasto variable
          date: new Date(monthDate.setDate(5 + j * 5)).toISOString(),
          type: 'expense',
        });
      }
    }
    console.log(`Generated ${generatedTransactions.length} transactions for account ID ${account.id}`);
    return generatedTransactions;
  }


  // --- Funciones de Cálculo ---

  /**
   * Calcula los ingresos y gastos totales para el mes actual.
   * @param transactions - La lista completa de transacciones de la cuenta.
   * @returns Un objeto IncomeExpense para las tarjetas de resumen.
   */
  private calculateCurrentMonthIncomeExpense(transactions: Transaction[]): IncomeExpense {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        if (tx.type === 'income') {
          income += tx.amount;
        } else {
          expense += tx.amount;
        }
      }
    }
    return { income, expense };
  }

  /**
   * Genera los datos para el gráfico a partir de una lista de transacciones.
   */
  private generateChartDataFromTransactions(transactions: Transaction[]): any {
    if (!transactions || transactions.length === 0) {
      return { labels: [], datasets: [] };
    }

    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    const labels: string[] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = date.toLocaleString('es-ES', { month: 'short', year: '2-digit' }).replace('.', '');
      labels.push(monthYear);
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      const monthYear = txDate.toLocaleString('es-ES', { month: 'short', year: '2-digit' }).replace('.', '');
      if (monthlyData[monthYear]) {
        if (tx.type === 'income') {
          monthlyData[monthYear].income += tx.amount;
        } else if (tx.type === 'expense') {
          monthlyData[monthYear].expense += tx.amount;
        }
      }
    }

    const incomeValues = labels.map(label => monthlyData[label].income);
    const expenseValues = labels.map(label => monthlyData[label].expense);

    return {
      labels: labels,
      datasets: [
        { label: 'Ingresos', data: incomeValues, backgroundColor: '#28a745' },
        { label: 'Gastos', data: expenseValues, backgroundColor: '#dc3545' }
      ]
    };
  }

  // --- Renderizado del Gráfico ---
  createIncomeExpenseChart(): void {
    if (!this.incomeExpenseChartRef?.nativeElement) return;
    const ctx = this.incomeExpenseChartRef.nativeElement.getContext('2d');
    if (this.chart) { this.chart.destroy(); }

    if (ctx && this.incomeExpenseChartData && this.incomeExpenseChartData.datasets.length > 0) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: this.incomeExpenseChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { callback: (value: any) => value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) } },
            x: { grid: { display: false } }
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: { callbacks: { label: (c: any) => `${c.dataset.label}: ${Number(c.parsed.y).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}` } }
          }
        },
      });
    } else {
      console.warn('No se creará el gráfico: no hay datos o el canvas no está listo.');
    }
  }

  // --- Métodos de utilidad ---
  toggleHideBalance() { this.hideBalance = !this.hideBalance; }
  formatDate(isoDate: string): string { return formatDate(isoDate, 'dd MMM, y', 'es-ES'); }
  getAccountBalanceForDisplay(account: ClientAccount | null): string { if (!account) return '...'; if (this.hideBalance) return '••••••'; return account.saldo.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }); }
  openAccountSelector() { this.router.navigateByUrl('/cuentas'); }
  async presentToast(message: string, color: string = 'primary') { const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'bottom' }); toast.present(); }
}
