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
import { Router } from '@angular/router';  // ① Importa Router

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

  // ② Inyecta Router
  constructor(private router: Router) {}

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
      // Aquí iría tu llamada al servicio de autenticación...
      // Simulamos éxito:
      this.router.navigate(['home']);  // ③ Redirige a Home
    } else {
      console.log('Registrar con:', this.formData);
      // lógica de registro
    }
  }
}
