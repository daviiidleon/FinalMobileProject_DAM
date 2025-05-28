import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  NavController, // Importa NavController para una redirección más limpia en Ionic
  LoadingController, // Para mostrar un spinner de carga
  AlertController // Para mostrar mensajes de alerta
} from '@ionic/angular/standalone'; // Asegúrate de que todos los componentes estén en standalone

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Asegúrate de que la ruta sea correcta a tu servicio

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    CommonModule,
    FormsModule // Importante para ngModel
  ]
})
export class AuthPage implements OnInit {

  isLogin = true;

  formData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '' // ¡Añadido para la validación de registro de Laravel!
  };

  constructor(
    private router: Router,
    private authService: AuthService, // ¡Inyecta el AuthService!
    private navCtrl: NavController, // Inyecta NavController
    private loadingCtrl: LoadingController, // Inyecta LoadingController
    private alertCtrl: AlertController // Inyecta AlertController
  ) {}

  ngOnInit() {
    // Aquí podrías comprobar si el usuario ya está autenticado y redirigirlo
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Usa NavController para manejar la pila de navegación de Ionic
        this.navCtrl.navigateRoot('/home'); // Redirige a tu página principal si ya está logeado
      }
    });
  }

  toggleAuth() {
    this.isLogin = !this.isLogin;
    this.formData = {
      name: '',
      email: '',
      password: '',
      password_confirmation: '' // Resetea también la confirmación de contraseña
    };
  }

  async onSubmit() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...'
    });
    await loading.present();

    try {
      if (this.isLogin) {
        // Lógica de Login
        const response = await this.authService.login(this.formData).toPromise();
        console.log('Login exitoso:', response);
        // Redirigir a la página principal después de un login exitoso
        this.navCtrl.navigateRoot('/home'); // ¡Cambia '/home' por la ruta de tu dashboard!
      } else {
        // Lógica de Registro
        // Asegúrate de que password_confirmation se envía solo en el registro
        const registerData = {
          name: this.formData.name,
          email: this.formData.email,
          password: this.formData.password,
          password_confirmation: this.formData.password_confirmation
        };
        const response = await this.authService.register(registerData).toPromise();
        console.log('Registro exitoso:', response);
        // Opcional: Redirigir a la página de login para que inicie sesión, o directamente a home
        this.navCtrl.navigateRoot('/home'); // Puedes cambiar esto a '/login' si quieres que se logee tras el registro
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      let errorMessage = 'Ocurrió un error inesperado.';

      if (error.error && error.error.errors) {
        // Errores de validación de Laravel
        const laravelErrors = Object.values(error.error.errors).flat();
        errorMessage = laravelErrors.join('\n');
      } else if (error.error && error.error.message) {
        // Otros mensajes de error de Laravel (ej. credenciales incorrectas para login)
        errorMessage = error.error.message;
      }

      const alert = await this.alertCtrl.create({
        header: 'Error de Autenticación',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();

    } finally {
      await loading.dismiss(); // Asegurarse de que el spinner se cierre
    }
  }
}
