import { Component, OnInit, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFooter,
  IonAvatar,
  IonMenuToggle,
  IonButton,
  IonImg,
  IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  clipboardSharp, gitCompareSharp, albumsSharp, newspaperSharp,
  trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp,
  logOutOutline, personCircleOutline, chevronBackOutline, chevronForwardOutline, menuOutline
} from 'ionicons/icons';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service'; // ¡¡¡IMPORTADO!!!

// Interface for menu items
interface MenuItem {
  title: string;
  path: string;
  icon: string;
  active?: boolean;
}

// Interface for user information
interface UserInfo {
  name: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonFooter,
    IonAvatar,
    IonMenuToggle,
    IonButton,
    IonImg,
    IonButtons,
  ],
})
export class SideMenuComponent implements OnInit {
  @HostBinding('class.collapsed') isCollapsed = false;
  @Output() collapsedStateChanged = new EventEmitter<boolean>();

  mainMenuItems: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: 'clipboard-sharp' },
    { title: 'Transacciones', path: '/transacciones', icon: 'git-compare-sharp' },
    { title: 'Cuentas', path: '/cuentas', icon: 'albums-sharp' },
    { title: 'Presupuestos', path: '/presupuestos', icon: 'newspaper-sharp' },
    { title: 'Ahorro', path: '/ahorro', icon: 'trending-up-sharp' },
    { title: 'Predicciones', path: '/predicciones', icon: 'stats-chart-sharp' },
    { title: 'Reportes', path: '/reportes', icon: 'document-text-sharp' },
  ];

  footerMenuItems: MenuItem[] = [
    { title: 'Configuración', path: '/configuracion', icon: 'cog-sharp' },
  ];

  currentUser: UserInfo = {
    name: 'Usuario Desarrollador',
    avatarUrl: 'https://placehold.co/40x40/E0E0E0/757575?text=U'
  };

  appLogoPath = 'assets/Header-removebg-preview.png';

  isMobileView = false;

  constructor(private router: Router, private authService: AuthService) { // ¡¡¡AUTHSERVICE INYECTADO!!!
    addIcons({
      clipboardSharp, gitCompareSharp, albumsSharp, newspaperSharp,
      trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp,
      logOutOutline, personCircleOutline, chevronBackOutline, chevronForwardOutline, menuOutline
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveState(event.urlAfterRedirects || event.url);
    });
  }

  ngOnInit() {
    this.updateActiveState(this.router.url);
    this.checkScreenWidth(window.innerWidth);
    if (!this.isMobileView && localStorage.getItem('sidebarCollapsed') === 'true') {
      this.isCollapsed = true;
    }
    this.collapsedStateChanged.emit(this.isCollapsed);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth(event.target.innerWidth);
  }

  checkScreenWidth(width: number) {
    const previouslyMobile = this.isMobileView;
    this.isMobileView = width < 992;

    if (previouslyMobile && !this.isMobileView && localStorage.getItem('sidebarCollapsed') === 'true') {
      this.isCollapsed = true;
    } else if (this.isMobileView) {
      this.isCollapsed = false;
    }
    this.collapsedStateChanged.emit(this.isCollapsed);
  }

  toggleCollapse(): void {
    if (!this.isMobileView) {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
      this.collapsedStateChanged.emit(this.isCollapsed);
    }
  }

  goTo(path: string, event?: MouseEvent): void {
    this.router.navigate([path]);
  }

  updateActiveState(currentUrl: string): void {
    const setActive = (items: MenuItem[]) => {
      items.forEach(item => {
        item.active = currentUrl.startsWith(item.path);
      });
    };
    setActive(this.mainMenuItems);
    setActive(this.footerMenuItems);
  }

  // ¡¡¡MÉTODO LOGOUT MODIFICADO Y CON CONSOLE.LOG DE DEBUG!!!
  async logout(): Promise<void> {
    console.log('DEBUG: El clic en Cerrar Sesión llegó al método logout() en SideMenuComponent.'); // <-- ¡¡ESTA LÍNEA ES CLAVE PARA LA DEPURACIÓN!!
    await this.authService.logout(); // Llama al método logout del servicio
    // El servicio authService.logout() ya se encarga de eliminar el token y navegar a /login
  }
}
