import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IonicModule,
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
    // La creación del storage se movió al AuthService para asegurar que se hace antes de usarse.
    // Aquí puedes dejar otras lógicas de inicialización de la plataforma si las hay.
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
