import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Platform, IonApp, IonRouterOutlet, IonMenu } from '@ionic/angular/standalone'; // IonicModule REMOVED, added IonApp and IonRouterOutlet
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { SideMenuComponent } from './component/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    // IonicModule, // REMOVE THIS LINE
    IonApp, // Add IonApp
    IonRouterOutlet, // Add IonRouterOutlet (if not already present)
    IonMenu,
    SideMenuComponent,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSubscription!: Subscription;

  constructor(
    private storage: Storage,
    private platform: Platform,
    private authService: AuthService,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      // Cualquier otra lógica de inicialización específica de la plataforma
    });
  }

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated.subscribe(
      (isAuthenticated) => {
        console.log('App authenticated state:', isAuthenticated);
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
