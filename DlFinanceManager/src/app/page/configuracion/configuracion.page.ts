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
  // IonSelect, IonSelectOption (Removed as per new design)
} from '@ionic/angular/standalone';
import { HeaderComponent } from "../../component/header/header.component"; // Assuming path is correct
import { SideMenuComponent } from "../../component/side-menu/side-menu.component"; // Assuming path is correct
import { addIcons } from 'ionicons'; // Import addIcons
import { personCircleOutline, mailOutline, colorPaletteOutline, notificationsOutline, lockClosedOutline, saveOutline, logOutOutline, cameraOutline } from 'ionicons/icons'; // Import necessary icons

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
    // IonSelect, IonSelectOption (Removed)
  ]
})
export class ConfiguracionPage implements OnInit {

  user = {
    displayName: 'Usuario Desarrollador', // Updated to match image
    email: 'dev@ejemplo.com',          // Updated to match image
    avatarUrl: 'https://placehold.co/80x80/E0E0E0/757575?text=Avatar' // Placeholder avatar
  };

  passwords = {
    current: '',
    new: '',
    confirm: ''
  };

  constructor() {
    // Add all icons that will be used in the template here
    addIcons({
      personCircleOutline,
      mailOutline,
      colorPaletteOutline,
      notificationsOutline,
      lockClosedOutline,
      saveOutline,
      logOutOutline,
      cameraOutline // For "Cambiar avatar" if you use an icon there
    });
  }

  ngOnInit() {
    // Logic to load user data would typically go here
    // For now, using static data
  }

  // This function is kept in case you have a global theme switcher
  // or implement the theme switch described in the "Apariencia" section later.
  onThemeChange(value: string) {
    document.body.classList.toggle('dark-theme', value === 'oscuro');
    // Optionally, save theme preference to localStorage or a service
  }

  changeAvatar() {
    // Logic for changing avatar
    // This could open a modal, file picker, etc.
    console.log('Attempting to change avatar...');
    // Example: You might use the Capacitor Camera plugin or a file input
  }

  saveProfile() {
    // Logic to save updated user profile information
    // This would typically involve calling a service
    console.log('Saving profile:', this.user);
    // Add actual save logic here (e.g., API call)
  }

  updatePassword() {
    // Logic to update user password
    console.log('Attempting to update password...');
    if (this.passwords.new !== this.passwords.confirm) {
      console.error('New passwords do not match.');
      // Display an error message to the user (e.g., using IonToast)
      return;
    }
    if (!this.passwords.current || !this.passwords.new) {
      console.error('Current and new passwords are required.');
      // Display an error message
      return;
    }
    // Add actual password update logic here (e.g., API call)
    console.log('Password update requested for:', this.user.email);
  }

  logout() {
    // Logic for user logout
    console.log('Logging out...');
    // This would typically clear session/token and navigate to login page
  }
}
