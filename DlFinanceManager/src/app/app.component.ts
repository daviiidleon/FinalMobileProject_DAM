import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Asegúrate de CommonModule si usas directivas básicas como NgIf, NgFor
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'; // Importa los componentes de Ionic necesarios

@Component({
  selector: 'app-root', // Este es el selector de tu componente raíz
  templateUrl: 'app.component.html', // La plantilla donde irá el ion-router-outlet
  styleUrls: ['app.component.scss'], // Tus estilos globales para el app-root
  standalone: true, // Indica que es un componente standalone
  imports: [
    CommonModule, // Necesario para directivas estructurales y pipes
    IonApp, // Contenedor principal de la aplicación Ionic
    IonRouterOutlet, // El "outlet" donde el router carga los componentes de la ruta activa
  ],
})
export class AppComponent {
  constructor() {}
}
