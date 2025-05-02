// header.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonIcon
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // Iconos registrados para usar en el template
  personIcon = personCircleOutline;
  logoutIcon = logOutOutline;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    // Registrar los iconos con ionicons
    addIcons({ personCircleOutline, logOutOutline });
  }

  ngOnInit() {}

  logout() {
    // Lógica de logout…
    this.router.navigate(['/login']);
  }
}
