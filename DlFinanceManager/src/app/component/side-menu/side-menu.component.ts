import { Component, OnInit, Output, EventEmitter, HostBinding, HostListener, OnDestroy } from '@angular/core'; // Added OnDestroy
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
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../services/user.service'; // <-- Importar UserProfile
import { environment } from 'src/environments/environment'; // <-- Importar environment
import { Subscription } from 'rxjs'; // <-- Importar Subscription

// Interface for menu items
interface MenuItem {
  title: string;
  path: string;
  icon: string;
  active?: boolean;
}

// Interface for user information (mantendremos esta, pero la llenaremos con datos de UserProfile)
interface UserInfo {
  name: string;
  avatarUrl?: string; // Ahora puede ser la URL completa del avatar
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
export class SideMenuComponent implements OnInit, OnDestroy { // Implementar OnDestroy
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

  // Mantendremos currentUser y lo actualizaremos con los datos del AuthService
  currentUser: UserInfo = {
    name: 'Usuario Desarrollador', // Valor inicial por defecto
    avatarUrl: 'https://placehold.co/40x40/2c2c2c/faf6e9?text=U' // Placeholder por defecto
  };

  appLogoPath = 'assets/Header-removebg-preview.png';

  isMobileView = false;

  private userSubscription: Subscription | undefined; // Para gestionar la suscripción

  constructor(private router: Router, private authService: AuthService) {
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

    // Suscribirse a los cambios del usuario desde AuthService
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser.name = user.name;
        // Construir la URL completa del avatar
        if (user.profile_picture_url) {
          // Usamos environment.baseUrl para construir la URL completa
          this.currentUser.avatarUrl = environment.baseUrl + user.profile_picture_url;
        } else {
          // Si no hay avatar, usa el placeholder por defecto
          this.currentUser.avatarUrl = 'https://placehold.co/40x40/2c2c2c/faf6e9?text=U';
        }
      } else {
        // Si no hay usuario (sesión cerrada), restablecer a valores por defecto
        this.currentUser.name = 'Usuario Desarrollador';
        this.currentUser.avatarUrl = 'https://placehold.co/40x40/2c2c2c/faf6e9?text=U';
      }
    });
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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

  async logout(): Promise<void> {
    console.log('DEBUG: El clic en Cerrar Sesión llegó al método logout() en SideMenuComponent.');
    await this.authService.logout();
  }
}
