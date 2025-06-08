import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component";
// ELIMINADO: import { SideMenuComponent } from "../../component/side-menu/side-menu.component";
import { addIcons } from 'ionicons';
import { personCircleOutline, mailOutline, colorPaletteOutline, notificationsOutline, lockClosedOutline, saveOutline, logOutOutline, cameraOutline } from 'ionicons/icons';

import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

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
    // ELIMINADO: SideMenuComponent,
  ]
})
export class ConfiguracionPage implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef;

  userProfile: UserProfile = {
    id: 0,
    name: '',
    email: '',
    profile_picture_url: ''
  };

  passwords = {
    current_password: '',
    password: '',
    password_confirmation: ''
  };

  userDisplay = {
    displayName: 'Cargando...',
    email: 'cargando...',
    avatarFullUrl: 'https://placehold.co/80x80/E0E0E0/757575?text=Avatar'
  };

  constructor(
    private userService: UserService,
    private authService: AuthService, // Ya inyectado
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
        this.userDisplay.displayName = data.name;
        this.userDisplay.email = data.email;

        if (data.profile_picture_url) {
          this.userDisplay.avatarFullUrl = environment.baseUrl + data.profile_picture_url;
        } else {
          this.userDisplay.avatarFullUrl = 'https://placehold.co/80x80/E0E0E0/757575?text=Avatar';
        }
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
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userDisplay.avatarFullUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      const loading = await this.loadingCtrl.create({
        message: 'Subiendo avatar...'
      });
      await loading.present();

      this.userService.uploadAvatar(file).subscribe({
        next: async (res) => {
          console.log('Avatar subido:', res);
          const alert = await this.alertCtrl.create({
            header: 'Éxito',
            message: res.message || 'Avatar actualizado correctamente.',
            buttons: ['OK']
          });
          await alert.present();
          if (res.avatar_url) {
            // Actualiza userProfile con la URL relativa de la API
            this.userProfile.profile_picture_url = res.avatar_url;
            // Actualiza la URL para el display
            this.userDisplay.avatarFullUrl = environment.baseUrl + res.avatar_url;

            // ¡¡¡CAMBIO CLAVE AQUÍ!!! Notifica a AuthService para actualizar el usuario almacenado
            // El API devuelve el objeto 'user' completo con la nueva profile_picture_url
            this.authService.updateCurrentUser(res.user);
          }
        },
        error: async (err) => {
          console.error('Error al subir avatar:', err);
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: err || 'No se pudo subir el avatar. Verifique el formato y tamaño (máx 2MB).',
            buttons: ['OK']
          });
          await alert.present();
          // Si falla, revertir a la URL anterior o a un placeholder
          this.userDisplay.avatarFullUrl = this.userProfile.profile_picture_url ? (environment.baseUrl + this.userProfile.profile_picture_url) : 'https://placehold.co/80x80/E0E0E0/757575?text=Avatar';
        },
        complete: () => {
          loading.dismiss();
          event.target.value = '';
        }
      });
    }
  }

  async saveProfile() {
    const loading = await this.loadingCtrl.create({
      message: 'Guardando perfil...'
    });
    await loading.present();

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
        this.userProfile = res.user;
        this.userDisplay.displayName = res.user.name;
        this.userDisplay.email = res.user.email;
        if (res.user.profile_picture_url) {
          this.userDisplay.avatarFullUrl = environment.baseUrl + res.user.profile_picture_url;
        } else {
          this.userDisplay.avatarFullUrl = 'https://placehold.co/80x80/E0E0E0/757575?text=Avatar';
        }

        // ¡¡¡CAMBIO CLAVE AQUÍ!!! Notifica a AuthService para actualizar el usuario almacenado
        // La API devuelve el objeto 'user' completo con la nueva profile_picture_url (si aplica)
        this.authService.updateCurrentUser(res.user);
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
        this.passwords = { current_password: '', password: '', password_confirmation: '' };

        // ¡¡¡CAMBIO CLAVE AQUÍ!!! Notifica a AuthService para actualizar el usuario almacenado
        // La API devuelve el objeto 'user' completo (con nombre, email, etc.)
        this.authService.updateCurrentUser(res.user);
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
      this.router.navigateByUrl('/auth', { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      console.error('Error al cerrar sesión:', error);
      this.presentAlert('Error', 'No se pudo cerrar la sesión.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
