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
  IonLabel
} from '@ionic/angular/standalone';

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
    FormsModule
  ]
})
export class AuthPage implements OnInit {

  isLogin = true;

  formData = {
    name: '',
    email: '',
    password: ''
  };

  constructor() {}

  ngOnInit() {}

  toggleAuth() {
    this.isLogin = !this.isLogin;
    this.formData = {
      name: '',
      email: '',
      password: ''
    };
  }

  onSubmit() {
    if (this.isLogin) {
      console.log('Iniciar sesión con:', this.formData);
      // lógica de inicio de sesión
    } else {
      console.log('Registrar con:', this.formData);
      // lógica de registro
    }
  }
}
