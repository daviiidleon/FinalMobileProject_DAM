import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridSharp,
  swapHorizontalSharp,
  walletSharp,
  calculatorSharp,
  ribbonSharp,
  trendingUpSharp,
  barChartSharp,
  settingsSharp
} from 'ionicons/icons';
import {RouterLink} from "@angular/router";

// Registrar iconos
addIcons({
  gridSharp,
  swapHorizontalSharp,
  walletSharp,
  calculatorSharp,
  ribbonSharp,
  trendingUpSharp,
  barChartSharp,
  settingsSharp
});

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    RouterLink
  ],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  menu = [
    { title: 'Dashboard', icon: gridSharp, url: '/dashboard' },
    { title: 'Transacciones', icon: swapHorizontalSharp, url: '/transacciones' },
    { title: 'Cuentas', icon: walletSharp, url: '/cuentas' },
    { title: 'Presupuestos', icon: calculatorSharp, url: '/presupuestos' },
    { title: 'Ahorro', icon: ribbonSharp, url: '/ahorro' },
    { title: 'Predicciones', icon: trendingUpSharp, url: '/predicciones' },
    { title: 'Reportes', icon: barChartSharp, url: '/reportes' },
    { title: 'Configuración', icon: settingsSharp, url: '/configuracion' }
  ];
}

