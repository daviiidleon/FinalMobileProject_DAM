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
  trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp, // Original main/footer icons
  logOutOutline, personCircleOutline, // Footer action icons
  chevronBackOutline, chevronForwardOutline, menuOutline // Toggle icons
} from 'ionicons/icons';
import { filter } from 'rxjs/operators';

// Interface for menu items
interface MenuItem {
  title: string;
  path: string;
  icon: string;
  active?: boolean; // To mark the current active route
}

// Interface for user information
interface UserInfo {
  name: string;
  avatarUrl?: string; // Optional avatar image URL
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
    // Added for the logo
  ],
})
export class SideMenuComponent implements OnInit {
  @HostBinding('class.collapsed') isCollapsed = false;
  @Output() collapsedStateChanged = new EventEmitter<boolean>();

  // Original menu items
  mainMenuItems: MenuItem[] = [
    { title: 'Dashboard', path: '/dashboard', icon: 'clipboard-sharp' },
    { title: 'Transacciones', path: '/transacciones', icon: 'git-compare-sharp' },
    { title: 'Cuentas', path: '/cuentas', icon: 'albums-sharp' },
    { title: 'Presupuestos', path: '/presupuestos', icon: 'newspaper-sharp' },
    { title: 'Ahorro', path: '/ahorro', icon: 'trending-up-sharp' },
    { title: 'Predicciones', path: '/predicciones', icon: 'stats-chart-sharp' },
    { title: 'Reportes', path: '/reportes', icon: 'document-text-sharp' },
  ];

  footerMenuItems: MenuItem[] = [ // This is for items styled like main items in footer
    { title: 'Configuración', path: '/configuracion', icon: 'cog-sharp' },
  ];

  currentUser: UserInfo = {
    name: 'Usuario Desarrollador',
    avatarUrl: 'https://placehold.co/40x40/E0E0E0/757575?text=U'
  };

  appLogoPath = 'assets/Header-removebg-preview.png'; // Path to your logo

  isMobileView = false;

  constructor(private router: Router) {
    addIcons({
      clipboardSharp, gitCompareSharp, albumsSharp, newspaperSharp,
      trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp,
      logOutOutline, personCircleOutline, chevronBackOutline, chevronForwardOutline, menuOutline
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveState(event.urlAfterRedirects || event.url);
    });
  }

  ngOnInit() {
    this.updateActiveState(this.router.url);
    this.checkScreenWidth(window.innerWidth);
    // Retrieve collapsed state from localStorage
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
    this.isMobileView = width < 992; // md breakpoint

    if (previouslyMobile && !this.isMobileView && localStorage.getItem('sidebarCollapsed') === 'true') {
      this.isCollapsed = true; // Restore collapsed state if transitioning to desktop
    } else if (this.isMobileView) {
      this.isCollapsed = false; // Always expanded overlay on mobile
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

  logout(): void {
    console.log('Logout action triggered');
    this.router.navigate(['/login']);
  }
}
