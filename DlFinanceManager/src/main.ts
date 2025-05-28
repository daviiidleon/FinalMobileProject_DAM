import { enableProdMode, APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular'; // Importa la CLASE Storage directamente

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import { AuthInterceptor } from './app/interceptors/auth.interceptor'; // Importa tu interceptor
import { AuthService } from './app/services/auth.service'; // Importa tu AuthService

if (environment.production) {
  enableProdMode();
}

// Función para inicializar Ionic Storage de forma asíncrona
function initializeStorage(storage: Storage) {
  return async () => {
    await storage.create();
    console.log('APP_INITIALIZER: Ionic Storage database created successfully.');
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()), // Esto habilita el DI para interceptores

    // Provisión de Storage
    // Angular inyectará una instancia de Storage aquí.
    // Su inicialización se hará a través de APP_INITIALIZER.
    Storage, // Simplemente registra la clase Storage como un proveedor

    // ¡¡Usa APP_INITIALIZER para asegurar que Storage.create() se complete antes de que la app arranque!!
    {
      provide: APP_INITIALIZER,
      useFactory: initializeStorage,
      deps: [Storage], // Indica que esta factoría depende de la instancia de Storage
      multi: true // Permite que haya múltiples inicializadores
    },

    // Registro del Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
});
