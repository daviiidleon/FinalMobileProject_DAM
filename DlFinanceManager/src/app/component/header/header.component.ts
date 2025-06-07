// src/app/component/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // <-- ¡IMPORTANTE! Añade esta importación
import {
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonIcon,
  IonButton
} from "@ionic/angular/standalone";
import { AccountService } from 'src/app/services/account.service';
import { ClientAccount } from 'src/app/page/cuentas/cuentas.page'; // Asegúrate de la ruta correcta
import { addIcons } from 'ionicons';
import { walletOutline, chevronDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  styleUrls: ['./header.component.scss'],
  imports: [
    CommonModule, // <-- ¡Añade CommonModule aquí!
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonSearchbar,
    IonLabel,
    IonIcon,
    IonButton,
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageTitle: string = 'DL Finance Manager';
  private routerSubscription: Subscription | undefined;
  private accountSubscription!: Subscription;
  selectedAccount: ClientAccount | null = null; // Propiedad para almacenar la cuenta seleccionada

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {
    addIcons({
      walletOutline,
      chevronDownOutline // Asegúrate de que este icono está añadido
    });
  }

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.pageTitle = this.getPageTitle(event.urlAfterRedirects);
      });

    // Suscribirse a los cambios de la cuenta seleccionada desde el AccountService
    this.accountSubscription = this.accountService.selectedAccount$.subscribe(account => {
      this.selectedAccount = account;
      console.log('Header: Cuenta seleccionada actualizada:', account?.nombre);
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

  getPageTitle(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0) return 'DL Finance Manager';
    const title = segments[segments.length - 1];
    switch(title) {
      case 'dashboard': return 'Dashboard';
      case 'cuentas': return 'Cuentas';
      case 'transacciones': return 'Transacciones';
      case 'ahorro': return 'Ahorro';
      case 'presupuestos': return 'Presupuestos';
      case 'predicciones': return 'Predicciones';
      case 'reportes': return 'Reportes';
      case 'configuracion': return 'Configuración';
      default: return title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');
    }
  }

  openAccountSelector() {
    console.log('Header: Abrir selector de cuentas (navegando a /cuentas).');
    this.router.navigateByUrl('/cuentas');
  }
}
