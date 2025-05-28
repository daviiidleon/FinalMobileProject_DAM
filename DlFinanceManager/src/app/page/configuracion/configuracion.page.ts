import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonAvatar,
  IonLabel,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  LoadingController, // Importado para manejar cargas
  AlertController // Importado para mostrar alertas
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { addIcons } from 'ionicons';
import { personCircleOutline, mailOutline, colorPaletteOutline, notificationsOutline, lockClosedOutline, saveOutline, logOutOutline, cameraOutline } from 'ionicons/icons';

// Importamos el UserService y la interfaz UserProfile
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service'; // Asumiendo que tienes un AuthService con método logout
import { Router } from '@angular/router'; // Para la redirección después del logout

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonAvatar,
    IonLabel,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    HeaderComponent,
    SideMenuComponent,
  ]
})
export class ConfiguracionPage implements OnInit {

  // Usamos el objeto userProfile del UserService
  userProfile: UserProfile = {
    id: 0,
    name: '',
    email: ''
  };

  passwords = {
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  // Se mantiene una variable 'user' para los datos del avatar, aunque el email y nombre se toman de userProfile
  // Puedes refactorizar esto más adelante si tu API devuelve la URL del avatar.
  user = {
    displayName: 'Cargando...',
    email: 'cargando...',
    avatarUrl: 'https://placehold.co/80x80/E0E0E0/757575?text=Avatar'
  };


  constructor(
    private userService: UserService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    addIcons({
      personCircleOutline,
      mailOutline,
      colorPaletteOutline,
      notificationsOutline,
      lockClosedOutline,
      saveOutline,
      logOutOutline,
      cameraOutline
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando perfil...'
    });
    await loading.present();

    this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.userProfile = data;
        // Actualizar el objeto 'user' usado para el avatar y otros display
        this.user.displayName = data.name;
        this.user.email = data.email;
        console.log('Perfil cargado:', data);
      },
      error: async (err) => {
        console.error('Error al cargar el perfil:', err);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo cargar el perfil del usuario. Por favor, intente de nuevo o inicie sesión.',
          buttons: ['OK']
        });
        await alert.present();
        // Si el error es de autenticación (401), redirigir al login
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigateByUrl('/auth', { replaceUrl: true });
        }
      },
      complete: () => {
        loading.dismiss();
      }
    });
  }


  changeAvatar() {
    // La lógica de cambiar el avatar es independiente de la API de perfil básica.
    // Esto podría abrir un selector de archivos o usar el plugin de la cámara de Capacitor.
    console.log('Intentando cambiar avatar...');
    this.presentAlert('Información', 'La función de cambiar avatar aún no está implementada con la API.');
  }


  async saveProfile() {
    const loading = await this.loadingCtrl.create({
      message: 'Guardando perfil...'
    });
    await loading.present();

    // Enviamos solo el nombre y el email, ya que la API espera esos campos para la actualización básica
    const dataToUpdate = {
      name: this.userProfile.name,
      email: this.userProfile.email
    };

    this.userService.updateUserProfile(dataToUpdate).subscribe({
      next: async (res) => {
        console.log('Perfil actualizado:', res);
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: res.message || 'Perfil actualizado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        this.userProfile = res.user; // Actualiza el perfil local con los datos de la respuesta
        this.user.displayName = res.user.name; // Actualizar el display name
        this.user.email = res.user.email; // Actualizar el email del display
      },
      error: async (err) => {
        console.error('Error al actualizar perfil:', err);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err || 'No se pudo actualizar el perfil. Verifique los datos e intente de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
      },
      complete: () => {
        loading.dismiss();
      }
    });
  }

  async updatePassword() {
    // Validaciones básicas antes de enviar a la API
    if (this.passwords.password !== this.passwords.password_confirmation) {
      this.presentAlert('Error', 'La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (!this.passwords.current_password || !this.passwords.password) {
      this.presentAlert('Error', 'Todos los campos de contraseña son requeridos.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Actualizando contraseña...'
    });
    await loading.present();

    // La API de Laravel espera estos campos para el cambio de contraseña
    const passwordData = {
      current_password: this.passwords.current_password,
      password: this.passwords.password,
      password_confirmation: this.passwords.password_confirmation
    };

    this.userService.updateUserProfile(passwordData).subscribe({
      next: async (res) => {
        console.log('Contraseña cambiada:', res);
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: res.message || 'Contraseña cambiada correctamente.',
          buttons: ['OK']
        });
        await alert.present();
        // Limpiar los campos de contraseña después de un cambio exitoso
        this.passwords = { current_password: '', password: '', password_confirmation: '' };
      },
      error: async (err) => {
        console.error('Error al cambiar contraseña:', err);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: err || 'No se pudo cambiar la contraseña. Verifique los datos, especialmente la contraseña actual.',
          buttons: ['OK']
        });
        await alert.present();
      },
      complete: () => {
        loading.dismiss();
      }
    });
  }

  async logout() {
    const loading = await this.loadingCtrl.create({
      message: 'Cerrando sesión...'
    });
    await loading.present();

    try {
      await this.authService.logout();
      await loading.dismiss();
      this.router.navigateByUrl('/auth', { replaceUrl: true }); // Redirige a la página de autenticación
    } catch (error) {
      await loading.dismiss();
      console.error('Error al cerrar sesión:', error);
      this.presentAlert('Error', 'No se pudo cerrar la sesión.');
    }
  }

  // Pequeña función auxiliar para mostrar alertas
  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
